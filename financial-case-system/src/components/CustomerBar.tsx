import { useState } from 'react';
import { Plus, X, Building2 } from 'lucide-react';
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
    await addCustomer({ name: newName.trim(), institutionName: newInst.trim(), principalName: newPrincipal.trim() || newName.trim() });
    setShowAdd(false); setNewName(''); setNewInst(''); setNewPrincipal('');
  };

  return (
    <div className="rounded-xl border border-[#1E2029] bg-[#13141C] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1E2029] bg-[#0F1017] px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#4A7CFF]/15">
            <Building2 size={14} className="text-[#4A7CFF]" />
          </div>
          <span className="text-[15px] font-semibold text-white">委托方</span>
          <span className="rounded-full bg-[#4A7CFF]/12 px-2 py-0.5 text-[11px] font-medium text-[#4A7CFF] tabular-nums">{customers.length}</span>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 rounded-lg bg-[#4A7CFF]/10 px-3.5 py-2 text-[13px] font-medium text-[#4A7CFF] transition-all hover:bg-[#4A7CFF]/20"
        >
          <Plus size={13} />
          新增
        </button>
      </div>

      <div className="p-5 pt-4">
        {showAdd && (
          <div className="mb-4 space-y-2.5 rounded-lg border border-[#4A7CFF]/20 bg-[#0F1017] p-4 animate-[fadeSlideUp_0.2s_ease-out]">
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="客户名称 *"
              className="w-full rounded-lg border border-[#2A2D3E] bg-[#161822] px-3.5 py-2 text-[14px] text-white placeholder-gray-500 outline-none focus:border-[#4A7CFF]/50" />
            <input value={newInst} onChange={(e) => setNewInst(e.target.value)} placeholder="机构名称 *"
              className="w-full rounded-lg border border-[#2A2D3E] bg-[#161822] px-3.5 py-2 text-[14px] text-white placeholder-gray-500 outline-none focus:border-[#4A7CFF]/50" />
            <input value={newPrincipal} onChange={(e) => setNewPrincipal(e.target.value)} placeholder="负责人姓名"
              className="w-full rounded-lg border border-[#2A2D3E] bg-[#161822] px-3.5 py-2 text-[14px] text-white placeholder-gray-500 outline-none focus:border-[#4A7CFF]/50" />
            <div className="flex gap-2.5">
              <button onClick={handleAdd} disabled={!newName.trim() || !newInst.trim()}
                className="flex-1 rounded-lg bg-[#4A7CFF] py-2 text-[13px] font-semibold text-white hover:bg-[#3B6AE0] disabled:opacity-30">确认添加</button>
              <button onClick={() => setShowAdd(false)}
                className="rounded-lg border border-[#2A2D3E] px-4 py-2 text-[13px] text-gray-400 hover:text-gray-300 hover:border-[#3A3D5E]">取消</button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 min-h-[38px] items-center">
          {customers.length === 0 && (
            <p className="text-[13px] text-gray-500">暂无委托方，请先添加</p>
          )}
          {customers.map((c) => (
            <button key={c.id} type="button" onClick={() => setCurrentCustomerId(c.id)}
              className={`group flex items-center gap-2 rounded-full pl-4 pr-2.5 py-1.5 text-[13px] font-medium transition-all ${
                currentCustomerId === c.id
                  ? 'bg-[#D4A855]/15 text-[#D4A855] ring-1 ring-[#D4A855]/30 shadow-sm'
                  : 'bg-[#1A1C27] text-gray-300 ring-1 ring-transparent hover:text-white hover:ring-[#2A2D3E]'
              }`}
            >
              <span>{c.name || c.institutionName}</span>
              <span className={`rounded-full px-1.5 py-px text-[10px] tabular-nums ${
                currentCustomerId === c.id ? 'bg-[#D4A855]/25 text-[#D4A855]' : 'bg-[#0F1017] text-gray-500'
              }`}>{c.recordCount || 0}</span>
              {customers.length > 1 && (
                <span onClick={(e) => { e.stopPropagation(); setDeletingId(c.id); setConfirmOpen(true); }}
                  className="ml-0.5 cursor-pointer rounded-full p-0.5 text-gray-600 opacity-0 transition-all hover:bg-[#F87171]/15 hover:text-[#F87171] group-hover:opacity-100">
                  <X size={10} />
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <ConfirmModal open={confirmOpen} title="删除委托方"
        message={`确定要删除"${customers.find((c) => c.id === deletingId)?.name}"吗？其下所有记录也将被删除。`}
        confirmText="删除" danger onConfirm={async () => { if (deletingId != null) await deleteCustomer(deletingId); setConfirmOpen(false); }}
        onCancel={() => setConfirmOpen(false)} />
    </div>
  );
}
