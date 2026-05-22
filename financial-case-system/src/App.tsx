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
    <div className="min-h-screen bg-[#0F1117]">
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

      {/* Tab Bar + Content Container */}
      <div className="mx-auto w-full max-w-[1680px] px-5">
        {/* Tab Bar */}
        <nav className="sticky top-[57px] z-40 border-b border-[#2A2D3E] bg-[#0F1117]/95 backdrop-blur-md">
          <div className="flex gap-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab?.(t.key)}
                className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  currentTab === t.key
                    ? 'text-[#D4A855]'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <t.icon size={15} />
                {t.label}
                {currentTab === t.key && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#D4A855] to-[#B8922E] rounded-full" />
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <main className="print-area pb-8">
          {currentTab === 'entry' && (
            <div className="flex gap-5 pt-5">
              {/* Left: Form area */}
              <section className="w-[58%] min-w-0 space-y-5">
                <CustomerBar />
                <EntryForm />
              </section>

              {/* Right: Record list */}
              <aside className="h-[calc(100vh-145px)] min-w-0 shrink-0 sticky top-[105px]">
                <div className="h-full rounded-xl border border-[#1E2029] bg-[#0F1017] overflow-hidden flex flex-col">
                  <RecordList />
                </div>
              </aside>
            </div>
          )}

          {currentTab === 'import' && (
            <div className="mx-auto max-w-3xl py-6">
              <ImportExport />
            </div>
          )}

          {currentTab === 'stats' && (
            <div className="py-6">
              <StatsPanel />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
