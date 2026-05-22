import { useState, useMemo, useCallback, useEffect } from 'react';
import { Search, Pencil, Trash2, FileText, Filter, Download, Printer, FileSpreadsheet, Merge, CheckSquare, Square, X } from 'lucide-react';
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

  // 合并导出弹窗状态
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

  // 弹窗内的记录列表（支持独立搜索）
  const mergeFilteredRecords = useMemo(() => {
    let list = records;
    if (mergeSearch) {
      const kw = mergeSearch.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(kw) ||
          (r.idCard || '').includes(kw) ||
          (r.contractNo || '').toLowerCase().includes(kw)
      );
    }
    return list;
  }, [records, mergeSearch]);

  // 全选逻辑：当搜索结果全部选中时视为全选
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
  const confirmDelete = async () => {
    if (deletingId != null) await deleteRecord(deletingId);
    setConfirmOpen(false);
  };

  // 打开合并导出弹窗时，默认全选当前筛选的数据
  const handleOpenMergeModal = useCallback(() => {
    setMergeSearch('');
    setMergeSelectedIds(new Set(filtered.map((r) => r.id)));
    setMergeSelectAll(true);
    setMergeModalOpen(true);
  }, [filtered]);

  const toggleMergeSelect = (id: number) => {
    setMergeSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    setMergeSelectAll(false);
  };

  const handleToggleAllMerge = () => {
    if (isAllMergeSelected || mergeSelectAll) {
      setMergeSelectedIds(new Set());
      setMergeSelectAll(false);
    } else {
      setMergeSelectedIds(new Set(mergeFilteredRecords.map((r) => r.id)));
      setMergeSelectAll(true);
    }
  };

  const handleConfirmExport = () => {
    const ids = Array.from(mergeSelectedIds);
    window.open(api.mergeExportUrl({ ids }), '_blank');
    setMergeModalOpen(false);
  };

  const totalSelectedDebt = useMemo(() => {
    let sum = 0;
    for (const r of records) {
      if (mergeSelectedIds.has(r.id)) sum += toNum(r.totalDebt);
    }
    return sum;
  }, [records, mergeSelectedIds]);

  const selectedCount = mergeSelectedIds.size;

  return (
    <div className="flex h-full flex-col">
      {/* Search & Filter */}
      <div className="mb-2 flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="搜索姓名、身份证、合同号..."
            className="w-full rounded-lg border border-[#2A2D3E] bg-[#22253A] py-1.5 pl-8 pr-3 text-xs text-white placeholder-gray-500 outline-none transition-colors focus:border-[#4A7CFF]"
          />
        </div>
        <div className="relative">
          <Filter size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <select
            value={filterCustomerId ?? ''}
            onChange={(e) => setFilterCustomerId(e.target.value ? Number(e.target.value) : null)}
            className="appearance-none rounded-lg border border-[#2A2D3E] bg-[#22253A] py-1.5 pl-8 pr-7 text-xs text-white outline-none transition-colors focus:border-[#4A7CFF]"
          >
            <option value="">全部客户</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name || c.institutionName}</option>
            ))}
          </select>
        </div>
        <span className="shrink-0 text-[11px] text-gray-500 whitespace-nowrap">{filtered.length} 条</span>
      </div>

      {/* Records List */}
      <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-1">
        {Array.from(grouped.entries()).map(([customerId, recs]) => (
          <div key={customerId}>
            <div className="mb-1 flex items-center gap-2">
              <div className="h-px flex-1 bg-[#2A2D3E]" />
              <span className="text-[10px] font-medium text-[#D4A855]">{getCustomerName(customerId)}</span>
              <span className="text-[9px] text-gray-500">({recs.length})</span>
              <div className="h-px flex-1 bg-[#2A2D3E]" />
            </div>
            <div className="space-y-1.5">
              {recs.map((r) => (
                <div key={r.id} className="group rounded-lg border border-[#2A2D3E] bg-[#1C1E2A] p-2.5 transition-colors hover:border-[#3A3D5E] animate-[cardIn_0.3s_ease-out]">
                  <div className="mb-1.5 flex items-start justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-xs font-medium text-white truncate">{r.name}</span>
                      {r.isJoint && (
                        <span className="shrink-0 rounded bg-[#4A7CFF]/15 px-1 py-px text-[9px] text-[#4A7CFF]">共债</span>
                      )}
                      <span className="shrink-0 text-[11px] font-semibold text-[#F87171]">¥{formatMoney(toNum(r.totalDebt))}</span>
                    </div>
                    <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 shrink-0 ml-2">
                      <button onClick={() => handleEdit(r)} className="rounded p-1 text-gray-400 transition-colors hover:bg-[#22253A] hover:text-[#4A7CFF]">
                        <Pencil size={12} />
                      </button>
                      <button onClick={() => handleDelete(r.id)} className="rounded p-1 text-gray-400 transition-colors hover:bg-[#22253A] hover:text-[#F87171]">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-x-3 gap-y-0.5 text-[10px]">
                    <div className="text-gray-500 truncate">身份证：<span className="text-gray-400">{r.idCard || '-'}</span></div>
                    <div className="text-gray-500 truncate">合同号：<span className="text-gray-400">{r.contractNo || '-'}</span></div>
                    <div className="text-gray-500">逾期：<span className={r.overdueDays > 90 ? 'text-[#F87171]' : 'text-gray-400'}>{r.overdueDays}天</span></div>
                    <div className="text-gray-500 truncate">机构：<span className="text-gray-400">{r.institution || '-'}</span></div>
                    <div className="text-gray-500">本金：<span className="text-gray-400">¥{formatMoney(toNum(r.loanPrincipal))}</span></div>
                    <div className="text-gray-500 truncate">电话：<span className="text-gray-400">{r.phone || '-'}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <FileText size={32} className="mb-2 text-gray-600" />
            <p className="text-xs">暂无记录</p>
            <p className="text-[10px] text-gray-600">请在左侧表单中添加数据</p>
          </div>
        )}
      </div>

      {/* Export Buttons */}
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-[#2A2D3E] pt-2.5">
        <button
          onClick={handleOpenMergeModal}
          className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-[#34D399] to-[#2FC78A] px-3 py-1.5 text-[11px] font-medium text-white transition-all hover:from-[#2FC78A] hover:to-[#26B777] shadow-md shadow-[#34D399]/20"
        >
          <Merge size={13} />
          批量导出
        </button>

        <button
          onClick={() => window.open(api.exportXlsxUrl(), '_blank')}
          className="flex items-center gap-1 rounded-lg bg-[#4A7CFF] px-2.5 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-[#3B6AE0]"
        >
          <FileSpreadsheet size={12} /> 导出 XLSX
        </button>

        <button
          onClick={() => window.open(api.downloadTemplateUrl(), '_blank')}
          className="flex items-center gap-1 rounded-lg border border-[#2A2D3E] bg-[#1C1E2A] px-2.5 py-1.5 text-[11px] text-gray-300 transition-colors hover:bg-[#22253A]"
        >
          <Download size={12} /> 下载模板
        </button>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1 rounded-lg border border-[#2A2D3E] bg-[#1C1E2A] px-2.5 py-1.5 text-[11px] text-gray-300 transition-colors hover:bg-[#22253A]"
        >
          <Printer size={12} /> 打印
        </button>
      </div>

      {/* ====== 合并导出选择弹窗 ====== */}
      {mergeModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-xl border border-[#2A2D3E] bg-[#161821] shadow-2xl animate-[fadeSlideUp_0.2s_ease-out] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#2A2D3E] px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#34D399]/15">
                  <Merge size={16} className="text-[#34D399]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">批量导出</h3>
                  <p className="text-[11px] text-gray-500">选择需要导出的案件数据</p>
                </div>
              </div>
              <button onClick={() => setMergeModalOpen(false)} className="rounded p-1.5 text-gray-400 hover:bg-[#22253A] hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Toolbar: search + select all + count */}
            <div className="flex items-center gap-3 border-b border-[#2A2D3E] px-5 py-3">
              <div className="relative flex-1">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  value={mergeSearch}
                  onChange={(e) => { setMergeSearch(e.target.value); setMergeSelectAll(false); }}
                  placeholder="在弹窗中搜索..."
                  className="w-full rounded-lg border border-[#2A2D3E] bg-[#22253A] py-1.5 pl-8 pr-3 text-xs text-white placeholder-gray-500 outline-none focus:border-[#4A7CFF]"
                />
              </div>
              <button
                onClick={handleToggleAllMerge}
                className={`flex shrink-0 items-center gap-1 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                  isAllMergeSelected || mergeSelectAll
                    ? 'bg-[#4A7CFF]/15 text-[#4A7CFF]'
                    : 'border border-[#2A2D3E] text-gray-400 hover:text-white'
                }`}
              >
                {(isAllMergeSelected || mergeSelectAll) ? <CheckSquare size={12} /> : <Square size={12} />}
                {isAllMergeSelected || mergeSelectAll ? '取消' : '全选'}
              </button>
              <div className="shrink-0 rounded-md bg-[#D4A855]/10 px-2.5 py-1.5 text-[11px] font-medium text-[#D4A855]">
                已选 {selectedCount} 条 / 共 {records.length} 条
              </div>
            </div>

            {/* Record List in Modal */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-3 space-y-1.5" style={{ maxHeight: '40vh' }}>
              {mergeFilteredRecords.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-gray-500">
                  <FileText size={28} className="mb-2 text-gray-600" />
                  <p className="text-xs">无匹配记录</p>
                </div>
              ) : (
                mergeFilteredRecords.map((r) => {
                  const custName = customers.find((c) => c.id === r.customerId)?.name || customers.find((c) => c.id === r.customerId)?.institutionName || '-';
                  const isSelected = mergeSelectedIds.has(r.id);
                  return (
                    <div
                      key={r.id}
                      onClick={() => toggleMergeSelect(r.id)}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border p-2.5 transition-all ${
                        isSelected
                          ? 'border-[#34D399] bg-[#34D399]/8'
                          : 'border-[#2A2D3E] bg-[#1C1E2A] hover:border-[#3A3D5E]'
                      }`}
                    >
                      <button className="shrink-0">
                        {isSelected
                          ? <CheckSquare size={15} className="text-[#34D399]" />
                          : <Square size={15} className="text-gray-500" />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-xs font-medium text-white">{r.name}</span>
                          {r.isJoint && <span className="shrink-0 rounded bg-[#4A7CFF]/15 px-1 py-px text-[9px] text-[#4A7CFF]">共债</span>}
                          <span className="shrink-0 text-[10px] text-gray-500">{custName}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-[10px] text-gray-400">
                          <span>{r.idCard || '-'} · {r.contractNo || '-'}</span>
                          <span className="ml-auto font-medium text-[#F87171]">¥{formatMoney(toNum(r.totalDebt))}</span>
                          <span className={`${r.overdueDays > 90 ? 'text-[#F87171]' : ''}`}>{r.overdueDays}天</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer: summary + confirm */}
            <div className="border-t border-[#2A2D3E] px-5 py-4 space-y-3">
              {selectedCount > 0 && (
                <div className="flex items-center justify-between rounded-lg bg-[#34D399]/8 px-4 py-2.5 text-xs">
                  <span className="text-[#34D399]">已选择 <strong>{selectedCount}</strong> 条记录</span>
                  <span>合计欠款：<strong className="text-[#F87171]">¥{formatMoney(totalSelectedDebt)}</strong></span>
                </div>
              )}
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setMergeModalOpen(false)}
                  className="rounded-lg border border-[#2A2D3E] bg-[#1C1E2A] px-4 py-2 text-xs text-gray-300 transition-colors hover:bg-[#22253A]"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirmExport}
                  disabled={selectedCount === 0}
                  className={`flex items-center gap-1.5 rounded-lg px-5 py-2 text-xs font-bold text-white transition-all ${
                    selectedCount > 0
                      ? 'bg-gradient-to-r from-[#34D399] to-[#2FC78A] shadow-md shadow-[#34D399]/25 hover:from-[#2FC78A] hover:to-[#26B777]'
                      : 'cursor-not-allowed bg-gray-600 opacity-50'
                  }`}
                >
                  <Merge size={14} />
                  确认导出 ({selectedCount})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
