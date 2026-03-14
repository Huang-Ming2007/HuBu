<template>
  <div class="reports">
    <div class="page-header">
      <div class="header-top">
        <button class="back-btn" @click="goBack">
          <span class="back-icon">←</span>
          <span>返回</span>
        </button>
        <h2 class="page-title">财务报表</h2>
      </div>
      <div class="title-decoration">
        <span class="decoration-line"></span>
        <span class="decoration-icon">◆</span>
        <span class="decoration-line"></span>
      </div>
    </div>
    
    <!-- 报表生成器 -->
    <div class="generator-card card scroll-menu">
      <div class="card-header">
        <h3 class="card-title">
          <span class="title-icon">📊</span>
          生成报表
        </h3>
      </div>
      
      <div class="report-generator">
        <div class="form-row">
          <div class="form-group">
            <label for="reportType">
              <span class="label-icon">📋</span>
              报表类型
            </label>
            <select id="reportType" v-model="reportType" class="input">
              <option value="monthly">月度报表</option>
              <option value="yearly">年度报表</option>
            </select>
          </div>
          
          <div class="form-group" v-if="reportType === 'monthly'">
            <label for="year">
              <span class="label-icon">📅</span>
              年份
            </label>
            <select id="year" v-model="year" class="input">
              <option v-for="y in years" :key="y" :value="y">{{ y }}年</option>
            </select>
          </div>
          
          <div class="form-group" v-if="reportType === 'monthly'">
            <label for="month">
              <span class="label-icon">📆</span>
              月份
            </label>
            <select id="month" v-model="month" class="input">
              <option v-for="m in 12" :key="m" :value="m">{{ m }}月</option>
            </select>
          </div>
          
          <div class="form-group" v-if="reportType === 'yearly'">
            <label for="yearlyYear">
              <span class="label-icon">📅</span>
              年份
            </label>
            <select id="yearlyYear" v-model="yearlyYear" class="input">
              <option v-for="y in years" :key="y" :value="y">{{ y }}年</option>
            </select>
          </div>
        </div>
        
        <div class="form-actions">
          <button class="btn btn-secondary" @click="resetForm">重置</button>
          <button class="btn" @click="generateReport" :disabled="isGenerating">
            <span v-if="isGenerating" class="loading-spinner"></span>
            <span v-else>📈 生成报表</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- 四柱清册 -->
    <div v-if="currentReport" class="report-card card antique-page">
      <div class="report-header">
        <div class="seal">户部</div>
        <h3 class="report-title">四柱清册</h3>
        <p class="report-period">{{ currentReport.period }}</p>
        <p class="report-date">起止日期：{{ currentReport.start_date }} 至 {{ currentReport.end_date }}</p>
      </div>
      
      <div class="four-columns">
        <div class="column-card">
          <div class="column-icon">📦</div>
          <h5>旧管</h5>
          <p class="column-subtitle">期初余额</p>
          <p class="amount">{{ formatAmount(currentReport.old_balance) }}</p>
        </div>
        
        <div class="column-card income">
          <div class="column-icon">📥</div>
          <h5>新收</h5>
          <p class="column-subtitle">本期收入</p>
          <p class="amount">{{ formatAmount(currentReport.new_income) }}</p>
        </div>
        
        <div class="column-card expense">
          <div class="column-icon">📤</div>
          <h5>开除</h5>
          <p class="column-subtitle">本期支出</p>
          <p class="amount">{{ formatAmount(currentReport.expenses) }}</p>
        </div>
        
        <div class="column-card balance">
          <div class="column-icon">💰</div>
          <h5>实在</h5>
          <p class="column-subtitle">期末余额</p>
          <p class="amount">{{ formatAmount(currentReport.current_balance) }}</p>
        </div>
      </div>
      
      <!-- 明细表格 -->
      <div class="details-section">
        <div class="detail-card">
          <div class="detail-header">
            <h4>
              <span class="detail-icon">📈</span>
              收入明细
            </h4>
            <span class="detail-total income">合计：{{ formatAmount(currentReport.new_income) }}</span>
          </div>
          <div class="table-wrapper">
            <table class="detail-table">
              <thead>
                <tr>
                  <th>分类</th>
                  <th>金额</th>
                  <th>占比</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in currentReport.income_details" :key="item.category">
                  <td>{{ item.category }}</td>
                  <td class="amount-cell">{{ formatAmount(item.amount) }}</td>
                  <td>
                    <div class="progress-bar">
                      <div class="progress-fill" :style="{ width: getPercentage(item.amount, currentReport.new_income) + '%' }"></div>
                      <span class="progress-text">{{ getPercentage(item.amount, currentReport.new_income) }}%</span>
                    </div>
                  </td>
                </tr>
                <tr v-if="currentReport.income_details.length === 0" class="empty-row">
                  <td colspan="3">暂无收入记录</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div class="detail-card">
          <div class="detail-header">
            <h4>
              <span class="detail-icon">📉</span>
              支出明细
            </h4>
            <span class="detail-total expense">合计：{{ formatAmount(currentReport.expenses) }}</span>
          </div>
          <div class="table-wrapper">
            <table class="detail-table">
              <thead>
                <tr>
                  <th>分类</th>
                  <th>金额</th>
                  <th>占比</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in currentReport.expense_details" :key="item.category">
                  <td>{{ item.category }}</td>
                  <td class="amount-cell">{{ formatAmount(item.amount) }}</td>
                  <td>
                    <div class="progress-bar">
                      <div class="progress-fill expense" :style="{ width: getPercentage(item.amount, currentReport.expenses) + '%' }"></div>
                      <span class="progress-text">{{ getPercentage(item.amount, currentReport.expenses) }}%</span>
                    </div>
                  </td>
                </tr>
                <tr v-if="currentReport.expense_details.length === 0" class="empty-row">
                  <td colspan="3">暂无支出记录</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <!-- 导出按钮 -->
      <div class="report-actions">
        <button class="btn btn-secondary" @click="printReport">
          <span class="btn-icon">🖨️</span>
          打印报表
        </button>
        <button class="btn" @click="exportReport">
          <span class="btn-icon">💾</span>
          导出Excel
        </button>
      </div>
    </div>
    
    <!-- 空状态 -->
    <div v-else class="empty-card card">
      <div class="empty-state">
        <div class="empty-icon">📊</div>
        <h3>暂无报表数据</h3>
        <p>请选择报表类型和时间范围，然后点击"生成报表"按钮</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const goBack = () => {
  router.back();
};

