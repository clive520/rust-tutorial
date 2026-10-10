<template>
  <div class="trait-power-lab">
    <div class="lab-header">
      <div class="header-title">
        <span class="icon">🔌</span>
        <h4>Rust 泛型與特徵實驗室：萬用插座與能力合約</h4>
      </div>
      <p class="subtitle">點選下方標籤頁，親身體驗「模具鑄造」、「證照多型」與「海關安檢查驗」：</p>
    </div>

    <!-- 概念切換按鈕 -->
    <div class="concept-tabs">
      <button :class="{ active: currentTab === 'generics' }" @click="currentTab = 'generics'">
        1. 泛型 Generics (萬用模具實驗台)
      </button>
      <button :class="{ active: currentTab === 'trait' }" @click="currentTab = 'trait'">
        2. 特徵 Trait (技能證照簽署所)
      </button>
      <button :class="{ active: currentTab === 'bound' }" @click="currentTab = 'bound'">
        3. 特徵約束 Trait Bound (海關安檢查驗站)
      </button>
    </div>

    <!-- 互動展台 -->
    <div class="stage-body">
      <!-- 1. 泛型模板實驗台 -->
      <div v-if="currentTab === 'generics'" class="tab-panel">
        <div class="analogy-box">
          <span class="tag">🧇 生活比喻：雞蛋糕金屬模具</span>
          <p>
            你不必為紅豆口味、奶油口味、起司口味各買一組鐵模。
            <strong>同一個模具 <code>Point&lt;T&gt;</code>，倒進什麼型別的麵糊，就產出什麼型別的實體！</strong>
          </p>
        </div>

        <div class="controls-bar">
          <span class="ctrl-label">挑選模具注入型別：</span>
          <button :class="{ sel: genericType === 'i32' }" @click="setGenericPreset('i32')">整數 i32</button>
          <button :class="{ sel: genericType === 'f64' }" @click="setGenericPreset('f64')">浮點數 f64</button>
          <button :class="{ sel: genericType === 'str' }" @click="setGenericPreset('str')">字串 &str</button>
          <button :class="{ sel: genericType === 'bool' }" @click="setGenericPreset('bool')">布林 bool</button>
        </div>

        <div class="input-row">
          <label>自訂 x 數值：<input v-model="customX" class="mini-input" /></label>
          <label>自訂 y 數值：<input v-model="customY" class="mini-input" /></label>
        </div>

        <div class="visual-grid">
          <!-- 結構實體 -->
          <div class="visual-card mold-card">
            <div class="card-badge">模具產出實體 (Instance)</div>
            <div class="mold-spec"><code>struct Point&lt;{{ genericType }}&gt;</code></div>
            <div class="field-pairs">
              <div class="pair-box">
                <span class="p-name">x ({{ genericType }})</span>
                <span class="p-val">{{ customX }}</span>
              </div>
              <div class="pair-box">
                <span class="p-name">y ({{ genericType }})</span>
                <span class="p-val">{{ customY }}</span>
              </div>
            </div>
          </div>

          <!-- 編譯器單態化視角 -->
          <div class="visual-card mono-card">
            <div class="card-badge">編譯器背後視角 (Monomorphization)</div>
            <div class="mono-code">
              <pre><code>// Rust 編譯器在編譯期自動為你生成原生機器碼：
