<template>
  <div class="wuying-management">
    <div class="page-header">
      <div class="header-top">
        <button class="back-btn" @click="goBack">
          <span class="back-icon">←</span>
          <span>返回</span>
        </button>
        <h2 class="page-title">武英殿</h2>
      </div>
      <div class="title-decoration">
        <span class="decoration-line"></span>
        <span class="decoration-icon">◆</span>
        <span class="decoration-line"></span>
      </div>
    </div>

    <!-- 权限管理 -->
    <div class="management-section">
      <h3 class="section-title">角色登录权限管理</h3>
      <p class="section-description">您可以禁止或解除禁止以下角色的登录权限</p>
      
      <div class="roles-grid">
        <div v-for="role in manageableRoles" :key="role.id" class="role-card">
          <div class="role-header">
            <h4 class="role-name">{{ role.name }}</h4>
            <span :class="['role-status', role.blocked ? 'blocked' : 'allowed']">
              {{ role.blocked ? '已禁止' : '允许登录' }}
            </span>
          </div>
          <p class="role-description">{{ role.description }}</p>
          <button 
            @click="toggleRoleBlock(role.id)" 
            :class="['btn', role.blocked ? 'unblock-btn' : 'block-btn']"
          >
            {{ role.blocked ? '解除禁止' : '禁止登录' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 密码管理 -->
    <div class="management-section">
      <h3 class="section-title">密码管理</h3>
      <p class="section-description">修改户部尚书、侍郎、主事的登录密码</p>
      
      <div class="password-grid">
        <div v-for="user in manageableUsers" :key="user.id" class="password-card">
          <div class="user-header">
            <h4 class="user-name">{{ user.name }}</h4>
            <span class="user-role">{{ user.roleName }}</span>
          </div>
          <div class="password-form">
            <input 
              type="password" 
              v-model="user.newPassword" 
              class="password-input" 
              placeholder="输入新密码"
              minlength="6"
            />
            <button 
              @click="resetPassword(user)" 
              class="btn reset-btn"
              :disabled="!user.newPassword || user.newPassword.length < 6"
            >
              修改密码
            </button>
          </div>
          <p v-if="user.message" :class="['message', user.messageType]">{{ user.message }}</p>
        </div>
      </div>
    </div>

    <!-- 当前状态 -->
    <div class="status-section">
      <h3 class="section-title">当前状态</h3>
      <div class="status-summary">
        <div class="status-item">
          <span class="status-label">总角色数：</span>
          <span class="status-value">{{ manageableRoles.length }}</span>
        </div>
        <div class="status-item">
          <span class="status-label">已禁止角色：</span>
          <span class="status-value blocked">{{ blockedCount }}</span>
        </div>
        <div class="status-item">
          <span class="status-label">允许登录角色：</span>
          <span class="status-value allowed">{{ manageableRoles.length - blockedCount }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '../services/auth';
import { Role, roleDescriptions, mockUsers } from '../types/user';

const router = useRouter();

interface ManageableRole {
  id: Role;
  name: string;
  description: string;
  blocked: boolean;
}

interface ManageableUser {
  id: string;
  name: string;
  roleName: string;
  newPassword: string;
  message: string;
  messageType: 'success' | 'error' | '';
}

const manageableRoles = ref<ManageableRole[]>([]);
const manageableUsers = ref<ManageableUser[]>([]);

const blockedCount = computed(() => {
  return manageableRoles.value.filter(role => role.blocked).length;
});

const goBack = () => {
  router.back();
};

const toggleRoleBlock = (role: Role) => {
  if (manageableRoles.value.find(r => r.id === role)?.blocked) {
    authService.unblockRole(role);
  } else {
    authService.blockRole(role);
  }
  loadRoles();
};

const resetPassword = (user: ManageableUser) => {
  if (!user.newPassword || user.newPassword.length < 6) {
    user.message = '密码长度至少6位';
    user.messageType = 'error';
    return;
  }
  
  const success = authService.resetUserPassword(user.id, user.newPassword);
  if (success) {
    user.message = '密码修改成功';
    user.messageType = 'success';
    user.newPassword = '';
    setTimeout(() => {
      user.message = '';
      user.messageType = '';
    }, 3000);
  } else {
    user.message = '密码修改失败';
    user.messageType = 'error';
  }
};

const loadRoles = () => {
  const blockedRoles = authService.getBlockedRoles();
  
  manageableRoles.value = [
    {
      id: Role.MINISTER,
      name: '户部尚书',
      description: roleDescriptions[Role.MINISTER],
      blocked: blockedRoles.includes(Role.MINISTER)
    },
    {
      id: Role.VICE_MINISTER_LEFT,
      name: '户部左侍郎',
      description: roleDescriptions[Role.VICE_MINISTER_LEFT],
      blocked: blockedRoles.includes(Role.VICE_MINISTER_LEFT)
    },
    {
      id: Role.VICE_MINISTER_RIGHT,
      name: '户部右侍郎',
      description: roleDescriptions[Role.VICE_MINISTER_RIGHT],
      blocked: blockedRoles.includes(Role.VICE_MINISTER_RIGHT)
    },
    {
      id: Role.CLERK,
      name: '主事',
      description: roleDescriptions[Role.CLERK],
      blocked: blockedRoles.includes(Role.CLERK)
    }
  ];
};

const loadUsers = () => {
  const users = mockUsers.filter(u => u.role !== Role.WUYING_SCHOLAR);
  manageableUsers.value = users.map(u => ({
    id: u.id,
    name: u.name,
    roleName: u.role === Role.MINISTER ? '户部尚书' : 
              u.role === Role.VICE_MINISTER_LEFT ? '户部左侍郎' :
              u.role === Role.VICE_MINISTER_RIGHT ? '户部右侍郎' : '主事',
    newPassword: '',
    message: '',
    messageType: ''
  }));
};

onMounted(() => {
  loadRoles();
  loadUsers();
});
</script>

<style scoped>
.wuying-management {
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

.management-section {
  background: rgba(255, 255, 255, 0.9);
  border: 3px solid #ffd700;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.section-title {
  font-size: 1.8rem;
  color: #8b0000;
  margin: 0 0 1.5rem 0;
  font-weight: bold;
  letter-spacing: 2px;
  font-family: 'SimSun', serif;
}

.section-description {
  color: #666;
  margin-bottom: 2rem;
  font-size: 1rem;
}

.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.role-card {
  background: linear-gradient(135deg, #fff 0%, #f8f3e9 100%);
  border: 2px solid #d4af37;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.role-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.role-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e8d9b9;
}

.role-name {
  font-size: 1.3rem;
  color: #8b0000;
  margin: 0;
  font-weight: bold;
  font-family: 'SimSun', serif;
}

.role-status {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
}

.role-status.blocked {
  background: linear-gradient(145deg, #c41e3a, #8b0000);
  color: #ffd700;
}

.role-status.allowed {
  background: linear-gradient(145deg, #4caf50, #2e7d32);
  color: #fff;
}

.role-description {
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.6;
  font-size: 0.95rem;
}

.btn {
  width: 100%;
  height: 48px;
  padding: 0 1.5rem;
  border: 2px solid;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  letter-spacing: 1px;
  font-family: 'Microsoft YaHei', 'SimSun', serif;
  display: flex;
  align-items: center;
  justify-content: center;
}

.block-btn {
  background: linear-gradient(135deg, #8b0000 0%, #a52a2a 100%);
  color: #ffd700;
  border-color: #ffd700;
}

.block-btn:hover {
  background: linear-gradient(135deg, #a52a2a 0%, #8b0000 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(139, 0, 0, 0.3);
}

.unblock-btn {
  background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
  color: #fff;
  border-color: #2e7d32;
}

.unblock-btn:hover {
  background: linear-gradient(135deg, #2e7d32 0%, #4caf50 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(46, 125, 50, 0.3);
}

.status-section {
  background: rgba(255, 255, 255, 0.9);
  border: 3px solid #ffd700;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.status-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.status-item {
  background: linear-gradient(135deg, #f8f3e9 0%, #f5e8d3 100%);
  border: 2px solid #d4af37;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
}

.status-label {
  display: block;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.status-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #8b0000;
}

.status-value.blocked {
  color: #c41e3a;
}

.status-value.allowed {
  color: #4caf50;
}

@media (max-width: 768px) {
  .wuying-management {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .roles-grid {
    grid-template-columns: 1fr;
  }
  
  .password-grid {
    grid-template-columns: 1fr;
  }
  
  .status-summary {
    grid-template-columns: 1fr;
  }
}

/* 密码管理样式 */
.password-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.password-card {
  background: linear-gradient(135deg, #faf8f3 0%, #f5f0e8 100%);
  border: 2px solid #d4c4a8;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.password-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  border-color: #ffd700;
}

.user-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e8d5b5;
}

.user-name {
  font-size: 1.25rem;
  color: #8b0000;
  margin: 0;
  font-weight: bold;
}

.user-role {
  font-size: 0.875rem;
  color: #666;
  background: #f0e6d3;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.password-input {
  padding: 0.75rem 1rem;
  border: 2px solid #d4c4a8;
  border-radius: 8px;
  font-size: 1rem;
  background: #fff;
  transition: all 0.3s ease;
}

.password-input:focus {
  outline: none;
  border-color: #8b0000;
  box-shadow: 0 0 0 3px rgba(139, 0, 0, 0.1);
}

.reset-btn {
  background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
  color: #ffd700;
  border: 2px solid #ffd700;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #283593 0%, #1a237e 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(26, 35, 126, 0.3);
}

.reset-btn:disabled {
  background: #ccc;
  border-color: #999;
  color: #666;
  cursor: not-allowed;
}

.message {
  margin-top: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  text-align: center;
}

.message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style>