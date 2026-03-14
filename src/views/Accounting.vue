<template>
  <div class="accounting">
    <div class="page-header">
      <div class="header-top">
        <button class="back-btn" @click="goBack">
          <span class="back-icon">←</span>
          <span>返回</span>
        </button>
        <h2 class="page-title">记账管理</h2>
      </div>
      <div class="title-decoration">
        <span class="decoration-line"></span>
        <span class="decoration-icon">◆</span>
        <span class="decoration-line"></span>
      </div>
    </div>
    
    <!-- 快捷分类 -->
    <div class="quick-categories">
      <div class="type-tabs">
        <button 
          class="type-tab" 
          :class="{ active: activeType === 'expense' }"
          @click="activeType = 'expense'"
        >
          <span class="tab-icon">📤</span>
          <span>支出</span>
        </button>
        <button 
          class="type-tab" 
          :class="{ active: activeType === 'income' }"
          @click="activeType = 'income'"
        >
          <span class="tab-icon">📥</span>
          <span>收入</span>
        </button>
      </div>
      
      <div class="categories-grid">
        <button 
          v-for="category in currentCategories" 
          :key="category"
          class="category-btn"
          @click="quickRecord(category)"
        >
          <span class="category-icon">{{ getCategoryIcon(category) }}</span>
          <span class="category-name">{{ category }}</span>
        </button>
      </div>
    </div>
    
    <!-- 快速记账弹窗 -->
    <div v-if="showQuickModal" class="modal-overlay" @click="showQuickModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>快速记账</h3>
          <button class="close-btn" @click="showQuickModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="modal-category">
            <span class="category-icon">{{ getCategoryIcon(selectedCategory) }}</span>
            <span class="category-name">{{ selectedCategory }}</span>
          </div>
          <div class="amount-inputs">
            <div class="amount-field">
              <input 
                type="number" 
                v-model.number="quickAmount.amount" 
                class="input" 
                placeholder="0.00" 
                min="0" 
                step="0.01"
                @keyup.enter="submitQuickRecord"
              />
              <span class="amount-label">元</span>
            </div>
          </div>
          <div class="form-group">
            <label>备注</label>
            <input 
              type="text" 
              v-model="quickAmount.note" 
              class="input" 
              placeholder="请输入备注..."
              @keyup.enter="submitQuickRecord"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showQuickModal = false">取消</button>
          <button class="btn" @click="submitQuickRecord">确认记账</button>
        </div>
      </div>
    </div>
    
    <!-- 记账表单 -->
    <div class="form-card card scroll-menu">
      <div class="card-header">
        <h3 class="card-title">
          <span class="title-icon">📝</span>
          登记账目
        </h3>
      </div>
      
      <form @submit.prevent="handleSubmit" class="accounting-form">
        <div class="form-grid">
          <div class="form-group">
            <label for="date">
              <span class="label-icon">📅</span>
              日期
            </label>
            <input type="date" id="date" v-model="formData.date" class="input" placeholder="请选择日期" required />
          </div>
          
          <div class="form-group">
            <label for="type">
              <span class="label-icon">📊</span>
              类型
            </label>
            <select id="type" v-model="formData.type" class="input" required>
              <option value="income">收入</option>
              <option value="expense">支出</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="category">
              <span class="label-icon">🏷️</span>
              分类
            </label>
            <select id="category" v-model="formData.category" class="input" required>
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label>
              <span class="label-icon">💰</span>
              金额
            </label>
            <div class="amount-inputs">
              <div class="amount-field">
                <input type="number" v-model.number="formData.amount" class="input" placeholder="0.00" min="0" step="0.01" required />
                <span class="amount-label">元</span>
              </div>
            </div>
          </div>
          
          <div class="form-group full-width">
            <label for="note">
              <span class="label-icon">📝</span>
              备注
            </label>
            <textarea id="note" v-model="formData.note" class="input" rows="3" placeholder="请输入备注信息..."></textarea>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="resetForm">重置</button>
          <button type="submit" class="btn" :disabled="isSubmitting">
            <span v-if="isSubmitting" class="loading-spinner"></span>
            <span v-else>💾 保存账目</span>
          </button>
        </div>
      </form>
    </div>

    <!-- 账目列表 -->
    <div class="list-card card">
      <div class="card-header">
        <h3 class="card-title">
          <span class="title-icon">📋</span>
          账目列表
        </h3>
        
        <div class="filter-section">
          <input 
            type="date" 
            v-model="filter.startDate" 
            class="input filter-input" 
            placeholder="开始日期"
          />
          <input 
            type="date" 
            v-model="filter.endDate" 
            class="input filter-input" 
            placeholder="结束日期"
          />
          <select v-model="filter.type" class="input filter-input">
            <option value="">全部</option>
            <option value="income">收入</option>
            <option value="expense">支出</option>
          </select>
        </div>
      </div>
      
      <div class="table-wrapper">
        <table class="records-table">
          <thead>
            <tr>
              <th>日期</th>
              <th>类型</th>
              <th>分类</th>
              <th>金额</th>
              <th>备注</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in paginatedRecords" :key="record.id" :class="record.type">
              <td>{{ formatDate(record.date) }}</td>
              <td>
                <span class="type-badge" :class="record.type">
                  {{ record.type === 'income' ? '收入' : '支出' }}
                </span>
              </td>
              <td>{{ record.category }}</td>
              <td class="amount-cell" :class="record.type">
                {{ formatAmount(record) }}
              </td>
              <td class="note-cell">{{ record.note || '-' }}</td>
              <td class="actions-cell">
                <button class="action-btn edit" @click="editRecord(record)" title="编辑">
                  ✏️
                </button>
                <button class="action-btn delete" @click="deleteRecord(record.id)" title="删除">
                  🗑️
                </button>
              </td>
            </tr>
            <tr v-if="filteredRecords.length === 0" class="empty-row">
              <td colspan="6">暂无账目记录</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="pagination" v-if="totalPages > 1">
        <button 
          class="page-btn" 
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          ← 上一页
        </button>
        <span class="page-info">
          第 {{ currentPage }} / {{ totalPages }} 页
        </span>
        <button 
          class="page-btn" 
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          下一页 →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { accountingService } from '../services/accounting';
import { RecordType, IncomeCategory, ExpenseCategory, type AccountingRecord } from '../types/accounting';
import { authService } from '../services/auth';
import { debounce } from '../utils/debounce';