struct Point_{{ genericTypeClean }} {
    x: {{ genericType }},
    y: {{ genericType }},
}
// ⚡ 零執行時開銷：速度與手寫機器碼 100% 一樣快！</code></pre>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Trait 技能證照簽署所 -->
      <div v-else-if="currentTab === 'trait'" class="tab-panel">
        <div class="analogy-box">
          <span class="tag">🪪 生活比喻：國家技能證照</span>
          <p>
            Rust 沒有物件導向的父子繼承，而是靠「能力合約」。只要實作了 <code>Speak</code> 特徵，管你是工程師、機器人還是寵物，就能被當作講話實體！
          </p>
        </div>

        <div class="controls-bar">
          <span class="ctrl-label">挑選簽約角色：</span>
          <button :class="{ sel: activeRole === 'human' }" @click="activeRole = 'human'">👨 工程師</button>
          <button :class="{ sel: activeRole === 'bot' }" @click="activeRole = 'bot'">🤖 AI 助手</button>
          <button :class="{ sel: activeRole === 'dog' }" @click="activeRole = 'dog'">🐕 柴犬</button>
          <button :class="{ sel: activeRole === 'duck' }" @click="activeRole = 'duck'">🦆 黃色小鴨</button>
        </div>

        <div class="visual-card speaker-card">
          <div class="speaker-profile">
            <span class="avatar-lg">{{ roleProfile.avatar }}</span>
            <div class="profile-info">
              <div class="profile-name">{{ roleProfile.name }}</div>
              <div class="profile-contract">
                已簽署合約：<code>impl Speak for {{ roleProfile.structName }}</code> ✅
              </div>
              <div class="toggle-default">
                <label>
                  <input type="checkbox" v-model="useDefaultImpl" />
                  啟用特徵預設實作 (Default Implementation)
                </label>
              </div>
            </div>
          </div>

          <div class="speech-result-box">
            <div class="bubble-tag">呼叫 <code>media.speak()</code> 執行結果：</div>
            <div class="quote-text">{{ activeSpeech }}</div>
          </div>
        </div>
      </div>

      <!-- 3. Trait Bound 海關安檢查驗站 -->
      <div v-else-if="currentTab === 'bound'" class="tab-panel">
        <div class="analogy-box">
          <span class="tag">🛂 生活比喻：機場過海關查驗護照</span>
          <p>
            泛型 <code>T</code> 可以是任何人，但如果你想在函式內使用 <code>&gt;</code> 比較或 <code>println!</code> 列印，就必須要求：<strong>「只有帶齊指定證照的型別，才能進入！」</strong>
          </p>
        </div>

        <div class="checkpoint-setup">
          <div class="rule-selector">
            <span class="ctrl-label">選擇海關檢查規則：</span>
            <button :class="{ sel: checkRule === 'display' }" @click="checkRule = 'display'">
              規則 A: 須有 Display (可列印)
            </button>
            <button :class="{ sel: checkRule === 'ord' }" @click="checkRule = 'ord'">
              規則 B: 須有 PartialOrd (可比大小)
            </button>
            <button :class="{ sel: checkRule === 'both' }" @click="checkRule = 'both'">
              規則 C: 須有 Display + PartialOrd (嚴格)
            </button>
          </div>
          <div class="rule-formula">
            函式簽章：<code>fn gatekeeper&lt;T: {{ currentRuleTrait }}&gt;(val: T)</code>
          </div>
        </div>

        <div class="passenger-grid">
          <div
            v-for="p in candidates"
            :key="p.id"
            class="passenger-item"
            :class="{ active: selectedPassenger.id === p.id }"
            @click="selectedPassenger = p"
          >
            <span class="p-icon">{{ p.icon }}</span>
            <div class="p-info">
              <div class="p-title">{{ p.name }}</div>
              <div class="p-traits">
                持有證照：
                <span v-if="p.hasDisplay" class="badge ok">Display</span>
                <span v-if="p.hasOrd" class="badge ok">PartialOrd</span>
                <span v-if="!p.hasDisplay && !p.hasOrd" class="badge none">無任何證照</span>
              </div>
            </div>
          </div>
        </div>

        <div class="inspection-result" :class="{ pass: inspectionResult.pass, fail: !inspectionResult.pass }">
          <div class="inspect-stamp">
            <span class="stamp-icon">{{ inspectionResult.pass ? '✅' : '🛑' }}</span>
            <span class="stamp-text">{{ inspectionResult.pass ? '海關放行 (編譯通過)' : '攔截拒絕 (編譯報錯)' }}</span>
          </div>
          <div class="inspect-detail">
            <p class="inspect-reason">{{ inspectionResult.message }}</p>
            <div v-if="!inspectionResult.pass" class="rust-error-box">
              <pre><code>error[E0277]: the trait bound `{{ selectedPassenger.structName }}: {{ inspectionResult.missingTrait }}` is not satisfied
  --> src/main.rs:12:16
   |
