<template>
  <div class="rust-runner">
    <div class="runner-header">
      <span class="runner-badge">🦀 互動程式碼實驗區</span>
      <button class="run-button" :disabled="loading" @click="runCode">
        <span v-if="loading">⏳ 編譯執行中...</span>
        <span v-else>▶ 立即執行 (Run)</span>
      </button>
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
import { ref } from 'vue'

const props = defineProps({
  initialCode: {
    type: String,
    default: 'fn main() {\n    println!("Hello, Rust World!");\n}'
  }
})

const code = ref(props.initialCode.trim())
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
