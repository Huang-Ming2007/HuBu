<template>
  <div class="app-container">
    <!-- 殿门动画 -->
    <div v-if="showDoorAnimation" class="door-animation-container">
      <div class="door-frame">
        <div class="door-content">
          <!-- 主页面内容将通过z-index显示在门后面 -->
        </div>
        <div class="door left-door">
          <div class="door-nails">
            <div v-for="i in 60" :key="'left-'+i" class="nail"></div>
          </div>
          <div class="door-knocker"></div>
        </div>
        <div class="door right-door">
          <div class="door-nails">
            <div v-for="i in 60" :key="'right-'+i" class="nail"></div>
          </div>
          <div class="door-knocker"></div>
        </div>
      </div>
    </div>
    
    <!-- 全局加载状态 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p class="loading-text">加载中...</p>
      </div>
    </div>
    
    <template v-if="currentUser">
      
      <!-- 主内容区 -->
      <main class="main-content" :class="{ 'fade-in': showDoorAnimation }">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
      
      <!-- 页脚 -->
      <footer class="footer" :class="{ 'fade-in': showDoorAnimation }">
        <p>户部记账系统 · 仿古代官府风格 · {{ currentYear }}</p>
      </footer>
    </template>
    
    <template v-else-if="!currentUser">
      <router-view />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { authService } from './services/auth';
import { useRoute, useRouter, type NavigationGuardNext, type RouteLocationNormalized } from 'vue-router';
import type { User } from './types/user';

const currentUser = ref<User | null>(null);
const showDoorAnimation = ref(false);
const isLoading = ref(false);
const route = useRoute();
const router = useRouter();

const currentYear = computed(() => new Date().getFullYear());

onMounted(() => {
  const user = authService.getCurrentUser();
  if (user) {
    currentUser.value = user;
  }
});

// 监听路由变化，当进入 dashboard 或 wuying-management 时显示殿门动画
watch(() => route.path, (newPath) => {
  if ((newPath === '/dashboard' || newPath === '/wuying-management') && currentUser.value) {
    showDoorAnimation.value = true;
    // 3秒后关闭动画
    setTimeout(() => {
      showDoorAnimation.value = false;
    }, 3000);
  }
});

// 路由导航守卫，显示加载状态
router.beforeEach((_to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
  isLoading.value = true;
  next();
});

router.afterEach(() => {
  // 延迟关闭加载状态，确保页面有足够的时间加载
  setTimeout(() => {
    isLoading.value = false;
  }, 300);
});
</script>

<style scoped>
/* 应用容器 */
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f8f3e9 0%, #f0e6d2 100%);
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f8f3e9"/><path d="M0,0 L100,100 M100,0 L0,100" stroke="%23e8ddd0" stroke-width="0.5" opacity="0.3"/></svg>');
  position: relative;
  z-index: 1;
}



/* 主内容区 */
.main-content {
  flex: 1;
  padding: 2.5rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* 页脚 */
.footer {
  text-align: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, #8b0000 0%, #a52a2a 100%);
  border-top: 3px solid #ffd700;
  color: #ffd700;
  font-size: 0.9rem;
  font-family: 'SimSun', serif;
  letter-spacing: 2px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  position: relative;
  margin-top: auto;
}

.footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #ffd700, transparent);
}

.footer::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #ffd700, transparent);
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .main-content {
    padding: 2rem;
    margin: 1.5rem;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 1.5rem;
    margin: 1rem;
    border-radius: 12px;
  }
  
  .title {
    font-size: 1.5rem;
  }
  
  .footer {
    padding: 1.25rem;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 1rem;
    margin: 0.5rem;
  }
}

/* 全局卡片样式 */
.card {
  background: linear-gradient(135deg, #fff 0%, #f8f3e9 100%);
  border: 2px solid #d4af37;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  margin-bottom: 2rem;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
}

.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #8b0000, #ffd700, #8b0000);
}

.card-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e8d9b9;
  position: relative;
}

.card-header::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100px;
  height: 2px;
  background: linear-gradient(90deg, #8b0000, #ffd700);
}

.card-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: #8b4513;
  margin-bottom: 0.5rem;
  letter-spacing: 1px;
  font-family: 'SimSun', serif;
}

