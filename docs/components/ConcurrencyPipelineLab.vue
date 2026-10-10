<template>
  <div class="concurrency-lab">
    <div class="lab-header">
      <div class="header-title">
        <span class="icon">⚡</span>
        <h4>Rust 函數式與並發實驗室：流水線與無懼並發</h4>
      </div>
      <p class="subtitle">點選下方概念，親自操作「迭代器惰性流水線」、「MPSC 通道傳遞」與「Mutex 保險箱」：</p>
    </div>

    <!-- 標籤頁 -->
    <div class="concept-tabs">
      <button :class="{ active: currentTab === 'iterator' }" @click="currentTab = 'iterator'">
        1. 迭代器流水線 (Iterator Pipeline)
      </button>
      <button :class="{ active: currentTab === 'channel' }" @click="currentTab = 'channel'">
        2. MPSC 訊息通道 (Channel 傳訊)
      </button>
      <button :class="{ active: currentTab === 'mutex' }" @click="currentTab = 'mutex'">
        3. Arc + Mutex 共享保險箱
      </button>
    </div>

    <!-- 內容區域 -->
    <div class="stage-body">
      <!-- 1. 迭代器流水線 -->
      <div v-if="currentTab === 'iterator'" class="tab-panel">
        <div class="analogy-box">
          <span class="tag">🏭 生活比喻：工廠自動化傳送帶</span>
          <p>
            Rust 的迭代器是<strong>惰性的 (Lazy)</strong>。你掛上 <code>.filter()</code> 和 <code>.map()</code> 時，傳送帶根本不會動！<strong>只有當你呼叫 <code>.collect()</code> 或 <code>.sum()</code> 時，傳送帶才會通電開始生產！</strong>
          </p>
        </div>

        <div class="pipeline-controls">
          <div class="options-row">
            <label class="chk-item">
              <input type="checkbox" v-model="filterEven" />
              <span>啟用過濾器：<code>.filter(|x| x % 2 == 0)</code> (只留偶數)</span>
            </label>
            <label class="chk-item">
              <input type="checkbox" v-model="multiplyTen" />
              <span>啟用加工機：<code>.map(|x| x * 10)</code> (數值乘 10)</span>
            </label>
          </div>
          <button class="run-flow-btn" @click="runPipeline">
            ▶ 呼叫 .collect() 啟動傳送帶
          </button>
        </div>

        <div class="flow-track">
          <!-- 原始原料 -->
          <div class="stage-box">
            <div class="stage-label">原始陣列 <code>v1</code></div>
            <div class="items-row">
              <span v-for="n in rawNumbers" :key="n" class="raw-num">{{ n }}</span>
            </div>
          </div>

          <div class="arrow-sep">➔</div>

          <!-- 流水線設定 -->
          <div class="stage-box mid-box">
            <div class="stage-label">流水線處理步驟</div>
            <div class="step-badges">
              <span class="step-badge" :class="{ on: filterEven }">Filter (偶數)</span>
              <span class="step-badge" :class="{ on: multiplyTen }">Map (× 10)</span>
            </div>
          </div>

          <div class="arrow-sep">➔</div>

          <!-- 成品容器 -->
          <div class="stage-box out-box">
            <div class="stage-label">最終產出 <code>Vec</code></div>
            <div class="items-row">
              <span v-for="(n, idx) in pipelineOutput" :key="idx" class="out-num">{{ n }}</span>
              <span v-if="pipelineOutput.length === 0" class="muted-text">(請點擊按鈕啟動)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. MPSC 訊息通道 -->
      <div v-else-if="currentTab === 'channel'" class="tab-panel">
        <div class="analogy-box">
          <span class="tag">📮 生活比喻：跨部門郵件管道</span>
          <p>
            「不要透過共享記憶體來通訊，而要<strong>透過通訊來共享記憶體！</strong>」
            發送端（<code>tx</code>）將包裹丟入管道後，所有權就轉移走了，原執行緒再也無法偷看或竄改！
          </p>
        </div>

        <div class="channel-actions">
          <button class="send-btn" @click="sendMessage('A')">
            📤 執行緒 A 發送「任務報告 A」
          </button>
          <button class="send-btn" @click="sendMessage('B')">
            📤 執行緒 B 發送「溫度警報 B」
          </button>
          <button class="clear-btn" @click="channelQueue = []">
            清空收件箱
          </button>
        </div>

        <div class="channel-track">
          <div class="station-side tx-side">
            <div class="side-title">多個生產者 (Multiple Producers)</div>
            <div class="worker-pill">子執行緒 A (tx1)</div>
            <div class="worker-pill">子執行緒 B (tx2)</div>
          </div>

          <div class="pipe-middle">
            <div class="pipe-tube">
              <span class="pipe-label">MPSC 訊息通道 (Channel) ➔</span>
            </div>
          </div>

          <div class="station-side rx-side">
            <div class="side-title">單一消費者 (Single Consumer)</div>
            <div class="worker-pill active-rx">主執行緒 (rx)</div>
            <div class="inbox-box">
              <div class="inbox-title">收到的訊息隊列 (.recv())：</div>
              <div v-if="channelQueue.length === 0" class="empty-inbox">目前管道內無訊息</div>
              <ul v-else class="msg-list">
                <li v-for="(msg, i) in channelQueue" :key="i" class="msg-item">
                  ✉️ {{ msg }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Arc + Mutex 共享保險箱 -->
      <div v-else-if="currentTab === 'mutex'" class="tab-panel">
        <div class="analogy-box">
          <span class="tag">🔐 生活比喻：多把鑰匙的辦公室保險箱</span>
          <p>
            <code>Arc</code>（原子參照計數）給每個執行緒發一把安全鑰匙；<code>Mutex</code>（互斥鎖）確保同一時間只有一個人能打開保險箱修改資料！
          </p>
        </div>

        <div class="mutex-visual">
          <div class="safe-box">
            <div class="lock-indicator" :class="{ locked: isLocked }">
              {{ isLocked ? '🔒 保險箱已上鎖 (工作中...)' : '🔓 保險箱已就緒 (可上鎖存取)' }}
            </div>
            <div class="safe-content">
              <div class="counter-label">共享計數器數值：</div>
              <div class="counter-val">{{ mutexCounter }}</div>
            </div>
          </div>

          <div class="thread-action-panel">
            <p class="action-desc">點擊下方按鈕，模擬 10 個執行緒同時排隊搶鎖增加計數：</p>
            <button class="lock-btn" :disabled="isLocked" @click="runMutexSimulation">
              {{ isLocked ? '執行緒並行運算中...' : '🚀 啟動 10 個執行緒搶鎖計數 (+10)' }}
            </button>
            <div class="log-stream">
              <div v-for="(log, idx) in mutexLogs" :key="idx" class="log-entry">
                {{ log }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const currentTab = ref('iterator')

// 1. 迭代器狀態
const rawNumbers = [1, 2, 3, 4, 5, 6]
const filterEven = ref(true)
const multiplyTen = ref(true)
const pipelineOutput = ref([])

function runPipeline() {
  let list = [...rawNumbers]
  if (filterEven.value) {
    list = list.filter(x => x % 2 === 0)
  }
  if (multiplyTen.value) {
    list = list.map(x => x * 10)
  }
  pipelineOutput.value = list
}

// 2. MPSC 狀態
const channelQueue = ref(['系統就緒信號'])

function sendMessage(sender) {
  const time = new Date().toLocaleTimeString()
  if (sender === 'A') {
    channelQueue.value.push(`[${time}] 執行緒 A 回報：計算完成`)
  } else {
    channelQueue.value.push(`[${time}] 執行緒 B 警報：溫度 42°C`)
  }
}

// 3. Mutex 狀態
const mutexCounter = ref(0)
const isLocked = ref(false)
const mutexLogs = ref(['準備就緒：10 個執行緒共用 Arc::clone(&counter)'])

async function runMutexSimulation() {
  isLocked.value = true
  mutexLogs.value = ['🚀 10 個執行緒同時啟動...']

  for (let i = 1; i <= 10; i++) {
    await new Promise(r => setTimeout(r, 120))
    mutexCounter.value++
    mutexLogs.value.unshift(`執行緒 #${i} 成功取得 Lock ➔ 數值累加為 ${mutexCounter.value}`)
  }

  mutexLogs.value.unshift('🎉 所有 10 個執行緒均已安全釋放鎖！')
  isLocked.value = false
}
</script>

<style scoped>
.concurrency-lab {
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

.concept-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.8rem 1.2rem;
  background: var(--vp-c-bg-alt);
  border-bottom: 1px solid var(--vp-c-divider);
}

.concept-tabs button {
  padding: 0.45rem 0.9rem;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.concept-tabs button.active {
  background: var(--vp-c-brand-1);
  color: white;
  border-color: var(--vp-c-brand-1);
  font-weight: 600;
}

.stage-body {
  padding: 1.2rem;
}

.analogy-box {
  background: var(--vp-c-bg);
  padding: 0.8rem 1rem;
  border-radius: 6px;
  border-left: 4px solid var(--vp-c-brand-1);
  margin-bottom: 1rem;
}

.analogy-box .tag {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  display: block;
  margin-bottom: 0.2rem;
}

.analogy-box p {
  margin: 0;
  font-size: 0.88rem;
  color: var(--vp-c-text-1);
  line-height: 1.5;
}

.pipeline-controls {
  margin-bottom: 1.2rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.options-row {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.chk-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  cursor: pointer;
}

.run-flow-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.flow-track {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.8rem;
  background: var(--vp-c-bg);
  padding: 1.2rem;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
}

.stage-box {
  flex: 1;
  min-width: 140px;
  padding: 0.8rem;
  background: var(--vp-c-bg-soft);
  border-radius: 6px;
  border: 1px dashed var(--vp-c-divider);
}

.stage-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
  margin-bottom: 0.5rem;
}

.items-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.raw-num, .out-num {
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-weight: 700;
  font-size: 0.9rem;
  font-family: var(--vp-font-family-mono);
}

.raw-num {
  background: #e2e8f0;
  color: #1e293b;
}

.out-num {
  background: #10b981;
  color: white;
}

.muted-text {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}

.arrow-sep {
  font-size: 1.2rem;
  color: var(--vp-c-text-2);
}

.step-badges {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.step-badge {
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  border: 1px solid var(--vp-c-divider);
}

.step-badge.on {
  border-color: #3b82f6;
  color: #3b82f6;
  font-weight: 700;
}

.channel-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 1rem;
}

.send-btn, .clear-btn {
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  font-size: 0.82rem;
  cursor: pointer;
}

.send-btn {
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.send-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}

.clear-btn {
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-2);
}

.channel-track {
  display: grid;
  grid-template-columns: 1fr auto 1.5fr;
  gap: 1rem;
  align-items: center;
  background: var(--vp-c-bg);
  padding: 1.2rem;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
}

.side-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
  margin-bottom: 0.5rem;
}

.worker-pill {
  padding: 0.35rem 0.6rem;
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  font-size: 0.82rem;
  margin-bottom: 0.4rem;
}

.active-rx {
  border-color: #10b981;
  color: #10b981;
  font-weight: 700;
}

.pipe-tube {
  padding: 0.4rem 0.8rem;
  background: var(--vp-c-bg-soft);
  border: 2px dashed #3b82f6;
  border-radius: 20px;
  font-size: 0.75rem;
  color: #3b82f6;
  font-weight: 600;
  text-align: center;
}

.inbox-box {
  background: var(--vp-c-bg-soft);
  border-radius: 6px;
  padding: 0.8rem;
  border: 1px solid var(--vp-c-divider);
}

.inbox-title {
  font-size: 0.75rem;
  font-weight: 700;
  margin-bottom: 0.4rem;
}

.empty-inbox {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  font-style: italic;
}

.msg-list {
  margin: 0;
  padding: 0 0 0 1rem;
  font-size: 0.8rem;
}

.msg-item {
  margin-bottom: 0.2rem;
}

.mutex-visual {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}

.safe-box {
  background: var(--vp-c-bg);
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.lock-indicator {
  font-size: 0.85rem;
  font-weight: 700;
  margin-bottom: 1rem;
  padding: 0.3rem 0.6rem;
  border-radius: 20px;
  background: #ecfdf5;
  color: #065f46;
}

.lock-indicator.locked {
  background: #fef2f2;
  color: #991b1b;
}

.safe-content {
  text-align: center;
}

.counter-label {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
}

.counter-val {
  font-size: 3rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
}

.thread-action-panel {
  background: var(--vp-c-bg);
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
}

.action-desc {
  margin: 0 0 0.8rem 0;
  font-size: 0.85rem;
  color: var(--vp-c-text-1);
}

.lock-btn {
  background: #8b5cf6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 0.8rem;
}

.lock-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.log-stream {
  background: #1e1e1e;
  border-radius: 6px;
  padding: 0.8rem;
  height: 120px;
  overflow-y: auto;
  font-family: var(--vp-font-family-mono);
  font-size: 0.75rem;
  color: #4ade80;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
</style>
