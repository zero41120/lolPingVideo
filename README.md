# lolPing 影片產生器

在瀏覽器裡排好英雄聯盟的 Ping 順序，就能直接匯出**透明背景**的影片，拿來疊在 OBS 直播畫面或放進剪輯軟體裡用。所有預覽與轉檔都在你自己的瀏覽器裡完成，不會上傳任何資料。

線上版本：[zero41120.github.io/lolPingVideo](https://zero41120.github.io/lolPingVideo/)

## 功能

* **訊號順序**：內建 12 種遊戲內訊號（如敵人失蹤、危險、請求支援等），可自由新增、移除，並用左側握把拖曳調整順序。
* **訊號間隔時間**：可自訂每個訊號觸發後要等多久才出現下一個。預設 0.25 秒，滑桿可調 0.1～1 秒（每次增減 0.05 秒），也能直接在數字欄輸入最大 10 秒的數值。
* **位置畫布**：用 Konva 畫出每個訊號落在畫面中的位置，直接拖曳即可調整；虛線顯示觸發順序。「重新亂數位移」會把所有訊號隨機散開。
* **畫面比例**：正方形 1080 × 1080，或開啟開關改為寬螢幕 1920 × 1080。
* **輪盤與音效**：可選擇是否顯示訊號輪盤動畫、是否播放對應音效。
* **即時預覽**：棋盤格背景代表透明區域，內建播放器可循環播放。

## 匯出

| 格式 | 速度 | 適用 |
| --- | --- | --- |
| WebM（含透明度） | 快 | OBS 媒體來源 |
| ProRes 4444（.mov） | 慢 | DaVinci Resolve 等剪輯軟體 |

* **WebM** 透過 Remotion 的瀏覽器渲染功能（基於 WebCodecs）輸出，優先採用 VP9 編碼，不支援時則自動改用 VP8。
* **ProRes 4444** 需先在瀏覽器載入 ffmpeg.wasm（約 32 MB，按下匯出時才會下載）。由於瀏覽器版的 ffmpeg 只能跑單執行緒，即使是預設長度的影片，轉檔也需要等上幾分鐘。

```bash
# dev
bun install
bun run dev
bun run typecheck
bun run build

# render
bun run render          # out/ping-demo.webm（透明 WebM）
bun run render:prores   # out/ping-demo.mov（ProRes 4444，透明）
```
