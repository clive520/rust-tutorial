<template>
  <div class="traffic-simulator">
    <div class="sim-header">
      <div class="header-left">
        <span class="light-badge" :class="currentLight">{{ lightText }}</span>
        <h4>🚦 交通紅綠燈即時倒數模擬器</h4>
      </div>
      <div class="controls">
        <button class="run-btn" :disabled="isRunning" @click="startSimulation">
          <span v-if="isRunning">⏳ 倒數運行中...</span>
          <span v-else>▶ 開始綠燈倒數 (Start)</span>
        </button>
        <button class="reset-btn" :disabled="isRunning" @click="resetSimulation">
          重置
        </button>
      </div>
    </div>

    <!-- 視覺化交通燈與倒數大數字 -->
    <div class="visual-stage">
      <div class="traffic-pole">
        <div class="lamp red" :class="{ lit: currentLight === 'red' }"></div>
        <div class="lamp yellow" :class="{ lit: currentLight === 'yellow' }"></div>
        <div class="lamp green" :class="{ lit: currentLight === 'green' }"></div>
      </div>

      <div class="timer-display">
        <div class="timer-label">目前剩餘通行秒數</div>
        <div class="timer-number" :class="currentLight">
          {{ remainingSeconds > 0 ? remainingSeconds : '0' }}
        </div>
        <div class="timer-status">{{ statusMessage }}</div>
      </div>
    </div>

    <!-- 即時終端日誌 (每秒逐行印出) -->
    <div class="terminal-log">
      <div class="terminal-title">標準輸出 (stdout) 即時日誌：</div>
      <div class="log-lines" ref="logContainer">
        <div v-for="(log, idx) in logs" :key="idx" class="log-line">
          <span class="timestamp">[{{ log.time }}]</span>
          <span class="text">{{ log.text }}</span>
        </div>
      </div>
    </div>

    <!-- 底層 Rust 對照代碼 -->
    <div class="code-note">
      <details>
        <summary>🔍 為什麼剛才線上 Playground 會一次全部吐出？（原理說明）</summary>
        <p>
          當我們將程式碼傳送給遠端伺服器（Rust Playground）編譯時，伺服器是在**整個程式執行完畢後**，才把全部的輸出（stdout buffer）一次透過 HTTP 回傳給瀏覽器。<br>
          在本地端（自己的電腦終端機）執行 <code>cargo run</code> 時，它就會如這個模擬器一樣，<strong>真實每秒鐘跳動並印出一行</strong>！
        </p>
      </details>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'

const isRunning = ref(false)
const remainingSeconds = ref(3)
const currentLight = ref('green') // green, yellow, red
const logs = ref([])
const logContainer = ref(null)

const lightText = computed(() => {
  if (currentLight.value === 'green') return '🟢 綠燈'
  if (currentLight.value === 'yellow') return '🟡 黃燈'
  return '🔴 紅燈'
})

const statusMessage = computed(() => {
  if (currentLight.value === 'green') return '車輛請儘速通過'
  if (currentLight.value === 'yellow') return '請減速慢行停等'
  return '請停於停止線後方'
})

function getTimeStr() {
  const d = new Date()
  return d.toTimeString().split(' ')[0]
}

function appendLog(text) {
  logs.value.push({
    time: getTimeStr(),
    text
  })
  nextTick(() => {
    if (logContainer.value) {
      logContainer.value.scrollTop = logContainer.value.scrollHeight
    }
  })
}

function resetSimulation() {
  isRunning.value = false
  remainingSeconds.value = 3
  currentLight.value = 'green'
  logs.value = []
}

async function startSimulation() {
  if (isRunning.value) return
  isRunning.value = true
  logs.value = []
  currentLight.value = 'green'
  remainingSeconds.value = 3

  appendLog('🚦 目前號誌是: 綠燈')

  for (let i = 3; i >= 1; i--) {
    remainingSeconds.value = i
    appendLog(`倒數通行時間: ${i} 秒... (模擬 thread::sleep 1秒)`)
    await new Promise(r => setTimeout(r, 1000))
  }

  remainingSeconds.value = 0
  currentLight.value = 'yellow'
  appendLog('⚠️ 轉為黃燈，請減速停等！')

  await new Promise(r => setTimeout(r, 1500))
  currentLight.value = 'red'
  appendLog('🔴 轉為紅燈，完全停止。')

  isRunning.value = false
}
</script>

<style scoped>
.traffic-simulator {
  margin: 1.8rem 0;
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  overflow: hidden;
}

.sim-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1.2rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.header-left h4 {
  margin: 0;
  font-size: 0.95rem;
  color: var(--vp-c-text-1);
}

.light-badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.light-badge.green { background: #166534; color: #bbf7d0; }
.light-badge.yellow { background: #854d0e; color: #fef08a; }
.light-badge.red { background: #991b1b; color: #fecaca; }

.controls {
  display: flex;
  gap: 0.5rem;
}

.run-btn {
  background: #ea580c;
  color: white;
  border: none;
  padding: 0.4rem 0.9rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.run-btn:hover:not(:disabled) {
  background: #c2410c;
}

.run-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.reset-btn {
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
}

.visual-stage {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2.5rem;
  padding: 1.5rem;
  background: var(--vp-c-bg);
}

.traffic-pole {
  background: #27272a;
  padding: 0.8rem 0.6rem;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  border: 2px solid #3f3f46;
}

.lamp {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  opacity: 0.2;
  transition: opacity 0.2s, box-shadow 0.2s;
}

.lamp.red { background: #ef4444; }
.lamp.yellow { background: #eab308; }
.lamp.green { background: #22c55e; }

.lamp.lit {
  opacity: 1;
}

.lamp.red.lit { box-shadow: 0 0 16px #ef4444; }
.lamp.yellow.lit { box-shadow: 0 0 16px #eab308; }
.lamp.green.lit { box-shadow: 0 0 16px #22c55e; }

.timer-display {
  text-align: center;
}

.timer-label {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}

.timer-number {
  font-family: var(--vp-font-family-mono);
  font-size: 3.5rem;
  font-weight: 900;
  line-height: 1.1;
  margin: 0.2rem 0;
}

.timer-number.green { color: #22c55e; }
.timer-number.yellow { color: #eab308; }
.timer-number.red { color: #ef4444; }

.timer-status {
  font-size: 0.85rem;
  color: var(--vp-c-text-1);
  font-weight: 600;
}

.terminal-log {
  background: #18181b;
  color: #d4d4d8;
  padding: 0.8rem 1.2rem;
  border-top: 1px solid var(--vp-c-divider);
  font-family: var(--vp-font-family-mono);
  font-size: 0.85rem;
}

.terminal-title {
  font-size: 0.75rem;
  color: #a1a1aa;
  margin-bottom: 0.4rem;
  font-weight: bold;
}

.log-lines {
  max-height: 120px;
  min-height: 80px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.log-line {
  line-height: 1.4;
}

.timestamp {
  color: #71717a;
  margin-right: 0.5rem;
}

.code-note {
  padding: 0.6rem 1.2rem;
  background: var(--vp-c-bg-mute);
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}

.code-note summary {
  cursor: pointer;
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

.code-note p {
  margin: 0.4rem 0 0 0;
}
</style>