const router = useRouter();

const goBack = () => {
  router.back();
};

const activeType = ref<'income' | 'expense'>('expense');
const showQuickModal = ref(false);
const selectedCategory = ref('');

const formData = ref({
  date: new Date().toISOString().split('T')[0],
  type: RecordType.EXPENSE,
  category: ExpenseCategory.FOOD,
  amount: 0,
  note: ''
});

const quickAmount = ref({
  amount: 0,
  note: ''
});

const records = ref<AccountingRecord[]>([]);
const isSubmitting = ref(false);
const isNewRecord = ref(false);

const filter = ref({
  startDate: '',
  endDate: '',
  type: ''
});

const currentPage = ref(1);
const pageSize = 10;

const incomeCategories = Object.values(IncomeCategory);
const expenseCategories = Object.values(ExpenseCategory);

// 使用防抖函数优化过滤逻辑
const debouncedFilter = debounce(() => {
  // 当过滤条件变化时，重置到第一页
  currentPage.value = 1;
}, 300);

// 监听过滤条件变化
watch(
  () => [filter.value.startDate, filter.value.endDate, filter.value.type],
  () => {
    debouncedFilter();
  }
);

const currentCategories = computed(() => {
  return activeType.value === 'income' ? incomeCategories : expenseCategories;
});

const categories = computed(() => {
  return formData.value.type === 'income' ? incomeCategories : expenseCategories;
});

const filteredRecords = computed(() => {
  let result = [...records.value];
  
  if (filter.value.startDate) {
    result = result.filter((r: AccountingRecord) => r.date >= filter.value.startDate);
  }
  
  if (filter.value.endDate) {
    result = result.filter((r: AccountingRecord) => r.date <= filter.value.endDate);
  }
  
  if (filter.value.type) {
    result = result.filter((r: AccountingRecord) => r.type === filter.value.type);
  }
  
  return result.sort((a: AccountingRecord, b: AccountingRecord) => new Date(b.date).getTime() - new Date(a.date).getTime());
});

const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  const end = start + pageSize;
  return filteredRecords.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredRecords.value.length / pageSize);
});