// 报表类型
const reportType = ref('monthly');
const year = ref(new Date().getFullYear());
const month = ref(new Date().getMonth() + 1);
const yearlyYear = ref(new Date().getFullYear());
const isGenerating = ref(false);

// 年份选项
const years = computed(() => {
  const current = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => current - 2 + i);
});

// 当前报表
const currentReport = ref<any>(null);

// 格式化金额
const formatAmount = (amount: number) => {
  return `${amount.toLocaleString()} 元`;
};

// 计算百分比
const getPercentage = (value: number, total: number) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

// 生成报表
const generateReport = async () => {
  isGenerating.value = true;
  
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // 模拟报表数据
  const period = reportType.value === 'monthly' 
    ? `${year.value}年${month.value}月`
    : `${yearlyYear.value}年`;
  
  currentReport.value = {
    period,
    start_date: reportType.value === 'monthly' 
      ? `${year.value}-${String(month.value).padStart(2, '0')}-01`
      : `${yearlyYear.value}-01-01`,
    end_date: reportType.value === 'monthly'
      ? `${year.value}-${String(month.value).padStart(2, '0')}-31`
      : `${yearlyYear.value}-12-31`,
    old_balance: 50000,
    new_income: 15000,
    expenses: 8000,
    current_balance: 57000,
    income_details: [
      { category: '税收', amount: 8000 },
      { category: '贡赋', amount: 4000 },
      { category: '捐赠', amount: 2000 },
      { category: '其他收入', amount: 1000 }
    ],
    expense_details: [
      { category: '俸禄', amount: 3000 },
      { category: '军需', amount: 2500 },
      { category: '基建', amount: 1500 },
      { category: '教育', amount: 1000 }
    ]
  };
  
  isGenerating.value = false;
};

// 重置表单
const resetForm = () => {
  reportType.value = 'monthly';
  year.value = new Date().getFullYear();
  month.value = new Date().getMonth() + 1;
  yearlyYear.value = new Date().getFullYear();
  currentReport.value = null;
};

// 打印报表
const printReport = () => {
  window.print();
};

// 导出报表
const exportReport = () => {
  alert('导出功能开发中...');
};
</script>

<style scoped>
.reports {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
  position: relative;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: 1rem;
}

.back-btn {
  position: absolute;
  left: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #8b0000 0%, #a52a2a 100%);
  color: #ffd700;
  border: 2px solid #ffd700;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  font-weight: 500;
  box-shadow: 0 4px 8px rgba(139, 0, 0, 0.3);
}

