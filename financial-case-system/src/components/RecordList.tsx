import { useState, useMemo, useCallback, useEffect } from 'react';
import { Search, Pencil, Trash2, FileText, Filter, Download, Printer, FileSpreadsheet, Merge, CheckSquare, Square, X, ListTodo } from 'lucide-react';
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

  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [mergeSearch, setMergeSearch] = useState('');
  const [mergeSelectedIds, setMergeSelectedIds] = useState<Set<number>>(new Set());
  const [mergeSelectAll, setMergeSelectAll] = useState(false);

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

  const mergeFilteredRecords = useMemo(() => {
    if (!mergeSearch) return records;
    const kw = mergeSearch.toLowerCase();
    return records.filter(
      (r) =>
        r.name.toLowerCase().includes(kw) ||
        (r.idCard || '').includes(kw) ||
        (r.contractNo || '').toLowerCase().includes(kw)
    );
  }, [records, mergeSearch]);

  useEffect(() => {
    if (mergeSelectAll && mergeFilteredRecords.length > 0) {
      setMergeSelectedIds(new Set(mergeFilteredRecords.map((r) => r.id)));
    }
  }, [mergeSelectAll, mergeFilteredRecords]);

  const isAllMergeSelected =
    mergeFilteredRecords.length > 0 &&
    mergeFilteredRecords.every((r) => mergeSelectedIds.has(r.id));

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

  const handleEdit = useCallback((record: DebtorRecord) => setEditingRecord(record), [setEditingRecord]);
  const handleDelete = (id: number) => { setDeletingId(id); setConfirmOpen(true); };
  const confirmDelete = async () => { if (deletingId != null) await deleteRecord(deletingId); setConfirmOpen(false); };

  const handleOpenMergeModal = useCallback(() => {
    setMergeSearch('');
    setMergeSelectedIds(new Set(filtered.map((r) => r.id)));
    setMergeSelectAll(true);
    setMergeModalOpen(true);
  }, [filtered]);

  const toggleMergeSelect = (id: number) => {
    setMergeSelectedIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
    setMergeSelectAll(false);
  };

  const handleToggleAllMerge = () => {
    if (isAllMergeSelected || mergeSelectAll) { setMergeSelectedIds(new Set()); setMergeSelectAll(false); }
    else { setMergeSelectedIds(new Set(mergeFilteredRecords.map((r) => r.id))); setMergeSelectAll(true); }
  };

  const handleConfirmExport = () => {
    window.open(api.mergeExportUrl({ ids: Array.from(mergeSelectedIds) }), '_blank');
    setMergeModalOpen(false);
  };

  const totalSelectedDebt = useMemo(() => {
    let sum = 0;
    for (const r of records) if (mergeSelectedIds.has(r.id)) sum += toNum(r.totalDebt);
    return sum;
  }, [records, mergeSelectedIds]);

  return (
    <div className="flex h-full flex-col">
      {/* ====== Panel Header ====== */}
      <div className="shrink-0 border-b border-[#1E2029] bg-[#0F1017] px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#34D399]/15">
              <ListTodo size={14} className="text-[#34D399]" />
            </div>
            <span className="text-[15px] font-semibold text-white">案件记录</span>
            <span className="rounded-full bg-[#34D399]/12 px-2 py-0.5 text-[11px] font-medium text-[#34D399] tabular-nums">{filtered.length}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索姓名、身份证、合同号..."
              className="w-full rounded-lg border border-[#2A2D3E] bg-[#161822] py-2 pl-9 pr-3 text-[13px] text-gray-200 placeholder-gray-500 outline-none transition-all focus:border-[#34D399]/50 focus:bg-[#1C1E2A]" />
          </div>
          <div className="relative">
            <Filter size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <select value={filterCustomerId ?? ''} onChange={(e) => setFilterCustomerId(e.target.value ? Number(e.target.value) : null)}
              className="appearance-none rounded-lg border border-[#2A2D3E] bg-[#161822] py-2 pl-8 pr-7 text-[13px] text-gray-200 outline-none focus:border-[#34D399]/50">
              <option value="">全部客户</option>
              {customers.map((c) => (<option key={c.id} value={c.id}>{c.name || c.institutionName}</option>))}
            </select>
          </div>
        </div>
      </div>

      {/* ====== Records List ====== */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-3 space-y-3">
        {Array.from(grouped.entries()).map(([customerId, recs]) => (
          <div key={customerId}>
            <div className="mb-2 flex items-center gap-2.5">
              <div className="h-px flex-1 bg-[#1E2029]" />
              <span className="text-[12px] font-semibold text-[#D4A855]">{getCustomerName(customerId)}</span>
              <span className="rounded-full bg-[#1A1C27] px-1.5 py-px text-[10px] text-gray-500 tabular-nums">({recs.length})</span>
              <div className="h-px flex-1 bg-[#1E2029]" />
            </div>

            <div className="space-y-2">
              {recs.map((r) => (
                <div key={r.id}
                  className="group rounded-lg border border-[#1E2029] bg-[#0F1017] p-3.5 transition-all hover:border-[#252836] hover:bg-[#13141C] animate-[cardIn_0.25s_ease-out]"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-[14px] font-semibold text-white truncate">{r.name}</span>
                      {r.isJoint && (
                        <span className="shrink-0 rounded-md bg-[#A78BFA]/12 px-1.5 py-0.5 text-[10px] font-medium text-[#A78BFA]">共债</span>
                      )}
                      <span className={`shrink-0 text-[14px] font-bold tabular-nums ${r.overdueDays > 90 ? 'text-[#F87171]' : 'text-white'}`}>¥{formatMoney(toNum(r.totalDebt))}</span>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                      <button onClick={() => handleEdit(r)} className="rounded p-1.5 text-gray-600 hover:text-[#4A7CFF] hover:bg-[#1A1C27]"><Pencil size={13} /></button>
                      <button onClick={() => handleDelete(r.id)} className="rounded p-1.5 text-gray-600 hover:text-[#F87171] hover:bg-[#1A1C27]"><Trash2 size={13} /></button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-[12px] text-gray-400">
                    <div>身份证：<span className="text-gray-300">{r.idCard || '-'}</span></div>
                    <div>合同号：<span className="text-gray-300">{r.contractNo || '-'}</span></div>
                    <div>逾期：<span className={r.overdueDays > 90 ? 'text-[#F87171] font-medium' : 'text-gray-300'}>{r.overdueDays}天</span></div>
                    <div>机构：<span className="text-gray-300">{r.institution || '-'}</span></div>
                    <div>本金：<span className="text-gray-300">¥{formatMoney(toNum(r.loanPrincipal))}</span></div>
                    <div>电话：<span className="text-gray-300">{r.phone || '-'}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-600">
            <FileText size={32} className="mb-3 opacity-40" />
            <p className="text-[13px] font-medium">暂无记录</p>
            <p className="text-[12px] mt-1">请在左侧表单中添加数据</p>
          </div>
        )}
      </div>

      {/* ====== Export Actions ====== */}
      <div className="shrink-0 border-t border-[#1E2029] bg-[#0F1017] px-5 py-3.5 flex items-center gap-2 flex-wrap">
        <button onClick={handleOpenMergeModal}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#34D399] to-[#26B777] px-4 py-2 text-[12px] font-semibold text-white shadow-md shadow-[#34D399]/20 hover:shadow-[#34D399]/30 active:scale-[0.97] transition-all"
        >
          <Merge size={13} /> 批量导出
        </button>
        <button onClick={() => window.open(api.exportXlsxUrl(), '_blank')}
          className="flex items-center gap-1.5 rounded-lg bg-[#4A7CFF] px-3 py-2 text-[12px] font-semibold text-white hover:bg-[#3B6AE0] transition-colors"
        >
          <FileSpreadsheet size={12} /> 导出 XLSX
        </button>
        <button onClick={() => window.open(api.downloadTemplateUrl(), '_blank')}
          className="flex items-center gap-1.5 rounded-lg border border-[#2A2D3E] bg-transparent px-3 py-2 text-[12px] text-gray-400 hover:text-gray-300 hover:border-[#3A3D5E] transition-colors"
        >
          <Download size={12} /> 模板
        </button>
        <button onClick={() => window.print()}
          className="flex items-center gap-1.5 rounded-lg border border-[#2A2D3E] bg-transparent px-3 py-2 text-[12px] text-gray-400 hover:text-gray-300 hover:border-[#3A3D5E] transition-colors"
        >
          <Printer size={12} /> 打印
        </button>
      </div>

      {/* ====== 合并导出弹窗 ====== */}
      {mergeModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-xl border border-[#1E2029] bg-[#0F1117] shadow-2xl shadow-black/40 animate-[fadeSlideUp_0.2s_ease-out] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#1E2029] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#34D399]/15">
                  <Merge size={17} className="text-[#34D399]" />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-white">批量导出</h3>
                  <p className="text-[12px] text-gray-500 mt-0.5">选择需要导出的案件数据</p>
                </div>
              </div>
              <button onClick={() => setMergeModalOpen(false)} className="rounded p-2 text-gray-500 hover:bg-[#1A1C27] hover:text-white transition-colors"><X size={18} /></button>
            </div>

            <div className="flex items-center gap-3 border-b border-[#1E2029] px-6 py-3.5">
              <div className="relative flex-1">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input value={mergeSearch} onChange={(e) => { setMergeSearch(e.target.value); setMergeSelectAll(false); }}
                  placeholder="搜索记录..."
                  className="w-full rounded-lg border border-[#2A2D3E] bg-[#13141C] py-2 pl-9 pr-3 text-[13px] text-gray-200 placeholder-gray-500 outline-none focus:border-[#34D399]/50" />
              </div>
              <button onClick={handleToggleAllMerge}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-medium transition-colors ${
                  isAllMergeSelected || mergeSelectAll
                    ? 'bg-[#34D399]/15 text-[#34D399]'
                    : 'border border-[#2A2D3E] text-gray-400 hover:text-gray-300'
                }`}
              >
                {(isAllMergeSelected || mergeSelectAll) ? <CheckSquare size={13} /> : <Square size={13} />}
                {isAllMergeSelected || mergeSelectAll ? '取消全选' : '全选'}
              </button>
              <div className="shrink-0 rounded-lg bg-[#D4A855]/10 px-3 py-2 text-[12px] font-medium text-[#D4A855] tabular-nums">
                已选 {mergeSelectedIds.size} / {records.length}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-3 space-y-1.5" style={{ maxHeight: '40vh' }}>
              {mergeFilteredRecords.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-gray-600">
                  <FileText size={28} className="mb-2 opacity-40" /><p className="text-[13px]">无匹配记录</p>
                </div>
              ) : (
                mergeFilteredRecords.map((r) => {
                  const custName = customers.find((c) => c.id === r.customerId)?.name || customers.find((c) => c.id === r.customerId)?.institutionName || '-';
                  const isSelected = mergeSelectedIds.has(r.id);
                  return (
                    <div key={r.id} onClick={() => toggleMergeSelect(r.id)}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all ${
                        isSelected ? 'border-[#34D399]/40 bg-[#34D399]/8' : 'border-[#1E2029] bg-[#0F1017] hover:border-[#252836]'
                      }`}
                    >
                      <button className="shrink-0">
                        {isSelected ? <CheckSquare size={16} className="text-[#34D399]" /> : <Square size={16} className="text-gray-600" />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-[13px] font-medium text-white">{r.name}</span>
                          {r.isJoint && <span className="shrink-0 rounded bg-[#A78BFA]/12 px-1.5 py-0.5 text-[10px] text-[#A78BFA]">共债</span>}
                          <span className="shrink-0 text-[11px] text-gray-500">{custName}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-[12px] text-gray-500">
                          <span>{r.idCard || '-'} · {r.contractNo || '-'}</span>
                          <span className="ml-auto font-semibold text-[#F87171] tabular-nums">¥{formatMoney(toNum(r.totalDebt))}</span>
                          <span className={`${r.overdueDays > 90 ? 'text-[#F87171]' : ''}`}>{r.overdueDays}天</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="border-t border-[#1E2029] px-6 py-4 space-y-3">
              {mergeSelectedIds.size > 0 && (
                <div className="flex items-center justify-between rounded-lg bg-[#34D399]/8 px-4 py-3 text-[13px]">
                  <span className="text-[#34D399]">已选 <strong>{mergeSelectedIds.size}</strong> 条记录</span>
                  <span>合计欠款：<strong className="text-[#F87171] tabular-nums">¥{formatMoney(totalSelectedDebt)}</strong></span>
                </div>
              )}
              <div className="flex items-center justify-end gap-3">
                <button onClick={() => setMergeModalOpen(false)}
                  className="rounded-lg border border-[#2A2D3E] px-5 py-2.5 text-[13px] text-gray-400 hover:text-gray-300 hover:border-[#3A3D5E] transition-colors">取消</button>
                <button onClick={handleConfirmExport} disabled={mergeSelectedIds.size === 0}
                  className={`flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-[13px] font-bold text-white transition-all ${
                    mergeSelectedIds.size > 0
                      ? 'bg-gradient-to-r from-[#34D399] to-[#26B777] shadow-lg shadow-[#34D399]/25 hover:from-[#2FC78A] hover:to-[#22A06B] active:scale-[0.97]'
                      : 'cursor-not-allowed bg-gray-800 opacity-40'
                  }`}
                >
                  <Merge size={14} /> 确认导出 ({mergeSelectedIds.size})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal open={confirmOpen} title="删除记录" message="确定要删除该条记录吗？此操作不可恢复。"
        confirmText="删除" danger onConfirm={confirmDelete} onCancel={() => setConfirmOpen(false)} />
    </div>
  );
}
