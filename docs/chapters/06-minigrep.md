# 06. 文字搜尋工具 (Mini-Grep)

在本單元中，我們將綜合前面所學的所有知識，親手打造一個經典的命令列文字搜尋工具 **`minigrep`**（類似 Linux 的 `grep` 指令）！

---

## 1. 專案需求與設計

我們的 `minigrep` 將支援：
1. 接收兩個命令列參數：**要搜尋的字串** 與 **目標檔案路徑**。
2. 讀取檔案內容並逐行掃描。
3. 印出所有包含該關鍵字的行號與內容。
4. 處理可能的錯誤（如檔案不存在、參數不足）並回傳友善提示。

---

## 2. 測試驅動開發 (TDD) 實作搜尋核心

在撰寫檔案與 CLI 前，我們先撰寫核心搜尋邏輯與單元測試：

```rust
pub fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
    let mut results = Vec::new();
    for line in contents.lines() {
        if line.contains(query) {
            results.push(line);
        }
    }
    results
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn one_result() {
        let query = "duct";
        let contents = "\
Rust:
safe, fast, productive.
Pick three.";

        assert_eq!(vec!["safe, fast, productive."], search(query, contents));
    }
}
```

---

## 3. 在線動手玩：迷你搜尋引擎

<RustRunner></RustRunner>
