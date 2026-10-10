# 08. 網頁伺服器 (Multi-Threaded Web Server)

恭喜你一路堅持闖關到最後一個單元！在這個終極實戰專案中，我們**不使用任何現成的高階 Web 框架**，而是純手工從底層的 **TCP Socket 連線** 與 **HTTP 網路協定** 開始，親手打造一個能夠並發處理請求的 **多執行緒 Web 伺服器 (Multi-Threaded Web Server)**！

這個專案將全面檢驗並融合你在此課程所學的每一項精髓：
- **第 2、3 章**：變數、字串切片與所有權借用。
- **第 4、5 章**：結構體、列舉、Trait 特徵物件（`dyn FnOnce`）。
- **第 6 章**：命令列與關注點分離模組化。
- **第 7 章**：MPSC 訊息通道、`Arc<Mutex<T>>` 共享狀態與多執行緒並發！

---

## 1. 🌐 架構解析：銀行營業櫃台與得來速比喻

如果我們寫出一個最簡單的單執行緒伺服器，會遇到什麼災難？

> 🚗 **單執行緒的噩夢（隊頭阻塞 Head-of-Line Blocking）**：
> 就像只有一個點餐窗口的得來速，前面一位客人點了一份需要現場烤 10 秒的披薩（例如 `/sleep` 耗時請求），後面排隊的所有客人通通動彈不得，整條馬路瞬間癱瘓！

為了解決這個問題，業界標準做法是引入 **執行緒池 (ThreadPool)**：

| 伺服器架構 | 生活比喻 | 優點 | 致命缺點 |
| :--- | :--- | :--- | :--- |
| **單執行緒 (Single-Thread)** | 只有一位櫃員的銀行窗口 | 程式碼最簡單 | 一個慢速請求就會卡死全場所有客人 |
| **隨到隨開 (Spawn-per-Request)** | 每來一位客人就當場招募一位新員工 | 回應迅速 | 瞬間湧入 10 萬人時會**耗盡記憶體直接當機 (DoS 崩潰)** |
| **執行緒池 (ThreadPool - 本章實作)** | **聘請 4 位受訓櫃員，客戶排隊抽號碼牌** | **效能極致、資源可控、絕不崩潰** | 需要設計 Channel 任務調度與優雅停機 |

---

## 2. 🎮 互動實驗室：手刻多執行緒 Web Server 模擬器

在下方的實驗台中，你可以親身體驗 ThreadPool 是如何排班的！點擊不同請求按鈕，觀察 4 位 Worker 櫃員如何並行處理：

<WebServerLab></WebServerLab>

---

## 3. 🧩 深度拆解：手刻 Web Server 三大技術核心

### ① 純手工解析 HTTP 協議與封包組裝
瀏覽器與伺服器之間的對話本質上就是標準的純文字：
- **請求格式 (HTTP Request)**：
  ```http
  GET / HTTP/1.1
  Host: 127.0.0.1:7878
  User-Agent: Mozilla/5.0
  ```
- **回應格式 (HTTP Response)**：
  ```http
  HTTP/1.1 200 OK
  Content-Length: 43
  Content-Type: text/html; charset=utf-8

  <!DOCTYPE html><html><body><h1>Hello Rust!</h1></body></html>
  ```
  在 Rust 中，我們透過計算 HTML 字串長度 `.len()`，動態格式化產出合法的 HTTP/1.1 回應封包。

### ② 執行緒池 (ThreadPool) 的本質：為什麼需要 `Arc<Mutex<Receiver>>`？
在第 7 章我們學過，MPSC 代表 **多生產者、單一消費者 (Multiple Producer, Single Consumer)**。
- 伺服器主執行緒是生產者（`sender`），它把客人的請求包裝成 `Job` 送入通道。
- 但我們有 **4 個 Worker 執行緒** 同時想從通道接收任務！
- **編譯器的防線**：`mpsc::Receiver` 本身不支援多個執行緒同時讀取。為了解決這個問題，我們必須使用：
  ```rust
  Arc<Mutex<mpsc::Receiver<Job>>>
  ```
  - `Arc`：讓 4 位 Worker 各自持有一份指向接收端的智慧指標。
  - `Mutex`：確保同一時間只有「一位」Worker 能進入通道抽取 Job，其他人排隊等待，完美實現工作分配！

