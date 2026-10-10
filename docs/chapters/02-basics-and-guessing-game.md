# 02. 基本觀念、猜數字 (Basics & Guessing Game)

在熟悉了工具鏈之後，我們將透過撰寫一個經典的**「猜數字遊戲」**，快速掌握 Rust 的核心語法與基本觀念！

---

## 1. 變數與可變性 (Mutability)

在 Rust 中，變數預設是 **不可變的（Immutable）**！這項設計強迫開發者思考資料何時需要被修改，減少競態條件（Race Conditions）與 Bug。

```rust
let x = 5;
// x = 6; // ❌ 編譯錯誤！不可對不可變變數重新賦值

let mut y = 5; // ✅ 加上 mut 關鍵字代表可變變數
y = 6;
```

---

## 2. 猜數字專案實作

我們來拆解猜數字遊戲的邏輯：
1. 程式隨機產生一個 1 到 100 之間的祕密數字。
2. 提示玩家輸入猜測。
3. 讀取玩家輸入並轉型成整數。
4. 比較玩家猜測與祕密數字，提示「太小了」、「太大了」或「恭喜猜中！」。
5. 如果猜中則跳出迴圈結束遊戲。

### 核心程式碼範例

```rust
use std::cmp::Ordering;
use std::io;

fn main() {
    println!("🎮 歡迎來到 Rust 猜數字遊戲！");

    let secret_number = 42;

    println!("請輸入你猜測的數字 (1~100)：");

    let mut guess = String::new();

    io::stdin()
        .read_line(&mut guess)
        .expect("讀取輸入失敗！");

    let guess: u32 = match guess.trim().parse() {
        Ok(num) => num,
        Err(_) => {
            println!("請輸入有效的數字！");
            return;
        }
    };

    println!("你猜的數字是: {}", guess);

    match guess.cmp(&secret_number) {
        Ordering::Less => println!("太小了！"),
        Ordering::Greater => println!("太大了！"),
        Ordering::Equal => println!("🎉 恭喜你猜中了！"),
    }
}
```

---

## 3. 在線動手玩

嘗試修改下方的代碼，測試不同數字的比較結果：

<RustRunner></RustRunner>
