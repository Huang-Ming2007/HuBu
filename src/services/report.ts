import { accountingService } from './accounting';
import { RecordType } from '../types/accounting';

// 四柱清册接口
export interface FourColumnBook {
  period: string; // 报表周期
  start_date: string;
  end_date: string;
  old_balance: number; // 旧管（期初余额）
  new_income: number; // 新收（本期收入）
  expenses: number; // 开除（本期支出）
  current_balance: number; // 实在（期末余额）
  income_details: Array<{ category: string; amount: number }>; // 收入明细
  expense_details: Array<{ category: string; amount: number }>; // 支出明细
  created_at: string;
}

// 报表服务
class ReportService {
  // 生成四柱清册
  generateFourColumnBook(startDate: string, endDate: string, period: string): FourColumnBook {
    // 获取指定期间的账目
    const records = accountingService.getRecordsByDateRange(startDate, endDate);
    
    // 计算本期收入和支出
    const incomeRecords = records.filter(r => r.type === RecordType.INCOME);
    const expenseRecords = records.filter(r => r.type === RecordType.EXPENSE);
    
    const newIncome = incomeRecords.reduce((sum, r) => sum + r.amount, 0);
    const expenses = expenseRecords.reduce((sum, r) => sum + r.amount, 0);
    
    // 计算期初余额（这里简化处理，实际应该从之前的报表中获取）
    const oldBalance = 0; // 实际项目中应该从数据库获取期初余额
    
    // 计算期末余额
    const currentBalance = oldBalance + newIncome - expenses;
    
    // 生成收入明细
    const incomeDetails = this.generateCategoryDetails(incomeRecords);
    
    // 生成支出明细
    const expenseDetails = this.generateCategoryDetails(expenseRecords);
    
    return {
      period,
      start_date: startDate,
      end_date: endDate,
      old_balance: oldBalance,
      new_income: newIncome,
      expenses: expenses,
      current_balance: currentBalance,
      income_details: incomeDetails,
      expense_details: expenseDetails,
      created_at: new Date().toISOString()
    };
  }

  // 生成分类明细
  private generateCategoryDetails(records: any[]): Array<{ category: string; amount: number }> {
    const categoryMap = new Map<string, number>();
    
    records.forEach(record => {
      if (categoryMap.has(record.category)) {
        categoryMap.set(record.category, categoryMap.get(record.category) + record.amount);
      } else {
        categoryMap.set(record.category, record.amount);
      }
    });
    
    return Array.from(categoryMap.entries()).map(([category, amount]) => ({
      category,
      amount
    }));
  }

  // 生成月度报表
  generateMonthlyReport(year: number, month: number): FourColumnBook {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-${this.getDaysInMonth(year, month)}`;
    const period = `${year}-${String(month).padStart(2, '0')}`;
    
    return this.generateFourColumnBook(startDate, endDate, period);
  }

  // 生成年度报表
  generateYearlyReport(year: number): FourColumnBook {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    const period = `${year}`;
    
    return this.generateFourColumnBook(startDate, endDate, period);
  }

  // 获取月份的天数
  private getDaysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
  }
}

export const reportService = new ReportService();