12 |     gatekeeper({{ selectedPassenger.structName }});
   |                ^^^^^^^^^^^^^^^^^^^^ the trait `{{ inspectionResult.missingTrait }}` is not implemented for `{{ selectedPassenger.structName }}`</code></pre>
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

// 1. 泛型模具狀態
const genericType = ref('i32')
const customX = ref('10')
const customY = ref('20')

function setGenericPreset(t) {
  genericType.value = t
  if (t === 'i32') {
    customX.value = '10'
    customY.value = '20'
  } else if (t === 'f64') {
    customX.value = '3.14'
    customY.value = '9.81'
  } else if (t === 'str') {
    customX.value = '"台北"'
    customY.value = '"高雄"'
  } else if (t === 'bool') {
    customX.value = 'true'
    customY.value = 'false'
  }
}

const genericTypeClean = computed(() => {
  return genericType.value.replace(/[^a-zA-Z0-9]/g, '')
})

// 2. Trait 技能證照狀態
const activeRole = ref('bot')
const useDefaultImpl = ref(false)

const roleProfile = computed(() => {
  const roles = {
    human: {
      avatar: '👨',
      name: '工程師志賢',
      structName: 'Developer',
      customQuote: '「Rust 的型別系統與所有權機制，讓軟體在高速運行時依然滴水不漏！」'
    },
    bot: {
      avatar: '🤖',
      name: 'AI 助手',
      structName: 'RobotAssistant',
      customQuote: '「嗶嗶！所有特徵約束與借用檢查均已順利通過，系統安全穩定！」'
    },
    dog: {
      avatar: '🐕',
      name: '柴犬布丁',
      structName: 'ShibaInu',
      customQuote: '「汪汪！今天的主人程式碼寫得好順暢，摸摸頭給肉肉！」'
    },
    duck: {
      avatar: '🦆',
      name: '黃色小鴨',
      structName: 'RubberDuck',
      customQuote: '「呱呱！跟我說說你的邏輯盲點，我們一起把 Bug 抓出來！」'
    }
  }
  return roles[activeRole.value] || roles.bot
})

const activeSpeech = computed(() => {
  if (useDefaultImpl.value) {
    return `[特徵預設實作 Default Impl]: 大家好！我是 ${roleProfile.value.name}，正在向全世界打招呼！`
  }
  return roleProfile.value.customQuote
})

// 3. Trait Bound 海關安檢狀態
const checkRule = ref('both')

const currentRuleTrait = computed(() => {
  if (checkRule.value === 'display') return 'Display'
  if (checkRule.value === 'ord') return 'PartialOrd'
  return 'Display + PartialOrd'
})

const candidates = [
  {
    id: 1,
    icon: '🔢',
    name: '整數 i32 (42)',
    structName: 'i32',
    hasDisplay: true,
    hasOrd: true
  },
  {
    id: 2,
    icon: '🔤',
    name: '字串 &str ("Rust")',
    structName: '&str',
    hasDisplay: true,
    hasOrd: true
  },
  {
    id: 3,
    icon: '📝',
    name: '學生筆記 (StudentMemo)',
    structName: 'StudentMemo',
    hasDisplay: true,
    hasOrd: false // 只能印，不能比大小
  },
  {
    id: 4,
    icon: '🔒',
    name: '安全憑證 (SecretToken)',
    structName: 'SecretToken',
    hasDisplay: false,
    hasOrd: false // 兩者皆無
  }
]

const selectedPassenger = ref(candidates[0])

