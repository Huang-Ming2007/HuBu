// 权限枚举
export enum Permission {
  // 用户管理
  USER_MANAGE = 'user_manage',
  USER_VIEW = 'user_view',
  USER_PASSWORD_RESET = 'user_password_reset', // 重置用户密码
  
  // 记账管理
  ACCOUNTING_CREATE = 'accounting_create',
  ACCOUNTING_EDIT = 'accounting_edit',
  ACCOUNTING_DELETE = 'accounting_delete',
  ACCOUNTING_VIEW = 'accounting_view',
  
  // 报表管理
  REPORT_GENERATE = 'report_generate',
  REPORT_VIEW = 'report_view',
  
  // 审计管理
  AUDIT_VIEW = 'audit_view',
  AUDIT_EXPORT = 'audit_export',
  
  // 数据管理
  DATA_EXPORT = 'data_export',
  DATA_IMPORT = 'data_import',
  DATA_STATISTICS = 'data_statistics',
  
  // 系统设置
  SYSTEM_SETTINGS = 'system_settings',
  
  // 封装库管理
  ENCAPSULATION_MANAGE = 'encapsulation_manage',
  ENCAPSULATION_VIEW = 'encapsulation_view',
  
  // 武英殿管理 - 仅武英殿大学士拥有
  WUYING_MANAGE = 'wuying_manage'
}

// 用户角色类型
export enum Role {
  // 户部尚书（系统管理员）
  MINISTER = 'minister',
  // 户部左侍郎（高级财务人员）
  VICE_MINISTER_LEFT = 'vice_minister_left',
  // 户部右侍郎（高级财务人员）
  VICE_MINISTER_RIGHT = 'vice_minister_right',
  // 主事（普通记账员）
  CLERK = 'clerk',
  // 武英殿大学士（超级管理员，可以禁止其他角色登录）
  WUYING_SCHOLAR = 'wuying_scholar'
}

// 用户接口
export interface User {
  id: string;
  username: string;
  password: string; // 实际项目中应该存储哈希后的密码
  role: Role;
  name: string; // 官员姓名
  created_at: string;
}

// 角色权限映射 - 明确区分五个角色的权限
// 武英殿大学士：仅拥有禁止登录和修改密码权限
// 户部尚书：拥有所有财务权限，但没有武英殿管理权限
// 户部左侍郎：拥有大部分财务权限，侧重记账管理
// 户部右侍郎：拥有大部分财务权限，侧重报表审计
// 主事：只能进行基础的记账和查看操作
export const rolePermissions: Record<Role, Permission[]> = {
  [Role.WUYING_SCHOLAR]: [
    // 用户管理 - 仅查看和修改密码
    Permission.USER_VIEW,
    Permission.USER_PASSWORD_RESET,
    // 武英殿管理 - 禁止登录
    Permission.WUYING_MANAGE
  ],
  [Role.MINISTER]: [
    // 用户管理
    Permission.USER_MANAGE,
    Permission.USER_VIEW,
    // 记账管理
    Permission.ACCOUNTING_CREATE,
    Permission.ACCOUNTING_EDIT,
    Permission.ACCOUNTING_DELETE,
    Permission.ACCOUNTING_VIEW,
    // 报表管理
    Permission.REPORT_GENERATE,
    Permission.REPORT_VIEW,
    // 审计管理
    Permission.AUDIT_VIEW,
    Permission.AUDIT_EXPORT,
    // 数据管理
    Permission.DATA_EXPORT,
    Permission.DATA_IMPORT,
    Permission.DATA_STATISTICS,
    // 系统设置
    Permission.SYSTEM_SETTINGS,
    // 封装库 - 只有户部尚书有权限
    Permission.ENCAPSULATION_MANAGE,
    Permission.ENCAPSULATION_VIEW
  ],
  [Role.VICE_MINISTER_LEFT]: [
    // 记账管理 - 左侍郎侧重记账
    Permission.ACCOUNTING_CREATE,
    Permission.ACCOUNTING_EDIT,
    Permission.ACCOUNTING_DELETE,
    Permission.ACCOUNTING_VIEW,
    // 报表管理
    Permission.REPORT_GENERATE,
    Permission.REPORT_VIEW,
    // 数据管理
    Permission.DATA_EXPORT,
    Permission.DATA_STATISTICS
  ],
  [Role.VICE_MINISTER_RIGHT]: [
    // 记账管理 - 右侍郎侧重审计
    Permission.ACCOUNTING_CREATE,
    Permission.ACCOUNTING_VIEW,
    // 报表管理
    Permission.REPORT_GENERATE,
    Permission.REPORT_VIEW,
    // 审计管理 - 右侍郎拥有审计权限
    Permission.AUDIT_VIEW,
    Permission.AUDIT_EXPORT,
    // 数据管理
    Permission.DATA_EXPORT,
    Permission.DATA_STATISTICS
  ],
  [Role.CLERK]: [
    // 记账管理
    Permission.ACCOUNTING_CREATE,
    Permission.ACCOUNTING_VIEW,
    // 报表管理
    Permission.REPORT_VIEW
  ]
};

