<template>
  <div class="data-management">
    <div class="page-header">
      <div class="header-top">
        <button class="back-btn" @click="goBack">
          <span class="back-icon">←</span>
          <span>返回</span>
        </button>
        <h2 class="page-title">数据管理</h2>
      </div>
      <div class="title-decoration">
        <span class="decoration-line"></span>
        <span class="decoration-icon">◆</span>
        <span class="decoration-line"></span>
      </div>
    </div>
    
    <!-- 统计分析 -->
    <div class="card scroll-menu">
      <h3>统计分析</h3>
      <div class="date-range-picker">
        <div class="date-input-wrapper">
          <input type="date" v-model="statsStartDate" class="input small-input date-input date-input-start" @focus="handleDateFocus($event)" @blur="handleDateBlur($event)" />
          <span class="date-placeholder" :class="{ 'active': !statsStartDate }">请选择开始日期</span>
        </div>
        <div class="date-input-wrapper">
          <input type="date" v-model="statsEndDate" class="input small-input date-input date-input-end" @focus="handleDateFocus($event)" @blur="handleDateBlur($event)" />
          <span class="date-placeholder" :class="{ 'active': !statsEndDate }">请选择结束日期</span>
        </div>
        <button class="btn" @click="generateStatistics">生成统计</button>
      </div>
      
      <div class="stats-summary">
        <div class="stat-item">
          <span class="stat-label">总记录数</span>
          <span class="stat-value">{{ statistics.totalRecords }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">总收入</span>
          <span class="stat-value income">{{ statistics.totalIncome }} 元</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">总支出</span>
          <span class="stat-value expense">{{ statistics.totalExpense }} 元</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">结余</span>
          <span class="stat-value">{{ statistics.balance }} 元</span>
        </div>
      </div>
      
      <!-- 按类型统计 -->
      <div class="stat-section">
        <h4>按类型统计</h4>
        <div class="stat-grid">
          <div class="stat-card income-card">
            <span class="stat-title">收入</span>
            <span class="stat-amount">{{ statistics.byType.income || 0 }} 元</span>
          </div>
          <div class="stat-card expense-card">
            <span class="stat-title">支出</span>
            <span class="stat-amount">{{ statistics.byType.expense || 0 }} 元</span>
          </div>
        </div>
      </div>
      
      <!-- 按分类统计 -->
      <div class="stat-section">
        <h4>按分类统计</h4>
        <div class="category-stats">
          <div v-for="(amount, category) in statistics.byCategory" :key="category" class="category-item">
            <span class="category-name">{{ category }}</span>
            <span class="category-amount">{{ amount }} 元</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 数据导出 -->
    <div class="card">
      <h3>数据导出</h3>
      <div class="export-section">
        <button class="btn" @click="exportData">导出所有数据</button>
        <p class="export-note">导出的数据将包含所有账目、结算和用户信息。</p>
      </div>
    </div>
    
    <!-- 数据导入 -->
    <div class="card">
      <h3>数据导入</h3>
      <div class="import-section">
        <input type="file" ref="fileInput" accept=".json" class="file-input" @change="handleFileImport" />
        <label for="fileInput" class="btn">选择JSON文件</label>
        <p class="import-note">请选择之前导出的JSON文件进行导入。</p>
        <div v-if="importMessage" :class="['import-message', importSuccess ? 'success' : 'error']">
          {{ importMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { dataManagerService } from '../services/dataManager';

const router = useRouter();

const goBack = () => {
  router.back();
};

// 统计日期范围
const statsStartDate = ref('');
const statsEndDate = ref('');

// 统计数据
const statistics = ref({
  totalRecords: 0,
  totalIncome: 0,
  totalExpense: 0,
  balance: 0,
  byType: {},
  byCategory: {},
  byDate: {}
});

// 导入相关
const importMessage = ref('');
const importSuccess = ref(false);

// 生成统计
const generateStatistics = () => {
  if (!statsStartDate.value || !statsEndDate.value) {
    alert('请选择日期范围');
    return;
  }
  
  statistics.value = dataManagerService.generateStatistics(statsStartDate.value, statsEndDate.value);
};

// 导出数据
const exportData = () => {
  dataManagerService.exportData();
};

// 处理文件导入
const handleFileImport = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e: ProgressEvent<FileReader>) => {
    const jsonString = e.target?.result as string;
    const success = dataManagerService.importData(jsonString);
    if (success) {
      importMessage.value = '数据导入成功';
      importSuccess.value = true;
    } else {
      importMessage.value = '数据导入失败，请检查文件格式';
      importSuccess.value = false;
    }
  };
  reader.readAsText(file);
};

// 处理日期输入框焦点
const handleDateFocus = (event: Event) => {
  const target = event.target as HTMLElement;
  const placeholder = target.nextElementSibling as HTMLElement;
  if (placeholder) {
    placeholder.classList.add('focused');
  }
};

// 处理日期输入框失焦
const handleDateBlur = (event: Event) => {
  const target = event.target as HTMLElement;
  const placeholder = target.nextElementSibling as HTMLElement;
  if (placeholder) {
    placeholder.classList.remove('focused');
  }
};

onMounted(() => {
  // 设置默认日期范围为当月
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  statsStartDate.value = firstDay.toISOString().split('T')[0];
  statsEndDate.value = lastDay.toISOString().split('T')[0];
  
  generateStatistics();
});
</script>

<style scoped>
.data-management {
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 1.8rem;
  margin-bottom: 2rem;
  text-align: center;
}

.date-range-picker {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.stats-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.stat-label {
  font-weight: bold;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: bold;
}

.income {
  color: green;
}

.expense {
  color: red;
}

.stat-section {
  margin-bottom: 2rem;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  color: white;
}

.income-card {
  background-color: green;
}

.expense-card {
  background-color: red;
}

.stat-title {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.stat-amount {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
}

.category-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.category-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.export-section,
.import-section {
  padding: 1rem 0;
}

.export-note,
.import-note {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #666;
}

.file-input {
  display: none;
}

.import-message {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 4px;
  text-align: center;
}

.import-message.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.import-message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

@media (max-width: 768px) {
  .date-range-picker {
    flex-direction: column;
  }
  
  .date-range-picker .date-input-wrapper {
    margin-bottom: 1rem;
  }
  
  .stats-summary {
    grid-template-columns: 1fr;
  }
  
  .stat-grid {
    grid-template-columns: 1fr;
  }
  
  .category-stats {
    grid-template-columns: 1fr;
  }
}

/* 日期输入框包装器样式 */
.date-input-wrapper {
  position: relative;
  width: 100%;
}

/* 日期输入框样式 */
.date-input {
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 6px;
  font-family: inherit;
  font-size: 1rem;
  width: 100%;
  background-color: var(--paper-color);
  color: var(--text-color);
  transition: all var(--transition-normal);
  position: relative;
  z-index: 2;
}

.date-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px rgba(139, 69, 19, 0.1);
  transform: translateY(-1px);
  color: var(--text-color);
}

/* 日期输入框占位符样式 */
.date-placeholder {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  pointer-events: none;
  z-index: 1;
  transition: all 0.3s ease;
}

.date-placeholder.active {
  opacity: 1;
}

.date-placeholder.focused {
  opacity: 0.5;
}

/* 隐藏日期输入框的默认箭头 */
.date-input::-webkit-calendar-picker-indicator {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  z-index: 3;
  cursor: pointer;
}
</style>