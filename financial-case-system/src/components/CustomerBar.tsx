import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import ConfirmModal from './ConfirmModal';

export default function CustomerBar() {
  const customers = useStore((s) => s.customers);
  const currentCustomerId = useStore((s) => s.currentCustomerId);
  const setCurrentCustomerId = useStore((s) => s.setCurrentCustomerId);
  const addCustomer = useStore((s) => s.addCustomer);
  const deleteCustomer = useStore((s) => s.deleteCustomer);

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newInst, setNewInst] = useState('');
  const [newPrincipal, setNewPrincipal] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleAdd = async () => {
    if (!newName.trim() || !newInst.trim()) return;
    await addCustomer({
      name: newName.trim(),
      institutionName: newInst.trim(),
      principalName: newPrincipal.trim() || newName.trim(),
    });
    setShowAdd(false);
    setNewName('');
    setNewInst('');
    setNewPrincipal('');
  };

  return (
    <div className="rounded-xl border border-[#1E2029] bg-[#13141C] p-5 animate-[fadeSlideUp_0.3s_ease-out]">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-1 w-5 rounded-full bg-gradient-to-r from-[#4A7CFF] to-[#3B6AE0]" />
          <h3 className="text-sm font-semibold text-white tracking-wide">
            委托方
            <span className="ml-2 rounded-full bg-[#4A7CFF]/10 px-2 py-0.5 text-[10px] font-medium text-[#4A7CFF] tabular-nums">
              {customers.length}
            </span>
          </h3>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1 rounded-lg bg-[#4A7CFF]/8 px-3 py-1.5 text-xs font-medium text-[#4A7CFF] transition-all hover:bg-[#4A7CFF]/15"
        >
          <Plus size={12} />
          新增
        </button>
      </div>

      {showAdd && (
        <div className="mb-3 space-y-2 rounded-lg border border-[#4A7CFF]/20 bg-[#0F1017] p-3 animate-[fadeSlideUp_0.2s_ease-out]">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="客户名称 *"
            className="w-full rounded-lg border border-[#252836] bg-[#1A1C27] px-3 py-1.5 text-xs text-white placeholder-gray-600 outline-none transition-colors focus:border-[#4A7CFF]/50 focus:ring-1 focus:ring-[#4A7CFF]/20"
          />
          <input
            value={newInst}
            onChange={(e) => setNewInst(e.target.value)}
            placeholder="机构名称 *"
            className="w-full rounded-lg border border-[#252836] bg-[#1A1C27] px-3 py-1.5 text-xs text-white placeholder-gray-600 outline-none transition-colors focus:border-[#4A7CFF]/50 focus:ring-1 focus:ring-[#4A7CFF]/20"
          />
          <input
            value={newPrincipal}
            onChange={(e) => setNewPrincipal(e.target.value)}
            placeholder="负责人姓名"
            className="w-full rounded-lg border border-[#252836] bg-[#1A1C27] px-3 py-1.5 text-xs text-white placeholder-gray-600 outline-none transition-colors focus:border-[#4A7CFF]/50 focus:ring-1 focus:ring-[#4A7CFF]/20"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={!newName.trim() || !newInst.trim()}
              className="flex-1 rounded-lg bg-[#4A7CFF] py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#3B6AE0] disabled:opacity-30"
            >
              确认添加
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="rounded-lg border border-[#252836] px-3 py-1.5 text-xs text-gray-500 transition-colors hover:text-gray-300 hover:border-[#333648]"
            >
              取消
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 min-h-[34px] items-center">
        {customers.length === 0 && (
          <p className="text-xs text-gray-600">暂无委托方，请先添加</p>
        )}
        {customers.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCurrentCustomerId(c.id)}
            className={`group relative flex items-center gap-1.5 rounded-full pl-3 pr-2 py-1 text-xs font-medium transition-all ${
              currentCustomerId === c.id
                ? 'bg-[#D4A855]/15 text-[#D4A855] ring-1 ring-[#D4A855]/30'
                : 'bg-[#1A1C27] text-gray-400 ring-1 ring-transparent hover:text-gray-200 hover:ring-[#252836]'
            }`}
          >
            <span>{c.name || c.institutionName}</span>
            <span
              className={`rounded-full px-1.5 py-px text-[9px] tabular-nums ${
                currentCustomerId === c.id ? 'bg-[#D4A855]/20 text-[#D4A855]' : 'bg-[#0F1017] text-gray-600'
              }`}
            >
              {c.recordCount || 0}
            </span>
            {customers.length > 1 && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setDeletingId(c.id);
                  setConfirmOpen(true);
                }}
                className="ml-0.5 cursor-pointer rounded-full p-0.5 text-gray-700 opacity-0 transition-all hover:bg-[#F87171]/15 hover:text-[#F87171] group-hover:opacity-100"
              >
                <X size={9} />
              </span>
            )}
          </button>
        ))}
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="删除委托方"
        message={`确定要删除"${customers.find((c) => c.id === deletingId)?.name}"吗？其下所有记录也将被删除。`}
        confirmText="删除"
        danger
        onConfirm={async () => {
          if (deletingId != null) await deleteCustomer(deletingId);
          setConfirmOpen(false);
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
