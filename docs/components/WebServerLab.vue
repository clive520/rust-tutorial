<template>
  <div class="webserver-lab">
    <div class="lab-header">
      <div class="header-title">
        <span class="icon">🌐</span>
        <h4>多執行緒 Web 伺服器實驗室：ThreadPool 與 HTTP 實戰</h4>
      </div>
      <p class="subtitle">發送 HTTP 請求，親眼觀察 4 位 Worker 櫃員如何並行處理，徹底杜絕阻塞！</p>
    </div>

    <!-- 執行緒池 (ThreadPool) 狀態看板 -->
    <div class="pool-dashboard">
      <div class="dashboard-header">
        <span class="d-title">👷 執行緒池 (ThreadPool) 狀態（配置 4 個固定 Worker）：</span>
        <span class="queue-stat">等待隊列中任務：{{ taskQueue.length }} 件</span>
      </div>

      <div class="workers-grid">
        <div
          v-for="w in workers"
          :key="w.id"
          class="worker-card"
          :class="{ busy: w.busy, stopped: isShutdown }"
        >
          <div class="worker-top">
            <span class="w-avatar">{{ isShutdown ? '💤' : (w.busy ? '⚡' : '🧑‍💻') }}</span>
            <div class="w-name">Worker #{{ w.id }}</div>
          </div>
          <div class="w-status">
            <span class="status-indicator"></span>
            {{ isShutdown ? '已停止服務 (Stopped)' : (w.busy ? `處理中: ${w.currentTask}` : '閒置待命中 (Idle)') }}
          </div>
          <div v-if="w.busy" class="w-progress">
            <div class="progress-bar" :style="{ width: `${w.progress}%` }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 請求控制面板 -->
    <div class="request-panel">
      <div class="panel-section-title">🚀 模擬客戶端發送 HTTP 請求：</div>
      <div class="buttons-bar">
        <button class="req-btn normal" :disabled="isShutdown" @click="sendRequest('/', 400)">
          📄 GET / (一般首頁 0.4s)
        </button>
        <button class="req-btn slow" :disabled="isShutdown" @click="sendRequest('/sleep', 3000)">
          ⏳ GET /sleep (耗時查詢 3.0s)
        </button>
        <button class="req-btn not-found" :disabled="isShutdown" @click="sendRequest('/unknown', 300)">
          ❓ GET /404 (未知路徑 0.3s)
        </button>
        <button class="req-btn burst" :disabled="isShutdown" @click="sendBurst">
          💥 瞬間並發 5 筆請求 (壓力測試)
        </button>
        <button class="shutdown-btn" :class="{ restart: isShutdown }" @click="toggleShutdown">
          {{ isShutdown ? '🔄 重啟伺服器' : '🛑 優雅停機 (Graceful Shutdown)' }}
        </button>
      </div>
    </div>

    <!-- 終端輸出與 HTTP 封包視角 -->
    <div class="terminal-display">
      <div class="term-tabs">
        <span class="term-tab-active">🖥️ 伺服器標準輸出 (stdout)</span>
        <span class="term-tip">觀察哪一個 Worker 接手哪筆任務</span>
      </div>
      <div class="term-logs" ref="logContainer">
        <div v-for="(log, idx) in serverLogs" :key="idx" class="log-line">
          <span class="log-time">[{{ log.time }}]</span>
          <span :class="['log-text', log.type]">{{ log.text }}</span>
        </div>
      </div>
    </div>

    <!-- 最近一次收到的 HTTP 回應封包 -->
    <div v-if="lastResponse" class="http-packet-box">
      <div class="packet-title">📦 最近一次客戶端收到的 HTTP 回應 (Response)：</div>
      <pre><code>{{ lastResponse }}</code></pre>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'

const isShutdown = ref(false)
const taskQueue = ref([])
const logContainer = ref(null)
const lastResponse = ref(`HTTP/1.1 200 OK\r\nContent-Length: 43\r\n\r\n<!DOCTYPE html><html><body><h1>Rust Web Server Ready!</h1></body></html>`)

