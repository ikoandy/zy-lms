import { X } from 'lucide-react';

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  danger = false,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-xl border border-[#2A2D3E] bg-[#1C1E2A] p-6 shadow-2xl animate-[fadeSlideUp_0.2s_ease-out]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <button onClick={onCancel} className="rounded p-1 text-gray-400 transition-colors hover:bg-[#22253A] hover:text-white">
            <X size={16} />
          </button>
        </div>
        <p className="mb-6 text-sm text-gray-300">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg border border-[#2A2D3E] bg-[#22253A] px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-[#2A2D3E]"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
              danger
                ? 'bg-[#F87171] hover:bg-[#EF4444]'
                : 'bg-[#4A7CFF] hover:bg-[#3B6AE0]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
