<template>
  <div class="decision-card">
    <div class="card-header">
      <span class="badge">💡 互動工程評估</span>
      <h4>技術選型決策器：這項任務適合用 Rust 嗎？</h4>
      <p class="subtitle">點擊不同情境，看看不同程式語言的適用性評估：</p>
    </div>

    <div class="scenario-buttons">
      <button
        v-for="(item, idx) in scenarios"
        :key="idx"
        :class="{ active: currentIdx === idx }"
        @click="currentIdx = idx"
      >
        {{ item.title }}
      </button>
    </div>

    <div class="result-box">
      <div class="result-header">
        <span class="rec-tag" :class="currentScenario.verdictType">
          {{ currentScenario.verdict }}
        </span>
        <h5>{{ currentScenario.headline }}</h5>
      </div>
      <p class="result-desc">{{ currentScenario.description }}</p>

      <div class="comparison-grid">
        <div class="comp-col rust-col">
          <div class="col-title">🦀 選擇 Rust</div>
          <ul>
            <li v-for="(pro, i) in currentScenario.rustPros" :key="i">
              {{ pro }}
            </li>
          </ul>
        </div>
        <div class="comp-col other-col">
          <div class="col-title">⚡ 其他替代選擇 ({{ currentScenario.altLang }})</div>
          <ul>
            <li v-for="(con, i) in currentScenario.altPros" :key="i">
              {{ con }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const currentIdx = ref(0)

const scenarios = [
  {
    title: '1. 極致效能與底層系統',
    verdict: '⭐ 強烈推薦 Rust',
    verdictType: 'verdict-strong',
    headline: '高頻交易、遊戲引擎、作業系統模組、瀏覽器核心',
    description: '此類任務對延遲（Latency）極度敏感，不允許任何記憶體垃圾回收造成的毫秒級卡頓，且不能發生崩潰。',
    rustPros: [
      '完全無 GC 停頓，提供微秒級穩定延遲',
      '編譯為原生機器碼，效能可比擬手寫 C/C++',
      '型別系統杜絕資料競爭與記憶體溢位'
    ],
    altLang: 'C++ / C',
    altPros: [
      'C++ 雖然速度一樣快，但容易出現 Use-After-Free 等致命漏洞',
      'Rust 的套件管理工具 Cargo 比 C++ CMake 更加現代與健全'
    ]
  },
  {
    title: '2. 現代命令行工具 (CLI)',
    verdict: '⭐ 非常適合 Rust',
    verdictType: 'verdict-strong',
    headline: '打造極速、單一執行檔、易於分發的工具 (如 ripgrep, bat)',
    description: '命令列工具需要快速啟動（毫秒級反應），且使用者希望下載單一執行檔就能跑，不想要安裝龐大的 Python 或 Node 運行環境。',
    rustPros: [
      '啟動速度遠勝 Python / Node.js，瞬時載入',
      '產出單一獨立二進位檔（Single Binary），部署無依賴',
      '社群提供成熟的 clap 等 CLI 參數解析庫'
    ],
    altLang: 'Go / Python',
    altPros: [
      'Go 也是單一二進位檔的好選擇，但記憶體與啟動速度 Rust 略勝一籌',
      'Python 開發極快，但終端使用者必須安裝 Python 環境與相關依賴'
    ]
  },
  {
    title: '3. 3天內要驗證的 MVP 原型',
    verdict: '⚠️ 不建議一開始用 Rust',
    verdictType: 'verdict-alt',
    headline: '黑客松專案、快速嘗試市場創意的初版 Web 應用',
    description: '當商業模式與資料結構隨時在改變，首要目標是「以最快速度上線測試需求」，而不是「極致效能」。',
    rustPros: [
      'Rust 的借用檢查器要求設計嚴謹架構，前期思考時間較長',
      '頻繁改動資料結構容易遭遇生命週期與所有權修改重構'
    ],
    altLang: 'Python / TypeScript / Go',
    altPros: [
      'Python / Node.js 擁有極度豐富的現成全端框架（Django, Next.js）',
      '前期開發速度快 3~5 倍，等業務規模擴大再將核心計算模組以 Rust 重寫'
    ]
  },
  {
    title: '4. 資源受限的物聯網 / 嵌入式設備',
    verdict: '⭐ 絕佳首選',
    verdictType: 'verdict-strong',
    headline: '微控制器 (MCU)、感測器、樹莓派、邊緣運算',
    description: '硬體記憶體可能只有幾十 KB 至數 MB，不具備運行虛擬機或垃圾回收器的硬體資源。',
    rustPros: [
      '支援 no_std 模式，可以在純裸機（Bare-metal）上運作',
      '記憶體佔用極低，無動態直譯器開銷',
      '在資源受限下依然保有高級型別安全保證'
    ],
    altLang: 'C / 組合語言',
    altPros: [
      'C 語言歷史悠久生態龐大，但指針錯誤極易導致嵌入式設備死機重啟',
      'Rust 提供了更現代的語法與安全的抽象能力'
    ]
  }
]

const currentScenario = computed(() => scenarios[currentIdx.value])
</script>

<style scoped>
.decision-card {
  margin: 1.8rem 0;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  padding: 1.2rem;
}

.card-header h4 {
  margin: 0.4rem 0 0.2rem 0;
  color: var(--vp-c-brand-1);
}

.subtitle {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  margin-bottom: 1rem;
}

.badge {
  font-size: 0.75rem;
  font-weight: 600;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
}

.scenario-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.2rem;
}

.scenario-buttons button {
  padding: 0.45rem 0.9rem;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-1);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.scenario-buttons button.active {
  background: var(--vp-c-brand-1);
  color: white;
  border-color: var(--vp-c-brand-1);
  font-weight: 600;
}

.result-box {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 1.2rem;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 0.5rem;
}

.rec-tag {
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
}

.verdict-strong {
  background: #10b981;
  color: white;
}

.verdict-alt {
  background: #f59e0b;
  color: white;
}

.result-header h5 {
  margin: 0;
  font-size: 1rem;
  color: var(--vp-c-text-1);
}

.result-desc {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.comparison-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 640px) {
  .comparison-grid {
    grid-template-columns: 1fr;
  }
}

.comp-col {
  padding: 0.8rem;
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
}

.rust-col {
  border-left: 3px solid var(--vp-c-brand-1);
}

.other-col {
  border-left: 3px solid #64748b;
}

.col-title {
  font-weight: 600;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  color: var(--vp-c-text-1);
}

.comp-col ul {
  margin: 0;
  padding-left: 1.2rem;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
</style>
