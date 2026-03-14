// 操作类型
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  EXPORT = 'export',
  IMPORT = 'import'
}

// 操作日志接口
export interface AuditLog {
  id: string;
  user_id: string;
  username: string;
  user_role: string;
  operation: OperationType;
  target_type: string; // 操作目标类型，如 'record', 'user', 'settlement'
  target_id: string; // 操作目标ID
  description: string; // 操作描述
  ip_address?: string; // IP地址
  user_agent?: string; // 用户代理
  created_at: string;
}

// 模拟操作日志数据（实际项目中应从数据库获取）
export const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    user_id: '1',
    username: 'minister',
    user_role: 'minister',
    operation: OperationType.LOGIN,
    target_type: 'system',
    target_id: 'system',
    description: '户部尚书登录系统',
    ip_address: '127.0.0.1',
    user_agent: 'Mozilla/5.0',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    user_id: '3',
    username: 'clerk',
    user_role: 'clerk',
    operation: OperationType.CREATE,
    target_type: 'record',
    target_id: '4',
    description: '主事创建了一条收入账目',
    ip_address: '127.0.0.1',
    user_agent: 'Mozilla/5.0',
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    user_id: '2',
    username: 'vice_minister',
    user_role: 'vice_minister',
    operation: OperationType.UPDATE,
    target_type: 'record',
    target_id: '2',
    description: '户部侍郎更新了一条支出账目',
    ip_address: '127.0.0.1',
    user_agent: 'Mozilla/5.0',
    created_at: new Date().toISOString()
  }
];