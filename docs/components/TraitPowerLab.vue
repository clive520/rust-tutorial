<template>
  <div class="trait-power-lab">
    <div class="lab-header">
      <div class="header-title">
        <span class="icon">🔌</span>
        <h4>Rust 泛型與特徵實驗室：萬用插座與能力合約</h4>
      </div>
      <p class="subtitle">點選下方概念，看看 Rust 如何實現「一招多用」與「能力保證」：</p>
    </div>

    <!-- 概念切換按鈕 -->
    <div class="concept-tabs">
      <button :class="{ active: currentTab === 'generics' }" @click="currentTab = 'generics'">
        1. 泛型 Generics (萬用模板模型)
      </button>
      <button :class="{ active: currentTab === 'trait' }" @click="currentTab = 'trait'">
        2. 特徵 Trait (技能證照合約)
      </button>
      <button :class="{ active: currentTab === 'bound' }" @click="currentTab = 'bound'">
        3. 特徵約束 Trait Bound (進場資格門檻)
      </button>
    </div>

    <!-- 互動展台 -->
    <div class="stage-body">
      <!-- 1. 泛型模板 -->
      <div v-if="currentTab === 'generics'" class="tab-panel">
        <div class="analogy-box">
          <span class="tag">📐 生活比喻：雞蛋糕金屬模具</span>
          <p>你不必為紅豆口味、奶油口味、起司口味分別打造不同的鐵模具。<strong>一個泛型模具 <code>Point&lt;T&gt;</code>，倒進什麼型別的麵糊，就產出該型別的成品！</strong></p>
        </div>

        <div class="mold-controls">
          <span class="ctrl-label">選擇注入的型別 (T)：</span>
          <button :class="{ sel: genericType === 'i32' }" @click="genericType = 'i32'">整數 i32 (5, 10)</button>
          <button :class="{ sel: genericType === 'f64' }" @click="genericType = 'f64'">浮點數 f64 (3.14, 6.28)</button>
          <button :class="{ sel: genericType === 'str' }" @click="genericType = 'str'">字串 &amp;str ("東", "北")</button>
        </div>

        <div class="visual-card mold-card">
          <div class="mold-title">泛型結構體實體：<code>Point&lt;T&gt;</code></div>
          <div class="mold-box">
            <div class="field-item">
              <span class="lbl">x: {{ genericType }}</span>
              <span class="val">{{ moldSample.x }}</span>
            </div>
            <div class="field-item">
              <span class="lbl">y: {{ genericType }}</span>
              <span class="val">{{ moldSample.y }}</span>
            </div>
          </div>
          <div class="mold-tip">⚡ <strong>零成本抽象：</strong> Rust 編譯時會進行「單態化 (Monomorphization)」，生成跟手寫型別一樣快的原生機器碼！</div>
        </div>
      </div>

      <!-- 2. Trait 技能證照 -->
      <div v-else-if="currentTab === 'trait'" class="tab-panel">
        <div class="analogy-box">
          <span class="tag">🪪 生活比喻：國家技能證照</span>
          <p>特徵就是一張合約。只要擁有<strong>「會發出自我介紹 (Speak)」</strong>這張證照，管你是人類、機器人、甚至是一隻鴨子，都可以被當作會講話的實體！</p>
        </div>

        <div class="actor-select">
          <span class="ctrl-label">挑選實作 Trait 的角色：</span>
          <button :class="{ sel: speakerRole === 'human' }" @click="speakerRole = 'human'">👨 人類</button>
          <button :class="{ sel: speakerRole === 'bot' }" @click="speakerRole = 'bot'">🤖 AI 機器人</button>
          <button :class="{ sel: speakerRole === 'duck' }" @click="speakerRole = 'duck'">🦆 玩具鴨</button>
        </div>

        <div class="visual-card speaker-card">
          <div class="speaker-profile">
            <span class="avatar">{{ speakerData.avatar }}</span>
            <div>
              <div class="name">{{ speakerData.name }}</div>
              <div class="contract-badge">實作了 trait Speak ✅</div>
            </div>
          </div>
          <div class="speech-bubble">
            <span class="bubble-tag">呼叫 .speak() 回傳：</span>
            <p class="quote">"{{ speakerData.quote }}"</p>
          </div>
        </div>
      </div>

      <!-- 3. Trait Bound 門檻 -->
      <div v-else-if="currentTab === 'bound'" class="tab-panel">
        <div class="analogy-box">
          <span class="tag">🛂 生活比喻：過海關查驗護照</span>
          <p>泛型 <code>T</code> 可以是任何人，但如果你想用 <code>&gt;</code> 比較大小，就必須限制：<strong>「只有身上帶有 PartialOrd 比較護照的人，才能進來這個函式！」</strong></p>
        </div>

        <div class="bound-visual">
          <div class="fn-gate">
            <div class="gate-sign">函式入口：<code>fn print_max&lt;T: Display + PartialOrd&gt;(a: T, b: T)</code></div>
            <div class="gate-condition">要求：必須同時擁有 <code>Display</code> (可列印) 與 <code>PartialOrd</code> (可比大小) 證照</div>
          </div>

          <div class="passengers-list">
            <div class="passenger-card pass">
              <span class="pass-status">✅ 放行通過</span>
              <span class="pass-name">數字 <code>42</code></span>
              <span class="pass-desc">有 Display 也有 PartialOrd，完全合法！</span>
            </div>
            <div class="passenger-card pass">
              <span class="pass-status">✅ 放行通過</span>
              <span class="pass-name">字串 <code>"apple"</code></span>
              <span class="pass-desc">字母照順序可比、可印，合法！</span>
            </div>
            <div class="passenger-card blocked">
              <span class="pass-status">🛑 擋在門口</span>
              <span class="pass-name">自訂結構 <code>struct Car</code></span>
              <span class="pass-desc">沒寫如何比大小！編譯器立刻報錯阻止。</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const currentTab = ref('generics')
