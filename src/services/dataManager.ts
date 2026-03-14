import { AccountingRecord, Settlement, RecordType } from '../types/accounting';
import { User } from '../types/user';

// 数据管理服务
class DataManagerService {
  private readonly STORAGE_KEYS = {
    RECORDS: 'hu_bu_records',
    SETTLEMENTS: 'hu_bu_settlements',
    USERS: 'hu_bu_users'
  };

  // 保存数据到本地存储
  saveData(key: string, data: any): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // 从本地存储获取数据
  getData<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  // 保存账目数据
  saveRecords(records: AccountingRecord[]): void {
    this.saveData(this.STORAGE_KEYS.RECORDS, records);
  }

  // 获取账目数据
  getRecords(): AccountingRecord[] {
    return this.getData<AccountingRecord>(this.STORAGE_KEYS.RECORDS);
  }

  // 保存结算数据
  saveSettlements(settlements: Settlement[]): void {
    this.saveData(this.STORAGE_KEYS.SETTLEMENTS, settlements);
  }

  // 获取结算数据
  getSettlements(): Settlement[] {
    return this.getData<Settlement>(this.STORAGE_KEYS.SETTLEMENTS);
  }

  // 保存用户数据
  saveUsers(users: User[]): void {
    this.saveData(this.STORAGE_KEYS.USERS, users);
  }

  // 获取用户数据
  getUsers(): User[] {
    return this.getData<User>(this.STORAGE_KEYS.USERS);
  }

  // 导出数据为JSON文件
  exportData(): void {
    const data = {
      records: this.getRecords(),
      settlements: this.getSettlements(),
      users: this.getUsers(),
      export_date: new Date().toISOString()
    };

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hu_bu_data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // 导入数据从JSON文件
  importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.records) this.saveRecords(data.records);
      if (data.settlements) this.saveSettlements(data.settlements);
      if (data.users) this.saveUsers(data.users);
      return true;
    } catch (error) {
      console.error('导入数据失败:', error);
      return false;
    }
  }

  // 生成统计数据
  generateStatistics(startDate: string, endDate: string): any {
    const records = this.getRecords();
    const filteredRecords = records.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= new Date(startDate) && recordDate <= new Date(endDate);
    });

    // 按类型统计
    const byType: Record<string, number> = filteredRecords.reduce((acc, record) => {
      if (!acc[record.type]) {
        acc[record.type] = 0;
      }
      acc[record.type] += record.amount;
      return acc;
    }, {} as Record<string, number>);

    // 按分类统计
    const byCategory: Record<string, number> = filteredRecords.reduce((acc, record) => {
      if (!acc[record.category]) {
        acc[record.category] = 0;
      }
      acc[record.category] += record.amount;
      return acc;
    }, {} as Record<string, number>);

    // 按日期统计
    const byDate: Record<string, number> = filteredRecords.reduce((acc, record) => {
      if (!acc[record.date]) {
        acc[record.date] = 0;
      }
      acc[record.date] += record.type === RecordType.INCOME ? record.amount : -record.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalRecords: filteredRecords.length,
      totalIncome: byType[RecordType.INCOME] || 0,
      totalExpense: byType[RecordType.EXPENSE] || 0,
      balance: (byType[RecordType.INCOME] || 0) - (byType[RecordType.EXPENSE] || 0),
      byType,
      byCategory,
      byDate
    };
  }
}

export const dataManagerService = new DataManagerService();