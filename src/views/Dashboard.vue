<template>
  <div class="dashboard">
    <!-- 用户信息和退出登录 -->
    <div class="user-info-bar">
      <div class="user-details">
        <span class="user-role">{{ currentUser ? getRoleChinese(currentUser.role) : '' }}</span>
      </div>
      <button class="logout-btn btn secondary" @click="handleLogout">退出登录</button>
    </div>
    
    <div class="page-header">
      <h2 class="page-title">户部总览</h2>
      <div class="title-decoration">
        <span class="decoration-line"></span>
        <span class="decoration-icon">◆</span>
        <span class="decoration-line"></span>
      </div>
    </div>
    
    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card card income-card">
        <div v-once class="stat-icon">💰</div>
        <div class="stat-content">
          <h3 v-once>本月收入</h3>
          <p class="stat-value" v-memo="[monthlyIncome]">{{ formatAmount(monthlyIncome) }}</p>
          <span v-once class="stat-trend positive">↑ 12%</span>
        </div>
        <div v-once class="card-decoration"></div>
      </div>
      
      <div class="stat-card card expense-card">
        <div v-once class="stat-icon">💸</div>
        <div class="stat-content">
          <h3 v-once>本月支出</h3>
          <p class="stat-value" v-memo="[monthlyExpense]">{{ formatAmount(monthlyExpense) }}</p>
          <span v-once class="stat-trend negative">↑ 5%</span>
        </div>
        <div v-once class="card-decoration"></div>
      </div>
      
      <div class="stat-card card balance-card">
        <div v-once class="stat-icon">⚖️</div>
        <div class="stat-content">
          <h3 v-once>本月结余</h3>
          <p class="stat-value" v-memo="[monthlyBalance]">{{ formatAmount(monthlyBalance) }}</p>
          <span v-once class="stat-trend positive">↑ 18%</span>
        </div>
        <div v-once class="card-decoration"></div>
      </div>
      
      <div class="stat-card card records-card">
        <div v-once class="stat-icon">📋</div>
        <div class="stat-content">
          <h3 v-once>总账目数</h3>
          <p class="stat-value" v-memo="[totalRecords]">{{ totalRecords }}</p>
          <span v-once class="stat-label">笔记录</span>
        </div>
        <div v-once class="card-decoration"></div>
      </div>
    </div>
    
    <!-- 最近账目 -->
    <div class="recent-section">
      <div class="section-header">
        <h3 class="section-title">
          <span class="title-icon">📜</span>
          最近账目
        </h3>
        <router-link to="/accounting" class="view-all-link">
          查看全部 →
        </router-link>
      </div>
      
      <div class="transactions-card card">
        <div class="table-wrapper">
          <table class="transactions-table">
            <thead v-once>
              <tr>
                <th>日期</th>
                <th>类型</th>
                <th>金额</th>
                <th>分类</th>
                <th>备注</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(record, index) in recentRecords" :key="record.id" :class="{ 'highlight': index === 0 }" v-memo="[record.id, record.date, record.type, record.amount, record.category, record.note]">
                <td class="date-cell">{{ record.date }}</td>
                <td>
                  <span class="type-badge" :class="record.type">
                    {{ record.type === 'income' ? '收入' : '支出' }}
                  </span>
                </td>
                <td class="amount-cell" :class="record.type">
                  {{ formatAmount(record.amount) }}
                </td>
                <td>{{ record.category }}</td>
                <td class="note-cell">{{ record.note }}</td>
                <td>
                  <span v-once class="status-badge verified">✓ 已审核</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-if="recentRecords.length === 0" class="empty-state">
          <div v-once class="empty-icon">📭</div>
          <p v-once>暂无账目记录</p>
          <router-link v-once to="/accounting" class="btn">去记账</router-link>
        </div>
      </div>
    </div>
    
    <!-- 快捷操作 -->
    <div class="quick-actions">
      <h3 class="section-title">
        <span class="title-icon">⚡</span>
        快捷操作
      </h3>
      <div class="actions-grid">
        <router-link v-if="hasPermission(Permission.ACCOUNTING_CREATE)" to="/accounting" class="action-card">
          <span class="action-icon">📝</span>
          <span class="action-text">记账</span>
        </router-link>
        <div v-else class="action-card disabled">
          <span class="action-icon">📝</span>
          <span class="action-text">记账</span>
          <span class="permission-denied">无权限</span>
        </div>
        
        <router-link v-if="hasPermission(Permission.REPORT_VIEW)" to="/reports" class="action-card">
          <span class="action-icon">📊</span>
          <span class="action-text">报表</span>
        </router-link>
        <div v-else class="action-card disabled">
          <span class="action-icon">📊</span>
          <span class="action-text">报表</span>
          <span class="permission-denied">无权限</span>
        </div>
        
        <router-link v-if="hasPermission(Permission.AUDIT_VIEW)" to="/audit" class="action-card">
          <span class="action-icon">🔍</span>
          <span class="action-text">审计</span>
        </router-link>
        <div v-else class="action-card disabled">
          <span class="action-icon">🔍</span>
          <span class="action-text">审计</span>
          <span class="permission-denied">无权限</span>
        </div>
        
        <router-link v-if="hasPermission(Permission.DATA_STATISTICS)" to="/data-management" class="action-card">
          <span class="action-icon">📈</span>
          <span class="action-text">统计</span>
        </router-link>
        <div v-else class="action-card disabled">
          <span class="action-icon">📈</span>
          <span class="action-text">统计</span>
          <span class="permission-denied">无权限</span>
        </div>
        
        <router-link v-if="hasPermission(Permission.ENCAPSULATION_VIEW)" to="/encapsulation-library" class="action-card">
          <span class="action-icon">📦</span>
          <span class="action-text">封装库</span>
        </router-link>
        <div v-else class="action-card disabled">
          <span class="action-icon">📦</span>
          <span class="action-text">封装库</span>
          <span class="permission-denied">无权限</span>
        </div>
        
        <router-link v-if="hasPermission(Permission.WUYING_MANAGE)" to="/wuying-management" class="action-card">
          <span class="action-icon">🏛️</span>
          <span class="action-text">武英殿</span>
        </router-link>
        <div v-else class="action-card disabled">
          <span class="action-icon">🏛️</span>
          <span class="action-text">武英殿</span>
          <span class="permission-denied">无权限</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { accountingService } from '../services/accounting';
