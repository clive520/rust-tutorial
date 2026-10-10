# 04. 結構體、列舉、集合 (Structs, Enums, Collections)

在掌握了所有權與借用後，本單元我們將進入 Rust 的資料塑模世界，學習如何自訂複雜資料型別與管理集合資料。

---

## 1. 結構體 (Struct)

結構體允許我們將多個關聯的值打包組合在一起：

```rust
struct Student {
    name: String,
    grade: u32,
    active: bool,
}

impl Student {
    // 關聯函式（建構子）
    fn new(name: &str, grade: u32) -> Self {
        Self {
            name: name.to_string(),
            grade,
            active: true,
        }
    }

    // 方法（Method）
    fn promote(&mut self) {
        self.grade += 1;
    }
}
```

---

## 2. 列舉 (Enum) 與模式匹配 (Match)

Rust 的 `enum` 非常強大，每個列舉成員都可以附帶不同的資料型別：

```rust
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
}
```

### 最重要的 Enum：Option
Rust 沒有像其他語言的 `null` 或 `nil`，而是使用 `Option` 來明確表示數值存在或不存在：
- `Some(value)`
- `None`

---

## 3. 常見集合 (Collections)

- **動態陣列** (`Vec`)：在 Heap 上動態分配、連續儲存同型別的資料。
- **字串** (`String`)：UTF-8 編碼的位元組集合。
- **雜湊映射** (`HashMap`)：鍵值對（Key-Value）儲存結構。

---

## 4. 實戰動手玩：學生資料庫

<RustRunner></RustRunner>
