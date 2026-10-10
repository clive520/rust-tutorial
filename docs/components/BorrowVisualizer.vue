<template>
  <div class="borrow-visualizer">
    <div class="bv-header">
      <div class="bv-title">
        <span class="bv-icon">📚</span>
        <h4>借用規則互動模擬器：圖書館「借書」比喻</h4>
      </div>
      <p class="bv-subtitle">Rust 的借用規則就跟圖書館借書一模一樣！點選下方 3 個日常情境切換體驗：</p>
    </div>

    <!-- 情境按鈕 -->
    <div class="mode-tabs">
      <button :class="{ active: currentScenario === 'readonly' }" @click="currentScenario = 'readonly'">
        情境 1: 多人同時「唯讀閱讀」(&T) ✅
      </button>
      <button :class="{ active: currentScenario === 'mutable' }" @click="currentScenario = 'mutable'">
        情境 2: 獨佔一人「修改塗鴉」(&mut T) ✅
      </button>
      <button :class="{ active: currentScenario === 'conflict' }" @click="currentScenario = 'conflict'">
        情境 3: 邊看邊改！編譯器抓包衝突 ❌
      </button>
    </div>

    <!-- 動畫展示舞台 -->
    <div class="stage-container">
      <!-- 書本 (核心資料) -->
      <div class="resource-book" :class="{ 'book-danger': currentScenario === 'conflict' }">
        <div class="book-spine">Rust 筆記本</div>
        <div class="book-cover">
          <div class="book-status">
            狀態: <strong>{{ bookStatusText }}</strong>
          </div>
          <div class="book-data">"Hello Rust"</div>
        </div>
      </div>

      <!-- 讀者/作者 (參照) -->
      <div class="readers-zone">
        <div v-if="currentScenario === 'readonly'" class="actors-row">
          <div class="actor-card read-actor">
            <span class="actor-role">學生 A (`&book`)</span>
            <span class="actor-action">📖 戴著眼鏡安靜閱讀</span>
          </div>
          <div class="actor-card read-actor">
            <span class="actor-role">學生 B (`&book`)</span>
            <span class="actor-action">📖 戴著眼鏡安靜閱讀</span>
          </div>
          <div class="actor-card read-actor">
            <span class="actor-role">學生 C (`&book`)</span>
            <span class="actor-action">📖 戴著眼鏡安靜閱讀</span>
          </div>
        </div>

        <div v-else-if="currentScenario === 'mutable'" class="actors-row">
          <div class="actor-card write-actor">
            <span class="actor-role">作者 (`&mut book`)</span>
            <span class="actor-action">✏️ 獨佔書本，正在修改塗鴉！</span>
          </div>
        </div>

        <div v-else-if="currentScenario === 'conflict'" class="actors-row">
          <div class="actor-card read-actor">
            <span class="actor-role">讀者 (`&book`)</span>
            <span class="actor-action">👀 我正在看這行字...</span>
          </div>
          <div class="conflict-badge">💥 衝突爆炸！</div>
          <div class="actor-card write-actor-danger">
            <span class="actor-role">作者 (`&mut book`)</span>
            <span class="actor-action">✏️ 我正拿修正帶塗改這行字！</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 規則診斷說明 -->
    <div class="verdict-banner" :class="currentScenario">
      <div class="verdict-title">{{ verdictTitle }}</div>
      <div class="verdict-desc">{{ verdictDesc }}</div>
      <div class="verdict-code" v-if="verdictCode">
        <code>{{ verdictCode }}</code>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const currentScenario = ref('readonly')

const bookStatusText = computed(() => {
  if (currentScenario.value === 'readonly') return '同時被 3 人唯讀共享'
  if (currentScenario.value === 'mutable') return '被 1 人獨佔修改中'
  return '⚠️ 讀寫衝突（Data Race 危機）'
})

const verdictTitle = computed(() => {
  if (currentScenario.value === 'readonly') return '✅ 規則允許：可以有無限多個不可變參照 (&T)'
  if (currentScenario.value === 'mutable') return '✅ 規則允許：同一時間只能有「唯一一個」可變參照 (&mut T)'
  return '🛑 編譯器報錯 (E0502)：不能同時存在可變借用與不可變借用！'
})

