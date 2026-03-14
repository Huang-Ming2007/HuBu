import { createRouter, createWebHistory, RouteRecordRaw, NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { authService } from './services/auth';
import { Permission } from './types/user';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: '登录',
    component: () => import('./components/Login.vue')
  },
  {
    path: '/dashboard',
    name: '首页',
    component: () => import('./views/Dashboard.vue'),
    meta: { requiresAuth: true, permission: Permission.ACCOUNTING_VIEW }
  },
  {
    path: '/accounting',
    name: '记账',
    component: () => import('./views/Accounting.vue'),
    meta: { requiresAuth: true, permission: Permission.ACCOUNTING_VIEW }
  },
  {
    path: '/reports',
    name: '报表',
    component: () => import('./views/Reports.vue'),
    meta: { requiresAuth: true, permission: Permission.REPORT_VIEW }
  },
  {
    path: '/audit',
    name: '审计',
    component: () => import('./views/Audit.vue'),
    meta: { requiresAuth: true, permission: Permission.AUDIT_VIEW }
  },
  {
    path: '/data-management',
    name: '数据管理',
    component: () => import('./views/DataManagement.vue'),
    meta: { requiresAuth: true, permission: Permission.DATA_STATISTICS }
  },
  {
    path: '/users',
    name: '用户管理',
    component: () => import('./views/Users.vue'),
    meta: { requiresAuth: true, permission: Permission.USER_VIEW }
  },
  {
    path: '/encapsulation-library',
    name: '封装库',
    component: () => import('./views/EncapsulationLibrary.vue'),
    meta: { requiresAuth: true, permission: Permission.ENCAPSULATION_VIEW }
  },
  {
    path: '/wuying-management',
    name: '武英殿管理',
    component: () => import('./views/WuyingManagement.vue'),
    meta: { requiresAuth: true, permission: Permission.WUYING_MANAGE }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 路由守卫
router.beforeEach((to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
  const requiresAuth = to.meta.requiresAuth;
  const requiredPermission = to.meta.permission as Permission;
  
  if (requiresAuth) {
    const user = authService.getCurrentUser();
    if (!user) {
      next('/login');
      return;
    }
    
    if (requiredPermission && !authService.hasPermission(requiredPermission)) {
      next('/dashboard');
      return;
    }
  }
  
  next();
});

export default router;
