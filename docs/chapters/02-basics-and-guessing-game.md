# 02. 基本觀念、猜數字 (Basics & Guessing Game)

在上一單元準備好環境後，本單元我們將深入探討 **Rust 變數的本質**，並透過生動的程式碼範例以及**真正能在網頁上輸入操作的「猜數字遊戲終端機」**，帶您打好扎實的基本功！

---

## 1. 深度剖析：Rust 變數如何設定與使用？

在許多動態語言（如 Python、JavaScript）中，變數就像一個可以隨意替換標籤的盒子；但在 Rust 中，變數受到編譯器極為嚴格的監控。

### (1) 變數的預設：不可變性 (Immutability)
在 Rust 中，使用 `let` 宣告變數時，預設是**完全不可修改的**：

```rust
let apples = 5;
// apples = 6; // ❌ 編譯器報錯：cannot assign twice to immutable variable `apples`
```

> 💡 **為什麼 Rust 要這樣設計？**  
> 如果變數的值不會隨意變動，程式碼在多執行緒並發運行時就不會發生「競態條件（Race Condition）」，大幅減少幽靈般的 Bug！

### (2) 主動宣告可變：`mut` 關鍵字
如果你明確知道某個變數後續需要被累加或修改，必須加上 `mut`（Mutable）：

```rust
let mut score = 10;
println!("目前得分: {}", score); // 10

score = score + 5; // ✅ 合法修改
println!("更新得分: {}", score); // 15
```

### (3) 常數 (Constants) vs 不可變變數
除了 `let`，Rust 還支援 `const`：
- `const` 必須**強制標註型別**（例如 `const MAX_POINTS: u32 = 100_000;`）。
- `const` 在編譯時期就必須確定數值，不能是執行時期運算的結果。
- `const` 在程式碼的任何作用域都有效，且絕不可加上 `mut`。

### (4) 變數遮蔽 (Shadowing)：同名變數的重生魔法
Rust 允許你宣告一個與先前變數「同名」的新變數，這稱為 **遮蔽（Shadowing）**：

```rust
let spaces = "   ";           // 型別是字串切片 (&str)
let spaces = spaces.len();     // 遮蔽前者！型別變成了整數 (usize)，數值是 3
```

- **優點**：我們不需要為了轉換型別而想出像 `spaces_str` 和 `spaces_num` 這樣繁瑣的變數名稱。
- **與 `mut` 的差別**：`mut` 不能改變變數的型別，但 `let` 遮蔽可以！

---

## 2. 🎮 猜數字遊戲：在線真實輸入互動！

初學者在終端機學 Rust 最常寫的代表作就是「猜數字」。現在，**你不需要開啟本機終端機，直接在下方輸入框輸入數字，體驗 Rust 程式的即時回饋**：

<GuessingTerminal></GuessingTerminal>

---

## 3. 三大動手實作練習（線上即時修改與執行）

除了猜數字之外，我們設計了 3 個日常實用的程式例子，**你可以直接修改程式碼中的數值，點擊「▶ 立即執行」**，觀察 Rust 是如何處理運算、判斷與迴圈的！

### 範例一：溫度轉換器 (攝氏轉華氏)
- **核心觀念**：浮點數型別運算（`f64`）、數學公式計算、格式化輸出浮點小數位數 `{:.1}`。
- **動手試試看**：試著將 `celsius` 的值改成你的體溫 `36.5` 或沸點 `100.0`，看看華氏是多少！

<RustRunner snippet-key="temp_converter"></RustRunner>

---

### 範例二：BMI 健康體態計算機
- **核心觀念**：多變數宣告、除法運算、複合條件式（`if`、`else if`、`else`）邏輯判斷。
- **動手試試看**：修改 `weight_kg`（體重）與 `height_m`（身高），點擊執行檢查你的健康評級！

<RustRunner snippet-key="bmi_calculator"></RustRunner>

---

### 範例三：交通紅綠燈倒數計時器 (真實每秒停頓模擬)
- **核心觀念**：
  - 區間範圍表達式（`1..=count`）與倒序走訪（`.rev()`）。
  - **真實時間暫停**：引入標準庫 `std::thread::sleep` 與 `std::time::Duration::from_secs(1)`，讓程式在每次倒數時真正暫停 1 秒，體驗真實世界的計時模擬！
- **動手試試看**：
  - 預設倒數 3 秒方便在線快速體驗。你可以點擊「▶ 立即執行」，感受伺服器每隔一秒回傳倒數的過程！也可以試著把號誌改成 `"紅燈"`。

<RustRunner snippet-key="traffic_light"></RustRunner>

---

## 4. 本單元重點總結

1. 變數預設不可變（`let x = 5`），要修改必須明確加上 `mut`。
2. 變數遮蔽（Shadowing）允許重新用 `let` 宣告同名變數，甚至可以更換型別。
3. 控制流程 `if / else` 是表達式（Expression），可以直接將判斷結果賦值給變數。
4. 迴圈有三種：`loop`（無窮迴圈）、`while`（條件迴圈）與 `for in`（集合與範圍走訪）。
