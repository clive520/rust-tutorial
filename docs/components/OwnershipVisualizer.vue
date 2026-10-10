<template>
  <div class="ownership-visualizer">
    <div class="vis-header">
      <h4>🧠 所有權移動 (Move) vs 複製 (Copy) 模擬器</h4>
      <p class="vis-desc">點擊下方步驟按鈕，觀察記憶體堆疊（Stack）與堆積（Heap）的指標變化：</p>
    </div>

    <div class="step-controls">
      <button :class="{ active: currentStep === 1 }" @click="currentStep = 1">
        步驟 1: let s1 = String::from("hello")
      </button>
      <button :class="{ active: currentStep === 2 }" @click="currentStep = 2">
        步驟 2: let s2 = s1 (所有權轉移)
      </button>
      <button :class="{ active: currentStep === 3 }" @click="currentStep = 3">
        步驟 3: 嘗試使用 println!("{}", s1)
      </button>
    </div>

    <div class="memory-stage">
      <!-- Stack 區域 -->
      <div class="memory-zone stack-zone">
        <h5>棧 (Stack 記憶體)</h5>
        
        <div class="memory-card" :class="{ invalidated: currentStep > 1 }">
          <div class="card-title">
            變數: <code>s1</code>
            <span v-if="currentStep > 1" class="badge-danger">已失效 (Moved)</span>
            <span v-else class="badge-success">有效</span>
          </div>
          <div class="card-body">
            <div>ptr: ➜ Heap[0]</div>
            <div>len: 5</div>
            <div>capacity: 5</div>
          </div>
        </div>

        <div v-if="currentStep > 1" class="memory-card active-card">
          <div class="card-title">
            變數: <code>s2</code>
            <span class="badge-success">獲得所有權</span>
          </div>
          <div class="card-body">
            <div>ptr: ➜ Heap[0]</div>
            <div>len: 5</div>
            <div>capacity: 5</div>
          </div>
        </div>
      </div>

      <!-- 連接箭頭 -->
      <div class="pointer-arrow">
        ➔
      </div>

      <!-- Heap 區域 -->
      <div class="memory-zone heap-zone">
        <h5>堆 (Heap 記憶體)</h5>
        <div class="heap-block">
          <div class="heap-index">[0] 實際字串資料</div>
          <div class="heap-content">"h" | "e" | "l" | "l" | "o"</div>
          <div class="heap-owner">
            擁有者: <strong>{{ currentStep > 1 ? 's2' : 's1' }}</strong>
          </div>
        </div>
      </div>
    </div>

    <div class="explanation-box" :class="{ 'error-alert': currentStep === 3 }">
      <div v-if="currentStep === 1">
        💡 <strong>解析：</strong> <code>s1</code> 被宣告，Stack 記錄指向 Heap 的指標（ptr）、長度（len）與容量（cap）。實際字串 <code>"hello"</code> 儲存在 Heap。
      </div>
      <div v-else-if="currentStep === 2">
        ⚠️ <strong>解析：</strong> 當執行 <code>let s2 = s1;</code> 時，Rust 進行「淺拷貝」並<strong>使 <code>s1</code> 無效</strong>（Move）。這避免了變數離開作用域時發生重複釋放（Double Free）的記憶體錯誤！
      </div>
      <div v-else-if="currentStep === 3">
        🛑 <strong>編譯器報錯 (E0382)：</strong>
        <code>borrow of moved value: `s1`</code><br>
        Rust 在編譯時期就擋下這個錯誤，保證執行時期的絕對安全！
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const currentStep = ref(1)
</script>

<style scoped>
.ownership-visualizer {
  margin: 1.5rem 0;
  padding: 1.2rem;
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
}

.vis-header h4 {
  margin: 0 0 0.5rem 0;
  color: var(--vp-c-brand-1);
}

.vis-desc {
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
}

.step-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.2rem;
}

.step-controls button {
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-1);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.step-controls button.active {
  background: var(--vp-c-brand-1);
  color: white;
  border-color: var(--vp-c-brand-1);
}

.memory-stage {
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 1rem;
  padding: 1rem;
  background: var(--vp-c-bg-alt);
  border-radius: 6px;
}

.memory-zone {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.memory-zone h5 {
  margin: 0;
  text-align: center;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}

.memory-card {
  padding: 0.8rem;
  border-radius: 6px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  transition: all 0.3s ease;
}

.memory-card.invalidated {
  opacity: 0.45;
  border: 1px dashed #e05d44;
  text-decoration: line-through;
}

.card-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  margin-bottom: 0.4rem;
}

.badge-success {
  background: #10b981;
  color: white;
  font-size: 0.7rem;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
}

.badge-danger {
  background: #ef4444;
  color: white;
  font-size: 0.7rem;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
}

.pointer-arrow {
  font-size: 1.8rem;
  color: var(--vp-c-brand-1);
}

.heap-block {
  padding: 1rem;
  background: var(--vp-c-bg);
  border: 2px solid var(--vp-c-brand-1);
  border-radius: 6px;
  text-align: center;
}

.heap-content {
  font-family: var(--vp-font-family-mono);
  font-weight: bold;
  font-size: 1.1rem;
  color: #e05d44;
  margin: 0.5rem 0;
}

.heap-owner {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
}

.explanation-box {
  margin-top: 1rem;
  padding: 0.8rem 1rem;
  border-radius: 6px;
  background: var(--vp-c-bg-mute);
  font-size: 0.9rem;
}

.explanation-box.error-alert {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #f87171;
}
</style>