/* 全局按钮样式 */
.btn {
  padding: 0.75rem 1.5rem;
  border: 2px solid #d4af37;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  letter-spacing: 1px;
  font-family: 'Microsoft YaHei', 'SimSun', serif;
  position: relative;
  overflow: hidden;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.btn.primary {
  background: linear-gradient(135deg, #8b0000 0%, #a52a2a 100%);
  color: #ffd700;
  border-color: #ffd700;
}

.btn.primary:hover {
  background: linear-gradient(135deg, #a52a2a 0%, #8b0000 100%);
  box-shadow: 0 6px 16px rgba(139, 0, 0, 0.3);
}

.btn.secondary {
  background: linear-gradient(135deg, #f8f3e9 0%, #fff 100%);
  color: #8b0000;
  border-color: #8b0000;
}

.btn.secondary:hover {
  background: linear-gradient(135deg, #fff 0%, #f8f3e9 100%);
  box-shadow: 0 6px 16px rgba(139, 0, 0, 0.2);
}

/* 全局输入框样式 */
.input {
  padding: 0.75rem 1.25rem;
  border: 2px solid #d4af37;
  border-radius: 12px;
  background: #fff;
  font-family: 'Microsoft YaHei', 'SimSun', serif;
  transition: all 0.3s ease;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.input:focus {
  outline: none;
  border-color: #8b0000;
  box-shadow: 0 0 0 4px rgba(139, 0, 0, 0.1), inset 0 2px 4px rgba(0, 0, 0, 0.1);
}
/* 日期输入框样式 */
input[type="date"] {
  font-family: 'SimSun', serif;
}

/* 自定义日期输入框外观 */
input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(1) hue-rotate(180deg);
}

input[type="date"]::-webkit-datetime-edit {
  color: #8b0000;
}

input[type="date"]::-webkit-datetime-edit-text {
  color: #8b0000;
}

input[type="date"]::-webkit-datetime-edit-month-field,
input[type="date"]::-webkit-datetime-edit-day-field,
input[type="date"]::-webkit-datetime-edit-year-field {
  color: #8b0000;
}
/* 殿门动画 */
.door-animation-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  overflow: hidden;
  perspective: 2000px;
  background: transparent;
  backdrop-filter: blur(0px);
  transition: backdrop-filter 3s ease;
  will-change: transform;
  transform: translateZ(0);
}

.door-frame {
  position: absolute;
  width: 100vw;
  height: 100vh;
  border: 12px solid #8b4513;
  background: transparent;
  box-shadow: 
    0 0 80px rgba(255, 215, 0, 0.3),
    inset 0 0 40px rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transform-style: preserve-3d;
  border-radius: 4px;
  overflow: hidden;
}

/* 门中间的内容显示区域 */
.door-content {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: -1;
  opacity: 0;
  animation: contentReveal 3s ease-in-out forwards;
}

@keyframes contentReveal {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 0.3;
  }
  100% {
    opacity: 1;
  }
}

.door-frame::before {
  content: '';
  position: absolute;
  top: -20px;
  left: -20px;
  right: -20px;
  height: 40px;
  background: linear-gradient(135deg, #8b4513, #a0522d);
  border-bottom: 3px solid #ffd700;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.door {
  position: absolute;
  top: 0;
  height: 100%;
  width: 50%;
  background: linear-gradient(135deg, #8b0000 0%, #a52a2a 50%, #8b0000 100%);
  border: 3px solid #ffd700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    inset 0 0 60px rgba(0, 0, 0, 0.7),
    0 0 30px rgba(0, 0, 0, 0.5);
  transform-style: preserve-3d;
  position: relative;
  overflow: hidden;
  z-index: 10;
  will-change: transform;
  transform: translateZ(0);
}

.left-door {
  left: 0;
  border-right: 2px solid #ffd700;
  transform-origin: left center;
}

.right-door {
  right: 0;
  border-left: 2px solid #ffd700;
  transform-origin: right center;
}

/* 门钉 */
.door-nails {
  position: absolute;
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-template-rows: repeat(10, 1fr);
  padding: 60px;
  gap: 30px;
  pointer-events: none;
}

.nail {
  width: 16px;
  height: 16px;
  background: radial-gradient(circle, #ffd700 0%, #b8860b 100%);
  border-radius: 50%;
  box-shadow: 
    0 0 10px rgba(255, 215, 0, 0.8),
    inset 0 2px 4px rgba(255, 255, 255, 0.3),
    0 2px 4px rgba(0, 0, 0, 0.5);
  align-self: center;
  justify-self: center;
  will-change: box-shadow;
  transform: translateZ(0);
}

/* 门环 */
.door-knocker {
  position: absolute;
  width: 80px;
  height: 80px;
  background: radial-gradient(circle, #ffd700 0%, #b8860b 100%);
  border-radius: 50%;
  box-shadow: 
    0 0 15px rgba(255, 215, 0, 0.8),
    inset 0 4px 8px rgba(255, 255, 255, 0.3),
    0 4px 8px rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #8b4513;
  will-change: transform, box-shadow;
  transform: translateZ(0);
}

.door-knocker::before {
  content: '🦁';
  font-size: 2rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.left-door .door-knocker {
  right: 30px;
  top: 50%;
  transform: translateY(-50%);
}

.right-door .door-knocker {
  left: 30px;
  top: 50%;
  transform: translateY(-50%);
}

/* 动画触发 */
.door-animation-container {
  animation: doorOpen 3s ease-in-out forwards;
}

@keyframes doorOpen {
  0% {
    opacity: 1;
    z-index: 9999;
  }
  70% {
    opacity: 1;
    z-index: 9999;
  }
  100% {
    opacity: 0;
    visibility: hidden;
    z-index: -1;
  }
}

.door-animation-container .left-door {
  animation: leftDoorOpen 3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.door-animation-container .right-door {
  animation: rightDoorOpen 3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes leftDoorOpen {
  0% {
    transform: rotateY(0deg) translateX(0);
    opacity: 1;
  }
  100% {
    transform: rotateY(-120deg) translateX(-100px);
    opacity: 0;
  }
}

@keyframes rightDoorOpen {
  0% {
    transform: rotateY(0deg) translateX(0);
    opacity: 1;
  }
  100% {
    transform: rotateY(120deg) translateX(100px);
    opacity: 0;
  }
}

/* 主页面渐显效果 */
.fade-in {
  animation: fadeIn 3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  opacity: 1;
}

@keyframes fadeIn {
  0% {
    opacity: 0.3;
    transform: translateY(30px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 门钉动画 */
.door-nails .nail {
  animation: nailGlow 2s ease-in-out infinite alternate;
}

@keyframes nailGlow {
  0% {
    box-shadow: 
      0 0 10px rgba(255, 215, 0, 0.8),
      inset 0 2px 4px rgba(255, 255, 255, 0.3),
      0 2px 4px rgba(0, 0, 0, 0.5);
  }
  100% {
    box-shadow: 
      0 0 20px rgba(255, 215, 0, 1),
      inset 0 2px 4px rgba(255, 255, 255, 0.5),
      0 2px 4px rgba(0, 0, 0, 0.5);
  }
}

/* 门环动画 */
.door-knocker {
  animation: knockerPulse 2s ease-in-out infinite alternate;
}

@keyframes knockerPulse {
  0% {
    transform: scale(1);
    box-shadow: 
      0 0 15px rgba(255, 215, 0, 0.8),
      inset 0 4px 8px rgba(255, 255, 255, 0.3),
      0 4px 8px rgba(0, 0, 0, 0.5);
  }
  100% {
    transform: scale(1.05);
    box-shadow: 
      0 0 25px rgba(255, 215, 0, 1),
      inset 0 4px 8px rgba(255, 255, 255, 0.5),
      0 4px 8px rgba(0, 0, 0, 0.5);
  }
}

/* 全局加载状态 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  backdrop-filter: blur(2px);
}

.loading-spinner {
  text-align: center;
  padding: 2rem;
  background: linear-gradient(135deg, #fff 0%, #f8f3e9 100%);
  border: 2px solid #d4af37;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #8b0000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: #8b4513;
  font-family: 'SimSun', serif;
  font-size: 1.2rem;
  letter-spacing: 2px;
}
</style>