// 账目类型
export enum RecordType {
  INCOME = 'income',
  EXPENSE = 'expense'
}

// 收入分类
export enum IncomeCategory {
  SALARY = '工资',
  BONUS = '奖金',
  INVESTMENT = '投资收益',
  PARTTIME = '兼职收入',
  FREELANCE = '自由职业',
  RENT = '房租收入',
  INTEREST = '利息收入',
  REFUND = '退款',
  GIFT = '礼金',
  OTHER_INCOME = '其他收入'
}

// 支出分类
export enum ExpenseCategory {
  FOOD = '餐饮',
  CLOTHING = '衣物',
  HOUSING = '住房',
  TRANSPORT = '交通',
  COMMUNICATION = '通讯',
  EDUCATION = '教育',
  ENTERTAINMENT = '娱乐',
  HEALTH = '医疗',
  SHOPPING = '购物',
  BEAUTY = '美容',
  TRAVEL = '旅行',
  GIFT = '送礼',
  DONATION = '捐赠',
  INSURANCE = '保险',
  UTILITIES = '水电',
  MAINTENANCE = '维修',
  CHILD = '育儿',
  PET = '宠物',
  SPORTS = '运动',
  BOOKS = '书籍',
  SOFTWARE = '软件',
  SUBSCRIPTION = '订阅',
  LOAN = '贷款',
  CREDIT = '信用卡',
  TAX = '税费',
  OTHER_EXPENSE = '其他支出'
}

// 账目接口
export interface AccountingRecord {
  id: string;
  date: string;
  type: RecordType;
  amount: number;
  tael: number;
  qian: number;
  fen: number;
  category: string;
  note: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// 结算接口
export interface Settlement {
  period: string;
  start_date: string;
  end_date: string;
  total_income: number;
  total_expense: number;
  balance: number;
  status: 'pending' | 'completed';
  created_by: string;
  created_at: string;
}

// 封装库接口
export interface EncapsulationLibrary {
  id: string;
  name: string;
  balance: number;
  tael: number;
  qian: number;
  fen: number;
  description: string;
  note: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}
