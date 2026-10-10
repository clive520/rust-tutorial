# 08. 網頁伺服器 (Multi-Threaded Web Server)

在終極單元中，我們將從底層的 TCP Socket 連線出發，手刻一個能夠處理並發請求的 **多執行緒 HTTP Web Server**！

---

## 1. 監聽 TCP 連線

在 Rust 標準庫中，`std::net::TcpListener` 讓我們能輕鬆建立 TCP 監聽器：

```rust
use std::net::TcpListener;

fn main() {
    let listener = TcpListener::bind("127.0.0.1:7878").unwrap();
    println!("伺服器已在 http://127.0.0.1:7878 啟動！");

    for stream in listener.incoming() {
        let stream = stream.unwrap();
        println!("收到新連線！");
    }
}
```

---

## 2. 解析 HTTP 請求與回應

一個標準的 HTTP 回應格式如下：
```http
HTTP/1.1 200 OK
Content-Length: 48

<!DOCTYPE html><html><body><h1>Hello Rust!</h1></body></html>
```

---

## 3. 建立執行緒池 (ThreadPool)

如果每來一個請求就 `thread::spawn` 一個執行緒，當連線量爆發時伺服器會耗盡記憶體崩潰。
我們透過自訂 **ThreadPool**，預先維護固定數量的 Worker 執行緒（例如 4 個），透過 Channel 指派任務：

```rust
pub struct ThreadPool {
    workers: Vec<Worker>,
    sender: Option<mpsc::Sender<Job>>,
}
```

---

## 4. 在線體驗：模擬 HTTP 回應生成

<RustRunner initial-code='fn handle_request(path: &str) -> (u16, &str, &str) {
    match path {
        "/" => (200, "OK", "<h1>歡迎來到 Rust 伺服器首頁！🦀</h1>"),
        "/about" => (200, "OK", "<p>這是以純 Rust 標準庫打造的伺服器。</p>"),
        _ => (404, "NOT FOUND", "<h1>404 找不到頁面</h1>"),
    }
}

fn main() {
    let test_paths = ["/", "/about", "/unknown"];

    for path in test_paths {
        let (status, phrase, body) = handle_request(path);
        println!("--- 請求路徑: {} ---", path);
        println!("HTTP/1.1 {} {}", status, phrase);
        println!("Content-Length: {}", body.len());
        println!("Content-Type: text/html; charset=utf-8\r\n");
        println!("{}", body);
    }
}' />