### ③ 優雅停機 (Graceful Shutdown) 與 Drop 哲學
伺服器不能直接拔掉電源！當管理員按下 `Ctrl + C` 準備關閉伺服器時：
1. **關閉通訊通道**：丟棄 `sender`，通知所有 Worker 不會再有新任務。
2. **等待收尾**：透過 `worker.thread.join()`，耐心等待正在處理煎披薩任務的 Worker 完成手邊工作。
3. **優雅退場**：所有 Worker 乾淨退出，釋放記憶體與 Socket，不遺漏任何一位正在連線的客人！

---

## 4. 四大實戰範例（在線即時修改與執行）

底下四個範例帶你循序漸進：從最基礎的 HTTP 封包組裝、路由模式匹配、手刻迷你 ThreadPool、到 Drop 優雅停機。你可以直接點擊 **「▶ 立即執行」**：

### 範例一：TCP 請求解析與 HTTP 封包組裝
- **核心觀念**：
  - 學習網路底層的純文字通訊協定，正確處理 `\r\n` 換行符號。
  - 動態計算 `Content-Length`，確保瀏覽器能精準接收完整網頁資料。
- **動手試試看**：修改 HTML 內容，觀察輸出的 `Content-Length` 數值如何自動同步更新！

<RustRunner snippet-key="web_http_response"></RustRunner>

---

### 範例二：HTTP 路由分發與 404 狀態碼處理
- **核心觀念**：
  - 藉由 `match request_path` 模式匹配，依據使用者請求的路徑分發到不同的處理邏輯。
  - 任何未定義的萬用路徑 `_` 自動導向標準 `404 NOT FOUND` 錯誤頁面。
- **動手試試看**：試著在 `handle_route` 中增加一個 `/about` 路由，點擊執行看看回應！

<RustRunner snippet-key="web_routing_match"></RustRunner>

---

### 範例三：手刻迷你執行緒池 (ThreadPool & Worker)
- **核心觀念**：
  - 定義 `type Job = Box<dyn FnOnce() + Send + 'static>;` 作為可在執行緒間傳遞的可執行任務。
  - 建立 4 個 Worker 執行緒，透過 `Arc<Mutex<Receiver>>` 共享任務隊列，各司其職並行作業。
- **動手試試看**：觀察終端機中各個 Worker 領取任務並交錯執行的紀錄！

<RustRunner snippet-key="web_threadpool_mini"></RustRunner>

---

### 範例四：Drop 特徵與優雅停機 (Graceful Shutdown)
- **核心觀念**：
  - 為 `SimpleThreadPool` 實作 `Drop` 特徵。
  - 離開作用域時自動關閉發送端，並呼叫 `worker.join()` 確保所有工作執行完畢才釋放資源。
- **動手試試看**：體會 Rust 著名的 RAII（Resource Acquisition Is Initialization）機制：離開大括號 `{}` 就自動完成安全停機！

<RustRunner snippet-key="web_graceful_shutdown"></RustRunner>

---

## 5. 🎓 全系列課程結業寄語：你的 Rust 冒險才剛開始！

🎉 **熱烈祝賀你完成了《Rust 程式設計入門到實戰》的完整 8 大章節！**

從一開始認識變數與猜數字、深入所有權與借用、拆解結構體與特徵，一路到打造文字搜尋工具與多執行緒網頁伺服器，你已經跨越了程式設計世界中最具挑戰性的一座高峰。

### 接下來你可以前往的新世界：
1. **非同步程式設計 (Async / Await)**：探索 `tokio` 執行時，邁向單機支撐百萬高並發連線的非阻塞殿堂。
2. **現代 Web 框架實戰**：嘗試使用 `axum` 或 `actix-web` 開發真正生產級的 RESTful API 與微服務。
3. **WebAssembly (WASM)**：將 Rust 編譯成 WebAssembly，在瀏覽器端以接近原生 C++ 的極限速度運行複雜演算法與遊戲！
4. **系統與底層工具開發**：打造媲美 `ripgrep`、`bat`、`fd` 的超高效能命令列系統工具。

**願 Rust 的型別系統與編譯器，永遠為你的程式碼安全保駕護航！Happy Coding! 🦀**