const workers = reactive([
  { id: 1, busy: false, currentTask: '', progress: 0 },
  { id: 2, busy: false, currentTask: '', progress: 0 },
  { id: 3, busy: false, currentTask: '', progress: 0 },
  { id: 4, busy: false, currentTask: '', progress: 0 }
])

const serverLogs = ref([
  { time: '12:00:00', text: 'TcpListener 已成功綁定於 http://127.0.0.1:7878', type: 'info' },
  { time: '12:00:00', text: 'ThreadPool 初始化完畢：4 位 Worker 執行緒就緒待命！', type: 'success' }
])

function addLog(text, type = 'info') {
  const time = new Date().toLocaleTimeString()
  serverLogs.value.push({ time, text, type })
  if (serverLogs.value.length > 50) serverLogs.value.shift()
  nextTick(() => {
    if (logContainer.value) {
      logContainer.value.scrollTop = logContainer.value.scrollHeight
    }
  })
}

function sendRequest(path, duration) {
  if (isShutdown.value) return
  addLog(`收到連線請求：GET ${path} HTTP/1.1`, 'req')
  dispatchTask({ path, duration })
}

function sendBurst() {
  if (isShutdown.value) return
  addLog(`🚨 壓力測試觸發：瞬間湧入 5 個連線請求！`, 'warn')
  const paths = ['/', '/api/user', '/sleep', '/style.css', '/about']
  paths.forEach((p, idx) => {
    dispatchTask({ path: p, duration: p === '/sleep' ? 3000 : (idx + 1) * 300 })
  })
}

function dispatchTask(task) {
  const freeWorker = workers.find(w => !w.busy)
  if (freeWorker && !isShutdown.value) {
    executeOnWorker(freeWorker, task)
  } else {
    taskQueue.value.push(task)
    addLog(`所有 Worker 忙碌中，任務 "${task.path}" 進入 MPSC 隊列排隊等待...`, 'queue')
  }
}

async function executeOnWorker(worker, task) {
  worker.busy = true
  worker.currentTask = task.path
  worker.progress = 0
  addLog(`Worker #${worker.id} 從通道提取 Job ➔ 開始處理 ${task.path}`, 'info')

  const interval = 50
  const steps = task.duration / interval
  let currentStep = 0

  const timer = setInterval(() => {
    currentStep++
    worker.progress = Math.min(100, Math.round((currentStep / steps) * 100))
    if (currentStep >= steps) {
      clearInterval(timer)
      finishWorker(worker, task)
    }
  }, interval)
}

function finishWorker(worker, task) {
  worker.busy = false
  worker.currentTask = ''
  worker.progress = 0

  let statusCode = '200 OK'
  let html = `<h1>Hello from ${task.path}!</h1>`
  if (task.path === '/unknown') {
    statusCode = '404 NOT FOUND'
    html = `<h1>404 Oops! Page Not Found</h1>`
  }

  const res = `HTTP/1.1 ${statusCode}\r\nContent-Length: ${html.length}\r\nContent-Type: text/html\r\n\r\n${html}`
  lastResponse.value = res
  addLog(`Worker #${worker.id} 完成 ${task.path} 回應送出 ➔ 釋放回到待命狀態`, 'success')

  if (taskQueue.value.length > 0 && !isShutdown.value) {
    const nextTask = taskQueue.value.shift()
    executeOnWorker(worker, nextTask)
  }
}

async function toggleShutdown() {
  if (isShutdown.value) {
    isShutdown.value = false
    addLog(`伺服器重啟！ThreadPool 已重新生成 4 個 Worker。`, 'success')
  } else {
    isShutdown.value = true
    addLog(`[Graceful Shutdown] 收到停機信號！關閉發送通道 sender...`, 'warn')
    addLog(`等待仍在運行的 Worker 完成手上工作...`, 'warn')
    taskQueue.value = []

    await new Promise(r => setTimeout(r, 600))
    workers.forEach(w => {
      w.busy = false
      w.progress = 0
    })
    addLog(`所有 Worker 均已安全 join() 結束執行緒，伺服器乾淨關閉！`, 'success')
  }
}
</script>