const getCategoryIcon = (category: string): string => {
  const iconMap: Record<string, string> = {
    '餐饮': '🍜',
    '衣物': '👔',
    '住房': '🏠',
    '交通': '🚗',
    '通讯': '📱',
    '教育': '📚',
    '娱乐': '🎮',
    '医疗': '💊',
    '购物': '🛍️',
    '美容': '💄',
    '旅行': '✈️',
    '送礼': '🎁',
    '捐赠': '❤️',
    '保险': '🛡️',
    '水电': '💡',
    '维修': '🔧',
    '育儿': '👶',
    '宠物': '🐕',
    '运动': '⚽',
    '书籍': '📖',
    '软件': '💻',
    '订阅': '📺',
    '贷款': '💸',
    '信用卡': '💳',
    '税费': '📋',
    '其他支出': '📝',
    '工资': '💰',
    '奖金': '🎉',
    '投资收益': '📈',
    '兼职收入': '💼',
    '自由职业': '🎨',
    '房租收入': '🏢',
    '利息收入': '🏦',
    '退款': '↩️',
    '礼金': '🧧',
    '其他收入': '📝'
  };
  return iconMap[category] || '📝';
};

const quickRecord = (category: string) => {
  selectedCategory.value = category;
  quickAmount.value = {
    amount: 0,
    note: ''
  };
  showQuickModal.value = true;
};

const submitQuickRecord = () => {
  if (quickAmount.value.amount === 0) {
    alert('请输入金额');
    return;
  }
  
  const currentUser = authService.getCurrentUser();
  if (!currentUser) return;
  
  const record = {
    date: new Date().toISOString().split('T')[0],
    type: activeType.value,
    category: selectedCategory.value,
    amount: quickAmount.value.amount,
    note: quickAmount.value.note,
    created_by: currentUser.username
  };
  
  accountingService.addRecord(record as Omit<AccountingRecord, 'id' | 'created_at' | 'updated_at'>);
  loadRecords();
  showQuickModal.value = false;
  isNewRecord.value = true;
  setTimeout(() => {
    isNewRecord.value = false;
  }, 2000);
};

const handleSubmit = async () => {
  isSubmitting.value = true;
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    isSubmitting.value = false;
    return;
  }
  
  const record = {
    ...formData.value,
    created_by: currentUser.username
  };
  
  accountingService.addRecord(record as Omit<AccountingRecord, 'id' | 'created_at' | 'updated_at'>);
  loadRecords();
  resetForm();
  
  isNewRecord.value = true;
  setTimeout(() => {
    isNewRecord.value = false;
  }, 2000);
  
  isSubmitting.value = false;
};

const editRecord = (record: any) => {
  formData.value = {
    date: record.date,
    type: record.type,
    category: record.category,
    amount: record.amount || 0,
    note: record.note || ''
  };
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const deleteRecord = (id: string) => {
  if (confirm('确定要删除这条账目吗？')) {
    accountingService.deleteRecord(id);
    loadRecords();
  }
};

const resetForm = () => {
  formData.value = {
    date: new Date().toISOString().split('T')[0],
    type: RecordType.EXPENSE,
    category: ExpenseCategory.FOOD,
    amount: 0,
    note: ''
  };
};

const formatAmount = (record: any) => {
  const amount = Number(record.amount) || 0;
  return `${amount.toFixed(2)} 元`;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit'
  });
};

const loadRecords = () => {
  records.value = accountingService.getRecords();
};

onMounted(() => {
  loadRecords();
});
</script>

