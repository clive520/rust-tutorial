# 07. 閉包、迭代器、並行 (Closures, Iterators, Concurrency)

Rust 的現代語言特性體現在**函數式程式設計**與**無懼並發（Fearless Concurrency）**上。

---

## 1. 閉包 (Closures)

閉包是可以儲存在變數中或作為引數傳遞給其他函式的匿名函式，能夠捕獲定義時周圍環境的值：

```rust
let add_one = |x: i32| x + 1;
println!("{}", add_one(5)); // 印出 6
```

---

## 2. 迭代器 (Iterators)

迭代器負責為序列中的每個項目執行處理邏輯。在 Rust 中，迭代器是**惰性的（Lazy）**，且享有**零成本抽象**（效能不輸手寫 while 迴圈）：

```rust
let v1 = vec![1, 2, 3];
let v2: Vec<_> = v1.iter().map(|x| x * 2).collect();
```

---

## 3. 無懼並發：執行緒與訊息傳遞 (Channel)

傳統多執行緒最怕資料競爭（Data Races）。Rust 的型別系統與所有權機制在編譯時期就能防範這類錯誤：

```rust
use std::sync::mpsc;
use std::thread;

let (tx, rx) = mpsc::channel();

thread::spawn(move || {
    let val = String::from("來自子執行緒的問候！");
    tx.send(val).unwrap();
});

let received = rx.recv().unwrap();
println!("收到：{}", received);
```

---

## 4. 在線動手玩：多執行緒平行計算

<RustRunner initial-code='use std::sync::mpsc;
use std::thread;

fn main() {
    let (tx, rx) = mpsc::channel();

    // 啟動 3 個背景執行緒
    for i in 1..=3 {
        let thread_tx = tx.clone();
        thread::spawn(move || {
            let msg = format!("執行緒 #{} 完成工作！", i);
            thread_tx.send(msg).unwrap();
        });
    }

    drop(tx); // 關閉原本的發送端，以便接收端知道何時結束

    for received in rx {
        println!("主執行緒收到: {}", received);
    }
}' />
