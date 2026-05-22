import { useState, useEffect, useMemo } from 'react';
import { Save, RotateCcw } from 'lucide-react';
import { useStore, emptyRecord } from '@/store/useStore';

function validateIdCard(id: string): boolean {
  if (!id || id.length !== 18) return false;
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const codes = '10X98765432';
  let sum = 0;
  for (let i = 0; i < 17; i++) sum += parseInt(id[i]) * weights[i];
  return codes[sum % 11] === id[17].toUpperCase();
}

function validatePhone(phone: string): boolean {
  if (!phone) return true;
  return /^1\d{10}$/.test(phone);
}

export default function EntryForm() {
  const currentCustomerId = useStore((s) => s.currentCustomerId);
  const editingRecord = useStore((s) => s.editingRecord);
  const addRecord = useStore((s) => s.addRecord);
  const updateRecord = useStore((s) => s.updateRecord);
  const setEditingRecord = useStore((s) => s.setEditingRecord);

  const [form, setForm] = useState({ ...emptyRecord });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingRecord) {
      const { id, createdAt, updatedAt, customerName, customerInstitution, ...rest } = editingRecord;
      setForm({
        ...rest,
        dataExtractionDate: rest.dataExtractionDate ?? '',
        idCard: rest.idCard ?? '',
        phone: rest.phone ?? '',
        gender: rest.gender ?? '',
        ethnicity: rest.ethnicity ?? '',
        householdAddress: rest.householdAddress ?? '',
        mailingAddress: rest.mailingAddress ?? '',
        contractNo: rest.contractNo ?? '',
        institution: rest.institution ?? '',
        lender: rest.lender ?? '',
        disbursementCard: rest.disbursementCard ?? '',
        collateral: rest.collateral ?? '',
        thirdParty: rest.thirdParty ?? '',
      } as typeof form);
    }
  }, [editingRecord]);

  const calculated = useMemo(() => {
    const principalPenaltyCompound =
      Number(form.loanPrincipal) + Number(form.paidPenalty) + Number(form.compoundInterest);
    const totalDebt = Math.max(
      0,
      Number(form.overduePrincipal) +
        Number(form.overdueInterest) +
        Number(form.penaltyInterest) +
        Number(form.compoundInterest) +
        Number(form.orderOverduePenalty)
    );
    return { principalPenaltyCompound, totalDebt };
  }, [
    form.loanPrincipal, form.paidPenalty, form.compoundInterest,
    form.overduePrincipal, form.overdueInterest, form.penaltyInterest,
    form.orderOverduePenalty,
  ]);

  const handleChange = (field: string, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === 'idCard' || field === 'phone') {
      setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!currentCustomerId) {
      newErrors._global = '请先选择委托方（客户）';
    }
    if (!form.name?.trim()) {
      newErrors.name = '姓名不能为空';
    }
    if (form.idCard && !validateIdCard(form.idCard)) {
      newErrors.idCard = '身份证号格式不正确';
    }
    if (form.phone && !validatePhone(form.phone)) {
      newErrors.phone = '手机号格式不正确';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...form,
      customerId: currentCustomerId ?? undefined,
      totalDebt: String(calculated.totalDebt),
      principalPenaltyCompound: String(calculated.principalPenaltyCompound),
    } as any;

    try {
      if (editingRecord) {
        await updateRecord(editingRecord.id, payload);
        setEditingRecord(null);
      } else {
        await addRecord(payload);
      }
      setForm({ ...emptyRecord, customerId: currentCustomerId });
      setErrors({});
    } catch (err) {
      setErrors({ _global: err instanceof Error ? err.message : '保存失败，请重试' });
    }
  };

  const handleReset = () => {
    setForm({ ...emptyRecord, customerId: currentCustomerId });
    setErrors({});
    if (editingRecord) setEditingRecord(null);
  };

  const inputCls = (field?: string) =>
    `w-full rounded-lg border bg-[#22253A] px-3 py-2 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-[#4A7CFF] ${
      field && errors[field] ? 'border-[#F87171]' : 'border-[#2A2D3E]'
    }`;

  const warningCls =
    'w-full rounded-lg border border-[#D4A855]/30 bg-[#D4A855]/5 px-3 py-2.5 text-sm text-[#D4A855] outline-none';

  const Field = ({
    label,
    field,
    type = 'text',
    placeholder = '',
    required = false,
  }: {
    label: string;
    field: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
  }) => (
    <div>
      <label className="mb-1 block text-xs text-gray-400">
        {label}
        {required && <span className="ml-1 text-[#F87171]">*</span>}
      </label>
      <input
        type={type}
        value={(form as any)[field] ?? ''}
        onChange={(e) => handleChange(field, e.target.value)}
        placeholder={placeholder}
        className={inputCls(field)}
      />
      {errors[field] && <p className="mt-1 text-xs text-[#F87171]">{errors[field]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">
          {editingRecord ? '编辑记录' : '数据录入'}
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-lg bg-[#4A7CFF] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3B6AE0]"
          >
            <Save size={15} />
            {editingRecord ? '保存修改' : '保存记录'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-lg border border-[#2A2D3E] bg-[#1C1E2A] px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-[#2A2D3E]"
          >
            <RotateCcw size={13} />
            重置
          </button>
        </div>
      </div>

      {/* Global Error */}
      {errors._global && (
        <div className="rounded-lg border border-[#F87171]/30 bg-[#F87171]/10 px-4 py-3 text-sm text-[#F87171]">
          {errors._global}
        </div>
      )}

      {/* Basic Info - 3 cols */}
      <fieldset className="rounded-xl border border-[#2A2D3E] bg-[#1C1E2A] p-4">
        <legend className="px-1 text-sm font-medium text-[#D4A855]">基本信息</legend>
        <div className="grid grid-cols-3 gap-x-4 gap-y-3">
          <Field label="姓名" field="name" placeholder="借款人姓名" required />
          <div>
            <label className="mb-1 block text-xs text-gray-400">是否联合</label>
            <button
              type="button"
              onClick={() => handleChange('isJoint', !form.isJoint)}
              className={`relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full transition-colors ${
                form.isJoint ? 'bg-[#4A7CFF]' : 'bg-[#2A2D3E]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  form.isJoint ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
          <Field label="身份证号" field="idCard" placeholder="18位身份证号" />
          <Field label="电话" field="phone" placeholder="手机号码" />
          <Field label="性别" field="gender" placeholder="男/女" />
          <Field label="民族" field="ethnicity" placeholder="汉族等" />
          <Field label="合同编号" field="contractNo" placeholder="合同编号" />
          <Field label="机构" field="institution" placeholder="贷款机构" />
          <Field label="出借人" field="lender" placeholder="出借方名称" />
        </div>
      </fieldset>

      {/* Loan Info - 3 cols */}
      <fieldset className="rounded-xl border border-[#2A2D3E] bg-[#1C1E2A] p-4">
        <legend className="px-1 text-sm font-medium text-[#4A7CFF]">借贷信息</legend>
        <div className="grid grid-cols-3 gap-x-4 gap-y-3">
          <Field label="借款本金" field="loanPrincipal" placeholder="元" type="number" />
          <Field label="年利率" field="annualRate" placeholder="如 0.05" type="number" />
          <Field label="合同金额" field="contractAmount" placeholder="元" type="number" />
          <Field label="申请日期" field="loanApplyDate" type="date" />
          <Field label="放款日期" field="disbursementDate" type="date" />
          <Field label="放款卡号" field="disbursementCard" placeholder="放款银行卡号" />
          <Field label="总期数" field="totalInstallments" type="number" />
          <Field label="已还期数" field="paidInstallments" type="number" />
          <Field label="剩余期数" field="remainingInstallments" type="number" />
          <Field label="还款到期日" field="repaymentDueDate" type="date" />
          <Field label="抵押物" field="collateral" placeholder="抵押物描述" />
        </div>
      </fieldset>

      {/* Repayment Info - 4 cols for numeric fields */}
      <fieldset className="rounded-xl border border-[#2A2D3E] bg-[#1C1E2A] p-4">
        <legend className="px-1 text-sm font-medium text-[#34D399]">还款信息</legend>
        <div className="grid grid-cols-4 gap-x-4 gap-y-3">
          <Field label="已还本金" field="paidPrincipal" type="number" />
          <Field label="已还利息" field="paidInterest" type="number" />
          <Field label="已还罚息" field="paidPenalty" type="number" />
          <Field label="逾期本金" field="overduePrincipal" type="number" />
          <Field label="逾期利息" field="overdueInterest" type="number" />
          <Field label="罚息" field="penaltyInterest" type="number" />
          <Field label="复利" field="compoundInterest" type="number" />
          <Field label="违约金" field="orderOverduePenalty" type="number" />
        </div>

        <div className="mt-3 grid grid-cols-3 gap-3">
          <div className={warningCls}>
            <div className="flex justify-between">
              <span className="text-xs">本金+罚息+复利</span>
              <span className="font-medium">{calculated.principalPenaltyCompound.toLocaleString()}</span>
            </div>
          </div>
          <div className={`col-span-2 ${warningCls}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">总欠款（自动计算）</span>
              <span className="text-lg font-bold text-[#F87171]">¥{calculated.totalDebt.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </fieldset>

      {/* Other Info - 2 cols with full-width addresses */}
      <fieldset className="rounded-xl border border-[#2A2D3E] bg-[#1C1E2A] p-4">
        <legend className="px-1 text-sm font-medium text-[#A78BFA]">其他信息</legend>
        <div className="grid grid-cols-3 gap-x-4 gap-y-3">
          <Field label="逾期天数" field="overdueDays" type="number" />
          <Field label="第三方" field="thirdParty" placeholder="第三方信息" />
          <Field label="数据提取日期" field="dataExtractionDate" type="date" />
          <div className="col-span-3">
            <Field label="户籍地址" field="householdAddress" placeholder="户籍地址（详细到门牌号）" />
          </div>
          <div className="col-span-3">
            <Field label="通讯地址" field="mailingAddress" placeholder="通讯地址（详细到门牌号）" />
          </div>
        </div>
      </fieldset>
    </form>
  );
}
