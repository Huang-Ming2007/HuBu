<template>
  <div class="audit">
    <div class="page-header">
      <div class="header-top">
        <button class="back-btn" @click="goBack">
          <span class="back-icon">←</span>
          <span>返回</span>
        </button>
        <h2 class="page-title">审计记录</h2>
      </div>
      <div class="title-decoration">
        <span class="decoration-line"></span>
        <span class="decoration-icon">◆</span>
        <span class="decoration-line"></span>
      </div>
      <p class="page-subtitle">记录官员操作，以备查考</p>
    </div>
    
    <!-- 统计卡片 -->
    <div class="stats-grid" v-if="filteredLogs.length > 0">
      <div class="stat-card card">
        <div class="stat-icon">📋</div>
        <div class="stat-content">
          <h4>总记录数</h4>
          <p class="stat-value">{{ filteredLogs.length }}</p>
        </div>
      </div>
      <div class="stat-card card">
        <div class="stat-icon">👥</div>
        <div class="stat-content">
          <h4>操作人员</h4>
          <p class="stat-value">{{ uniqueOperators }}</p>
        </div>
      </div>
      <div class="stat-card card">
        <div class="stat-icon">⚡</div>
        <div class="stat-content">
          <h4>今日操作</h4>
          <p class="stat-value">{{ todayOperations }}</p>
        </div>
      </div>
    </div>
    
    <!-- 筛选条件 -->
    <div class="filter-card card scroll-menu">
      <div class="card-header">
        <h3 class="card-title">
          <span class="title-icon">🔍</span>
          筛选条件
        </h3>
        <button class="btn-toggle" @click="showFilters = !showFilters">
          <span v-if="showFilters">收起 ▲</span>
          <span v-else>展开 ▼</span>
        </button>
      </div>
      
      <div v-show="showFilters" class="filter-content">
        <div class="filter-grid">
          <div class="form-group">
            <label>
              <span class="label-icon">📅</span>
              开始日期
            </label>
            <div class="date-input-wrapper">
              <input type="date" v-model="filter.startDate" class="input date-input date-input-start" @focus="handleDateFocus($event)" @blur="handleDateBlur($event)" />
              <span class="date-placeholder" :class="{ 'active': !filter.startDate }">请选择开始日期</span>
            </div>
          </div>
          <div class="form-group">
            <label>
              <span class="label-icon">📅</span>
              结束日期
            </label>
            <div class="date-input-wrapper">
              <input type="date" v-model="filter.endDate" class="input date-input date-input-end" @focus="handleDateFocus($event)" @blur="handleDateBlur($event)" />
              <span class="date-placeholder" :class="{ 'active': !filter.endDate }">请选择结束日期</span>
            </div>
          </div>
          <div class="form-group">
            <label for="operation">
              <span class="label-icon">⚡</span>
              操作类型
            </label>
            <select id="operation" v-model="filter.operation" class="input">
              <option value="">全部</option>
              <option value="create">📝 创建</option>
              <option value="update">✏️ 更新</option>
              <option value="delete">🗑️ 删除</option>
              <option value="login">🔑 登录</option>
              <option value="logout">🚪 登出</option>
              <option value="export">📤 导出</option>
              <option value="import">📥 导入</option>
            </select>
          </div>
          <div class="form-group">
            <label for="targetType">
              <span class="label-icon">🎯</span>
              目标类型
            </label>
            <select id="targetType" v-model="filter.targetType" class="input">
              <option value="">全部</option>
              <option value="record">📋 账目</option>
              <option value="user">👤 用户</option>
              <option value="settlement">💰 结算</option>
              <option value="system">⚙️ 系统</option>
            </select>
          </div>
        </div>
        
        <div class="filter-actions">
          <button class="btn btn-secondary" @click="resetFilter">
            <span class="btn-icon">🔄</span>
            重置
          </button>
          <button class="btn" @click="applyFilter">
            <span class="btn-icon">🔍</span>
            筛选
          </button>
        </div>
      </div>
    </div>
    
    <!-- 操作日志列表 -->
    <div class="logs-card card antique-page">
      <div class="card-header">
        <h3 class="card-title">
          <span class="title-icon">📜</span>
          审计记录
        </h3>
        <div class="header-actions">
          <button class="btn-icon-only" @click="refreshLogs" title="刷新">
            🔄
          </button>
          <button class="btn-icon-only" @click="exportLogs" title="导出">
            📥
          </button>
        </div>
      </div>
      
      <div class="table-container">
        <table class="logs-table">
          <thead>
            <tr>
              <th>时间</th>
              <th>官员</th>
              <th>操作</th>
              <th>目标</th>
              <th>描述</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in paginatedLogs" :key="log.id" :class="getOperationClass(log.operation)">
              <td data-label="时间">
                <div class="time-cell">
                  <span class="date">{{ formatDate(log.created_at) }}</span>
                  <span class="time">{{ formatTime(log.created_at) }}</span>
                </div>
              </td>
              <td data-label="官员">
                <div class="user-cell">
                  <span class="user-name">{{ log.username }}</span>
                  <span class="user-role">{{ formatRole(log.user_role) }}</span>
                </div>
              </td>
              <td data-label="操作">
                <span class="operation-badge" :class="log.operation">
                  {{ formatOperation(log.operation) }}
                </span>
              </td>
              <td data-label="目标">
                <span class="target-type">{{ formatTargetType(log.target_type) }}</span>
              </td>
              <td data-label="描述" class="description-cell">
                {{ log.description }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 分页 -->
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
      
      <!-- 空状态 -->
      <div v-if="filteredLogs.length === 0" class="empty-state">
        <div class="empty-icon">📜</div>
        <h3>暂无记录</h3>
        <p>没有找到符合条件的操作记录</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { auditService } from '../services/audit';

const router = useRouter();

const goBack = () => {
  router.back();
};

// 筛选条件
const filter = ref({
  startDate: '',
  endDate: '',
  operation: '',
  targetType: ''
});

// 显示筛选器
const showFilters = ref(true);

// 分页
const currentPage = ref(1);
const pageSize = 10;

// 所有日志
const logs = ref<any[]>([]);

// 筛选后的日志
const filteredLogs = computed(() => {
  let result = [...logs.value];
  
  if (filter.value.startDate) {
    result = result.filter(log => new Date(log.created_at) >= new Date(filter.value.startDate));
  }
  
  if (filter.value.endDate) {
    result = result.filter(log => new Date(log.created_at) <= new Date(filter.value.endDate));
  }
  
  if (filter.value.operation) {
    result = result.filter(log => log.operation === filter.value.operation);
  }
  
  if (filter.value.targetType) {
    result = result.filter(log => log.target_type === filter.value.targetType);
  }
  
  return result.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
});

// 分页后的日志
const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  const end = start + pageSize;
  return filteredLogs.value.slice(start, end);
});

