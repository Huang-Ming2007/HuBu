import { User, Role, Permission, mockUsers, rolePermissions } from '../types/user';

// 认证服务
class AuthService {
  private currentUser: User | null = null;
  private blockedRoles: Role[] = []; // 被禁止登录的角色

  constructor() {
    // 初始化时从localStorage加载被禁止的角色列表
    this.loadBlockedRoles();
    // 清除所有禁止状态，确保可以正常登录
    this.clearAllBlocks();
  }

  // 从localStorage加载被禁止的角色列表
  private loadBlockedRoles(): void {
    const storedBlockedRoles = localStorage.getItem('blockedRoles');
    if (storedBlockedRoles) {
      try {
        this.blockedRoles = JSON.parse(storedBlockedRoles);
      } catch (e) {
        this.blockedRoles = [];
      }
    }
  }

  // 登录
  login(username: string, password: string): boolean {
    // 重新加载被禁止的角色列表
    this.loadBlockedRoles();
    
    const user = mockUsers.find(u => u.username === username && u.password === password);
    if (user) {
      // 检查该角色是否被禁止登录
      if (this.blockedRoles.includes(user.role)) {
        return false;
      }
      
      this.currentUser = user;
      // 存储用户信息到本地存储
      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    }
    return false;
  }

  // 登出
  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
  }

  // 获取当前用户
  getCurrentUser(): User | null {
    if (!this.currentUser) {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
      }
    }
    return this.currentUser;
  }

  // 检查是否有权限
  hasPermission(permission: Permission): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    const permissions = rolePermissions[user.role];
    return permissions.includes(permission);
  }

  // 检查是否有角色
  hasRole(role: Role): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    return user.role === role;
  }

  // 获取用户的所有权限
  getUserPermissions(): Permission[] {
    const user = this.getCurrentUser();
    if (!user) return [];
    return rolePermissions[user.role];
  }

  // 武英殿大学士禁止角色登录
  blockRole(role: Role): boolean {
    const currentUser = this.getCurrentUser();
    if (!currentUser || currentUser.role !== Role.WUYING_SCHOLAR) {
      return false;
    }
    
    if (!this.blockedRoles.includes(role)) {
      this.blockedRoles.push(role);
      localStorage.setItem('blockedRoles', JSON.stringify(this.blockedRoles));
      return true;
    }
    return false;
  }

  // 武英殿大学士解除禁止角色登录
  unblockRole(role: Role): boolean {
    const currentUser = this.getCurrentUser();
    if (!currentUser || currentUser.role !== Role.WUYING_SCHOLAR) {
      return false;
    }
    
    const index = this.blockedRoles.indexOf(role);
    if (index > -1) {
      this.blockedRoles.splice(index, 1);
      localStorage.setItem('blockedRoles', JSON.stringify(this.blockedRoles));
      return true;
    }
    return false;
  }

  // 获取被禁止登录的角色
  getBlockedRoles(): Role[] {
    const storedBlockedRoles = localStorage.getItem('blockedRoles');
    if (storedBlockedRoles) {
      this.blockedRoles = JSON.parse(storedBlockedRoles);
    }
    return this.blockedRoles;
  }

  // 检查角色是否被禁止登录
  isRoleBlocked(role: Role): boolean {
    return this.blockedRoles.includes(role);
  }

  // 清除所有禁止状态（用于调试）
  clearAllBlocks(): void {
    this.blockedRoles = [];
    localStorage.removeItem('blockedRoles');
  }

  // 武英殿大学士重置用户密码
  resetUserPassword(userId: string, newPassword: string): boolean {
    const currentUser = this.getCurrentUser();
    if (!currentUser || currentUser.role !== Role.WUYING_SCHOLAR) {
      return false;
    }
    
    // 不能重置自己的密码
    if (currentUser.id === userId) {
      return false;
    }
    
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
      user.password = newPassword;
      return true;
    }
    return false;
  }
}

export const authService = new AuthService();