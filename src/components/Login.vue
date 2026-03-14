<template>
  <div class="login-container">
    <!-- 顶部匾额 -->
    <div class="plaque-container">
      <!-- 悬挂结构 -->
      <div class="plaque-hanger">
        <div class="hanger-top"></div>
        <div class="hanger-chains">
          <div class="chain chain-1"></div>
          <div class="chain chain-2"></div>
        </div>
      </div>
      <!-- 匾额 -->
      <div class="plaque" @click="showWuyingLogin = true">
        <div class="plaque-border">
          <div class="plaque-text">户部</div>
        </div>
      </div>
    </div>

    <!-- 武英殿登录弹窗 -->
    <div v-if="showWuyingLogin" class="wuying-modal">
      <div class="wuying-modal-content">
        <div class="wuying-modal-header">
          <h2 class="wuying-title">武英殿大学士登录</h2>
          <button class="close-btn" @click="showWuyingLogin = false">&times;</button>
        </div>
        <div class="wuying-modal-body">
          <form @submit.prevent="handleWuyingLogin" class="wuying-form">
            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">👤</span>
                <span class="label-text">账号</span>
              </label>
              <div class="input-container">
                <input 
                  type="text" 
                  v-model="wuyingForm.username" 
                  placeholder="请输入账号"
                  required
                  class="form-input"
                />
                <div class="input-decoration"></div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">🔒</span>
                <span class="label-text">密码</span>
              </label>
              <div class="input-container">
                <input 
                  type="password" 
                  v-model="wuyingForm.password" 
                  placeholder="请输入密码"
                  required
                  class="form-input"
                />
                <div class="input-decoration"></div>
              </div>
            </div>

            <button type="submit" class="login-btn" :class="{ 'loading': wuyingLoading }">
              <span class="btn-text">进入武英殿</span>
            </button>

            <div v-if="wuyingError" class="error-message">{{ wuyingError }}</div>

            <!-- 武英殿测试账号 -->
            <div class="test-accounts">
              <div class="accounts-header">
                <span class="header-icon">📋</span>
                <span class="header-text">测试账号</span>
              </div>
              <div class="accounts-grid">
                <div class="account-item minister" @click="fillWuyingAccount('wuying_scholar', '123456')">
                  <span class="account-title">武英殿大学士</span>
                  <span class="account-details">wuying_scholar / 123456</span>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 登录主体 -->
    <div class="login-main">
      <div class="login-card">
        <div class="card-header">
          <h1 class="login-title">登录</h1>
          <div class="title-decoration">
            <div class="decorative-line left-line"></div>
            <div class="decorative-dot"></div>
            <div class="decorative-line right-line"></div>
          </div>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">👤</span>
              <span class="label-text">账号</span>
            </label>
            <div class="input-container">
              <input 
                type="text" 
                v-model="form.username" 
                placeholder="请输入账号"
                required
                class="form-input"
              />
              <div class="input-decoration"></div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">🔒</span>
              <span class="label-text">密码</span>
            </label>
            <div class="input-container">
              <input 
                type="password" 
                v-model="form.password" 
                placeholder="请输入密码"
                required
                class="form-input"
              />
              <div class="input-decoration"></div>
            </div>
          </div>

          <button type="submit" class="login-btn" :class="{ 'loading': loading }">
            <span class="btn-text">进入户部</span>
          </button>

          <div v-if="error" class="error-message">{{ error }}</div>
        </form>

        <!-- 测试账号 -->
        <div class="test-accounts">
          <div class="accounts-header">
            <span class="header-icon">📋</span>
            <span class="header-text">测试账号</span>
          </div>
          <div class="accounts-grid">
            <div class="account-item minister" @click="fillAccount('minister', '123456')">
              <span class="account-title">户部尚书</span>
              <span class="account-details">minister / 123456</span>
            </div>
            <div class="account-item" @click="fillAccount('vice_minister_left', '123456')">
              <span class="account-title">户部左侍郎</span>
              <span class="account-details">vice_minister_left / 123456</span>
            </div>
            <div class="account-item" @click="fillAccount('vice_minister_right', '123456')">
              <span class="account-title">户部右侍郎</span>
              <span class="account-details">vice_minister_right / 123456</span>
            </div>
            <div class="account-item" @click="fillAccount('clerk', '123456')">
              <span class="account-title">户部主事</span>
              <span class="account-details">clerk / 123456</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '../services/auth';

const router = useRouter();

const form = reactive({
  username: '',
  password: ''
});
const loading = ref(false);
const error = ref('');

