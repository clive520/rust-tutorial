<template>
  <div class="guess-game-box">
    <div class="game-header">
      <div class="header-title">
        <span class="game-icon">🎮</span>
        <h4>Rust 猜數字真實互動模擬器 (Web Terminal)</h4>
      </div>
      <button class="reset-btn" @click="resetGame">🔄 重新一局</button>
    </div>

    <!-- 終端機模擬畫面 -->
    <div class="terminal-screen" ref="screenRef">
      <div v-for="(line, idx) in logs" :key="idx" class="terminal-line" :class="line.type">
        <span class="prefix" v-if="line.type === 'system'">[系統]</span>
        <span class="prefix" v-else-if="line.type === 'user'">[玩家輸入] ></span>
        <span class="prefix" v-else-if="line.type === 'bot'">[Rust 程式]</span>
        <span class="text">{{ line.text }}</span>
      </div>
    </div>

    <!-- 玩家輸入互動區 -->
    <div class="input-bar" v-if="!gameOver">
      <span class="input-prompt">> 請輸入 1 ~ 100 猜測數字：</span>
      <input
        v-model="userInput"
        type="number"
        min="1"
        max="100"
        placeholder="例如: 50"
        @keyup.enter="submitGuess"
        ref="inputRef"
      />
      <button class="submit-btn" @click="submitGuess">送出猜測 (Enter)</button>
    </div>

    <div v-else class="game-over-banner">
      <span>🎉 恭喜！你總共猜了 <strong>{{ attempts }}</strong> 次！</span>
      <button class="play-again-btn" @click="resetGame">再玩一次</button>
    </div>

    <!-- 程式碼對照解析 -->
    <div class="code-explain">
      <details>
        <summary>💡 查看這背後對應的 Rust 核心語法（點擊展開）</summary>
        <pre><code>// 1. 產生 1~100 隨機數
let secret_number = rand::thread_rng().gen_range(1..=100);

// 2. 迴圈讀取輸入與轉型
loop {
    let mut guess = String::new();
    io::stdin().read_line(&mut guess).expect("讀取失敗");
    let guess: u32 = match guess.trim().parse() {
        Ok(num) => num,
        Err(_) => continue,
    };

    // 3. 匹配比較
    match guess.cmp(&secret_number) {
        Ordering::Less => println!("太小了！"),
        Ordering::Greater => println!("太大了！"),
        Ordering::Equal => {
            println!("🎉 恭喜猜中！");
            break;
        }
    }
}</code></pre>
      </details>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

const secret = ref(0)
const attempts = ref(0)
const userInput = ref('')
const gameOver = ref(false)
const screenRef = ref(null)
const inputRef = ref(null)

const logs = ref([])

function resetGame() {
  secret.value = Math.floor(Math.random() * 100) + 1
  attempts.value = 0
  gameOver.value = false
  userInput.value = ''
  logs.value = [
    { type: 'system', text: '編譯完成：target/debug/guessing_game 執行中...' },
    { type: 'bot', text: '歡迎來到 Rust 猜數字遊戲！祕密數字已生成 (1~100)。' }
  ]
  nextTick(() => {
    inputRef.value?.focus()
  })
}

function scrollToBottom() {
  nextTick(() => {
    if (screenRef.value) {
      screenRef.value.scrollTop = screenRef.value.scrollHeight
    }
  })
}

function submitGuess() {
  const val = parseInt(userInput.value)
  if (isNaN(val) || val < 1 || val > 100) {
    logs.value.push({ type: 'system', text: '⚠️ 請輸入有效的數字 (1~100)！' })
    userInput.value = ''
    scrollToBottom()
    return
  }

  attempts.value++
  logs.value.push({ type: 'user', text: `${val}` })

  if (val < secret.value) {
    logs.value.push({ type: 'bot', text: `👉 ${val} 太小了！ (Ordering::Less)` })
  } else if (val > secret.value) {
    logs.value.push({ type: 'bot', text: `👉 ${val} 太大了！ (Ordering::Greater)` })
  } else {
    logs.value.push({ type: 'bot', text: `🎉 恭喜你猜中了！祕密數字就是 ${secret.value}！(Ordering::Equal)` })
    gameOver.value = true
  }

  userInput.value = ''
  scrollToBottom()
}

onMounted(() => {
  resetGame()
})
</script>

<style scoped>
.guess-game-box {
  margin: 1.8rem 0;
  border-radius: 8px;
  background: #18181b;
  color: #f4f4f5;
  border: 1px solid #27272a;
  overflow: hidden;
  font-family: var(--vp-font-family-mono);
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1.2rem;
  background: #27272a;
  border-bottom: 1px solid #3f3f46;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-title h4 {
  margin: 0;
  font-size: 0.95rem;
  color: #fb923c;
}

.reset-btn {
  background: #3f3f46;
  color: #e4e4e7;
  border: none;
  padding: 0.3rem 0.7rem;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.2s;
}

.reset-btn:hover {
  background: #52525b;
}

.terminal-screen {
  padding: 1.2rem;
  max-height: 220px;
  min-height: 180px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 0.88rem;
  background: #09090b;
}

.terminal-line {
  line-height: 1.5;
}

.terminal-line.system {
  color: #a1a1aa;
}

.terminal-line.user {
  color: #38bdf8;
  font-weight: 600;
}

.terminal-line.bot {
  color: #4ade80;
}

.prefix {
  margin-right: 0.5rem;
}

.input-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.8rem 1.2rem;
  background: #18181b;
  border-top: 1px solid #27272a;
}

.input-prompt {
  font-size: 0.85rem;
  color: #a1a1aa;
}

.input-bar input {
  width: 100px;
  background: #27272a;
  border: 1px solid #3f3f46;
  color: #ffffff;
  padding: 0.4rem 0.6rem;
  border-radius: 4px;
  outline: none;
  font-family: inherit;
}

.input-bar input:focus {
  border-color: #fb923c;
}

.submit-btn {
  background: #ea580c;
  color: white;
  border: none;
  padding: 0.4rem 0.9rem;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  font-weight: 600;
}

.submit-btn:hover {
  background: #f97316;
}

.game-over-banner {
  padding: 0.8rem 1.2rem;
  background: #14532d;
  color: #bbf7d0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.play-again-btn {
  background: #22c55e;
  color: #052e16;
  border: none;
  padding: 0.35rem 0.8rem;
  border-radius: 4px;
  font-weight: 700;
  cursor: pointer;
}

.code-explain {
  padding: 0.6rem 1.2rem;
  background: #18181b;
  border-top: 1px dashed #27272a;
  font-size: 0.8rem;
  color: #a1a1aa;
}

.code-explain summary {
  cursor: pointer;
  color: #fb923c;
}

.code-explain pre {
  margin-top: 0.5rem;
  padding: 0.6rem;
  background: #09090b;
  border-radius: 4px;
  color: #e4e4e7;
}
</style>
