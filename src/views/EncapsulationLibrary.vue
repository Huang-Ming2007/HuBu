<template>
  <div class="encapsulation-library">
    <div class="page-header">
      <div class="header-top">
        <button class="back-btn" @click="goBack">
          <span class="back-icon">←</span>
          <span>返回</span>
        </button>
        <h2 class="page-title">封装库</h2>
      </div>
      <div class="title-decoration">
        <span class="decoration-line"></span>
        <span class="decoration-icon">◆</span>
        <span class="decoration-line"></span>
      </div>
    </div>

    <!-- 操作区 -->
    <div class="action-section">
      <button class="btn primary" @click="showCreateModal = true">
        <span class="btn-icon">➕</span>
        <span>创建封装库</span>
      </button>
    </div>

    <!-- 封装库列表 -->
    <div class="libraries-grid">
      <div v-for="library in libraries" :key="library.id" class="library-card">
        <div class="library-header">
          <h3 class="library-name">{{ library.name }}</h3>
          <div class="library-actions">
            <button class="action-btn edit" @click="editLibrary(library)" title="编辑">
              ✏️
            </button>
            <button class="action-btn delete" @click="deleteLibrary(library.id)" title="删除">
              🗑️
            </button>
          </div>
        </div>
        <div class="library-balance">
          <span class="balance-label">余额：</span>
          <span class="balance-amount">{{ formatAmount(library) }}</span>
        </div>
        <div class="library-description">
          {{ library.description || '无描述' }}
        </div>
        <div class="library-footer">
          <span class="library-date">{{ formatDate(library.created_at) }}</span>
          <button class="btn secondary small" @click="showAddBalanceModal(library)">
            添加余额
          </button>
        </div>
      </div>
      <div v-if="libraries.length === 0" class="empty-state">
        <div class="empty-icon">📦</div>
        <h3>暂无封装库</h3>
        <p>点击上方按钮创建第一个封装库</p>
      </div>
    </div>

    <!-- 创建/编辑封装库弹窗 -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ showEditModal ? '编辑封装库' : '创建封装库' }}</h3>
          <button class="close-btn" @click="closeModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>名称</label>
            <input type="text" v-model="formData.name" class="input" placeholder="请输入封装库名称" required />
          </div>
          <div class="form-group">
            <label>初始余额</label>
            <div class="amount-inputs">
              <div class="amount-field">
                <input type="number" v-model.number="formData.tael" class="input" placeholder="0" min="0" />
                <span class="amount-label">元</span>
              </div>
              <div class="amount-field">
                <input type="number" v-model.number="formData.qian" class="input" placeholder="0" min="0" max="9" />
                <span class="amount-label">角</span>
              </div>
              <div class="amount-field">
                <input type="number" v-model.number="formData.fen" class="input" placeholder="0" min="0" max="9" />
                <span class="amount-label">分</span>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label>描述</label>
            <textarea v-model="formData.description" class="input" rows="3" placeholder="请输入描述..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn secondary" @click="closeModal">取消</button>
          <button class="btn primary" @click="saveLibrary">保存</button>
        </div>
      </div>
    </div>

    <!-- 添加余额弹窗 -->
    <div v-if="showAddBalanceModalFlag" class="modal-overlay" @click="showAddBalanceModalFlag = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>添加余额</h3>
          <button class="close-btn" @click="showAddBalanceModalFlag = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="library-info">
            <h4>{{ selectedLibrary?.name }}</h4>
            <p>当前余额：{{ formatAmount(selectedLibrary) }}</p>
          </div>
          <div class="form-group">
            <label>添加金额</label>
            <div class="amount-inputs">
              <div class="amount-field">
                <input type="number" v-model.number="addBalanceData.tael" class="input" placeholder="0" min="0" />
                <span class="amount-label">元</span>
              </div>
              <div class="amount-field">
                <input type="number" v-model.number="addBalanceData.qian" class="input" placeholder="0" min="0" max="9" />
                <span class="amount-label">角</span>
              </div>
              <div class="amount-field">
                <input type="number" v-model.number="addBalanceData.fen" class="input" placeholder="0" min="0" max="9" />
                <span class="amount-label">分</span>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label>备注</label>
            <textarea v-model="addBalanceData.note" class="input" rows="3" placeholder="请输入备注（例如：这笔钱用于什么用途）"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn secondary" @click="showAddBalanceModalFlag = false">取消</button>
          <button class="btn primary" @click="addBalance">确认添加</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { accountingService } from '../services/accounting';
import { type EncapsulationLibrary } from '../types/accounting';
import { authService } from '../services/auth';

const router = useRouter();
const libraries = ref<EncapsulationLibrary[]>([]);

const showCreateModal = ref(false);
const showEditModal = ref(false);
const showAddBalanceModalFlag = ref(false);
const selectedLibrary = ref<EncapsulationLibrary | null>(null);

const formData = ref({
  name: '',
  tael: 0,
  qian: 0,
  fen: 0,
  description: '',
  note: ''
});

const addBalanceData = ref({
  tael: 0,
  qian: 0,
  fen: 0,
  note: ''
});

const goBack = () => {
  router.back();
};

const loadLibraries = () => {
  libraries.value = accountingService.getEncapsulationLibraries();
};

const saveLibrary = () => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) return;

  if (showEditModal.value && selectedLibrary.value) {
    accountingService.updateEncapsulationLibrary(selectedLibrary.value.id, {
      ...formData.value
    });
  } else {
    accountingService.createEncapsulationLibrary({
      ...formData.value,
      created_by: currentUser.username,
      balance: formData.value.tael + formData.value.qian / 10 + formData.value.fen / 100
    });
  }

  loadLibraries();
  closeModal();
};