import { authService } from '../services/auth';
import { Permission, Role, type User } from '../types/user';
import { useRouter } from 'vue-router';
import type { AccountingRecord } from '../types/accounting';

// 用户信息
const currentUser = ref<User | null>(null);
const router = useRouter();

// 角色中文映射
const getRoleChinese = (role: string) => {
  const roleMap: Record<string, string> = {
    [Role.MINISTER]: '户部尚书',
    [Role.VICE_MINISTER_LEFT]: '户部左侍郎',
    [Role.VICE_MINISTER_RIGHT]: '户部右侍郎',
    [Role.CLERK]: '户部主事',
    [Role.WUYING_SCHOLAR]: '武英殿大学士'
  };
  return roleMap[role] || role;
};



// 退出登录
const handleLogout = () => {
  authService.logout();
  router.push('/login');
};

// 统计数据
const monthlyIncome = ref(0);
const monthlyExpense = ref(0);
const monthlyBalance = ref(0);
const totalRecords = ref(0);

// 最近账目
const recentRecords = ref<AccountingRecord[]>([]);

// 格式化金额
const formatAmount = (amount: number) => {
  return `${amount.toLocaleString()} 元`;
};

// 检查权限
const hasPermission = (permission: Permission) => {
  return authService.hasPermission(permission);
};

const loadData = () => {
  const records = accountingService.getRecords();
  
  // 计算总记录数
  totalRecords.value = records.length;
  
  // 计算本月收支
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const startDate = startOfMonth.toISOString().split('T')[0];
  const endDate = endOfMonth.toISOString().split('T')[0];
  
  const monthlyData = accountingService.calculatePeriodTotals(startDate, endDate);
  monthlyIncome.value = monthlyData.income;
  monthlyExpense.value = monthlyData.expense;
  monthlyBalance.value = monthlyData.balance;
  
  // 获取最近5条记录
  recentRecords.value = [...records]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
};

onMounted(() => {
  // 获取当前用户信息
  const user = authService.getCurrentUser();
  if (user) {
    currentUser.value = user;
  }
  loadData();
});
</script>

<style scoped>
.dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
}

/* 用户信息栏 */
.user-info-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #e8d9b9;
}

