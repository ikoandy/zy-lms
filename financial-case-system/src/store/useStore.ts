import { create } from 'zustand';
import { api, type Customer, type DebtorRecord, type OverviewStats, type DistributionItem, type CustomerStats } from '@/lib/api';

interface Toast { id: number; type: 'success' | 'error'; message: string; }

interface AppState {
  _tab: 'entry' | 'import' | 'stats';
  customers: Customer[];
  records: DebtorRecord[];
  currentCustomerId: number | null;
  editingRecord: DebtorRecord | null;
  searchKeyword: string;
  filterCustomerId: number | null;
  toasts: Toast[];
  overviewStats: OverviewStats | null;
  debtDistribution: DistributionItem[];
  overdueAnalysis: DistributionItem[];
  customerStats: CustomerStats[];

  setTab: (t: 'entry' | 'import' | 'stats') => void;

  fetchCustomers: () => Promise<void>;
  fetchRecords: () => Promise<void>;
  fetchStats: () => Promise<void>;

  addCustomer: (data: Partial<Customer>) => Promise<Customer>;
  updateCustomer: (id: number, data: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: number) => Promise<void>;

  setCurrentCustomerId: (id: number | null) => void;
  setEditingRecord: (r: DebtorRecord | null) => void;
  setSearchKeyword: (kw: string) => void;
  setFilterCustomerId: (id: number | null) => void;

  addRecord: (data: Partial<DebtorRecord>) => Promise<void>;
  updateRecord: (id: number, data: Partial<DebtorRecord>) => Promise<void>;
  deleteRecord: (id: number) => Promise<void>;
  batchImport: (records: Partial<DebtorRecord>[]) => Promise<void>;

  addToast: (message: string, type?: 'success' | 'error') => void;
  removeToast: (id: number) => void;
}

const emptyRecord = {
  customerId: null as number | null,
  isJoint: false,
  dataExtractionDate: '',
  name: '',
  idCard: '',
  phone: '',
  gender: '',
  ethnicity: '',
  householdAddress: '',
  mailingAddress: '',
  contractNo: '',
  institution: '',
  lender: '',
  contractAmount: '',
  loanPrincipal: '',
  annualRate: '',
  loanApplyDate: '',
  disbursementDate: '',
  disbursementCard: '',
  collateral: '',
  totalInstallments: 0,
  paidInstallments: 0,
  remainingInstallments: 0,
  repaymentDueDate: '',
  paidPrincipal: '',
  paidInterest: '',
  paidPenalty: '',
  overduePrincipal: '',
  overdueInterest: '',
  penaltyInterest: '',
  compoundInterest: '',
  principalPenaltyCompound: '',
  totalDebt: '',
  orderOverduePenalty: '',
  overdueDays: 0,
  thirdParty: '',
};

export const useStore = create<AppState>((set, get) => ({
  _tab: 'entry',
  customers: [],
  records: [],
  currentCustomerId: null,
  editingRecord: null,
  searchKeyword: '',
  filterCustomerId: null,
  toasts: [],
  overviewStats: null,
  debtDistribution: [],
  overdueAnalysis: [],
  customerStats: [],

  fetchCustomers: async () => {
    try {
      const customers = await api.getCustomers();
      set({ customers });
      if (customers.length > 0 && !get().currentCustomerId) {
        set({ currentCustomerId: customers[0].id });
      }
    } catch { get().addToast('获取客户列表失败', 'error'); }
  },

  fetchRecords: async () => {
    try {
      const { filterCustomerId, searchKeyword } = get();
      const records = await api.getRecords({
        customerId: filterCustomerId ?? undefined,
        keyword: searchKeyword || undefined,
      });
      set({ records });
    } catch { get().addToast('获取记录列表失败', 'error'); }
  },

  fetchStats: async () => {
    try {
      const [overviewStats, debtDistribution, overdueAnalysis, customerStats] = await Promise.all([
        api.getOverview(),
        api.getDebtDistribution(),
        api.getOverdueAnalysis(),
        api.getCustomerStats(),
      ]);
      set({ overviewStats, debtDistribution, overdueAnalysis, customerStats });
    } catch { /* stats non-critical */ }
  },

  addCustomer: async (data) => {
    const customer = await api.addCustomer(data);
    await get().fetchCustomers();
    get().addToast('客户添加成功', 'success');
    return customer;
  },

  updateCustomer: async (id, data) => {
    await api.updateCustomer(id, data);
    await get().fetchCustomers();
    get().addToast('客户更新成功', 'success');
  },

  deleteCustomer: async (id) => {
    await api.deleteCustomer(id);
    const { currentCustomerId } = get();
    if (currentCustomerId === id) set({ currentCustomerId: null });
    await get().fetchCustomers();
    await get().fetchRecords();
    get().addToast('客户已删除', 'success');
  },

  setCurrentCustomerId: (id) => set({ currentCustomerId: id }),
  setEditingRecord: (r) => set({ editingRecord: r }),
  setSearchKeyword: (kw) => set({ searchKeyword: kw }),
  setFilterCustomerId: (id) => set({ filterCustomerId: id }),
  setTab: (t) => set({ _tab: t }),

  addRecord: async (data) => {
    await api.addRecord(data);
    await get().fetchRecords();
    await get().fetchStats();
    get().addToast('记录添加成功', 'success');
  },

  updateRecord: async (id, data) => {
    await api.updateRecord(id, data);
    set({ editingRecord: null });
    await get().fetchRecords();
    await get().fetchStats();
    get().addToast('记录更新成功', 'success');
  },

  deleteRecord: async (id) => {
    await api.deleteRecord(id);
    await get().fetchRecords();
    await get().fetchStats();
    get().addToast('记录已删除', 'success');
  },

  batchImport: async (records) => {
    await api.batchImport(records);
    await get().fetchRecords();
    await get().fetchStats();
    get().addToast(`成功导入 ${records.length} 条记录`, 'success');
  },

  addToast: (message, type = 'success') => {
    const id = Date.now() + Math.random();
    set((s) => ({ toasts: [...s.toasts, { id, type, message }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3000);
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export { emptyRecord };
