# 03. 所有權、借用 (Ownership & Borrowing)

所有權（Ownership）是 Rust 最核心也最獨特的概念。它是 Rust 無需垃圾回收（GC）卻能保證記憶體安全的關鍵！

---

## 1. 所有權三大黃金法則

請牢記這三條規則，所有的 Rust 程式碼都受其規範：

1. **Rust 中的每一個數值都有一個被稱為其「擁有者（Owner）」的變數。**
2. **同一時間，一個數值只能有一個擁有者。**
3. **當擁有者離開其作用域（Scope）時，該數值將會被自動釋放（Drop）。**

---

## 2. 堆疊 (Stack) vs 堆積 (Heap)

- **堆疊（Stack）**：先進後出，速度極快。儲存大小已知且固定長度的資料（例如基本型別 `i32`, `bool`, `f64`）。
- **堆積（Heap）**：速度較慢，儲存大小未知或在執行時期會動態增長的資料（例如 `String`, `Vec<T>`）。

---

## 3. 移動 (Move) vs 複製 (Copy)

當我們將一個變數賦值給另一個變數時：

- **Copy**：對於大小固定的型別（有實作 `Copy` trait 的，例如整數），資料會直接在 Stack 上完整複製一份。
- **Move**：對於動態堆積型別（如 `String`），Rust 僅複製 Stack 上的指標與長度，並**讓原本的變數失效**，轉移擁有權。

```rust
let s1 = String::from("hello");
let s2 = s1; // 所有權轉移給 s2，s1 失效！

// println!("{}", s1); // ❌ 編譯錯誤：borrow of moved value: `s1`
```

---

## 4. 🧠 記憶體與所有權視覺化模擬

點擊下方步驟按鈕，觀察 `s1` 與 `s2` 在 Stack 和 Heap 記憶體中的流轉過程：

<OwnershipVisualizer />

---

## 5. 參照與借用 (References & Borrowing)

如果我們不想交出所有權，但想讓其他函式「看一眼」或「讀取」資料呢？
答案就是使用 **參照（`&`）**，這個動作稱為 **借用（Borrowing）**。

### 借用的兩大鐵律：
1. 在任何特定時間點，你只能擁有**一個可變參照（`&mut T`）**，或者**多個不可變參照（`&T`）**。
2. 參照必須永遠有效（不可指向已釋放的記憶體）。

```rust
fn main() {
    let mut s = String::from("hello");
    
    // 不可變借用
    let len = calculate_length(&s);
    println!("長度是: {}", len);

    // 可變借用
    append_world(&mut s);
    println!("修改後: {}", s);
}

fn calculate_length(s: &String) -> usize {
    s.len()
}

fn append_world(s: &mut String) {
    s.push_str(", world!");
}
```

<RustRunner initial-code='fn main() {
    let mut greeting = String::from("Rust");
    
    // 借用 greeting 並傳入函式
    add_exclamation(&mut greeting);
    
    println!("結果: {}", greeting);
}

fn add_exclamation(text: &mut String) {
    text.push_str(" is Awesome! 🦀");
}' />
