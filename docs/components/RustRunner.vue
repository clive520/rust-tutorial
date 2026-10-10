<template>
  <div class="rust-runner">
    <div class="runner-header">
      <span class="runner-badge">🦀 互動程式碼實驗區</span>
      <button class="run-button" :disabled="loading" @click="runCode">
        <span v-if="loading">⏳ 編譯執行中...</span>
        <span v-else>▶ 立即執行 (Run)</span>
      </button>
    </div>

    <!-- 隱藏插槽容器以擷取 slot 內容 -->
    <div ref="slotContainer" style="display: none;">
      <slot></slot>
    </div>

    <div class="editor-wrap">
      <textarea
        v-model="code"
        rows="10"
        class="code-input"
        spellcheck="false"
      ></textarea>
    </div>

    <div v-if="output || error" class="output-box" :class="{ 'has-error': error }">
      <div class="output-title">執行輸出：</div>
      <pre><code>{{ output || error }}</code></pre>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  initialCode: {
    type: String,
    default: ''
  },
  snippetKey: {
    type: String,
    default: 'default'
  }
})

const snippets = {
  default: `fn main() {\n    println!("Hello, Rust World! 🦀");
}`,
  temp_converter: `fn main() {\n    // 溫度轉換器：攝氏轉華氏\n    let celsius = 25.0;\n    let fahrenheit = (celsius * 9.0 / 5.0) + 32.0;\n\n    println!("🌡️ 攝氏 {:.1}°C 等於 華氏 {:.1}°F", celsius, fahrenheit);
}`,
  bmi_calculator: `fn main() {\n    // BMI 健康計算機\n    let weight_kg = 65.0;\n    let height_m = 1.75;\n    let bmi = weight_kg / (height_m * height_m);\n\n    println!("體重: {} kg, 身高: {} m", weight_kg, height_m);\n    println!("您的 BMI 指數為: {:.2}", bmi);\n\n    if bmi < 18.5 {\n        println!("👉 體重過輕，多吃點有營養的食物！");
} else if bmi < 24.0 {\n        println!("👉 標準體態，保持得非常好！🎉");
} else {\n        println!("👉 體重過重，記得多運動喔！");
}
}`,
  traffic_light: `use std::thread;\nuse std::time::Duration;\n\nfn main() {\n    // 交通紅綠燈計時器 (真實每秒模擬)\n    let light = "綠燈";\n    let count = 3; // 倒數 3 秒方便在線快速體驗\n\n    println!("🚦 目前號誌是: {}", light);\n    for i in (1..=count).rev() {\n        println!("倒數通行時間: {} 秒...", i);\n        thread::sleep(Duration::from_secs(1)); // 真正暫停 1 秒
}\n    println!("⚠️ 轉為黃燈，請減速停等！");
}`,
  move_vs_copy: `fn main() {\n    // 範例 1：基本型別 Copy vs 堆積字串 Move\n    let x = 100;\n    let y = x; // 整數自動 Copy，x 依然有效\n    println!("x = {}, y = {} (兩個都安好！)", x, y);\n\n    let s1 = String::from("Rust");\n    let s2 = s1; // 所有權轉移 (Move)，s1 失效\n    println!("s2 拿到了: {}", s2);\n    // 試著取消下方這行註解，看看編譯器會怎麼阻止你！\n    // println!("s1 = {}", s1);
}`,
  borrow_calculate: `fn main() {\n    // 範例 2：用借用 (&) 解決所有權被拿走的問題\n    let my_book = String::from("Rust 程式設計聖經");\n\n    // 傳遞不可變參照 &my_book (只借給函式看，不交出所有權)\n    let len = get_length(&my_book);\n\n    // 函式跑完後，my_book 依然由 main 擁有！可以繼續使用！\n    println!("《{}》共有 {} 個字元", my_book, len);
}\n\nfn get_length(book: &String) -> usize {\n    book.chars().count()
}`,
  mutable_append: `fn main() {\n    // 範例 3：可變借用 (&mut) 讓函式修改外部資料\n    let mut shopping_cart = String::from("🛒 購物車清單: 蘋果");\n\n    println!("原始清單: {}", shopping_cart);\n\n    // 借出可變參照，允許函式在後面添加商品\n    add_item(&mut shopping_cart, "、香蕉");\n    add_item(&mut shopping_cart, "、鮮奶");\n\n    println!("結帳清單: {}", shopping_cart);
}\n\nfn add_item(cart: &mut String, item: &str) {\n    cart.push_str(item);
}`,
  struct_user: `#[derive(Debug)]\nstruct Student {\n    name: String
  score: u32
  passed: bool
  }\n\nimpl Student {\n    // 建構子關聯函式\n    fn new(name: &str, score: u32) -> Self {\n        Self {\n            name: name.to_string()
  score
  passed: score >= 60
  }
}\n\n    // 自訂方法：印出成績單\n    fn print_report(&self) {\n        let status = if self.passed { "及格 🎉" } else { "不及格 ⚠️" };\n        println!("學生: {} | 分數: {} | 結果: {}", self.name, self.score, status);
}
}\n\nfn main() {\n    let s1 = Student::new("小明", 85);\n    let s2 = Student::new("小華", 55);\n\n    s1.print_report();\n    s2.print_report();
}`,
  enum_web: `enum WebEvent {\n    PageLoad
  KeyPress(char)
  Click { x: i64, y: i64 }
  }\n\nfn handle_event(event: WebEvent) {\n    match event {\n        WebEvent::PageLoad => println!("📄 網頁已載入完畢！")
  WebEvent::KeyPress(key) => println!("⌨️ 使用者按下了按鍵: '{}'", key)
  WebEvent::Click { x, y } => println!("🖱️ 滑鼠在座標 ({}, {}) 處點擊了按鈕！", x, y)
  }
}\n\nfn main() {\n    let e1 = WebEvent::PageLoad;\n    let e2 = WebEvent::KeyPress('Enter');\n    let e3 = WebEvent::Click { x: 320, y: 240 };\n\n    handle_event(e1);\n    handle_event(e2);\n    handle_event(e3);
}`,
  collections_phonebook: `use std::collections::HashMap;\n\nfn main() {\n    // 1. 動態陣列 Vec：記錄所有班級幹部\n    let mut leaders = Vec::new();\n    leaders.push("班長");\n    leaders.push("風紀股長");\n    leaders.push("學藝股長");\n    println!("班級幹部名單: {:?}", leaders);\n\n    // 2. 雜湊字典 HashMap：學號與姓名對照表\n    let mut students = HashMap::new();\n    students.insert("A01", "志賢");\n    students.insert("A02", "小美");\n    students.insert("A03", "大雄");\n\n    // 3. Option 容器查詢：查詢學號 "A01" 是否存在\n    let query_id = "A01";\n    match students.get(query_id) {\n        Some(name) => println!("查詢成功！學號 {} 的學生是: {}", query_id, name)
  None => println!("查無此學號！")
  }
}`,
  generics_container: `// 泛型結構體：萬用包裹 BoxItem<T>\nstruct BoxItem<T> {\n    content: T
  }\n\nimpl<T> BoxItem<T> {\n    fn new(content: T) -> Self {\n        Self { content }
}\n    fn inspect(&self) -> &T {\n        &self.content
}
}\n\nfn main() {\n    // 同一個泛型結構體，裝整數、裝浮點數、裝字串全部通用！\n    let int_box = BoxItem::new(100);\n    let float_box = BoxItem::new(3.14159);\n    let text_box = BoxItem::new("Rust 零成本抽象");\n\n    println!("整數箱裝了: {}", int_box.inspect());\n    println!("浮點箱裝了: {}", float_box.inspect());\n    println!("字串箱裝了: {}", text_box.inspect());
}`,
  trait_media: `// 1. 定義特徵 (Trait 合約)\ntrait Playable {\n    fn play(&self);
}\n\n// 2. 實作一：音樂歌曲\nstruct Song {\n    title: String
  artist: String
  }\nimpl Playable for Song {\n    fn play(&self) {\n        println!("🎵 正在播放歌曲: {} (歌手: {})", self.title, self.artist);
}
}\n\n// 3. 實作二：播客節目\nstruct Podcast {\n    episode: u32
  topic: String
  }\nimpl Playable for Podcast {\n    fn play(&self) {\n        println!("🎙️ 正在播放 Podcast 第 {} 集: 《{}》", self.episode, self.topic);
}
}\n\n// 4. 多型播放器函式：只要簽署了 Playable 合約都能播！\nfn start_player(media: &impl Playable) {\n    media.play();
}\n\nfn main() {\n    let my_song = Song { title: "海闊天空".to_string(), artist: "Beyond".to_string() };\n    let my_podcast = Podcast { episode: 42, topic: "為什麼全世界都在學 Rust".to_string() };\n\n    start_player(&my_song);\n    start_player(&my_podcast);
}`,
  trait_bound_math: `use std::fmt::Display;\n\n// 特徵約束：T 必須同時具備 Display (可列印) 與 PartialOrd (可比大小)\nfn print_champion<T: Display + PartialOrd>(label: &str, a: T, b: T) {\n    if a > b {\n        println!("🏆 {} 勝出者: {}", label, a);
} else if b > a {\n        println!("🏆 {} 勝出者: {}", label, b);
} else {\n        println!("🤝 {} 雙方平手: {}", label, a);
}
}\n\nfn main() {\n    // 比數字大小 (i32 符合門檻)\n    print_champion("數字對決", 95, 88);\n\n    // 比字串字母順序 (&str 符合門檻)\n    print_champion("英文字母", "zebra", "apple");
}`,
  trait_default: `// 範例四：特徵的「預設實作」\ntrait Greetable {\n    fn name(&self) -> &str;\n\n    // 具有預設實作的方法：型別如果不覆蓋，就使用預設台詞！\n    fn say_hello(&self) -> String {\n        format!("👋 你好！我是 {}，很高興認識你！", self.name())
}
}\n\n// 實作一：一般訪客 (使用預設招呼)\nstruct Guest {\n    username: String
  }\nimpl Greetable for Guest {\n    fn name(&self) -> &str {\n        &self.username
}\n    // 不寫 say_hello，自動套用預設招呼
}\n\n// 實作二：熱情店家 (自訂特別的招呼語)\nstruct ShopOwner {\n    shop_name: String
  }\nimpl Greetable for ShopOwner {\n    fn name(&self) -> &str {\n        &self.shop_name
}\n    // 覆蓋 (Override) 預設實作\n    fn say_hello(&self) -> String {\n        format!("🏮 歡迎光臨【{}】！今天全館特價中，請隨便看看！", self.shop_name)
}
}\n\nfn main() {\n    let visitor = Guest { username: "志賢".to_string() };\n    let shop = ShopOwner { shop_name: "Rust 咖啡館".to_string() };\n\n    println!("{}", visitor.say_hello());\n    println!("{}", shop.say_hello());
}`,
  where_clause_shop: `// 範例五：多重 Trait 約束與 where 語法實戰 (電商計價結帳系統)\nuse std::fmt::Display;\n\ntrait Priceable {\n    fn price(&self) -> f64;
}\n\ntrait Weighable {\n    fn weight_kg(&self) -> f64;
}\n\n// 商品結構體：機械鍵盤\nstruct Keyboard {\n    model: String
  unit_price: f64
  weight: f64
  }\nimpl Priceable for Keyboard {\n    fn price(&self) -> f64 { self.unit_price }
}\nimpl Weighable for Keyboard {\n    fn weight_kg(&self) -> f64 { self.weight }
}\nimpl Display for Keyboard {\n    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {\n        write!(f, "鍵盤 ({})", self.model)
}
}\n\n// 使用 where 子句清楚表達約束：T 必須可查價格、可秤重、可列印\nfn calculate_shipping_and_total<T>(item: &T)\nwhere\n    T: Priceable + Weighable + Display
  {\n    let base_price = item.price();\n    // 運費規則：每公斤 60 元\n    let shipping = item.weight_kg() * 60.0;\n    let total = base_price + shipping;\n\n    println!("📦 商品名稱: {}", item);\n    println!("💰 商品售價: NT$ {:.0}", base_price);\n    println!("🚚 運送重量: {:.2} kg (運費: NT$ {:.0})", item.weight_kg(), shipping);\n    println!("🧾 應付總金額: NT$ {:.0}", total);
}\n\nfn main() {\n    let my_item = Keyboard {\n        model: "RGB 青軸機械鍵盤".to_string()
  unit_price: 2480.0
  weight: 1.25
  };\n\n    calculate_shipping_and_total(&my_item);
}`,
  minigrep_core_lifetime: `// 範例一：minigrep 核心搜尋邏輯與生命週期驗證\n// 'a 生命週期標記保證：回傳的字串切片必須與 contents 存活一樣久！\npub fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {\n    let mut results = Vec::new();\n    for line in contents.lines() {\n        if line.contains(query) {\n            results.push(line);
}
}\n    results
}\n\nfn main() {\n    let document = "\\\nRust 程式語言特點：\\n\\\n高效 (Fast) 且安全 (Safe)。\\n\\\n保證沒有記憶體漏洞 (No Memory Leaks)！\\n\\\n快來學習 Rust 吧！";\n\n    let keyword = "安全";\n    println!("🔍 正在搜尋關鍵字: \\"{}\\"\\\\n", keyword);\n\n    let matches = search(keyword, document);\n\n    if matches.is_empty() {\n        println!("查無相符行！");
} else {\n        for (i, line) in matches.iter().enumerate() {\n            println!("  [命中 {}]: {}", i + 1, line);
}
}
}`,
  minigrep_case_insensitive: `// 範例二：大小寫敏感 vs 忽略大小寫搜尋\npub fn search_case_sensitive<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {\n    let mut results = Vec::new();\n    for line in contents.lines() {\n        if line.contains(query) {\n            results.push(line);
}
}\n    results
}\n\npub fn search_case_insensitive<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {\n    let query_lower = query.to_lowercase();\n    let mut results = Vec::new();\n    for line in contents.lines() {\n        if line.to_lowercase().contains(&query_lower) {\n            results.push(line);
}
}\n    results
}\n\nfn main() {\n    let text = "\\\nRust is fast.\\n\\\nrust is safe.\\n\\\nRUST is reliable.";\n\n    println!("--- 區分大小寫搜尋 \\"Rust\\" ---");\n    for line in search_case_sensitive("Rust", text) {\n        println!("  -> {}", line);
}\n\n    println!("\\\\n--- 忽略大小寫搜尋 \\"rust\\" (IGNORE_CASE) ---");\n    for line in search_case_insensitive("rust", text) {\n        println!("  -> {}", line);
}
}`,
  minigrep_config_parse: `// 範例三：命令列參數安全解析 (優雅錯誤處理，不崩潰)\n#[derive(Debug)]\nstruct Config {\n    query: String
  file_path: String
  }\n\nimpl Config {\n    // 使用 Result 替代 unwrap，避免參數不足時 panic 崩潰\n    fn build(args: &[String]) -> Result<Config, &'static str> {\n        if args.len() < 3 {\n            return Err("❌ 參數不足！用法範例: minigrep <關鍵字> <檔案路徑>");
}\n\n        let query = args[1].clone();\n        let file_path = args[2].clone();\n\n        Ok(Config { query, file_path })
}
}\n\nfn main() {\n    // 模擬使用者在終端機輸入的指令參數\n    let test_args_fail = vec!["minigrep".to_string(), "hello".to_string()];\n    let test_args_ok = vec!["minigrep".to_string(), "safe".to_string(), "poem.txt".to_string()];\n\n    println!("情境 1：參數不足時");\n    match Config::build(&test_args_fail) {\n        Ok(cfg) => println!("解析成功: {:?}", cfg)
  Err(err) => println!("捕捉錯誤: {}", err)
  }\n\n    println!("\\\\n情境 2：參數齊全時");\n    match Config::build(&test_args_ok) {\n        Ok(cfg) => println!("解析成功！要搜尋 '{}' 在檔案 '{}'", cfg.query, cfg.file_path)
  Err(err) => println!("捕捉錯誤: {}", err)
  }
}`,
  minigrep_iterator_version: `// 範例四：極致簡潔的迭代器 (Iterator) 函數式寫法\npub fn search_fast<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {\n    // 透過鏈式呼叫 lines -> filter -> collect，一行搞定！\n    contents\n        .lines()\n        .filter(|line| line.contains(query))\n        .collect()
}\n\nfn main() {\n    let log_data = "\\\n[INFO] 系統啟動成功\\n\\\n[WARN] 記憶體使用率高達 85%\\n\\\n[ERROR] 資料庫連線失敗\\n\\\n[INFO] 心跳包檢測正常\\n\\\n[ERROR] 外部 API 回應逾時";\n\n    let errors = search_fast("[ERROR]", log_data);\n\n    println!("🚨 搜尋到 {} 筆系統錯誤記錄：", errors.len());\n    for (idx, err_line) in errors.iter().enumerate() {\n        println!("  #{}: {}", idx + 1, err_line);
}
}`,
  closure_capture: `// 範例一：閉包 (Closure) 環境捕獲與 move 關鍵字\nfn main() {\n    let factor = 3;\n    let prefix = String::from("計算結果");\n\n    // 1. 借用環境變數的閉包 (|x| ...)\n    let multiply = |x: i32| -> i32 {\n        x * factor // 借用外面的 factor
};\n\n    println!("5 乘上 factor = {}", multiply(5));\n\n    // 2. 使用 move 強制獲取所有權的閉包\n    let print_message = move |num: i32| {\n        println!("{}: {}", prefix, num);\n        // prefix 的所有權已經搬移進閉包了！
};\n\n    print_message(100);\n    // 試著取消下方註解，編譯器會阻止你，因為 prefix 已經被 move 走囉！\n    // println!("prefix 依然存在嗎？{}", prefix);
}`,
  iterator_pipeline: `// 範例二：迭代器流水線實戰：學生成績統計分析\n#[derive(Debug)]\nstruct Student {\n    name: String
  score: u32
  }\n\nfn main() {\n    let students = vec![\n        Student { name: "小明".to_string(), score: 85 }
  Student { name: "小美".to_string(), score: 55 }
  Student { name: "大雄".to_string(), score: 42 }
  Student { name: "靜香".to_string(), score: 98 }
  Student { name: "胖虎".to_string(), score: 60 }
  ];\n\n    println!("--- 篩選及格 (>= 60) 學生並加權 5 分 ---");\n    let honored: Vec<String> = students\n        .iter()\n        .filter(|s| s.score >= 60) // 1. 篩選\n        .map(|s| format!("🎓 {} (調整後: {} 分)", s.name, s.score + 5)) // 2. 加工\n        .collect(); // 3. 收集成新向量\n\n    for record in &honored {\n        println!("  {}", record);
}\n\n    // 計算全班及格者的總分\n    let total_passed_score: u32 = students\n        .iter()\n        .filter(|s| s.score >= 60)\n        .map(|s| s.score)\n        .sum();\n\n    println!("\\\\n及格者原始總分: {} 分", total_passed_score);
}`,
  channel_mpsc: `// 範例三：MPSC 通道：多生產者與單消費者\nuse std::sync::mpsc;\nuse std::thread;\nuse std::time::Duration;\n\nfn main() {\n    // 建立多生產者、單消費者的訊息通道\n    let (tx, rx) = mpsc::channel();\n\n    // 複製發送端給第二個執行緒 (tx1)\n    let tx1 = tx.clone();\n\n    // 生產者 1\n    thread::spawn(move || {\n        let vals = vec!["1: 來自執行緒 A 的問候", "1: 執行緒 A 正在處理任務"];\n        for val in vals {\n            tx1.send(val.to_string()).unwrap();\n            thread::sleep(Duration::from_millis(50));
}
});\n\n    // 生產者 2\n    thread::spawn(move || {\n        let vals = vec!["2: 來自執行緒 B 的報告", "2: 執行緒 B 計算完畢"];\n        for val in vals {\n            tx.send(val.to_string()).unwrap();\n            thread::sleep(Duration::from_millis(70));
}
});\n\n    println!("📥 主執行緒開始等待接收訊息：");\n    // 主執行緒做為消費者，逐一接收通道訊息\n    for received in rx {\n        println!("  ✉️ 主執行緒收到: {}", received);
}\n    println!("🏁 所有發送端均已關閉，通道結束！");
}`,
  arc_mutex_counter: `// 範例四：Arc + Mutex：多執行緒共享狀態計數器\nuse std::sync::{Arc, Mutex};\nuse std::thread;\n\nfn main() {\n    // 建立包在 Mutex (互斥鎖) 與 Arc (原子參照計數) 中的計數器\n    let counter = Arc::new(Mutex::new(0));\n    let mut handles = vec![];\n\n    println!("🚀 啟動 10 個執行緒同時累加計數器...");\n\n    for i in 0..10 {\n        let counter_clone = Arc::clone(&counter);\n        let handle = thread::spawn(move || {\n            // 取得互斥鎖，此時其他執行緒必須等待\n            let mut num = counter_clone.lock().unwrap();\n            *num += 1;\n            println!("  [執行緒 #{}] 已加 1，目前數值: {}", i, *num);\n            // 離開作用域時，num 自動 drop 釋放鎖！
});\n        handles.push(handle);
}\n\n    // 等待所有執行緒執行完畢\n    for handle in handles {\n        handle.join().unwrap();
}\n\n    println!("🎉 最終計數器結果: {}", *counter.lock().unwrap());
}`
}

