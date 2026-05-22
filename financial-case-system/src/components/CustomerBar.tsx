import { useState } from 'react';
import { Plus, X, Edit2 } from 'lucide-react';
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
    <div className="animate-[fadeSlideUp_0.4s_ease_both] rounded-xl border border-[#2A2D3E] bg-[#1C1E2A] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">
          委托方管理
          <span className="ml-2 rounded bg-[#4A7CFF]/15 px-2 py-0.5 text-xs font-normal text-[#4A7CFF]">
            {customers.length} 个
          </span>
        </h3>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1 rounded-lg bg-[#4A7CFF]/10 px-3 py-1.5 text-xs font-medium text-[#4A7CFF] transition-colors hover:bg-[#4A7CFF]/20"
        >
          <Plus size={13} />
          新增
        </button>
      </div>

      {showAdd && (
        <div className="mb-3 space-y-2 rounded-lg border border-[#4A7CFF]/30 bg-[#4A7CFF]/5 p-3">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="客户名称 *"
            className="w-full rounded border border-[#2A2D3E] bg-[#22253A] px-3 py-1.5 text-xs text-white placeholder-gray-500 outline-none focus:border-[#4A7CFF]"
          />
          <input
            value={newInst}
            onChange={(e) => setNewInst(e.target.value)}
            placeholder="机构名称 *"
            className="w-full rounded border border-[#2A2D3E] bg-[#22253A] px-3 py-1.5 text-xs text-white placeholder-gray-500 outline-none focus:border-[#4A7CFF]"
          />
          <input
            value={newPrincipal}
            onChange={(e) => setNewPrincipal(e.target.value)}
            placeholder="负责人姓名"
            className="w-full rounded border border-[#2A2D3E] bg-[#22253A] px-3 py-1.5 text-xs text-white placeholder-gray-500 outline-none focus:border-[#4A7CFF]"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={!newName.trim() || !newInst.trim()}
              className="flex-1 rounded-lg bg-[#4A7CFF] py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#3B6AE0] disabled:opacity-40"
            >
              确认添加
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="rounded-lg border border-[#2A2D3E] px-3 py-1.5 text-xs text-gray-400 transition-colors hover:bg-[#2A2D3E]"
            >
              取消
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 min-h-[36px] items-center">
        {customers.length === 0 && (
          <p className="text-xs text-gray-500">暂无委托方，请先添加</p>
        )}
        {customers.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCurrentCustomerId(c.id)}
            className={`group flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-all ${
              currentCustomerId === c.id
                ? 'bg-[#4A7CFF]/15 border-[#4A7CFF] text-[#4A7CFF]'
                : 'bg-[#22253A] border-[#2A2D3E] text-gray-300 hover:border-gray-500'
            } border`}
          >
            <span>{c.name || c.institutionName}</span>
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                currentCustomerId === c.id ? 'bg-[#4A7CFF]/20' : 'bg-[#1C1E2A] text-gray-500'
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
                className="ml-0.5 cursor-pointer rounded-full p-0.5 text-gray-600 opacity-0 transition-all hover:bg-[#F87171]/20 hover:text-[#F87171] group-hover:opacity-100"
              >
                <X size={10} />
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
