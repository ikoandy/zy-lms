const BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    if (errBody?.error) throw new Error(errBody.error);
    throw new Error(`API Error: ${res.status}`);
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('json')) {
    const json = await res.json();
    if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
      return json.data as T;
    }
    return json as T;
  }
  return res as any;
}

export interface Customer {
  id: number;
  name: string;
  institutionName: string;
  creditCode: string | null;
  principalName: string;
  principalPhone: string | null;
  authLevel: string | null;
  address: string | null;
  delegateDate: string | null;
  recordCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DebtorRecord {
  id: number;
  customerId: number;
  isJoint: boolean;
  dataExtractionDate: string | null;
  name: string;
  idCard: string | null;
  phone: string | null;
  gender: string | null;
  ethnicity: string | null;
  householdAddress: string | null;
  mailingAddress: string | null;
  contractNo: string | null;
  institution: string | null;
  lender: string | null;
  contractAmount: string | number;
  loanPrincipal: string | number;
  annualRate: string | number;
  loanApplyDate: string | null;
  disbursementDate: string | null;
  disbursementCard: string | null;
  collateral: string | null;
  totalInstallments: number;
  paidInstallments: number;
  remainingInstallments: number;
  repaymentDueDate: string | null;
  paidPrincipal: string | number;
  paidInterest: string | number;
  paidPenalty: string | number;
  overduePrincipal: string | number;
  overdueInterest: string | number;
  penaltyInterest: string | number;
  compoundInterest: string | number;
  principalPenaltyCompound: string | number;
  totalDebt: string | number;
  orderOverduePenalty: string | number;
  overdueDays: number;
  thirdParty: string | null;
  customerName?: string;
  customerInstitution?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OverviewStats {
  totalRecords: number;
  totalCustomers: number;
  totalDebt: string | number;
  avgDebt: string | number;
  maxDebt: string | number;
  totalRepaid: string | number;
}

export interface DistributionItem { range: string; count: number; }

export interface CustomerStats {
  customerId: number;
  customerName: string;
  recordCount: number;
  totalDebt: string | number;
  avgDebt: string | number;
  totalRepaid: string | number;
  avgOverdueDays: string | number;
}

export const api = {
  getCustomers: () => request<Customer[]>('/customers'),
  addCustomer: (data: Partial<Customer>) =>
    request<Customer>('/customers', { method: 'POST', body: JSON.stringify(data) }),
  updateCustomer: (id: number, data: Partial<Customer>) =>
    request<Customer>(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCustomer: (id: number) =>
    request<void>(`/customers/${id}`, { method: 'DELETE' }),

  getRecords: (params?: { customerId?: number; keyword?: string }) => {
    const qs = new URLSearchParams();
    if (params?.customerId) qs.set('customerId', String(params.customerId));
    if (params?.keyword) qs.set('keyword', params.keyword);
    return request<DebtorRecord[]>(`/records${qs.toString() ? `?${qs}` : ''}`);
  },
  addRecord: (data: Partial<DebtorRecord>) =>
    request<DebtorRecord>('/records', { method: 'POST', body: JSON.stringify(data) }),
  updateRecord: (id: number, data: Partial<DebtorRecord>) =>
    request<DebtorRecord>(`/records/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRecord: (id: number) =>
    request<void>(`/records/${id}`, { method: 'DELETE' }),
  batchImport: (records: Partial<DebtorRecord>[]) =>
    request<{ count: number }>('/records/batch', { method: 'POST', body: JSON.stringify({ records }) }),

  getOverview: () => request<OverviewStats>('/stats/overview'),
  getDebtDistribution: () => request<DistributionItem[]>('/stats/debt-distribution'),
  getOverdueAnalysis: () => request<DistributionItem[]>('/stats/overdue-analysis'),
  getCustomerStats: () => request<CustomerStats[]>('/stats/by-customer'),

  exportXlsxUrl: () => `${BASE}/export/xlsx`,
  downloadTemplateUrl: () => `${BASE}/export/template`,
};