// 武英殿登录相关状态
const showWuyingLogin = ref(false);
const wuyingForm = reactive({
  username: '',
  password: ''
});
const wuyingLoading = ref(false);
const wuyingError = ref('');

const fillAccount = (user: string, pass: string) => {
  form.username = user;
  form.password = pass;
};

const fillWuyingAccount = (user: string, pass: string) => {
  wuyingForm.username = user;
  wuyingForm.password = pass;
};

const handleLogin = async () => {
  error.value = '';
  loading.value = true;
  
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const success = authService.login(form.username, form.password);
  if (success) {
    const user = authService.getCurrentUser();
    if (user?.role === 'wuying_scholar') {
      router.push('/wuying-management');
    } else {
      router.push('/dashboard');
    }
  } else {
    error.value = '账号或密码有误，请重新输入';
  }
  
  loading.value = false;
};

const handleWuyingLogin = async () => {
  wuyingError.value = '';
  wuyingLoading.value = true;
  
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const success = authService.login(wuyingForm.username, wuyingForm.password);
  if (success) {
    const user = authService.getCurrentUser();
    if (user?.role === 'wuying_scholar') {
      router.push('/wuying-management');
    } else {
      wuyingError.value = '请使用武英殿大学士账号登录';
    }
  } else {
    wuyingError.value = '账号或密码有误，请重新输入';
  }
  
  wuyingLoading.value = false;
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    180deg,
    #F9F5EC 0%,
    #F0E8D8 40%,
    #E8DCC8 70%,
    #D4C4A0 100%
  );
  font-family: 'SimSun', 'STSong', serif;
  position: relative;
  overflow: hidden;
}

/* 匾额容器 */
.plaque-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
  z-index: 2;
}

/* 悬挂结构 */
.plaque-hanger {
  position: relative;
  width: 200px;
  height: 60px;
  margin-bottom: -10px;
  z-index: 1;
}