// 总页数
const totalPages = computed(() => {
  return Math.ceil(filteredLogs.value.length / pageSize);
});

// 统计：唯一操作人员数
const uniqueOperators = computed(() => {
  const operators = new Set(filteredLogs.value.map((log: any) => log.user_id));
  return operators.size;
});

// 统计：今日操作数
const todayOperations = computed(() => {
  const today = new Date().toDateString();
  return filteredLogs.value.filter((log: any) => 
    new Date(log.created_at).toDateString() === today
  ).length;
});

// 格式化日期
const formatDate = (dateTimeString: string) => {
  const date = new Date(dateTimeString);
  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit'
  });
};

// 格式化时间
const formatTime = (dateTimeString: string) => {
  const date = new Date(dateTimeString);
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 格式化角色
const formatRole = (role: string) => {
  const roleMap: Record<string, string> = {
    'minister': '户部尚书',
    'vice_minister': '户部侍郎',
    'clerk': '主事'
  };
  return roleMap[role] || role;
};

// 格式化操作类型
const formatOperation = (operation: string) => {
  const operationMap: Record<string, string> = {
    'create': '创建',
    'update': '更新',
    'delete': '删除',
    'login': '登录',
    'logout': '登出',
    'export': '导出',
    'import': '导入'
  };
  return operationMap[operation] || operation;
};

// 格式化目标类型
const formatTargetType = (targetType: string) => {
  const targetTypeMap: Record<string, string> = {
    'record': '账目',
    'user': '用户',
    'settlement': '结算',
    'system': '系统'
  };
  return targetTypeMap[targetType] || targetType;
};

// 获取操作样式类
const getOperationClass = (operation: string) => {
  return {
    'create': 'row-create',
    'update': 'row-update',
    'delete': 'row-delete',
    'login': 'row-login',
    'logout': 'row-logout'
  }[operation] || '';
};

// 应用筛选
const applyFilter = () => {
  currentPage.value = 1;
};

// 重置筛选
const resetFilter = () => {
  filter.value = {
    startDate: '',
    endDate: '',
    operation: '',
    targetType: ''
  };
  currentPage.value = 1;
};

// 刷新日志
const refreshLogs = () => {
  loadLogs();
};

// 导出日志
const exportLogs = () => {
  const data = JSON.stringify(filteredLogs.value, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

// 加载日志
const loadLogs = () => {
  logs.value = auditService.getLogs();
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
  loadLogs();
});
</script>

<style scoped>
.audit {
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
  margin-bottom: 0.5rem;
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

.page-subtitle {
  color: #999;
  font-size: 0.95rem;
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
}

.stat-icon {
  font-size: 2rem;
}

.stat-content h4 {
  font-size: 0.85rem;
  color: #999;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

/* 筛选卡片 */
.filter-card {
  margin-bottom: 2rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.btn-toggle {
  background: none;
  border: none;
  color: #8b4513;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.5rem;
}

.btn-toggle:hover {
  text-decoration: underline;
}

.filter-content {
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.filter-grid {
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

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-icon {
  font-size: 1.1rem;
}

/* 日志卡片 */
.logs-card {
  position: relative;
  padding: 2rem;
}

.logs-card::before {
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

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon-only {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background 0.3s;
}

.btn-icon-only:hover {
  background: rgba(139, 69, 19, 0.1);
}

/* 表格样式 */
.table-container {
  overflow-x: auto;
  margin-bottom: 1.5rem;
}

.logs-table {
  width: 100%;
  border-collapse: collapse;
}

.logs-table th {
  background: #f5f5f5;
  color: #666;
  padding: 0.875rem;
  font-weight: 600;
  text-align: left;
  font-size: 0.9rem;
  border-bottom: 2px solid #e0e0e0;
}

.logs-table td {
  padding: 0.875rem;
  border-bottom: 1px solid #e0e0e0;
}

.logs-table tr:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

/* 行样式 */
.row-create {
  border-left: 3px solid #4caf50;
}

.row-update {
  border-left: 3px solid #2196f3;
}

.row-delete {
  border-left: 3px solid #f44336;
}

.row-login {
  border-left: 3px solid #9c27b0;
}

.row-logout {
  border-left: 3px solid #ff9800;
}

/* 时间单元格 */
.time-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.time-cell .date {
  font-weight: 500;
  color: #333;
}

.time-cell .time {
  font-size: 0.85rem;
  color: #999;
}

/* 用户单元格 */
.user-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-cell .user-name {
  font-weight: 500;
  color: #333;
}

.user-cell .user-role {
  font-size: 0.85rem;
  color: #999;
}

/* 操作徽章 */
.operation-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
  background: #e0e0e0;
  color: #666;
}

.operation-badge.create {
  background: #e8f5e9;
  color: #2e7d32;
}

.operation-badge.update {
  background: #e3f2fd;
  color: #1565c0;
}

.operation-badge.delete {
  background: #ffebee;
  color: #c62828;
}

.operation-badge.login {
  background: #f3e5f5;
  color: #7b1fa2;
}

.operation-badge.logout {
  background: #fff3e0;
  color: #e65100;
}

.operation-badge.export,
.operation-badge.import {
  background: #e0f2f1;
  color: #00695c;
}

/* 目标类型 */
.target-type {
  color: #666;
  font-size: 0.9rem;
}

/* 描述单元格 */
.description-cell {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.page-btn {
  padding: 0.5rem 1rem;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.page-btn:hover:not(:disabled) {
  background: #8b4513;
  color: white;
  border-color: #8b4513;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #666;
  font-size: 0.9rem;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 3rem;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .filter-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-actions {
    flex-direction: column;
  }
  
  .filter-actions .btn {
    width: 100%;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .logs-table {
    font-size: 0.85rem;
  }
  
  .logs-table th,
  .logs-table td {
    padding: 0.625rem;
  }
  
  .description-cell {
    max-width: 150px;
  }
  
  .pagination {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .page-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .logs-card {
    padding: 1rem;
  }
  
  .table-container {
    margin: 0 -1rem;
  }
  
  .logs-table {
    display: block;
  }
  
  .logs-table thead {
    display: none;
  }
  
  .logs-table tbody {
    display: block;
  }
  
  .logs-table tr {
    display: block;
    margin-bottom: 1rem;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 1rem;
  }
  
  .logs-table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border: none;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .logs-table td:last-child {
    border-bottom: none;
  }
  
  .logs-table td::before {
    content: attr(data-label);
    font-weight: 600;
    color: #666;
  }
  
  .time-cell,
  .user-cell {
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
  }
  
  .description-cell {
    max-width: none;
    white-space: normal;
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