const verdictDesc = computed(() => {
  if (currentScenario.value === 'readonly') {
    return '當大家都不修改資料時，所有人一起看是絕對安全的！不會有任何人讀到被改一半的髒資料。'
  }
  if (currentScenario.value === 'mutable') {
    return '當有人要修改資料時，其他人必須全部退開，保證他在改寫過程中沒有任何其他人會受到干擾。'
  }
  return '想像一下：A 正在讀一句話，B 突然用橡皮擦把字擦掉改寫成別的字！A 就會讀到混亂不一致的內容（這就是多執行緒最致命的資料競爭 Data Race）。Rust 編譯器在編譯期就直接把它擋下！'
})

const verdictCode = computed(() => {
  if (currentScenario.value === 'conflict') {
    return 'cannot borrow `s` as mutable because it is also borrowed as immutable'
  }
  return ''
})
</script>

<style scoped>
.borrow-visualizer {
  margin: 1.8rem 0;
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  overflow: hidden;
}

.bv-header {
  padding: 1rem 1.2rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}

.bv-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.bv-title h4 {
  margin: 0;
  font-size: 1rem;
  color: var(--vp-c-brand-1);
}

.bv-subtitle {
  margin: 0.4rem 0 0 0;
  font-size: 0.88rem;
  color: var(--vp-c-text-2);
}

.mode-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.8rem 1.2rem;
  background: var(--vp-c-bg-alt);
  border-bottom: 1px solid var(--vp-c-divider);
}

.mode-tabs button {
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-tabs button.active {
  background: var(--vp-c-brand-1);
  color: white;
  border-color: var(--vp-c-brand-1);
  font-weight: 600;
}

.stage-container {
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 1.5rem;
  padding: 1.8rem 1.2rem;
  background: var(--vp-c-bg);
}

@media (max-width: 640px) {
  .stage-container {
    flex-direction: column;
  }
}

.resource-book {
  display: flex;
  background: #3b82f6;
  color: white;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  overflow: hidden;
  min-width: 170px;
  transition: all 0.3s ease;
}

.resource-book.book-danger {
  background: #ef4444;
  animation: shake 0.5s ease-in-out infinite alternate;
}

@keyframes shake {
  from { transform: rotate(-1deg); }
  to { transform: rotate(1deg); }
}

.book-spine {
  writing-mode: vertical-rl;
  padding: 0.8rem 0.3rem;
  background: rgba(0,0,0,0.25);
  font-size: 0.75rem;
  font-weight: bold;
  letter-spacing: 2px;
}

.book-cover {
  padding: 0.8rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.book-status {
  font-size: 0.75rem;
  opacity: 0.9;
}

.book-data {
  font-family: var(--vp-font-family-mono);
  font-size: 1.05rem;
  font-weight: bold;
}

.readers-zone {
  flex: 1;
}

.actors-row {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.actor-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  border-radius: 6px;
  font-size: 0.85rem;
}

.read-actor {
  background: #ecfdf5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.write-actor {
  background: #eff6ff;
  color: #1e40af;
  border: 1px solid #bfdbfe;
}

.write-actor-danger {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.actor-role {
  font-weight: 700;
  font-family: var(--vp-font-family-mono);
}

.conflict-badge {
  text-align: center;
  font-weight: 800;
  color: #ef4444;
  font-size: 0.95rem;
}

.verdict-banner {
  padding: 1rem 1.2rem;
  border-top: 1px solid var(--vp-c-divider);
}

.verdict-banner.readonly, .verdict-banner.mutable {
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-1);
}

.verdict-banner.conflict {
  background: #fef2f2;
  color: #991b1b;
  border-top: 1px solid #f87171;
}

.verdict-title {
  font-weight: 700;
  font-size: 0.95rem;
  margin-bottom: 0.3rem;
}

.verdict-desc {
  font-size: 0.85rem;
  line-height: 1.5;
}

.verdict-code {
  margin-top: 0.5rem;
  font-family: var(--vp-font-family-mono);
  font-size: 0.85rem;
  background: #fee2e2;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  display: inline-block;
}
</style>
