import { useState, useMemo } from 'react';
import { Search, Pencil, Trash2, FileText, Filter, Download, Printer, FileSpreadsheet } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/api';
import type { DebtorRecord } from '@/lib/api';
import ConfirmModal from './ConfirmModal';

function toNum(v: string | number): number {
  return typeof v === 'number' ? v : parseFloat(v) || 0;
}

function formatMoney(n: number) {
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function RecordList() {
  const records = useStore((s) => s.records);
  const customers = useStore((s) => s.customers);
  const searchKeyword = useStore((s) => s.searchKeyword);
  const filterCustomerId = useStore((s) => s.filterCustomerId);
  const setSearchKeyword = useStore((s) => s.setSearchKeyword);
  const setFilterCustomerId = useStore((s) => s.setFilterCustomerId);
  const deleteRecord = useStore((s) => s.deleteRecord);
  const setEditingRecord = useStore((s) => s.setEditingRecord);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    let list = records;
    if (filterCustomerId) list = list.filter((r) => r.customerId === filterCustomerId);
    if (searchKeyword) {
      const kw = searchKeyword.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(kw) ||
          (r.idCard || '').includes(kw) ||
          (r.contractNo || '').toLowerCase().includes(kw) ||
          (r.institution || '').toLowerCase().includes(kw)
      );
    }
    return list;
  }, [records, filterCustomerId, searchKeyword]);

  const grouped = useMemo(() => {
    const map = new Map<number, DebtorRecord[]>();
    filtered.forEach((r) => {
      const key = r.customerId || 0;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    });
    return map;
  }, [filtered]);

  const getCustomerName = (id: number) =>
    customers.find((c) => c.id === id)?.name ||
    customers.find((c) => c.id === id)?.institutionName ||
    '未分类';

  const handleEdit = (record: DebtorRecord) => setEditingRecord(record);

  const handleDelete = (id: number) => {
    setDeletingId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingId != null) await deleteRecord(deletingId);
    setConfirmOpen(false);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Search & Filter */}
      <div className="mb-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索姓名、身份证、合同号..."
              className="w-full rounded-lg border border-[#2A2D3E] bg-[#22253A] py-2 pl-9 pr-3 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-[#4A7CFF]"
            />
          </div>
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <select
              value={filterCustomerId ?? ''}
              onChange={(e) => setFilterCustomerId(e.target.value ? Number(e.target.value) : null)}
              className="appearance-none rounded-lg border border-[#2A2D3E] bg-[#22253A] py-2 pl-9 pr-8 text-sm text-white outline-none transition-colors focus:border-[#4A7CFF]"
            >
              <option value="">全部客户</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name || c.institutionName}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="text-[11px] text-gray-500">共 {filtered.length} 条记录</div>
      </div>

      {/* Records List */}
      <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1">
        {Array.from(grouped.entries()).map(([customerId, recs]) => (
          <div key={customerId}>
            <div className="mb-1.5 flex items-center gap-2">
              <div className="h-px flex-1 bg-[#2A2D3E]" />
              <span className="text-[11px] font-medium text-[#D4A855]">{getCustomerName(customerId)}</span>
              <span className="text-[10px] text-gray-500">({recs.length})</span>
              <div className="h-px flex-1 bg-[#2A2D3E]" />
            </div>
            <div className="space-y-2">
              {recs.map((r) => (
                <div
                  key={r.id}
                  className="group rounded-lg border border-[#2A2D3E] bg-[#1C1E2A] p-3 transition-colors hover:border-[#3A3D5E] animate-[cardIn_0.3s_ease-out]"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <span className="text-sm font-medium text-white">{r.name}</span>
                      {r.isJoint && (
                        <span className="ml-2 rounded bg-[#4A7CFF]/15 px-1.5 py-0.5 text-[10px] text-[#4A7CFF]">共债</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button onClick={() => handleEdit(r)} className="rounded p-1 text-gray-400 transition-colors hover:bg-[#22253A] hover:text-[#4A7CFF]">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleDelete(r.id)} className="rounded p-1 text-gray-400 transition-colors hover:bg-[#22253A] hover:text-[#F87171]">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                    <div className="text-gray-500">身份证：<span className="text-gray-300">{r.idCard || '-'}</span></div>
                    <div className="text-gray-500">合同号：<span className="text-gray-300">{r.contractNo || '-'}</span></div>
                    <div className="text-gray-500">欠款总额：<span className="font-medium text-[#F87171]">¥{formatMoney(toNum(r.totalDebt))}</span></div>
                    <div className="text-gray-500">逾期天数：<span className={r.overdueDays > 90 ? 'text-[#F87171]' : 'text-gray-300'}>{r.overdueDays}天</span></div>
                    <div className="text-gray-500">委托机构：<span className="text-gray-300">{r.institution || '-'}</span></div>
                    <div className="text-gray-500">借款本金：<span className="text-gray-300">¥{formatMoney(toNum(r.loanPrincipal))}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <FileText size={40} className="mb-3 text-gray-600" />
            <p className="text-sm">暂无记录</p>
            <p className="text-xs text-gray-600">请在左侧表单中添加数据</p>
          </div>
        )}
      </div>

      {/* Export Buttons */}
      <div className="mt-3 flex flex-wrap gap-2 border-t border-[#2A2D3E] pt-3">
        <button
          onClick={() => window.open(api.exportXlsxUrl(), '_blank')}
          className="flex items-center gap-1.5 rounded-lg bg-[#4A7CFF] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#3B6AE0]"
        >
          <FileSpreadsheet size={13} />
          导出 XLSX
        </button>
        <button
          onClick={() => window.open(api.downloadTemplateUrl(), '_blank')}
          className="flex items-center gap-1.5 rounded-lg border border-[#2A2D3E] bg-[#1C1E2A] px-3 py-1.5 text-xs text-gray-300 transition-colors hover:bg-[#22253A]"
        >
          <Download size={13} />
          下载模板
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 rounded-lg border border-[#2A2D3E] bg-[#1C1E2A] px-3 py-1.5 text-xs text-gray-300 transition-colors hover:bg-[#22253A]"
        >
          <Printer size={13} />
          打印
        </button>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="删除记录"
        message="确定要删除该条记录吗？此操作不可恢复。"
        confirmText="删除"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