const slotContainer = ref(null)
const code = ref(props.initialCode || snippets[props.snippetKey] || snippets.default)

onMounted(() => {
  if (slotContainer.value && slotContainer.value.innerText.trim()) {
    code.value = slotContainer.value.innerText.trim()
  } else if (snippets[props.snippetKey]) {
    code.value = snippets[props.snippetKey]
  }
})
const output = ref('')
const error = ref('')
const loading = ref(false)

async function runCode() {
  loading.value = true
  output.value = ''
  error.value = ''

  try {
    const res = await fetch('https://play.rust-lang.org/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        channel: 'stable',
        mode: 'debug',
        edition: '2021',
        crateType: 'bin',
        tests: false,
        code: code.value,
        backtrace: false
      })
    })

    const data = await res.json()
    if (data.success) {
      output.value = data.stdout || '(程式執行完畢，無標準輸出)'
      if (data.stderr) {
        output.value += '\n[編譯器警告/訊息]:\n' + data.stderr
      }
    } else {
      error.value = data.stderr || '執行失敗，請檢查程式碼語法。'
    }
  } catch (err) {
    error.value = '無法連線至 Rust 官方 Playground 服務，請檢查網路連線。'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.rust-runner {
  margin: 1.5rem 0;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background-color: var(--vp-c-bg-soft);
  overflow: hidden;
}

.runner-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 1rem;
  background-color: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}

.runner-badge {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--vp-c-text-1);
}

.run-button {
  background: linear-align;
  background-color: #e05d44;
  color: white;
  border: none;
  padding: 0.35rem 0.9rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.run-button:hover:not(:disabled) {
  background-color: #c94c34;
  transform: translateY(-1px);
}

.run-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.editor-wrap {
  padding: 0;
}

.code-input {
  width: 100%;
  font-family: var(--vp-font-family-mono);
  font-size: 0.9rem;
  line-height: 1.5;
  padding: 0.8rem 1rem;
  border: none;
  outline: none;
  resize: vertical;
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
  box-sizing: border-box;
}

.output-box {
  padding: 0.8rem 1rem;
  border-top: 1px dashed var(--vp-c-divider);
  background: #1e1e1e;
  color: #d4d4d4;
  font-size: 0.85rem;
}

.output-box.has-error {
  background: #2a1515;
  color: #ff8b8b;
}

.output-title {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #888;
  margin-bottom: 0.3rem;
}

.output-box pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: var(--vp-font-family-mono);
}
</style>
