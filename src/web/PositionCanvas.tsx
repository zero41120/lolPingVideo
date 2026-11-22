import Konva from "konva";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Shuffle } from "lucide-react";
import { FRAME_SIZES, PING_SIZE_PX, RANDOM_OFFSET_PX, randomOffset, type PingConfig } from "../config";
import { ALL_PINGS, pingById } from "../pings";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";

// Where each ping lands in the frame. Drag a ping to move it. Later pings sit on top, like in the video.

type PositionCanvasProp = {
  config: PingConfig;
  onMove: (key: string, dx: number, dy: number) => void;
  onChange: (patch: Partial<PingConfig>) => void;
};

const textureUrl = (name: string): string => `./textures/${name}.png`;

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}

/** The texture each ping draws on screen, keyed by texture name */
async function loadAllArt(): Promise<Map<string, HTMLImageElement>> {
  const names = [...new Set(ALL_PINGS.map((ping) => ping.art[0]))];
  const images = await Promise.all(names.map((name) => loadImage(textureUrl(name))));
  return new Map(names.map((name, index) => [name, images[index]]));
}

export function PositionCanvas(prop: PositionCanvasProp) {
  const { config, onMove, onChange } = prop;
  const { t } = useTranslation();
  const frameRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const layerRef = useRef<Konva.Layer | null>(null);
  const onMoveRef = useRef(onMove);
  const [art, setArt] = useState<Map<string, HTMLImageElement> | null>(null);
  const [displayWidth, setDisplayWidth] = useState(0);
  onMoveRef.current = onMove;

  // Create the stage once, follow the container's width, load the textures
  useEffect(() => {
    const element = frameRef.current;
    if (!element) return;
    const stage = new Konva.Stage({ container: element, width: 1, height: 1 });
    const layer = new Konva.Layer();
    stage.add(layer);
    stageRef.current = stage;
    layerRef.current = layer;

    const observer = new ResizeObserver(() => setDisplayWidth(element.clientWidth));
    observer.observe(element);
    setDisplayWidth(element.clientWidth);
    void loadAllArt().then(setArt);

    return () => {
      observer.disconnect();
      stage.destroy();
      stageRef.current = null;
      layerRef.current = null;
    };
  }, []);

  // Redraw whenever the sequence, the ping size, the frame shape or the width changes
  useEffect(() => {
    const stage = stageRef.current;
    const layer = layerRef.current;
    const isReady = stage && layer && art && displayWidth > 0;
    if (!isReady) return;

    const frame = FRAME_SIZES[config.shape];
    const scale = displayWidth / frame.width;
    const displayHeight = frame.height * scale;
    stage.size({ width: displayWidth, height: displayHeight });
    layer.destroyChildren();

    // Center cross
    const crossStyle = { stroke: "#d4d4d4", strokeWidth: 1, listening: false };
    layer.add(new Konva.Line({ points: [displayWidth / 2, 0, displayWidth / 2, displayHeight], ...crossStyle }));
    layer.add(new Konva.Line({ points: [0, displayHeight / 2, displayWidth, displayHeight / 2], ...crossStyle }));

    // The order the pings fire in, as a dashed path
    const centers = config.pings.map((item) => [(frame.width / 2 + item.dx) * scale, (frame.height / 2 + item.dy) * scale]);
    const pathPoints = centers.flat();
    const hasPath = centers.length > 1;
    if (hasPath) layer.add(new Konva.Line({ points: pathPoints, stroke: "#a3a3a3", strokeWidth: 1, dash: [4, 4], listening: false }));

    const sizePx = PING_SIZE_PX * scale;
    const badgeRadius = 9;

    config.pings.forEach((item, index) => {
      const image = art.get(pingById(item.id).art[0]);
      if (!image) return;
      const [x, y] = centers[index];
      const group = new Konva.Group({
        x,
        y,
        draggable: true,
        // Keep the ping's spot inside the frame
        dragBoundFunc: (position) => ({
          x: Math.min(displayWidth, Math.max(0, position.x)),
          y: Math.min(displayHeight, Math.max(0, position.y)),
        }),
      });
      // Same offset the video uses: the spot is the ping's feet, the art floats above it
      group.add(new Konva.Image({ image, x: -sizePx / 2, y: -sizePx * 0.73, width: sizePx, height: sizePx }));
      group.add(new Konva.Circle({ x: -sizePx / 2 + badgeRadius, y: -sizePx * 0.73 + badgeRadius, radius: badgeRadius, fill: "#171717" }));
      group.add(new Konva.Text({
        x: -sizePx / 2,
        y: -sizePx * 0.73 + badgeRadius - 6,
        width: badgeRadius * 2,
        text: String(index + 1),
        fontSize: 11,
        fontStyle: "bold",
        fill: "#ffffff",
        align: "center",
        listening: false,
      }));
      group.add(new Konva.Circle({ radius: 3, fill: "#171717", listening: false }));

      const container = stage.container();
      group.on("mouseenter", () => { container.style.cursor = "grab"; });
      group.on("mouseleave", () => { container.style.cursor = "default"; });
      group.on("dragstart", () => { container.style.cursor = "grabbing"; group.moveToTop(); });
      group.on("dragend", () => {
        container.style.cursor = "grab";
        const dx = Math.round(group.x() / scale - frame.width / 2);
        const dy = Math.round(group.y() / scale - frame.height / 2);
        onMoveRef.current(item.key, dx, dy);
      });
      layer.add(group);
    });
  }, [config.pings, config.shape, art, displayWidth]);

  const isWide = config.shape === "wide";

  function changeShape(wide: boolean) {
    onChange({ shape: wide ? "wide" : "square" });
  }

  function shuffleOffsets() {
    const pings = config.pings.map((item) => ({ ...item, ...randomOffset(RANDOM_OFFSET_PX) }));
    onChange({ pings });
  }

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-4">
      <h2 className="text-sm font-semibold">{t("canvas.title")}</h2>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="flex items-center gap-2">
          <Switch checked={isWide} onCheckedChange={changeShape} />
          <span>{t("options.wide")}</span>
        </label>
        <Button variant="outline" size="sm" onClick={shuffleOffsets}>
          <Shuffle />
          {t("options.shuffle")}
        </Button>
      </div>
      <div ref={frameRef} className="checkerboard w-full overflow-hidden rounded border border-neutral-200" />
    </section>
  );
}