.back-btn:hover {
  background: linear-gradient(135deg, #a52a2a 0%, #8b0000 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(139, 0, 0, 0.4);
}

.back-icon {
  font-size: 1.2rem;
  font-weight: bold;
}

.page-title {
  font-size: 2rem;
  color: #8b4513;
  margin: 0;
  font-weight: bold;
  letter-spacing: 4px;
}

.title-decoration {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.decoration-line {
  width: 100px;
  height: 2px;
  background: linear-gradient(to right, transparent, #8b4513, transparent);
}

.decoration-icon {
  color: #8b4513;
  font-size: 1rem;
}

/* 生成器卡片 */
.generator-card {
  margin-bottom: 2rem;
}

.card-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.3rem;
  color: #5d4037;
  margin: 0;
}

.title-icon {
  font-size: 1.2rem;
}

/* 表单样式 */
.report-generator {
  padding: 1rem 0;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #5d4037;
}

.label-icon {
  font-size: 1.1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 报表卡片 */
.report-card {
  position: relative;
  padding: 2rem;
}

.report-card::before {
  content: '';
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  bottom: 20px;
  border: 1px solid rgba(139, 69, 19, 0.2);
  border-radius: 4px;
  pointer-events: none;
}

.report-header {
  text-align: center;
  margin-bottom: 2rem;
  position: relative;
}

.seal {
  position: absolute;
  top: 0;
  right: 2rem;
  width: 80px;
  height: 80px;
  background: linear-gradient(145deg, #c41e3a, #8b0000);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d4af37;
  font-size: 1.5rem;
  font-weight: bold;
  border: 3px solid #d4af37;
  box-shadow: 0 4px 10px rgba(139, 0, 0, 0.3);
  transform: rotate(-15deg);
  opacity: 0.8;
}

.report-title {
  font-size: 2rem;
  color: #8b4513;
  margin-bottom: 0.5rem;
  letter-spacing: 8px;
}

.report-period {
  font-size: 1.2rem;
  color: #5d4037;
  margin-bottom: 0.25rem;
}

.report-date {
  font-size: 0.9rem;
  color: #999;
}

/* 四柱样式 */
.four-columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.column-card {
  background: linear-gradient(145deg, #f5f5f5, #fff);
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s;
}

.column-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.column-card.income {
  border-color: #4caf50;
  background: linear-gradient(145deg, #e8f5e9, #fff);
}

.column-card.expense {
  border-color: #f44336;
  background: linear-gradient(145deg, #ffebee, #fff);
}

.column-card.balance {
  border-color: #2196f3;
  background: linear-gradient(145deg, #e3f2fd, #fff);
}

.column-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.column-card h5 {
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 0.25rem;
}

.column-subtitle {
  font-size: 0.85rem;
  color: #999;
  margin-bottom: 1rem;
}

.column-card .amount {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

.column-card.income .amount {
  color: #2e7d32;
}

.column-card.expense .amount {
  color: #c62828;
}

.column-card.balance .amount {
  color: #1565c0;
}

/* 明细部分 */
.details-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.detail-card {
  background: #fafafa;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e0e0e0;
}

.detail-header h4 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 1.1rem;
  color: #5d4037;
}

.detail-icon {
  font-size: 1.2rem;
}

.detail-total {
  font-weight: 600;
  font-size: 0.95rem;
}

.detail-total.income {
  color: #2e7d32;
}

.detail-total.expense {
  color: #c62828;
}

/* 表格样式 */
.table-wrapper {
  overflow-x: auto;
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
}

.detail-table th {
  background: #f0f0f0;
  color: #666;
  padding: 0.75rem;
  font-weight: 600;
  text-align: left;
  font-size: 0.9rem;
}

.detail-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #e0e0e0;
}

.detail-table tr:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.amount-cell {
  font-weight: 500;
  font-family: 'Noto Serif SC', serif;
}

.empty-row {
  text-align: center;
  color: #999;
}

/* 进度条 */
.progress-bar {
  position: relative;
  height: 20px;
  background: #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #81c784);
  border-radius: 10px;
  transition: width 0.5s ease;
}

.progress-fill.expense {
  background: linear-gradient(90deg, #f44336, #e57373);
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.75rem;
  font-weight: 600;
  color: #333;
  text-shadow: 0 0 2px rgba(255, 255, 255, 0.8);
}

/* 报表操作 */
.report-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e0e0e0;
}

.btn-icon {
  font-size: 1.1rem;
}

/* 空状态 */
.empty-card {
  padding: 3rem;
}

.empty-state {
  text-align: center;
  color: #999;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  color: #666;
  margin-bottom: 0.5rem;
}

/* 打印样式 */
@media print {
  .generator-card,
  .report-actions {
    display: none;
  }
  
  .report-card {
    box-shadow: none;
    border: 1px solid #ccc;
  }
  
  .seal {
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .form-actions .btn {
    width: 100%;
  }
  
  .four-columns {
    grid-template-columns: 1fr;
  }
  
  .details-section {
    grid-template-columns: 1fr;
  }
  
  .seal {
    width: 60px;
    height: 60px;
    font-size: 1rem;
    right: 1rem;
  }
  
  .report-title {
    font-size: 1.5rem;
  }
  
  .report-actions {
    flex-direction: column;
  }
  
  .report-actions .btn {
    width: 100%;
  }
}
</style>