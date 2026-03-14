import { AccountingRecord, RecordType, Settlement, EncapsulationLibrary } from '../types/accounting';

// 记账服务
class AccountingService {
  private records: AccountingRecord[] = [];
  private settlements: Settlement[] = [];
  private encapsulationLibraries: EncapsulationLibrary[] = [];
  private cache: {
    [key: string]: any;
  } = {};

  // 获取所有账目
  getRecords(): AccountingRecord[] {
    return this.records;
  }

  // 根据ID获取账目
  getRecordById(id: string): AccountingRecord | undefined {
    return this.records.find(record => record.id === id);
  }

  // 添加账目
  addRecord(record: Omit<AccountingRecord, 'id' | 'created_at' | 'updated_at'>): AccountingRecord {
    const newRecord: AccountingRecord = {
      ...record,
      id: Date.now().toString(),
      amount: record.amount || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.records.push(newRecord);
    // 清除缓存
    this.clearCache();
    return newRecord;
  }

  // 更新账目
  updateRecord(id: string, updates: Partial<AccountingRecord>): AccountingRecord | undefined {
    const index = this.records.findIndex(record => record.id === id);
    if (index !== -1) {
      const updatedRecord = {
        ...this.records[index],
        ...updates,
        amount: updates.amount !== undefined ? updates.amount : this.records[index].amount,
        updated_at: new Date().toISOString()
      };
      this.records[index] = updatedRecord;
      // 清除缓存
      this.clearCache();
      return updatedRecord;
    }
    return undefined;
  }

  // 删除账目
  deleteRecord(id: string): boolean {
    const initialLength = this.records.length;
    this.records = this.records.filter(record => record.id !== id);
    // 清除缓存
    this.clearCache();
    return this.records.length < initialLength;
  }

  // 按日期范围获取账目
  getRecordsByDateRange(startDate: string, endDate: string): AccountingRecord[] {
    return this.records.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= new Date(startDate) && recordDate <= new Date(endDate);
    });
  }

  // 按类型获取账目
  getRecordsByType(type: RecordType): AccountingRecord[] {
    return this.records.filter(record => record.type === type);
  }

  // 按分类获取账目
  getRecordsByCategory(category: string): AccountingRecord[] {
    return this.records.filter(record => record.category === category);
  }

  // 创建结算
  createSettlement(settlement: Omit<Settlement, 'id' | 'created_at'>): Settlement {
    const newSettlement: Settlement = {
      ...settlement,
      created_at: new Date().toISOString()
    };
    this.settlements.push(newSettlement);
    return newSettlement;
  }

  // 获取所有结算
  getSettlements(): Settlement[] {
    return this.settlements;
  }

  // 根据周期获取结算
  getSettlementByPeriod(period: string): Settlement | undefined {
    return this.settlements.find(settlement => settlement.period === period);
  }

  // 计算指定期间的收支
  calculatePeriodTotals(startDate: string, endDate: string): { income: number, expense: number, balance: number } {
    const cacheKey = `calculatePeriodTotals_${startDate}_${endDate}`;
    
    // 检查缓存
    if (this.cache[cacheKey]) {
      return this.cache[cacheKey];
    }
    
    const records = this.getRecordsByDateRange(startDate, endDate);
    const income = records.filter(r => r.type === RecordType.INCOME).reduce((sum, r) => sum + r.amount, 0);
    const expense = records.filter(r => r.type === RecordType.EXPENSE).reduce((sum, r) => sum + r.amount, 0);
    const result = {
      income,
      expense,
      balance: income - expense
    };
    
    // 缓存结果
    this.cache[cacheKey] = result;
    return result;
  }

  // 获取所有封装库
  getEncapsulationLibraries(): EncapsulationLibrary[] {
    return this.encapsulationLibraries;
  }

  // 根据ID获取封装库
  getEncapsulationLibraryById(id: string): EncapsulationLibrary | undefined {
    return this.encapsulationLibraries.find(library => library.id === id);
  }

  // 创建封装库
  createEncapsulationLibrary(library: Omit<EncapsulationLibrary, 'id' | 'created_at' | 'updated_at'>): EncapsulationLibrary {
    const newLibrary: EncapsulationLibrary = {
      ...library,
      id: Date.now().toString(),
      balance: library.tael + library.qian / 10 + library.fen / 100,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.encapsulationLibraries.push(newLibrary);
    return newLibrary;
  }

  // 更新封装库
  updateEncapsulationLibrary(id: string, updates: Partial<EncapsulationLibrary>): EncapsulationLibrary | undefined {
    const index = this.encapsulationLibraries.findIndex(library => library.id === id);
    if (index !== -1) {
      const updatedLibrary = {
        ...this.encapsulationLibraries[index],
        ...updates,
        balance: updates.tael! + updates.qian! / 10 + updates.fen! / 100,
        updated_at: new Date().toISOString()
      };
      this.encapsulationLibraries[index] = updatedLibrary;
      return updatedLibrary;
    }
    return undefined;
  }

  // 删除封装库
  deleteEncapsulationLibrary(id: string): boolean {
    const initialLength = this.encapsulationLibraries.length;
    this.encapsulationLibraries = this.encapsulationLibraries.filter(library => library.id !== id);
    return this.encapsulationLibraries.length < initialLength;
  }

  // 向封装库添加余额
  addBalanceToLibrary(id: string, tael: number, qian: number, fen: number, note: string = ''): EncapsulationLibrary | undefined {
    const library = this.getEncapsulationLibraryById(id);
    if (library) {
      const newTael = library.tael + tael;
      const newQian = library.qian + qian;
      const newFen = library.fen + fen;
      
      // 处理进位
      const totalFen = newFen % 10;
      const carryQian = Math.floor(newFen / 10);
      
      const totalQian = (newQian + carryQian) % 10;
      const carryTael = Math.floor((newQian + carryQian) / 10);
      
      const totalTael = newTael + carryTael;
      
      return this.updateEncapsulationLibrary(id, {
        tael: totalTael,
        qian: totalQian,
        fen: totalFen,
        note: note
      });
    }
    return undefined;
  }
  
  // 清除缓存
  private clearCache(): void {
    this.cache = {};
  }
}


export const accountingService = new AccountingService();