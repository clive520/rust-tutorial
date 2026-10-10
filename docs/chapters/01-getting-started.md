# 01. 一開始準備 (Getting Started)

歡迎來到 Rust 的世界！在本單元中，我們將認識什麼是 Rust、為什麼全世界頂尖工程師都熱愛它，以及如何設定開發環境。

---

## 1. 什麼是 Rust？

Rust 是一門由 Mozilla 於 2010 年贊助發起、現由獨立非營利組織 **Rust 基金會** 維護的系統級程式語言。

它連續多年在 Stack Overflow 開發者大調查中獲選為**「最受開發者喜愛的語言」**，核心優勢在於：

1. **記憶體安全（Memory Safety）**：
   - 在傳統 C/C++ 中，常見的 Segmentation Fault、懸空指標（Dangling Pointer）、重複釋放（Double Free）等錯誤造成了 70% 以上的重大安全漏洞。
   - Rust 透過獨創的**所有權（Ownership）系統**，在**編譯時期**就徹底消滅了這些錯誤！
2. **無垃圾回收器（No Garbage Collector）**：
   - 像 Java、Go、Python 都有背景執行的垃圾回收機制（GC），這會帶來難以預測的效能停頓（Stop-the-world）。
   - Rust **完全沒有 GC**，卻依然不需要程式設計師手動 `malloc` 或 `free` 記憶體。
3. **零成本抽象（Zero-Cost Abstractions）**：
   - 寫高級的泛型、閉包、迭代器程式碼，編譯後的機器碼效能與手寫底層組合語言一樣快！

---

## 2. 核心工具鏈介紹

學習 Rust 只需要熟悉三個最重要的命令列工具：

- **`rustup`**：Rust 安裝程式與版本管理器（可以隨時切換 stable / nightly 版本）。
- **`rustc`**：Rust 官方編譯器。
- **`cargo`**：Rust 的建置工具與套件管理工具（專案建置、執行、測試、安裝第三方庫全靠它！）。

---

## 3. 安裝步驟

### 在 Windows 上安裝
1. 前往官方網站下載安裝檔：[https://rustup.rs/](https://rustup.rs/)
2. 下載並執行 `rustup-init.exe`。
3. 依照提示選擇預設選項安裝（需具備 Visual Studio C++ 建置工具）。

### 在 macOS / Linux 上安裝
在終端機中貼上以下指令：
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

安裝完成後，打開新終端機並檢查版本：
```bash
rustc --version
cargo --version
```

---

## 4. 第一個 Rust 程式：Hello, World!

傳統的做法是建立一個 `main.rs` 檔案：

```rust
fn main() {
    println!("Hello, World!");
}
```

- `fn` 代表定義一個函式（Function）。
- `main` 是程式執行的進入點。
- `println!` 後面的驚嘆號代表這是一個 **巨集（Macro）**，而不是一般的函式。

---

## 5. 互動體驗：在瀏覽器立即執行！

你可以直接修改下方文字框中的字串，點擊 **「▶ 立即執行」**，不用裝環境也能看到實際執行輸出：

<RustRunner></RustRunner>
