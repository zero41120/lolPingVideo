import "../i18n";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

// Remotion's staticFile() reads this, so the site also works under a sub-path (e.g. /tools/lolping/)
const basePath = new URL(".", document.baseURI).pathname;
const trimmedBase = basePath.replace(/\/$/, "");
window.remotion_staticBase = trimmedBase;

const root = document.getElementById("root")!;
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