const genericType = ref('i32')
const speakerRole = ref('bot')

const moldSample = computed(() => {
  if (genericType.value === 'i32') return { x: '5', y: '10' }
  if (genericType.value === 'f64') return { x: '3.14', y: '6.28' }
  return { x: '"東經 121°"', y: '"北緯 25°"' }
})

const speakerData = computed(() => {
  if (speakerRole.value === 'human') {
    return {
      avatar: '👨',
      name: '工程師志賢',
      quote: '你好！今天讓我們一起探索 Rust 的零成本抽象！'
    }
  }
  if (speakerRole.value === 'bot') {
    return {
      avatar: '🤖',
      name: 'Gemini Assistant',
      quote: '嗶嗶！Rust 記憶體檢查器已就緒，所有借用均已確認安全！'
    }
  }
  return {
    avatar: '🦆',
    name: '黃色小鴨',
    quote: '呱呱！對著我講你的程式碼邏輯，我幫你抓 Bug！'
  }
})
</script>

<style scoped>
.trait-power-lab {
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

.mold-controls, .actor-select {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.ctrl-label {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}

.mold-controls button, .actor-select button {
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-size: 0.82rem;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
}

.mold-controls button.sel, .actor-select button.sel {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
  font-weight: 600;
}

.visual-card {
  padding: 1.2rem;
  border-radius: 8px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
}

.mold-title {
  font-size: 0.9rem;
  font-weight: 700;
  margin-bottom: 0.8rem;
}

.mold-box {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 0.8rem;
}

.field-item {
  display: flex;
  flex-direction: column;
  padding: 0.8rem 1.5rem;
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
  border: 1px dashed var(--vp-c-brand-1);
}

.field-item .lbl {
  font-family: var(--vp-font-family-mono);
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}

.field-item .val {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  margin-top: 0.2rem;
}

.mold-tip {
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
}

.speaker-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.avatar {
  font-size: 2.2rem;
}

.name {
  font-weight: 700;
  font-size: 1rem;
}

.contract-badge {
  font-size: 0.75rem;
  color: #10b981;
  font-weight: 600;
}

.speech-bubble {
  background: var(--vp-c-bg-soft);
  padding: 1rem;
  border-radius: 8px;
  border-left: 3px solid #3b82f6;
}

.bubble-tag {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  display: block;
  margin-bottom: 0.3rem;
}

.quote {
  margin: 0;
  font-size: 0.95rem;
  color: var(--vp-c-text-1);
  font-weight: 600;
}

.bound-visual {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.fn-gate {
  padding: 0.9rem;
  background: var(--vp-c-bg-soft);
  border-radius: 6px;
  border: 1px solid var(--vp-c-brand-1);
}

.gate-sign {
  font-size: 0.9rem;
  font-weight: 700;
  margin-bottom: 0.3rem;
}

.gate-condition {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
}

.passengers-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.8rem;
}

.passenger-card {
  padding: 0.8rem;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.85rem;
}

.passenger-card.pass {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  color: #065f46;
}

.passenger-card.blocked {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
}

.pass-status {
  font-weight: 700;
  font-size: 0.8rem;
}

.pass-name {
  font-weight: 600;
}

.pass-desc {
  font-size: 0.75rem;
  opacity: 0.9;
}
</style>