const inspectionResult = computed(() => {
  const p = selectedPassenger.value
  const r = checkRule.value

  if (r === 'display') {
    if (p.hasDisplay) {
      return { pass: true, message: `通過！${p.name} 具備 Display 證照，可以安全格式化列印！` }
    }
    return {
      pass: false,
      missingTrait: 'Display',
      message: `攔截！${p.name} 未實作 Display，海關禁止放行，避免執行時無法列印崩潰！`
    }
  }

  if (r === 'ord') {
    if (p.hasOrd) {
      return { pass: true, message: `通過！${p.name} 具備 PartialOrd 證照，可以安全進行 > / < 比大小！` }
    }
    return {
      pass: false,
      missingTrait: 'PartialOrd',
      message: `攔截！${p.name} 未實作 PartialOrd，編譯器不知道如何定義它們的大小關係！`
    }
  }

  // both
  if (p.hasDisplay && p.hasOrd) {
    return { pass: true, message: `全數合格！${p.name} 同時擁有 Display 與 PartialOrd 兩張雙證照，完美符合要求！` }
  }
  const missing = !p.hasDisplay ? 'Display' : 'PartialOrd'
  return {
    pass: false,
    missingTrait: missing,
    message: `攔截！${p.name} 缺少必備的 ${missing} 證照，未達雙重安檢標準！`
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

.controls-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.8rem;
}

.ctrl-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.controls-bar button {
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-size: 0.82rem;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
}

.controls-bar button.sel {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
  font-weight: 600;
}

.input-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  color: var(--vp-c-text-1);
}

.mini-input {
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-family: var(--vp-font-family-mono);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  width: 100px;
}

.visual-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.visual-card {
  padding: 1.2rem;
  border-radius: 8px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
}

.card-badge {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  margin-bottom: 0.6rem;
  text-transform: uppercase;
}

.mold-spec {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0.8rem;
}

.field-pairs {
  display: flex;
  gap: 1rem;
}

.pair-box {
  flex: 1;
  padding: 0.7rem;
  background: var(--vp-c-bg-soft);
  border: 1px dashed var(--vp-c-brand-1);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
}

.p-name {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  font-family: var(--vp-font-family-mono);
}

.p-val {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  margin-top: 0.2rem;
}

.mono-code pre {
  margin: 0;
  font-size: 0.8rem;
  background: #1e1e1e;
  color: #9cdcfe;
  padding: 0.8rem;
  border-radius: 6px;
  overflow-x: auto;
}

.speaker-profile {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  margin-bottom: 1.2rem;
}

.avatar-lg {
  font-size: 2.8rem;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.profile-name {
  font-size: 1.1rem;
  font-weight: 700;
}

.profile-contract {
  font-size: 0.8rem;
  color: #10b981;
  font-weight: 600;
}

.toggle-default {
  margin-top: 0.3rem;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
}

.speech-result-box {
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  padding: 1rem;
  border-left: 4px solid #3b82f6;
}

.bubble-tag {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  margin-bottom: 0.4rem;
}

.quote-text {
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.5;
}

.checkpoint-setup {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: 1rem;
}

.rule-selector {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.rule-selector button {
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-size: 0.82rem;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  cursor: pointer;
}

.rule-selector button.sel {
  background: #8b5cf6;
  color: white;
  border-color: #8b5cf6;
  font-weight: 600;
}

.rule-formula {
  font-size: 0.88rem;
  padding: 0.5rem 0.8rem;
  background: var(--vp-c-bg);
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
}

.passenger-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.8rem;
  margin-bottom: 1rem;
}

.passenger-item {
  padding: 0.8rem;
  border-radius: 6px;
  background: var(--vp-c-bg);
  border: 2px solid var(--vp-c-divider);
  display: flex;
  align-items: center;
  gap: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.passenger-item:hover {
  border-color: #8b5cf6;
}

.passenger-item.active {
  border-color: #8b5cf6;
  background: var(--vp-c-bg-soft);
}

.p-icon {
  font-size: 1.8rem;
}

.p-title {
  font-size: 0.88rem;
  font-weight: 600;
}

.p-traits {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  margin-top: 0.2rem;
}

.badge {
  display: inline-block;
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  margin-right: 0.2rem;
}

.badge.ok {
  background: #ecfdf5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.badge.none {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.inspection-result {
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
}

.inspection-result.pass {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.05);
}

.inspection-result.fail {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.05);
}

.inspect-stamp {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.inspect-stamp .stamp-icon {
  font-size: 1.4rem;
}

.inspect-reason {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  line-height: 1.5;
}

.rust-error-box pre {
  margin: 0;
  padding: 0.8rem;
  background: #201010;
  color: #fca5a5;
  border-radius: 6px;
  font-size: 0.78rem;
  overflow-x: auto;
}
</style>
