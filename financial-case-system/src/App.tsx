import { useEffect } from 'react';
import { FileText, Database, BarChart3 } from 'lucide-react';
import Header from './components/Header';
import CustomerBar from './components/CustomerBar';
import EntryForm from './components/EntryForm';
import RecordList from './components/RecordList';
import ImportExport from './components/ImportExport';
import StatsPanel from './components/StatsPanel';
import { useStore } from '@/store/useStore';

type Tab = 'entry' | 'import' | 'stats';

export default function App() {
  const tab = useStore((s) => (s as any)._tab) as Tab | undefined;
  const setTab = useStore((s) => (s as any).setTab) as ((t: Tab) => void) | undefined;
  const fetchCustomers = useStore((s) => s.fetchCustomers);
  const fetchRecords = useStore((s) => s.fetchRecords);
  const toasts = useStore((s) => s.toasts);
  const removeToast = useStore((s) => s.removeToast);

  const currentTab: Tab = tab || 'entry';

  useEffect(() => {
    fetchCustomers();
    fetchRecords();
  }, [fetchCustomers, fetchRecords]);

  const tabs: { key: Tab; label: string; icon: typeof FileText }[] = [
    { key: 'entry', label: '数据录入', icon: FileText },
    { key: 'import', label: '批量导入', icon: Database },
    { key: 'stats', label: '数据统计', icon: BarChart3 },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#0F1117]">
      <Header />

      {/* Toast Notifications */}
      <div className="fixed right-4 top-4 z-[300] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm shadow-lg animate-[fadeSlideUp_0.3s_ease-out] ${
              t.type === 'success'
                ? 'border-[#34D399]/30 bg-[#1C1E2A] text-[#34D399]'
                : 'border-[#F87171]/30 bg-[#1C1E2A] text-[#F87171]'
            }`}
          >
            <span>{t.message}</span>
            <button onClick={() => removeToast(t.id)} className="ml-2 opacity-60 hover:opacity-100">
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Tab Bar */}
      <div className="shrink-0 border-b border-[#2A2D3E] bg-[#161821] px-6">
        <div className="flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab?.(t.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                currentTab === t.key
                  ? 'border-b-2 border-[#4A7CFF] text-[#4A7CFF]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <t.icon size={15} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="print-area flex-1 mx-auto w-full max-w-[1600px] px-6 py-5">
        {currentTab === 'entry' && (
          <div className="flex h-[calc(100vh-155px)] gap-5">
            {/* Left: Form area - wider for data entry */}
            <div className="w-[55%] min-w-0 shrink-0 overflow-y-auto custom-scrollbar pr-1">
              <CustomerBar />
              <EntryForm />
            </div>
            {/* Right: Record list - narrower, compact */}
            <div className="flex-1 min-w-0 rounded-xl border border-[#2A2D3E] bg-[#1C1E2A] p-3 overflow-hidden flex flex-col">
              <RecordList />
            </div>
          </div>
        )}

        {currentTab === 'import' && (
          <div className="mx-auto max-w-3xl">
            <ImportExport />
          </div>
        )}

        {currentTab === 'stats' && (
          <StatsPanel />
        )}
      </main>
    </div>
  );
}