const editLibrary = (library: EncapsulationLibrary) => {
  selectedLibrary.value = library;
  formData.value = {
    name: library.name,
    tael: library.tael,
    qian: library.qian,
    fen: library.fen,
    description: library.description,
    note: library.note
  };
  showEditModal.value = true;
  showCreateModal.value = false;
};

const deleteLibrary = (id: string) => {
  if (confirm('确定要删除这个封装库吗？')) {
    accountingService.deleteEncapsulationLibrary(id);
    loadLibraries();
  }
};

const showAddBalanceModal = (library: EncapsulationLibrary) => {
  selectedLibrary.value = library;
  addBalanceData.value = {
    tael: 0,
    qian: 0,
    fen: 0,
    note: ''
  };
  showAddBalanceModalFlag.value = true;
};

const addBalance = () => {
  if (selectedLibrary.value) {
    accountingService.addBalanceToLibrary(
      selectedLibrary.value.id,
      addBalanceData.value.tael,
      addBalanceData.value.qian,
      addBalanceData.value.fen,
      addBalanceData.value.note
    );
    loadLibraries();
    showAddBalanceModalFlag.value = false;
  }
};

const closeModal = () => {
  showCreateModal.value = false;
  showEditModal.value = false;
  showAddBalanceModalFlag.value = false;
  selectedLibrary.value = null;
  formData.value = {
    name: '',
    tael: 0,
    qian: 0,
    fen: 0,
    description: '',
    note: ''
  };
  addBalanceData.value = {
    tael: 0,
    qian: 0,
    fen: 0,
    note: ''
  };
};

const formatAmount = (library: EncapsulationLibrary | null) => {
  if (!library) return '0.00 元';
  const amount = Number(library.balance) || 0;
  return `${amount.toFixed(2)} 元`;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

onMounted(() => {
  loadLibraries();
});
</script>

<style scoped>
/* 故宫建筑风格 */
.encapsulation-library {
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

.action-section {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 2rem;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  font-weight: 500;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn.primary {
  background: linear-gradient(135deg, #8b0000 0%, #a52a2a 100%);
  color: #ffd700;
  border: 2px solid #ffd700;
}

.btn.primary:hover {
  background: linear-gradient(135deg, #a52a2a 0%, #8b0000 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(139, 0, 0, 0.4);
}

.btn.secondary {
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
  color: #8b0000;
  border: 2px solid #ffd700;
}

.btn.secondary:hover {
  background: linear-gradient(135deg, #e8e8e8 0%, #f5f5f5 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.btn.small {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.btn-icon {
  font-size: 1.2rem;
}

.libraries-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.library-card {
  background: rgba(255, 255, 255, 0.9);
  border: 3px solid #ffd700;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.library-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
}

.library-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.library-name {
  font-size: 1.3rem;
  color: #8b0000;
  margin: 0;
  font-weight: bold;
  font-family: 'SimSun', serif;
  letter-spacing: 1px;
}

.library-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
  border: 2px solid #ffd700;
  font-size: 1rem;
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

.library-balance {
  margin-bottom: 1rem;
  padding: 1rem;
  background: rgba(245, 245, 245, 0.8);
  border-radius: 8px;
  border: 1px solid #ffd700;
}

.balance-label {
  font-weight: 600;
  color: #8b0000;
  font-family: 'SimSun', serif;
}

.balance-amount {
  font-size: 1.5rem;
  font-weight: bold;
  color: #8b0000;
  margin-left: 0.5rem;
}

.library-description {
  margin-bottom: 1.5rem;
  color: #666;
  line-height: 1.5;
}

.library-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 2px solid #ffd700;
}

.library-date {
  color: #999;
  font-size: 0.9rem;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem;
  background: rgba(255, 255, 255, 0.9);
  border: 3px dashed #ffd700;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.empty-icon {
  font-size: 4rem;
  color: #ffd700;
}

.empty-state h3 {
  color: #8b0000;
  margin: 0;
  font-family: 'SimSun', serif;
}

.empty-state p {
  color: #666;
  margin: 0;
}

/* 弹窗样式 */
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
  max-width: 500px;
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

.form-group .input,
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
.form-group textarea:focus {
  outline: none;
  border-color: #8b0000;
  box-shadow: 0 0 0 3px rgba(139, 0, 0, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.amount-inputs {
  display: flex;
  gap: 1rem;
}

.amount-field {
  flex: 1;
  position: relative;
}

.amount-field .input {
  width: 100%;
  padding-right: 2.5rem;
  text-align: center;
  font-size: 1.2rem;
  font-weight: 600;
}

.amount-label {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #8b0000;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: 'SimSun', serif;
}

.library-info {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.8);
  border: 2px solid #ffd700;
  border-radius: 8px;
}

.library-info h4 {
  color: #8b0000;
  margin: 0 0 0.5rem 0;
  font-family: 'SimSun', serif;
}

.library-info p {
  color: #666;
  margin: 0;
}

.modal-footer {
  display: flex;
  gap: 1.5rem;
  justify-content: flex-end;
  padding-top: 1.5rem;
  border-top: 2px solid #ffd700;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .encapsulation-library {
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
  
  .libraries-grid {
    grid-template-columns: 1fr;
  }
  
  .library-card {
    padding: 1.5rem;
  }
  
  .modal-content {
    padding: 1.5rem;
  }
  
  .amount-inputs {
    flex-direction: column;
  }
}
</style>