<style scoped>
.webserver-lab {
  margin: 1.8rem 0;
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  overflow: hidden;
}

.lab-header {
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

.pool-dashboard {
  padding: 1.2rem;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-alt);
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
}

.d-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.queue-stat {
  font-size: 0.8rem;
  color: #3b82f6;
  font-weight: 600;
}

.workers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.8rem;
}

.worker-card {
  background: var(--vp-c-bg);
  padding: 0.8rem;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  transition: all 0.2s ease;
}

.worker-card.busy {
  border-color: #f59e0b;
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.2);
}

.worker-card.stopped {
  opacity: 0.6;
  border-color: #ef4444;
}

.worker-top {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.4rem;
}

.w-avatar {
  font-size: 1.4rem;
}

.w-name {
  font-weight: 700;
  font-size: 0.9rem;
}

.w-status {
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
}

.worker-card.busy .status-indicator {
  background: #f59e0b;
}

.worker-card.stopped .status-indicator {
  background: #ef4444;
}

.w-progress {
  margin-top: 0.5rem;
  height: 4px;
  background: var(--vp-c-bg-mute);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: #f59e0b;
  transition: width 0.05s linear;
}

.request-panel {
  padding: 1rem 1.2rem;
  background: var(--vp-c-bg);
  border-bottom: 1px solid var(--vp-c-divider);
}

.panel-section-title {
  font-size: 0.85rem;
  font-weight: 700;
  margin-bottom: 0.6rem;
  color: var(--vp-c-text-2);
}

.buttons-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.req-btn, .shutdown-btn {
  padding: 0.45rem 0.85rem;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--vp-c-divider);
  transition: all 0.15s;
}

.req-btn.normal {
  background: #ecfdf5;
  color: #065f46;
  border-color: #a7f3d0;
}

.req-btn.slow {
  background: #fffbeb;
  color: #92400e;
  border-color: #fde68a;
}

.req-btn.not-found {
  background: #f3f4f6;
  color: #374151;
}

.req-btn.burst {
  background: #eff6ff;
  color: #1e40af;
  border-color: #bfdbfe;
}

.shutdown-btn {
  background: #fef2f2;
  color: #991b1b;
  border-color: #fecaca;
  margin-left: auto;
}

.shutdown-btn.restart {
  background: #f0fdf4;
  color: #166534;
  border-color: #bbf7d0;
}

.terminal-display {
  background: #1e1e1e;
  border-bottom: 1px solid var(--vp-c-divider);
}

.term-tabs {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background: #252526;
  border-bottom: 1px solid #333333;
}

.term-tab-active {
  font-size: 0.8rem;
  font-weight: 700;
  color: #cccccc;
}

.term-tip {
  font-size: 0.75rem;
  color: #888888;
}

.term-logs {
  padding: 0.8rem 1rem;
  height: 150px;
  overflow-y: auto;
  font-family: var(--vp-font-family-mono);
  font-size: 0.78rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.log-time {
  color: #64748b;
  margin-right: 0.5rem;
}

.log-text.info { color: #94a3b8; }
.log-text.req { color: #60a5fa; font-weight: 600; }
.log-text.success { color: #4ade80; }
.log-text.warn { color: #fbbf24; }
.log-text.queue { color: #c084fc; }

.http-packet-box {
  padding: 1rem 1.2rem;
  background: var(--vp-c-bg);
}

.packet-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  margin-bottom: 0.4rem;
}

.http-packet-box pre {
  margin: 0;
  padding: 0.8rem;
  background: var(--vp-c-bg-soft);
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  font-size: 0.8rem;
  color: var(--vp-c-text-1);
  overflow-x: auto;
}
</style>
