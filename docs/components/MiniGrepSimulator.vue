<template>
  <div class="minigrep-simulator">
    <div class="sim-header">
      <div class="header-title">
        <span class="icon">🔍</span>
        <h4>MiniGrep 文字雷達搜尋模擬器 (CLI 模擬終端)</h4>
      </div>
      <p class="subtitle">輸入關鍵字與文字，親身體會 UNIX 經典 grep 的「逐行掃描」與「零拷貝生命週期」：</p>
    </div>

    <!-- 快速載入情境 -->
    <div class="scenario-bar">
      <span class="bar-label">切換文本情境：</span>
      <button :class="{ active: currentPreset === 'rust' }" @click="loadPreset('rust')">🦀 Rust 官方宣言</button>
      <button :class="{ active: currentPreset === 'log' }" @click="loadPreset('log')">📋 伺服器 Log 日誌</button>
      <button :class="{ active: currentPreset === 'poem' }" @click="loadPreset('poem')">📜 經典詩歌</button>
    </div>

    <!-- 控制面板 -->
    <div class="toolbar-box">
      <div class="search-input-group">
        <span class="prompt-symbol">$ minigrep</span>
        <input
          v-model="query"
          placeholder="輸入要搜尋的關鍵字 (例如: fast, ERROR, safe)..."
          class="query-input"
        />
      </div>

      <div class="options-group">
        <label class="toggle-option">
          <input type="checkbox" v-model="ignoreCase" />
          <span>🔠 忽略大小寫 (IGNORE_CASE=1)</span>
        </label>
        <label class="toggle-option">
          <input type="checkbox" v-model="showLineNumbers" />
          <span>🔢 顯示匹配行號</span>
        </label>
      </div>
    </div>

    <!-- 左右雙欄：原始檔案 vs 搜尋終端輸出 -->
    <div class="editor-grid">
      <!-- 左欄：目標檔案內容 -->
      <div class="panel file-panel">
        <div class="panel-header">
          <span>📄 目標檔案內容 (poem.txt)</span>
          <span class="file-stat">{{ rawLines.length }} 行 / {{ rawText.length }} 字元</span>
        </div>
        <textarea
          v-model="rawText"
          class="file-textarea"
          placeholder="在此輸入或貼上任何長篇文字..."
          rows="9"
        ></textarea>
      </div>

      <!-- 右欄：Grep 終端輸出 -->
      <div class="panel terminal-panel">
        <div class="panel-header term-header">
          <span>🖥️ 搜尋結果終端 (標準輸出 stdout)</span>
          <span class="match-count">匹配結果: {{ searchResults.length }} 行</span>
        </div>
        <div class="terminal-body">
          <div v-if="!query.trim()" class="empty-hint">
            ⌨️ 請在上方輸入關鍵字開始檢索...
          </div>
          <div v-else-if="searchResults.length === 0" class="empty-hint not-found">
            ❌ 查無相符內容 (未找到任何包含 "{{ query }}" 的行)
          </div>
          <div v-else class="results-list">
            <div
              v-for="item in searchResults"
              :key="item.lineIndex"
              class="result-line"
            >
              <span v-if="showLineNumbers" class="line-badge">L{{ item.lineIndex }}:</span>
              <span class="line-text" v-html="highlightMatch(item.text)"></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 生命週期圖解說明 -->
    <div class="lifetime-card">
      <div class="card-title">
        <span class="badge-tag">🧠 Rust 生命週期實戰揭秘</span>
        <code>fn search&lt;'a&gt;(query: &amp;str, contents: &amp;'a str) -&gt; Vec&lt;&amp;'a str&gt;</code>
      </div>
      <p class="desc">
        為什麼這裡需要 <code>'a</code>？因為搜尋結果 <code>Vec&lt;&amp;'a str&gt;</code> 裡面每一行字串，都只是<strong>「借用」</strong>原始檔案 <code>contents</code> 中的記憶體切片！
        <strong>只要原檔案還在記憶體中，切片就 100% 安全有效，且完全沒有複製任何字串（零額外記憶體分配）！</strong>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const currentPreset = ref('rust')
const query = ref('safe')
const ignoreCase = ref(false)
const showLineNumbers = ref(true)

const presets = {
  rust: `Rust:
safe, fast, productive.
Pick three.
Trust me, Rust will make your software safer!
No data races, no memory leaks.
Enjoy coding with Rust.`,
  log: `[2026-10-10 12:00:01] INFO  Server started on port 8080
[2026-10-10 12:01:15] WARN  High memory usage detected (82%)
[2026-10-10 12:02:40] ERROR Connection timeout from 192.168.1.105
[2026-10-10 12:03:12] INFO  Heartbeat check OK
[2026-10-10 12:04:05] ERROR Database query failed: dead lock`,
  poem: `To be, or not to be, that is the question:
Whether 'tis nobler in the mind to suffer
The slings and arrows of outrageous fortune,
Or to take arms against a sea of troubles
And by opposing end them.`
}