<style scoped>
/* 故宫建筑风格 - 主色调：红、金、黑 */
.accounting {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: linear-gradient(135deg, #f9f3e9 0%, #f5e8d3 100%);
  min-height: 100vh;
}

.page-header {
  text-align: center;
  margin-bottom: 2.5rem;
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
  font-size: 2.5rem;
  color: #8b0000;
  margin: 0;
  font-weight: bold;
  letter-spacing: 6px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  font-family: 'SimSun', serif;
  background: linear-gradient(135deg, #8b0000 0%, #a52a2a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-decoration {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 1rem;
}

.decoration-line {
  width: 150px;
  height: 3px;
  background: linear-gradient(to right, transparent, #ffd700, transparent);
  border-radius: 2px;
}

.decoration-icon {
  color: #ffd700;
  font-size: 1.5rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

/* 快捷分类 */
.quick-categories {
  margin-bottom: 2.5rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.9);
  border: 3px solid #ffd700;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
}

.type-tabs {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  justify-content: center;
}

.type-tab {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2.5rem;
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
  border: 2px solid #ffd700;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.1rem;
  font-weight: 600;
  color: #8b0000;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.type-tab:hover {
  background: linear-gradient(135deg, #e8e8e8 0%, #f5f5f5 100%);
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.type-tab.active {
  background: linear-gradient(135deg, #8b0000 0%, #a52a2a 100%);
  color: #ffd700;
  border-color: #ffd700;
  box-shadow: 0 6px 16px rgba(139, 0, 0, 0.4);
}

.tab-icon {
  font-size: 1.4rem;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 1.5rem;
}

.category-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem 1rem;
  background: linear-gradient(135deg, #ffffff 0%, #f9f9f9 100%);
  border: 2px solid #ffd700;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.category-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #8b0000, #ffd700, #8b0000);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.category-btn:hover::before {
  transform: scaleX(1);
}

.category-btn:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  border-color: #8b0000;
}

.category-icon {
  font-size: 2.2rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.category-name {
  font-size: 1rem;
  color: #8b0000;
  text-align: center;
  font-weight: 500;
  font-family: 'SimSun', serif;
}

/* 快速记账弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: linear-gradient(135deg, #f9f3e9 0%, #f5e8d3 100%);
  border: 4px solid #ffd700;
  border-radius: 20px;
  padding: 2.5rem;
  width: 90%;
  max-width: 480px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
  animation: slideUp 0.3s ease;
  position: relative;
  backdrop-filter: blur(10px);
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #ffd700;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.8rem;
  color: #8b0000;
  font-weight: bold;
  letter-spacing: 2px;
  font-family: 'SimSun', serif;
}

.close-btn {
  background: linear-gradient(135deg, #8b0000 0%, #a52a2a 100%);
  border: 2px solid #ffd700;
  font-size: 1.5rem;
  cursor: pointer;
  color: #ffd700;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(139, 0, 0, 0.3);
}

.close-btn:hover {
  background: linear-gradient(135deg, #a52a2a 0%, #8b0000 100%);
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(139, 0, 0, 0.4);
}

.modal-body {
  margin-bottom: 2rem;
}

.modal-category {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.8);
  border: 2px solid #ffd700;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.modal-category .category-icon {
  font-size: 3rem;
}

.modal-category .category-name {
  font-size: 1.4rem;
  font-weight: 600;
  color: #8b0000;
  font-family: 'SimSun', serif;
}

.amount-inputs {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.amount-field {
  flex: 1;
  position: relative;
}

.amount-field .input {
  width: 100%;
  padding: 1rem;
  padding-right: 3rem;
  text-align: center;
  font-size: 1.4rem;
  font-weight: 600;
  border: 2px solid #ffd700;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  color: #8b0000;
  transition: all 0.3s ease;
}

.amount-field .input:focus {
  outline: none;
  border-color: #8b0000;
  box-shadow: 0 0 0 3px rgba(139, 0, 0, 0.1);
}

.amount-label {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #8b0000;
  font-size: 1rem;
  font-weight: 600;
  font-family: 'SimSun', serif;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: #8b0000;
  font-size: 1.1rem;
  font-family: 'SimSun', serif;
}

.form-group .input {
  width: 100%;
  padding: 1rem;
  border: 2px solid #ffd700;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  color: #8b0000;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group .input:focus {
  outline: none;
  border-color: #8b0000;
  box-shadow: 0 0 0 3px rgba(139, 0, 0, 0.1);
}

.modal-footer {
  display: flex;
  gap: 1.5rem;
  justify-content: flex-end;
  padding-top: 1.5rem;
  border-top: 2px solid #ffd700;
}

/* 表单卡片 */
.form-card {
  margin-bottom: 2.5rem;
  padding: 2.5rem;
  background: rgba(255, 255, 255, 0.9);
  border: 3px solid #ffd700;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #ffd700;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  color: #8b0000;
  margin: 0;
  font-weight: bold;
  font-family: 'SimSun', serif;
  letter-spacing: 2px;
}

.title-icon {
  font-size: 1.4rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 2rem;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: #8b0000;
  font-size: 1.1rem;
  font-family: 'SimSun', serif;
}

.label-icon {
  font-size: 1.2rem;
}

.form-group .input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 1rem;
  border: 2px solid #ffd700;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  color: #8b0000;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group .input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #8b0000;
  box-shadow: 0 0 0 3px rgba(139, 0, 0, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
}

.full-width {
  grid-column: 1 / -1;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1.5rem;
  padding-top: 2rem;
  border-top: 2px solid #ffd700;
  margin-top: 2rem;
}

/* 列表卡片 */
.list-card {
  margin-bottom: 2.5rem;
  padding: 2.5rem;
  background: rgba(255, 255, 255, 0.9);
  border: 3px solid #ffd700;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
}

.filter-section {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  background: rgba(245, 245, 245, 0.8);
  border-radius: 8px;
  border: 1px solid #ffd700;
}

.filter-input {
  padding: 0.75rem 1rem;
  border: 2px solid #ffd700;
  border-radius: 6px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.9);
  color: #8b0000;
  transition: all 0.3s ease;
}

.filter-input:focus {
  outline: none;
  border-color: #8b0000;
  box-shadow: 0 0 0 3px rgba(139, 0, 0, 0.1);
}

.table-wrapper {
  overflow-x: auto;
  border: 2px solid #ffd700;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
}

.records-table {
  width: 100%;
  border-collapse: collapse;
}

.records-table th {
  background: linear-gradient(135deg, #8b0000 0%, #a52a2a 100%);
  color: #ffd700;
  padding: 1rem;
  font-weight: 600;
  text-align: left;
  font-size: 1rem;
  border-bottom: 2px solid #ffd700;
  font-family: 'SimSun', serif;
  letter-spacing: 1px;
}

.records-table td {
  padding: 1rem;
  border-bottom: 1px solid #ffd700;
  color: #333;
}

.records-table tr:hover {
  background-color: rgba(139, 0, 0, 0.05);
}

.records-table tr.income .amount-cell {
  color: #2e7d32;
  font-weight: 600;
}

.records-table tr.expense .amount-cell {
  color: #c62828;
  font-weight: 600;
}

.type-badge {
  display: inline-block;
  padding: 0.375rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: 'SimSun', serif;
}

.type-badge.income {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  color: #2e7d32;
  border: 1px solid #4caf50;
}

.type-badge.expense {
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
  color: #c62828;
  border: 1px solid #f44336;
}

.note-cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #666;
}

.actions-cell {
  display: flex;
  gap: 0.75rem;
}

.action-btn {
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
  border: 2px solid #ffd700;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-btn.edit:hover {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-color: #2196f3;
  transform: scale(1.1);
}

.action-btn.delete:hover {
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
  border-color: #f44336;
  transform: scale(1.1);
}

.empty-row {
  text-align: center;
  color: #999;
  padding: 3rem;
  font-size: 1.1rem;
  font-family: 'SimSun', serif;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid #ffd700;
  margin-top: 1.5rem;
}

.page-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
  border: 2px solid #ffd700;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #8b0000;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.page-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #8b0000 0%, #a52a2a 100%);
  color: #ffd700;
  border-color: #ffd700;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(139, 0, 0, 0.3);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f5f5f5;
  color: #999;
  border-color: #e0e0e0;
}

.page-info {
  color: #8b0000;
  font-size: 1rem;
  font-weight: 500;
  font-family: 'SimSun', serif;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .accounting {
    padding: 1rem;
  }
  
  .back-btn {
    position: relative;
    left: auto;
    margin-bottom: 1rem;
  }
  
  .header-top {
    flex-direction: column;
    gap: 1rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .quick-categories,
  .form-card,
  .list-card {
    padding: 1.5rem;
  }
  
  .categories-grid {
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    gap: 1rem;
  }
  
  .category-btn {
    padding: 1.25rem 0.75rem;
  }
  
  .category-icon {
    font-size: 1.8rem;
  }
  
  .category-name {
    font-size: 0.9rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .filter-section {
    flex-direction: column;
  }
  
  .filter-input {
    width: 100%;
  }
  
  .modal-content {
    padding: 1.5rem;
  }
  
  .amount-inputs {
    flex-direction: column;
  }
  
  .type-tabs {
    flex-direction: column;
    align-items: center;
  }
  
  .type-tab {
    width: 100%;
    justify-content: center;
  }
}
</style>