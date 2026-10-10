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
  default: `fn main() {\n    println!("Hello, Rust World! 🦀");\n}`,
  temp_converter: `fn main() {\n    // 溫度轉換器：攝氏轉華氏\n    let celsius = 25.0;\n    let fahrenheit = (celsius * 9.0 / 5.0) + 32.0;\n\n    println!("🌡️ 攝氏 {:.1}°C 等於 華氏 {:.1}°F", celsius, fahrenheit);\n}`,
  bmi_calculator: `fn main() {\n    // BMI 健康計算機\n    let weight_kg = 65.0;\n    let height_m = 1.75;\n    let bmi = weight_kg / (height_m * height_m);\n\n    println!("體重: {} kg, 身高: {} m", weight_kg, height_m);\n    println!("您的 BMI 指數為: {:.2}", bmi);\n\n    if bmi < 18.5 {\n        println!("👉 體重過輕，多吃點有營養的食物！");\n    } else if bmi < 24.0 {\n        println!("👉 標準體態，保持得非常好！🎉");\n    } else {\n        println!("👉 體重過重，記得多運動喔！");\n    }\n}`,
  traffic_light: `use std::thread;\nuse std::time::Duration;\n\nfn main() {\n    // 交通紅綠燈計時器 (真實每秒模擬)\n    let light = "綠燈";\n    let count = 3; // 倒數 3 秒方便在線快速體驗\n\n    println!("🚦 目前號誌是: {}", light);\n    for i in (1..=count).rev() {\n        println!("倒數通行時間: {} 秒...", i);\n        thread::sleep(Duration::from_secs(1)); // 真正暫停 1 秒\n    }\n    println!("⚠️ 轉為黃燈，請減速停等！");\n}`,
  move_vs_copy: `fn main() {\n    // 範例 1：基本型別 Copy vs 堆積字串 Move\n    let x = 100;\n    let y = x; // 整數自動 Copy，x 依然有效\n    println!("x = {}, y = {} (兩個都安好！)", x, y);\n\n    let s1 = String::from("Rust");\n    let s2 = s1; // 所有權轉移 (Move)，s1 失效\n    println!("s2 拿到了: {}", s2);\n    // 試著取消下方這行註解，看看編譯器會怎麼阻止你！\n    // println!("s1 = {}", s1);\n}`,
  borrow_calculate: `fn main() {\n    // 範例 2：用借用 (&) 解決所有權被拿走的問題\n    let my_book = String::from("Rust 程式設計聖經");\n\n    // 傳遞不可變參照 &my_book (只借給函式看，不交出所有權)\n    let len = get_length(&my_book);\n\n    // 函式跑完後，my_book 依然由 main 擁有！可以繼續使用！\n    println!("《{}》共有 {} 個字元", my_book, len);\n}\n\nfn get_length(book: &String) -> usize {\n    book.chars().count()\n}`,
  mutable_append: `fn main() {\n    // 範例 3：可變借用 (&mut) 讓函式修改外部資料\n    let mut shopping_cart = String::from("🛒 購物車清單: 蘋果");\n\n    println!("原始清單: {}", shopping_cart);\n\n    // 借出可變參照，允許函式在後面添加商品\n    add_item(&mut shopping_cart, "、香蕉");\n    add_item(&mut shopping_cart, "、鮮奶");\n\n    println!("結帳清單: {}", shopping_cart);\n}\n\nfn add_item(cart: &mut String, item: &str) {\n    cart.push_str(item);\n}`,
  struct_user: `#[derive(Debug)]\nstruct Student {\n    name: String,\n    score: u32,\n    passed: bool,\n}\n\nimpl Student {\n    // 建構子關聯函式\n    fn new(name: &str, score: u32) -> Self {\n        Self {\n            name: name.to_string(),\n            score,\n            passed: score >= 60,\n        }\n    }\n\n    // 自訂方法：印出成績單\n    fn print_report(&self) {\n        let status = if self.passed { "及格 🎉" } else { "不及格 ⚠️" };\n        println!("學生: {} | 分數: {} | 結果: {}", self.name, self.score, status);\n    }\n}\n\nfn main() {\n    let s1 = Student::new("小明", 85);\n    let s2 = Student::new("小華", 55);\n\n    s1.print_report();\n    s2.print_report();\n}`,
  enum_web: `enum WebEvent {\n    PageLoad,\n    KeyPress(char),\n    Click { x: i64, y: i64 },\n}\n\nfn handle_event(event: WebEvent) {\n    match event {\n        WebEvent::PageLoad => println!("📄 網頁已載入完畢！"),\n        WebEvent::KeyPress(key) => println!("⌨️ 使用者按下了按鍵: '{}'", key),\n        WebEvent::Click { x, y } => println!("🖱️ 滑鼠在座標 ({}, {}) 處點擊了按鈕！", x, y),\n    }\n}\n\nfn main() {\n    let e1 = WebEvent::PageLoad;\n    let e2 = WebEvent::KeyPress('Enter');\n    let e3 = WebEvent::Click { x: 320, y: 240 };\n\n    handle_event(e1);\n    handle_event(e2);\n    handle_event(e3);\n}`,
  collections_phonebook: `use std::collections::HashMap;\n\nfn main() {\n    // 1. 動態陣列 Vec：記錄所有班級幹部\n    let mut leaders = Vec::new();\n    leaders.push("班長");\n    leaders.push("風紀股長");\n    leaders.push("學藝股長");\n    println!("班級幹部名單: {:?}", leaders);\n\n    // 2. 雜湊字典 HashMap：學號與姓名對照表\n    let mut students = HashMap::new();\n    students.insert("A01", "志賢");\n    students.insert("A02", "小美");\n    students.insert("A03", "大雄");\n\n    // 3. Option 容器查詢：查詢學號 "A01" 是否存在\n    let query_id = "A01";\n    match students.get(query_id) {\n        Some(name) => println!("查詢成功！學號 {} 的學生是: {}", query_id, name),\n        None => println!("查無此學號！"),\n    }\n}`,
  generics_container: `// 泛型結構體：萬用包裹 BoxItem<T>\nstruct BoxItem<T> {\n    content: T,\n}\n\nimpl<T> BoxItem<T> {\n    fn new(content: T) -> Self {\n        Self { content }\n    }\n    fn inspect(&self) -> &T {\n        &self.content\n    }\n}\n\nfn main() {\n    // 同一個泛型結構體，裝整數、裝浮點數、裝字串全部通用！\n    let int_box = BoxItem::new(100);\n    let float_box = BoxItem::new(3.14159);\n    let text_box = BoxItem::new("Rust 零成本抽象");\n\n    println!("整數箱裝了: {}", int_box.inspect());\n    println!("浮點箱裝了: {}", float_box.inspect());\n    println!("字串箱裝了: {}", text_box.inspect());\n}`,
  trait_media: `// 1. 定義特徵 (Trait 合約)\ntrait Playable {\n    fn play(&self);\n}\n\n// 2. 實作一：音樂歌曲\nstruct Song {\n    title: String,\n    artist: String,\n}\nimpl Playable for Song {\n    fn play(&self) {\n        println!("🎵 正在播放歌曲: {} (歌手: {})", self.title, self.artist);\n    }\n}\n\n// 3. 實作二：播客節目\nstruct Podcast {\n    episode: u32,\n    topic: String,\n}\nimpl Playable for Podcast {\n    fn play(&self) {\n        println!("🎙️ 正在播放 Podcast 第 {} 集: 《{}》", self.episode, self.topic);\n    }\n}\n\n// 4. 多型播放器函式：只要簽署了 Playable 合約都能播！\nfn start_player(media: &impl Playable) {\n    media.play();\n}\n\nfn main() {\n    let my_song = Song { title: "海闊天空".to_string(), artist: "Beyond".to_string() };\n    let my_podcast = Podcast { episode: 42, topic: "為什麼全世界都在學 Rust".to_string() };\n\n    start_player(&my_song);\n    start_player(&my_podcast);\n}`,
  trait_bound_math: `use std::fmt::Display;\n\n// 特徵約束：T 必須同時具備 Display (可列印) 與 PartialOrd (可比大小)\nfn print_champion<T: Display + PartialOrd>(label: &str, a: T, b: T) {\n    if a > b {\n        println!("🏆 {} 勝出者: {}", label, a);\n    } else if b > a {\n        println!("🏆 {} 勝出者: {}", label, b);\n    } else {\n        println!("🤝 {} 雙方平手: {}", label, a);\n    }\n}\n\nfn main() {\n    // 比數字大小 (i32 符合門檻)\n    print_champion("數字對決", 95, 88);\n\n    // 比字串字母順序 (&str 符合門檻)\n    print_champion("英文字母", "zebra", "apple");\n}`,
  trait_default: `// 範例四：特徵的「預設實作」\ntrait Greetable {\n    fn name(&self) -> &str;\n\n    // 具有預設實作的方法：型別如果不覆蓋，就使用預設台詞！\n    fn say_hello(&self) -> String {\n        format!("👋 你好！我是 {}，很高興認識你！", self.name())\n    }\n}\n\n// 實作一：一般訪客 (使用預設招呼)\nstruct Guest {\n    username: String,\n}\nimpl Greetable for Guest {\n    fn name(&self) -> &str {\n        &self.username\n    }\n    // 不寫 say_hello，自動套用預設招呼\n}\n\n// 實作二：熱情店家 (自訂特別的招呼語)\nstruct ShopOwner {\n    shop_name: String,\n}\nimpl Greetable for ShopOwner {\n    fn name(&self) -> &str {\n        &self.shop_name\n    }\n    // 覆蓋 (Override) 預設實作\n    fn say_hello(&self) -> String {\n        format!("🏮 歡迎光臨【{}】！今天全館特價中，請隨便看看！", self.shop_name)\n    }\n}\n\nfn main() {\n    let visitor = Guest { username: "志賢".to_string() };\n    let shop = ShopOwner { shop_name: "Rust 咖啡館".to_string() };\n\n    println!("{}", visitor.say_hello());\n    println!("{}", shop.say_hello());\n}`,
  where_clause_shop: `// 範例五：多重 Trait 約束與 where 語法實戰 (電商計價結帳系統)\nuse std::fmt::Display;\n\ntrait Priceable {\n    fn price(&self) -> f64;\n}\n\ntrait Weighable {\n    fn weight_kg(&self) -> f64;\n}\n\n// 商品結構體：機械鍵盤\nstruct Keyboard {\n    model: String,\n    unit_price: f64,\n    weight: f64,\n}\nimpl Priceable for Keyboard {\n    fn price(&self) -> f64 { self.unit_price }\n}\nimpl Weighable for Keyboard {\n    fn weight_kg(&self) -> f64 { self.weight }\n}\nimpl Display for Keyboard {\n    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {\n        write!(f, "鍵盤 ({})", self.model)\n    }\n}\n\n// 使用 where 子句清楚表達約束：T 必須可查價格、可秤重、可列印\nfn calculate_shipping_and_total<T>(item: &T)\nwhere\n    T: Priceable + Weighable + Display,\n{\n    let base_price = item.price();\n    // 運費規則：每公斤 60 元\n    let shipping = item.weight_kg() * 60.0;\n    let total = base_price + shipping;\n\n    println!("📦 商品名稱: {}", item);\n    println!("💰 商品售價: NT$ {:.0}", base_price);\n    println!("🚚 運送重量: {:.2} kg (運費: NT$ {:.0})", item.weight_kg(), shipping);\n    println!("🧾 應付總金額: NT$ {:.0}", total);\n}\n\nfn main() {\n    let my_item = Keyboard {\n        model: "RGB 青軸機械鍵盤".to_string(),\n        unit_price: 2480.0,\n        weight: 1.25,\n    };\n\n    calculate_shipping_and_total(&my_item);\n}`
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
