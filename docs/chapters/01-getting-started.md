# 01. 一開始準備 (Getting Started)

歡迎來到 Rust 的世界！在本單元中，我們將深入了解什麼是 Rust、有哪些世界級頂尖專案正在使用它、何時該選擇 Rust，以及它獨特的運行環境與工具鏈安裝。

---

## 1. 什麼是 Rust？

Rust 是一門由 Mozilla 於 2010 年贊助發起、現由獨立非營利組織 **Rust 基金會** 維護的系統級程式語言。

它連續多年在 Stack Overflow 全球開發者大調查中獲選為**「最受開發者喜愛的程式語言」**，其核心使命是：**在不犧牲執行效能的前提下，提供絕對的記憶體安全與並發安全。**

---

## 2. 有哪些知名程式是用 Rust 寫的？

Rust 已經不是實驗室裡的玩具，而是支撐起全球科技巨頭底層關鍵基礎設施的骨幹：

### 🐧 作業系統核心與底層軟體
- **Linux 核心（Linux Kernel）**：Linux 誕生 30 多年以來，**Rust 是第一個也是唯一一個被官方接納納入核心開發的現代語言**（與 C 語言並列）。
- **Windows 核心組件**：微軟（Microsoft）正積極將 Windows 核心函式庫以 Rust 逐步重寫，以消除長久以來的安全性漏洞。
- **Android 作業系統**：Google 採用 Rust 重新開發 Android 底層的藍牙協議棧（Gabeldorsche）、超寬頻（UWB）與硬體安全模組，使 Android 系統中的重大記憶體安全漏洞降至歷史新低。

### ⚡ 現代開發者必備的極速工具
- **ripgrep (`rg`)**：地表最快的命令列文字搜尋工具，速度比傳統 grep 快數倍至數十倍（我們將在**單元 6** 親手實作其核心原型！）。
- **bat** / **fd**：現代化、支援語法高亮與智慧過濾的 `cat` 與 `find` 替代品。
- **Turbopack / SWC**：前端新一代極速 JavaScript / TypeScript 編譯器（Next.js 的核心底層）。
- **Tauri**：比 Electron 輕量 10 倍以上的跨平台桌面應用程式框架。

### ☁️ 雲端、分散式系統與高效能服務
- **Discord**：將數十億筆訊息的快取伺服器從 Go 語言重寫為 Rust，徹底解決了 Go 垃圾回收（GC）引起的延遲尖峰問題。
- **Cloudflare Workers**：支撐全球數十兆次邊緣請求的底層高效能執行引擎。
- **AWS Firecracker**：Amazon 用於驅動 AWS Lambda 與 Fargate 的極輕量微虛擬機（MicroVM），純 Rust 打造。

---

## 3. 為什麼要使用 Rust？

如果把程式語言比喻為交通工具：
- **Python / Ruby**：像自排自駕車，開起來舒適快速，但極速有限且吃油（耗資源）。
- **C / C++**：像拆掉了所有防護裝備的 F1 賽車，速度極快，但一個小失誤就會致命撞毀。
- **Rust**：**擁有 F1 賽車的極速，同時配備了太空梭等級的鈦合金防滾架與自動防撞系統！**

### 核心價值主張：
1. **消滅 70% 的重大安全漏洞**：
   - 根據微軟與 Google 統計，過去數十年重大 CVE 安全漏洞中，有超過 70% 來自 C/C++ 的記憶體管理錯誤（如緩衝區溢位 Buffer Overflow、懸空指標 Use-After-Free）。Rust 透過編譯時期的「所有權系統」徹底杜絕了此類問題！
2. **極致效能且無垃圾回收延遲（Zero GC Overhead）**：
   - Java、Go、Python 都有背景垃圾回收器（GC），這會帶來難以預測的停頓（Stop-the-world）。Rust **完全沒有 GC**，具備微秒級的穩定低延遲。
3. **零成本抽象（Zero-Cost Abstractions）**：
   - 撰寫優雅高級的泛型、閉包或迭代器，編譯器會自動最佳化，產出的機器碼效能與手寫底層組合語言完全一致。
4. **極度友善的編譯器提示**：
   - Rust 編譯器不只指出錯誤，還會明確告訴你「為什麼錯」以及「建議如何修改」，被開發者譽為最棒的程式設計導師。

---

## 4. 什麼情況下我們會使用 Rust？

我們透過下方的技術選型診斷器，幫助您建立清晰的架構決策視野：

<TechDecisionCard></TechDecisionCard>

---

## 5. Rust 需要的運行環境？

初學者常問：「Rust 需要像 Java 一樣安裝虛擬機（JVM）嗎？還是需要裝 Python 直譯器？」

### 🚀 執行階段（Runtime）：純二進位原生執行檔！
- **無需任何虛擬機或直譯器**：
  Rust 編譯器直接將程式碼編譯成**目標 CPU 架構的機器碼（Native Binary，例如 Windows 的 `.exe` 或 Linux 的 ELF）**。
- **部署極度輕量**：
  編譯完成後，只需要把單一檔案拷貝到目標伺服器或容器即可直接跑起來，無需在伺服器安裝 Rust 環境。
- **強大的交叉編譯（Cross-Compilation）**：
  你可以在 Windows 或 Mac 電腦上，直接編譯出給 Linux 伺服器或樹莓派（ARM 架構）執行的二進位檔案。

### 💻 開發階段（Development）：工具鏈需求
- **Windows**：Windows 10/11，需要具備 Visual Studio C++ 建置工具。
- **macOS**：macOS 10.12 以上，需要安裝 Xcode Command Line Tools (`xcode-select --install`)。
- **Linux**：安裝系統標準的 `gcc` 或 `clang` 工具鏈即可。
- **硬體建議**：Rust 編譯期需要大量型別推導與靜態檢查，建議配備至少 8GB 記憶體與多核心處理器以獲得最佳編譯體驗。

---

## 6. 核心工具鏈介紹與安裝

學習 Rust 只需要熟悉三個最重要的命令列工具：

- **`rustup`**：Rust 工具鏈安裝程式與版本管理器。
- **`rustc`**：Rust 官方編譯器。
- **`cargo`**：Rust 官方專案建置工具與套件管理器（建立專案、編譯、執行、單元測試、安裝套件全靠它！）。

### 安裝步驟

#### 在 Windows 上安裝
1. 前往官方下載頁面：[https://rustup.rs/](https://rustup.rs/)
2. 下載並執行 `rustup-init.exe`，依照提示選擇預設選項完成安裝。

#### 在 macOS / Linux 上安裝
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

## 7. 第一個 Rust 程式：Hello, World!

使用 `cargo` 建立標準專案：

```bash
cargo new hello_world
cd hello_world
cargo run
```

在 `src/main.rs` 裡的原始程式碼如下：

```rust
fn main() {
    println!("Hello, World!");
}
```

- `fn` 代表定義一個函式（Function）。
- `main` 是程式執行的進入點。
- `println!` 後面的驚嘆號代表這是一個 **巨集（Macro）**，而不是一般的函式。

---

## 8. 互動體驗：在瀏覽器立即執行！

你可以直接修改下方文字框中的字串，點擊 **「▶ 立即執行」**，不用裝環境也能看到實際執行輸出：

<RustRunner></RustRunner>