.user-details {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  color: #5d4037;
}

.user-role {
  font-weight: bold;
}

.user-name {
  font-style: italic;
}

.logout-btn {
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 0, 0, 0.2);
}

.page-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.page-title {
  font-size: 2rem;
  color: #8b4513;
  margin-bottom: 0.5rem;
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

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  font-size: 2.5rem;
  margin-right: 1rem;
  opacity: 0.8;
}

.stat-content {
  flex: 1;
}

.stat-content h3 {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
  font-weight: normal;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 0.25rem;
}

.stat-trend {
  font-size: 0.85rem;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.stat-trend.positive {
  color: #2e7d32;
  background: rgba(46, 125, 50, 0.1);
}

.stat-trend.negative {
  color: #c62828;
  background: rgba(198, 40, 40, 0.1);
}

.stat-label {
  font-size: 0.85rem;
  color: #999;
}

.card-decoration {
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, transparent 50%, rgba(255, 255, 255, 0.1) 50%);
  border-radius: 0 8px 0 0;
}

.income-card {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  border-left: 4px solid #4caf50;
}

.expense-card {
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
  border-left: 4px solid #f44336;
}

.balance-card {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-left: 4px solid #2196f3;
}

.records-card {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  border-left: 4px solid #ff9800;
}

/* 最近账目 */
.recent-section {
  margin-bottom: 2.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-title {
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

.view-all-link {
  color: #8b4513;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s;
}

.view-all-link:hover {
  color: #a0522d;
  text-decoration: underline;
}

.transactions-card {
  padding: 0;
  overflow: hidden;
}

.table-wrapper {
  overflow-x: auto;
}

.transactions-table {
  width: 100%;
  border-collapse: collapse;
  margin: 0;
}

.transactions-table th {
  background: linear-gradient(135deg, #8b4513, #a0522d);
  color: white;
  padding: 1rem;
  font-weight: 600;
  text-align: left;
}

.transactions-table td {
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.transactions-table tr:hover {
  background-color: rgba(139, 69, 19, 0.05);
}

.transactions-table tr.highlight {
  background-color: rgba(255, 193, 7, 0.1);
  animation: highlight 2s ease-in-out;
}

@keyframes highlight {
  0%, 100% { background-color: rgba(255, 193, 7, 0.1); }
  50% { background-color: rgba(255, 193, 7, 0.3); }
}

.date-cell {
  font-family: monospace;
  color: #666;
}

.type-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.type-badge.income {
  background: rgba(76, 175, 80, 0.1);
  color: #2e7d32;
}

.type-badge.expense {
  background: rgba(244, 67, 54, 0.1);
  color: #c62828;
}

.amount-cell {
  font-weight: 600;
  font-family: 'Noto Serif SC', serif;
}

.amount-cell.income {
  color: #2e7d32;
}

.amount-cell.expense {
  color: #c62828;
}

.note-cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  background: rgba(76, 175, 80, 0.1);
  color: #2e7d32;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #999;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

/* 快捷操作 */
.quick-actions {
  margin-bottom: 2rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, #fff8e1, #f5f1e6);
  border: 2px solid #d2b48c;
  border-radius: 12px;
  text-decoration: none;
  color: #5d4037;
  transition: all 0.3s;
  cursor: pointer;
}

.action-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(139, 69, 19, 0.2);
  border-color: #8b4513;
  background: linear-gradient(135deg, #f5f1e6, #e8d9b9);
}

.action-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.action-text {
  font-size: 0.95rem;
  font-weight: 500;
}

.action-card.disabled {
  background: linear-gradient(135deg, #f5f5f5, #e0e0e0);
  border-color: #bdbdbd;
  cursor: not-allowed;
  opacity: 0.7;
}

.action-card.disabled:hover {
  transform: none;
  box-shadow: none;
  border-color: #bdbdbd;
  background: linear-gradient(135deg, #f5f5f5, #e0e0e0);
}

.permission-denied {
  font-size: 0.75rem;
  color: #f44336;
  margin-top: 0.25rem;
  font-weight: 500;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .transactions-table {
    font-size: 0.9rem;
  }
  
  .transactions-table th,
  .transactions-table td {
    padding: 0.75rem 0.5rem;
  }
  
  .note-cell {
    max-width: 100px;
  }
  
  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>