// 权限描述
export const permissionDescriptions: Record<Permission, string> = {
  [Permission.USER_MANAGE]: '管理用户（添加、编辑、删除）',
  [Permission.USER_VIEW]: '查看用户列表',
  [Permission.USER_PASSWORD_RESET]: '重置用户密码',
  [Permission.ACCOUNTING_CREATE]: '创建账目',
  [Permission.ACCOUNTING_EDIT]: '编辑账目',
  [Permission.ACCOUNTING_DELETE]: '删除账目',
  [Permission.ACCOUNTING_VIEW]: '查看账目',
  [Permission.REPORT_GENERATE]: '生成报表',
  [Permission.REPORT_VIEW]: '查看报表',
  [Permission.AUDIT_VIEW]: '查看操作日志',
  [Permission.AUDIT_EXPORT]: '导出操作日志',
  [Permission.DATA_EXPORT]: '导出数据',
  [Permission.DATA_IMPORT]: '导入数据',
  [Permission.DATA_STATISTICS]: '查看统计分析',
  [Permission.SYSTEM_SETTINGS]: '系统设置',
  [Permission.ENCAPSULATION_MANAGE]: '管理封装库',
  [Permission.ENCAPSULATION_VIEW]: '查看封装库',
  [Permission.WUYING_MANAGE]: '武英殿管理（禁止角色登录）'
};

// 角色描述
export const roleDescriptions: Record<Role, string> = {
  [Role.WUYING_SCHOLAR]: '武英殿大学士 - 仅可禁止角色登录和修改密码',
  [Role.MINISTER]: '户部尚书 - 掌管全局，拥有所有财务权限',
  [Role.VICE_MINISTER_LEFT]: '户部左侍郎 - 协助尚书管理财务，侧重记账管理',
  [Role.VICE_MINISTER_RIGHT]: '户部右侍郎 - 协助尚书管理财务，侧重报表审计',
  [Role.CLERK]: '主事 - 负责基础记账工作，权限受限'
};

// 模拟用户数据（实际项目中应从数据库获取）
export const mockUsers: User[] = [
  {
    id: '5',
    username: 'wuying_scholar',
    password: '123456', // 实际项目中应该是哈希后的密码
    role: Role.WUYING_SCHOLAR,
    name: '武英殿大学士',
    created_at: new Date().toISOString()
  },
  {
    id: '1',
    username: 'minister',
    password: '123456', // 实际项目中应该是哈希后的密码
    role: Role.MINISTER,
    name: '户部尚书',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    username: 'vice_minister_left',
    password: '123456',
    role: Role.VICE_MINISTER_LEFT,
    name: '左侍郎',
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    username: 'vice_minister_right',
    password: '123456',
    role: Role.VICE_MINISTER_RIGHT,
    name: '右侍郎',
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    username: 'clerk',
    password: '123456',
    role: Role.CLERK,
    name: '主事',
    created_at: new Date().toISOString()
  }
];