# 05. 泛型、特徵 (Generics & Traits)

為了編寫能跨不同資料型別運作、且不犧牲執行效率與型別安全性的程式碼，Rust 提供了 **泛型（Generics）** 與 **特徵（Traits）**。

---

## 1. 泛型 (Generics)

泛型讓我們可以用抽象型別參數編寫函式或資料結構：

```rust
// 尋找切片中最大元素的泛型函式
fn largest<T: std::cmp::PartialOrd>(list: &[T]) -> &T {
    let mut largest = &list[0];
    for item in list {
        if item > largest {
            largest = item;
        }
    }
    largest
}
```

---

## 2. 特徵 (Traits)

特徵類似其他語言的「介面（Interface）」，定義了型別必須具備的共享行為：

```rust
pub trait Summary {
    fn summarize(&self) -> String;
}

pub struct Article {
    pub title: String,
    pub author: String,
}

impl Summary for Article {
    fn summarize(&self) -> String {
        format!("《{}》由 {} 撰寫", self.title, self.author)
    }
}
```

---

## 3. 在線動手玩：自訂 Trait 實作

<RustRunner></RustRunner>