.hanger-top {
  width: 100%;
  height: 10px;
  background: linear-gradient(90deg, #5D4037, #8B4513, #5D4037);
  border: 2px solid #D4AF37;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
  position: absolute;
  top: 0;
  left: 0;
}

.hanger-chains {
  position: absolute;
  top: 10px;
  left: 0;
  right: 0;
  height: 50px;
  display: flex;
  justify-content: space-between;
  padding: 0 40px;
}

.chain {
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, #D4AF37, #FFD700, #D4AF37);
  border-radius: 2px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  position: relative;
}

.chain::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 8px;
  height: 8px;
  background: linear-gradient(145deg, #D4AF37, #FFD700);
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  margin-top: -4px;
}

.chain::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 8px;
  height: 8px;
  background: linear-gradient(145deg, #D4AF37, #FFD700);
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  margin-bottom: -4px;
}

/* 匾额 */
.plaque {
  position: relative;
  text-align: center;
  cursor: pointer;
  z-index: 2;
}

.plaque-border {
  background: linear-gradient(145deg, #8b0000, #a52a2a);
  border: 2px solid #ffd700;
  border-radius: 6px;
  padding: 0.5rem 2rem;
  position: relative;
  box-shadow: 
    0 6px 16px rgba(0, 0, 0, 0.4),
    inset 0 2px 4px rgba(255, 255, 255, 0.1);
  display: inline-block;
  transition: all 0.3s ease;
}

.plaque:hover .plaque-border {
  transform: translateY(-2px);
  box-shadow: 
    0 8px 20px rgba(0, 0, 0, 0.5),
    inset 0 2px 4px rgba(255, 255, 255, 0.1);
}

.plaque-text {
  font-size: 1.8rem;
  color: #ffd700;
  font-weight: bold;
  letter-spacing: 10px;
  text-shadow: 
    2px 2px 4px rgba(0, 0, 0, 0.5),
    0 0 10px rgba(255, 215, 0, 0.5);
  font-family: 'SimSun', 'STSong', serif;
  text-align: center;
  position: relative;
}

.plaque-border::before {
  content: '';
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  background: linear-gradient(45deg, #ffd700, #ffed4e, #ffd700);
  border-radius: 8px;
  z-index: -1;
  opacity: 0.8;
}

/* 登录主体 */
.login-main {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 600px;
}

.login-card {
  background: linear-gradient(
    145deg,
    #FFFAF0 0%,
    #FFF8DC 50%,
    #FFFAF0 100%
  );
  border: 3px solid #D4AF37;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  width: 100%;
  position: relative;
}

.card-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-title {
  font-size: 24px;
  color: #8B4513;
  font-weight: bold;
  margin-bottom: 16px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.title-decoration {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.decorative-line {
  width: 80px;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    #D4AF37 50%,
    transparent 100%
  );
}

.decorative-dot {
  width: 12px;
  height: 12px;
  background: #D4AF37;
  border-radius: 50%;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  color: #5D4037;
  font-weight: bold;
}

.label-icon {
  font-size: 20px;
}

.input-container {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 16px 20px;
  border: 3px solid #D4C4A0;
  border-radius: 12px;
  background: #FFFAF5;
  font-size: 16px;
  color: #333;
  font-family: inherit;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.form-input:focus {
  outline: none;
  border-color: #D4AF37;
  box-shadow: 0 0 16px rgba(212, 175, 55, 0.4);
}

.form-input::placeholder {
  color: #B8A898;
}

.input-decoration {
  position: absolute;
  top: 4px;
  left: 4px;
  right: 4px;
  bottom: 4px;
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 8px;
  pointer-events: none;
  z-index: 0;
}

.login-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(
    145deg,
    #8B0000 0%,
    #9B1C1C 40%,
    #8B0000 100%
  );
  border: 3px solid #D4AF37;
  border-radius: 12px;
  color: #FFD700;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  position: relative;
  overflow: hidden;
  margin-top: 8px;
  transform: rotate(0deg) !important;
}

.login-btn.loading {
  opacity: 0.8;
  cursor: not-allowed;
  transform: rotate(0deg) !important;
}

.btn-text {
  position: relative;
  z-index: 1;
  letter-spacing: 12px;
  padding-left: 12px;
}

.login-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(139, 0, 0, 0.4);
}

.login-btn:active {
  transform: translateY(0);
}

.login-btn.loading {
  opacity: 0.8;
  cursor: not-allowed;
}

.error-message {
  text-align: center;
  color: #DC143C;
  font-size: 14px;
  padding: 16px;
  background: rgba(220, 20, 60, 0.08);
  border-radius: 8px;
  border: 2px solid rgba(220, 20, 60, 0.3);
  margin-top: 8px;
}

/* 测试账号 */
.test-accounts {
  border-top: 2px dashed #D4C4A0;
  padding-top: 20px;
}

.accounts-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #5D4037;
  font-weight: bold;
  margin-bottom: 12px;
}

.header-icon {
  font-size: 20px;
}

.accounts-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.account-item {
  padding: 12px 16px;
  background: linear-gradient(
    145deg,
    #F5F0E8 0%,
    #E8DCC8 100%
  );
  border: 2px solid #D4C4A0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.account-item:hover {
  transform: translateY(-4px);
  border-color: #D4AF37;
  box-shadow: 0 8px 24px rgba(212, 175, 55, 0.2);
}

/* 户部尚书：红白渐变（适中） */
.account-item.minister {
  background: linear-gradient(
    145deg,
    #FFCCCC 0%,
    #FFFFFF 100%
  );
  border-color: #D4AF37;
}

/* 左右侍郎：黄白渐变（浅） */
.accounts-grid .account-item:nth-child(2),
.accounts-grid .account-item:nth-child(3) {
  background: linear-gradient(
    145deg,
    #FFF9C4 0%,
    #FFFFFF 100%
  );
  border-color: #D4AF37;
}

.account-title {
  font-weight: bold;
  color: #8B4513;
}

.account-details {
  font-size: 12px;
  color: #8B7355;
  font-family: monospace;
}

/* 武英殿登录弹窗 */
.wuying-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.wuying-modal-content {
  background: linear-gradient(
    145deg,
    #FFFAF0 0%,
    #FFF8DC 50%,
    #FFFAF0 100%
  );
  border: 3px solid #D4AF37;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  width: 90%;
  max-width: 500px;
  position: relative;
  animation: slideIn 0.3s ease;
}

.wuying-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.wuying-title {
  font-size: 20px;
  color: #8B4513;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #8B4513;
  transition: all 0.3s ease;
}

.close-btn:hover {
  color: #DC143C;
  transform: rotate(90deg);
}

.wuying-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-main {
    padding: 20px 15px;
  }
  
  .login-card {
    padding: 25px 20px;
  }
  
  .login-title {
    font-size: 20px;
  }
  
  .accounts-grid {
    grid-template-columns: 1fr;
  }
  
  .wuying-modal-content {
    width: 95%;
    padding: 25px 20px;
  }
  
  .wuying-title {
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .login-card {
    padding: 20px 15px;
  }
  
  .form-input {
    padding: 14px 16px;
  }
  
  .login-btn {
    padding: 14px;
    font-size: 16px;
  }
  
  .btn-text {
    letter-spacing: 8px;
    padding-left: 8px;
  }
  
  .wuying-modal-content {
    padding: 20px 15px;
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-50px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>