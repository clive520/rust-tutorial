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
  traffic_light: `fn main() {\n    // 交通紅綠燈計時器\n    let light = "綠燈";\n    let count = 5;\n\n    println!("🚦 目前號誌是: {}", light);\n    for i in (1..=count).rev() {\n        println!("倒數通行時間: {} 秒...", i);\n    }\n    println!("⚠️ 轉為黃燈，請減速停等！");\n}`
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
