<template>
  <div class="data-model-lab">
    <div class="lab-header">
      <div class="header-title">
        <span class="icon">🍱</span>
        <h4>Rust 資料塑模實驗室：Struct、Enum 與 Option 視覺化</h4>
      </div>
      <p class="subtitle">點擊不同概念切換，觀察 Rust 如何像樂高積木一樣組合複雜資料：</p>
    </div>

    <!-- 概念標籤切換 -->
    <div class="concept-tabs">
      <button :class="{ active: activeTab === 'struct' }" @click="activeTab = 'struct'">
        1. 結構體 Struct (便當盒模型)
      </button>
      <button :class="{ active: activeTab === 'enum' }" @click="activeTab = 'enum'">
        2. 列舉 Enum (多型態訊息)
      </button>
      <button :class="{ active: activeTab === 'option' }" @click="activeTab = 'option'">
        3. Option 安全防護盒 (告別 null)
      </button>
    </div>

    <!-- 互動內容區 -->
    <div class="content-stage">
      <!-- 1. Struct 便當盒 -->
      <div v-if="activeTab === 'struct'" class="tab-panel">
        <div class="analogy-box">
          <span class="tag">🍱 生活比喻</span>
          <p>結構體就像一個<strong>「有格子的便當盒」</strong>：你自訂每個格子放什麼菜（欄位名稱與型別），打包成一份完整的午餐！</p>
        </div>

        <div class="visual-card bento-card">
          <div class="card-headline">struct UserProfile 實體物件</div>
          <div class="bento-grid">
            <div class="bento-slot">
              <span class="slot-name">username: String</span>
              <span class="slot-val">"志賢老師"</span>
            </div>
            <div class="bento-slot">
              <span class="slot-name">email: String</span>
              <span class="slot-val">"teacher@rust.tw"</span>
            </div>
            <div class="bento-slot">
              <span class="slot-name">level: u32</span>
              <span class="slot-val">99 級</span>
            </div>
            <div class="bento-slot">
              <span class="slot-name">is_active: bool</span>
              <span class="slot-val">true (在線中)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Enum 多型態訊息 -->
      <div v-else-if="activeTab === 'enum'" class="tab-panel">
        <div class="analogy-box">
          <span class="tag">🚦 生活比喻</span>
          <p>列舉就像<strong>「多樣化包裹」</strong>：一個變數在同一時間只會是<strong>其中一種可能</strong>，而且每個型態還可以裝載不同規格的資料！</p>
        </div>

        <div class="enum-selector">
          <span class="label">點擊切換 Enum 狀態：</span>
          <button :class="{ selected: enumType === 'quit' }" @click="enumType = 'quit'">Quit (無參數)</button>
          <button :class="{ selected: enumType === 'move' }" @click="enumType = 'move'">Move { x, y } (座標)</button>
          <button :class="{ selected: enumType === 'chat' }" @click="enumType = 'chat'">Write(String) (文字)</button>
        </div>

        <div class="visual-card enum-card">
          <div class="enum-state-title">目前匹配模式 (match)：<code>Message::{{ enumTitle }}</code></div>
          <div class="enum-content-box">
            <div v-if="enumType === 'quit'">
              🚪 <strong>使用者離開系統</strong>（不需要附帶任何資料）
            </div>
            <div v-else-if="enumType === 'move'">
              🎯 <strong>角色位移指令</strong>：X 座標 = <code>120</code>, Y 座標 = <code>80</code>
            </div>
            <div v-else-if="enumType === 'chat'">
              💬 <strong>聊天室廣播</strong>：內容 = <code>"大家好，今天來學 Rust！🦀"</code>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Option 盲盒 -->
      <div v-else-if="activeTab === 'option'" class="tab-panel">
        <div class="analogy-box">
          <span class="tag">🎁 生活比喻</span>
          <p>Rust 完全沒有 Null / None 指標。它用 <strong>Option 安全盲盒</strong> 包裹：拆開前你必須明確寫出「有禮物」和「空盒子」時的處理邏輯，編譯器才肯放行！</p>
        </div>

        <div class="option-controls">
          <button :class="{ selected: hasValue }" @click="hasValue = true">🎁 箱子裡面有寶物：Some(888)</button>
          <button :class="{ selected: !hasValue }" @click="hasValue = false">📭 箱子是空的：None</button>
        </div>

        <div class="visual-card option-card" :class="{ 'is-none': !hasValue }">
          <div class="box-icon">{{ hasValue ? '🎁' : '📭' }}</div>
          <div class="box-result">
            <div class="box-type">型別：<code>Option&lt;i32&gt;</code></div>
            <div class="box-val">{{ hasValue ? 'Some(888) ➔ 成功解開數值: 888！' : 'None ➔ 安全處理空值，絕不閃退崩潰！' }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const activeTab = ref('struct')
const enumType = ref('chat')
const hasValue = ref(true)

const enumTitle = computed(() => {
  if (enumType.value === 'quit') return 'Quit'
  if (enumType.value === 'move') return 'Move { x: 120, y: 80 }'
  return 'Write("大家好，今天來學 Rust！🦀")'
})
</script>

<style scoped>
.data-model-lab {
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

.content-stage {
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

.visual-card {
  padding: 1.2rem;
  border-radius: 8px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
}

.card-headline {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 0.8rem;
}

.bento-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.8rem;
}

.bento-slot {
  display: flex;
  flex-direction: column;
  padding: 0.8rem;
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
  border: 1px dashed var(--vp-c-brand-1);
}

.slot-name {
  font-family: var(--vp-font-family-mono);
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}

.slot-val {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  margin-top: 0.3rem;
}

.enum-selector {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.enum-selector .label {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}

.enum-selector button {
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-size: 0.82rem;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
}

.enum-selector button.selected {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
  font-weight: 600;
}

.enum-state-title {
  font-size: 0.9rem;
  margin-bottom: 0.8rem;
}

.enum-content-box {
  padding: 1rem;
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
  font-size: 0.95rem;
}

.option-controls {
  display: flex;
  gap: 0.6rem;
  margin-bottom: 1rem;
}

.option-controls button {
  padding: 0.45rem 0.9rem;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.85rem;
  cursor: pointer;
}

.option-controls button.selected {
  background: #10b981;
  color: white;
  border-color: #10b981;
  font-weight: 600;
}

.option-card {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}

.option-card.is-none {
  border-color: #f59e0b;
}

.box-icon {
  font-size: 2.5rem;
}

.box-type {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}

.box-val {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-top: 0.2rem;
}
</style>
