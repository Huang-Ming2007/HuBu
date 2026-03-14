import { AuditLog, OperationType, mockAuditLogs } from '../types/audit';
import { authService } from './auth';

// 审计服务
class AuditService {
  private logs: AuditLog[] = [...mockAuditLogs];

  // 记录操作日志
  logOperation(
    operation: OperationType,
    targetType: string,
    targetId: string,
    description: string
  ): AuditLog | null {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return null;

    const log: AuditLog = {
      id: Date.now().toString(),
      user_id: currentUser.id,
      username: currentUser.username,
      user_role: currentUser.role,
      operation,
      target_type: targetType,
      target_id: targetId,
      description,
      ip_address: this.getIPAddress(),
      user_agent: navigator.userAgent,
      created_at: new Date().toISOString()
    };

    this.logs.push(log);
    return log;
  }

  // 获取所有操作日志
  getLogs(): AuditLog[] {
    return this.logs;
  }

  // 按条件筛选操作日志
  getLogsByFilter(filter: {
    startDate?: string;
    endDate?: string;
    userId?: string;
    operation?: OperationType;
    targetType?: string;
  }): AuditLog[] {
    let result = [...this.logs];

    if (filter.startDate) {
      result = result.filter(log => new Date(log.created_at) >= new Date(filter.startDate!));
    }

    if (filter.endDate) {
      result = result.filter(log => new Date(log.created_at) <= new Date(filter.endDate!));
    }

    if (filter.userId) {
      result = result.filter(log => log.user_id === filter.userId);
    }

    if (filter.operation) {
      result = result.filter(log => log.operation === filter.operation);
    }

    if (filter.targetType) {
      result = result.filter(log => log.target_type === filter.targetType);
    }

    return result;
  }

  // 按用户获取操作日志
  getLogsByUser(userId: string): AuditLog[] {
    return this.logs.filter(log => log.user_id === userId);
  }

  // 按操作类型获取操作日志
  getLogsByOperation(operation: OperationType): AuditLog[] {
    return this.logs.filter(log => log.operation === operation);
  }

  // 获取最近的操作日志
  getRecentLogs(limit: number = 50): AuditLog[] {
    return [...this.logs].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ).slice(0, limit);
  }

  // 获取IP地址（模拟）
  private getIPAddress(): string {
    // 实际项目中可以通过API获取真实IP地址
    return '127.0.0.1';
  }
}

export const auditService = new AuditService();