const rawText = ref(presets.rust)

function loadPreset(name) {
  currentPreset.value = name
  rawText.value = presets[name]
  if (name === 'rust') query.value = 'safe'
  if (name === 'log') query.value = 'ERROR'
  if (name === 'poem') query.value = 'to'
}

const rawLines = computed(() => {
  return rawText.value.split('\n')
})

const searchResults = computed(() => {
  const q = query.value.trim()
  if (!q) return []

  const list = []
  const targetQuery = ignoreCase.value ? q.toLowerCase() : q

  rawLines.value.forEach((line, idx) => {
    const compLine = ignoreCase.value ? line.toLowerCase() : line
    if (compLine.includes(targetQuery)) {
      list.push({
        lineIndex: idx + 1,
        text: line
      })
    }
  })
  return list
})

function highlightMatch(line) {
  const q = query.value.trim()
  if (!q) return line

  // Escape special regex characters
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const flags = ignoreCase.value ? 'gi' : 'g'
  const regex = new RegExp(`(${escaped})`, flags)

  return line.replace(regex, '<mark class="hl-match">$1</mark>')
}
</script>

<style scoped>
.minigrep-simulator {
  margin: 1.8rem 0;
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  overflow: hidden;
}

.sim-header {
  padding: 1rem 1.2rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-title h4 {
  margin: 0;
  font-size: 1rem;
  color: var(--vp-c-brand-1);
}

.subtitle {
  margin: 0.3rem 0 0 0;
  font-size: 0.88rem;
  color: var(--vp-c-text-2);
}

.scenario-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.7rem 1.2rem;
  background: var(--vp-c-bg-alt);
  border-bottom: 1px solid var(--vp-c-divider);
}

.bar-label {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  font-weight: 600;
}

.scenario-bar button {
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.2s;
}

.scenario-bar button.active {
  background: var(--vp-c-brand-1);
  color: white;
  border-color: var(--vp-c-brand-1);
  font-weight: 600;
}

.toolbar-box {
  padding: 0.9rem 1.2rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background: var(--vp-c-bg);
  border-bottom: 1px solid var(--vp-c-divider);
}

.search-input-group {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex: 1;
  min-width: 260px;
}

.prompt-symbol {
  font-family: var(--vp-font-family-mono);
  font-size: 0.88rem;
  font-weight: 700;
  color: #3b82f6;
}

.query-input {
  flex: 1;
  padding: 0.45rem 0.8rem;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
  font-size: 0.9rem;
  outline: none;
}

.query-input:focus {
  border-color: var(--vp-c-brand-1);
}

.options-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.82rem;
}

.toggle-option {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
  user-select: none;
}

.editor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 0;
  border-bottom: 1px solid var(--vp-c-divider);
}

.panel {
  display: flex;
  flex-direction: column;
}

.file-panel {
  border-right: 1px solid var(--vp-c-divider);
}

.panel-header {
  padding: 0.6rem 1rem;
  font-size: 0.8rem;
  font-weight: 700;
  background: var(--vp-c-bg-alt);
  border-bottom: 1px solid var(--vp-c-divider);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.file-stat {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}

.file-textarea {
  width: 100%;
  border: none;
  padding: 0.8rem 1rem;
  font-family: var(--vp-font-family-mono);
  font-size: 0.85rem;
  line-height: 1.6;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  outline: none;
  resize: vertical;
  box-sizing: border-box;
}

.term-header {
  background: #252526;
  color: #cccccc;
}

.match-count {
  font-size: 0.75rem;
  color: #4ade80;
}

.terminal-body {
  padding: 0.8rem 1rem;
  background: #1e1e1e;
  color: #d4d4d4;
  font-family: var(--vp-font-family-mono);
  font-size: 0.85rem;
  min-height: 180px;
  overflow-y: auto;
}

.empty-hint {
  color: #888888;
  font-style: italic;
  padding: 1rem 0;
}

.empty-hint.not-found {
  color: #f87171;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.result-line {
  line-height: 1.5;
  display: flex;
  gap: 0.6rem;
  word-break: break-all;
}

.line-badge {
  color: #60a5fa;
  font-weight: 700;
  user-select: none;
}

.line-text :deep(.hl-match) {
  background-color: #f59e0b;
  color: #000000;
  padding: 0 0.2rem;
  border-radius: 3px;
  font-weight: 700;
}

.lifetime-card {
  padding: 1rem 1.2rem;
  background: var(--vp-c-bg);
}

.card-title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 0.5rem;
}

.badge-tag {
  font-size: 0.75rem;
  font-weight: 700;
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.desc {
  margin: 0;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}
</style>
