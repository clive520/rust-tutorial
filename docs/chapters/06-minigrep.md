# 06. 文字搜尋工具 (Mini-Grep)

在學完前五章的語法、所有權、結構體與特徵之後，恭喜你已經擁有了堅實的 Rust 基礎！現在，我們要將這些知識熔於一爐，親手打造一個經典且實用的 UNIX 命令列工具 —— **`minigrep`**（迷你版 `grep`）！

`grep` 是全世界系統工程師每天都會使用的文字搜尋工具。透過這個專案，你將學會如何處理**命令列參數**、**讀取檔案**、**測試驅動開發 (TDD)**、**環境變數控制**，以及理解最關鍵的 **生命週期 (Lifetimes) 標記**！

---

## 1. 🔍 核心架構解析：從命令列到終端輸出

打造一個專業的 CLI 工具，通常會經歷以下五個核心階段：

| 階段步驟 | 負責任務 | 關鍵技術與模組 | 生活比喻 |
| :--- | :--- | :--- | :--- |
| **1. 參數接收** | 獲取使用者在終端機輸入的參數 | `std::env::args()` | 郵差確認包裹收件人與住址 |
| **2. 設定解析** | 將文字參數轉換為型別安全的結構體 | `Config::build(&args)` | 將便條紙資料登錄進電腦資料庫 |
| **3. 檔案讀取** | 開啟硬碟檔案並取出所有文字內容 | `std::fs::read_to_string` | 從圖書館書架取下整本圖書 |
| **4. 核心檢索** | 逐行比對是否包含搜尋關鍵字 | `search<'a>(query, text)` | 拿放大鏡在書頁中掃描關鍵詞 |
| **5. 終端輸出** | 將命中行印到螢幕；錯誤時印到 stderr | `println!` / `eprintln!` | 廣播播報命中行；警報器響起紅燈 |

---

## 2. 🎮 互動實驗室：MiniGrep 文字雷達搜尋模擬器

在閱讀背後的 Rust 程式碼之前，先在下方的互動終端機親自玩玩看 `minigrep` 是如何運作的！你可以切換文本範本、調整大小寫開關，或直接修改內容文字：

<MiniGrepSimulator></MiniGrepSimulator>

---

## 3. 🧩 深度拆解：三大工程實戰核心思維

### ① 模組關注點分離 (Separation of Concerns)
在撰寫真實 Rust 專案時，我們絕不會把成百上千行的邏輯全塞在 `main.rs`：
- **`src/main.rs` (指揮官)**：只負責「接收參數」與「呼叫執行」，遇到錯誤印出紅字並優雅退出程式。
- **`src/lib.rs` (後勤引擎)**：放置 `Config` 設定結構體、`run` 執行函式、核心 `search` 演算法與單元測試。這種切分方式讓核心邏輯能被完全獨立測試！

```
minigrep/
├── Cargo.toml
└── src/
    ├── main.rs   ➔ (入口：只負責調度與錯誤退出)
    └── lib.rs    ➔ (核心：Config 結構體、search 函式、單元測試)
```

### ② 生命週期標記 `'a`：借閱便條紙 vs 圖書館藏書
當我們寫出搜尋函式簽章時，Rust 編譯器強制我們標上生命週期：
```rust
pub fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str>
```
- **為什麼是 `'a`？**：回傳的 `Vec<&'a str>` 裝著所有匹配到的文字行。這些行**不是複製出來的新字串**，而是直接指向原檔案 `contents` 記憶體位置的「切片（Slices）」！
- **編譯器的保證**：原檔案存在多久，回傳的切片紙條就能活多久！一旦原檔案被丟棄或銷毀，編譯器就會立刻阻止你使用那些紙條，徹底杜絕懸空指標（Dangling Pointer）！這也帶來了極致的效能：**零額外字串複製分配！**

### ③ 標準輸出 (stdout) vs 標準錯誤輸出 (stderr)
Linux 命令列非常重視資料管線（Pipeline）。如果把錯誤訊息也用 `println!` 印出，當使用者使用管道輸出到檔案時（如 `minigrep safe poem.txt > output.txt`），錯誤訊息也會被寫入檔案中！
- 一般輸出：使用 `println!` 導向標準輸出 (`stdout`)。
- 報錯訊息：使用 `eprintln!` 導向標準錯誤 (`stderr`)，確保即使輸出被重新導向，終端機依然能第一時間看到警告紅字！

---

## 4. 四大實戰範例（在線即時修改與執行）

底下四個範例從核心搜尋演算法、大小寫切換、參數安全解析、到高階迭代器寫法，全部可以直接點擊 **「▶ 立即執行」**：

### 範例一：minigrep 核心搜尋邏輯與生命週期驗證
- **核心觀念**：
  - 實作經典的 `search<'a>` 函式，逐行迭代 `contents.lines()` 並用 `line.contains(query)` 抓取命中行。
  - 回傳的 `Vec<&'a str>` 享有編譯期生命週期防護。
- **動手試試看**：把關鍵字改成 `"高效"` 或 `"沒有"`，觀察終端機命中行號的即時變化！

<RustRunner snippet-key="minigrep_core_lifetime"></RustRunner>

---

### 範例二：大小寫敏感 vs 忽略大小寫搜尋 (IGNORE_CASE)
- **核心觀念**：
  - 在真實環境中，我們可以透過環境變數 `std::env::var("IGNORE_CASE")` 決定要使用哪種搜尋模式。
  - 忽略大小寫版本使用 `.to_lowercase()` 先將比對目標標準化，讓 `"rust"`、`"Rust"`、`"RUST"` 都能被精準捕捉！
- **動手試試看**：試著把搜尋關鍵字改成大寫 `"FAST"`，看看兩個函式輸出有何不同！

<RustRunner snippet-key="minigrep_case_insensitive"></RustRunner>

---

### 範例三：命令列參數安全解析 (優雅錯誤處理，拒絕崩潰)
- **核心觀念**：
  - 很多初學者會直接用 `args[1]` 取值，若使用者忘了打參數就會觸發 `index out of bounds` 造成程式崩潰 panic！
  - 透過 `Config::build(&args) -> Result<Config, &'static str>`，以安全的 `Result` 捕捉長度不足的情境，給出清楚的用法說明。
- **動手試試看**：觀察 `test_args_fail` 捕捉到的錯誤訊息，思考如何引導使用者正確操作。

<RustRunner snippet-key="minigrep_config_parse"></RustRunner>

---

### 範例四：極致簡潔的迭代器 (Iterator) 函數式寫法
- **核心觀念**：
  - 掌握了基礎的 `for` 迴圈後，Rust 的迭代器（Iterator）提供鏈式操作：`.lines().filter(...).collect()`。
  - 這段程式碼不僅只要一行，而且同樣具備零成本抽象（Zero-cost abstraction），速度與手寫 `for` 迴圈一樣飛快！
- **動手試試看**：把過濾條件改成找出包含 `"[WARN]"` 的行，點擊執行查看篩選結果！

<RustRunner snippet-key="minigrep_iterator_version"></RustRunner>

---

## 5. 💡 本章核心重點速記

1. **關注點分離**：`main.rs` 專注調度與錯誤處理，`lib.rs` 專注純邏輯與單元測試。
2. **生命週期 `'a`**：宣告切片回傳值借用自原內容，享受零拷貝極致效能並杜絕懸空參照。
3. **優雅錯誤處理**：使用 `Result<T, E>` 包裝參數解析，搭配 `eprintln!` 將錯誤清晰輸出至 stderr。
4. **迭代器威力**：善用 `.lines().filter().collect()`，兼具簡潔美感與極限效能！
