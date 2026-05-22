import { useEffect, useState } from 'react';
import { Building2, Users, DollarSign, TrendingUp } from 'lucide-react';
import { useStore } from '@/store/useStore';

function toNum(v: string | number): number {
  return typeof v === 'number' ? v : parseFloat(String(v)) || 0;
}

function fmt(n: number): string {
  if (n >= 1e8) return (n / 1e8).toFixed(2) + '亿';
  if (n >= 1e4) return (n / 1e4).toFixed(2) + '万';
  return n.toFixed(2);
}

export default function Header() {
  const overviewStats = useStore((s) => s.overviewStats);
  const fetchStats = useStore((s) => s.fetchStats);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); fetchStats(); }, [fetchStats]);

  return (
    <header className="sticky top-0 z-50 border-b border-[#1E2029] bg-[#0F1117]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[60px] max-w-[1680px] items-center justify-between px-5">
        {/* Logo + Title */}
        <div className="flex items-center gap-3.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4A855] via-[#C49A3F] to-[#B8922E] shadow-lg shadow-[#D4A855]/20">
            <span className="text-[16px] font-bold text-[#0F1117]" style={{ fontFamily: "'Noto Serif SC', serif" }}>金</span>
          </div>
          <div>
            <h1 className="text-[15px] font-semibold text-white tracking-wide leading-tight">金融案件数据录入系统</h1>
            <span className="text-[11px] text-gray-600 font-medium">Financial Case Data Entry</span>
          </div>
        </div>

        {/* Stats Pills */}
        {mounted && overviewStats && (
          <div className="flex items-center gap-2.5">
            {[
              { icon: Users, value: String(overviewStats.totalRecords), label: '记录', color: '#4A7CFF' },
              { icon: Building2, value: String(overviewStats.totalCustomers), label: '客户', color: '#D4A855' },
              { icon: DollarSign, value: `¥${fmt(toNum(overviewStats.totalDebt))}`, label: '欠款', color: '#F87171' },
              { icon: TrendingUp, value: `¥${fmt(toNum(overviewStats.avgDebt))}`, label: '均欠', color: '#A78BFA' },
            ].map((s) => (
              <div key={s.label} className="group flex items-center gap-2 rounded-lg border border-[#1E2029] bg-[#13141C] px-3 py-1.5 transition-colors hover:border-[#252836]">
                <s.icon size={13} style={{ color: s.color }} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                <span className="text-[13px] font-semibold text-white tabular-nums">{s.value}</span>
                <span className="text-[10px] text-gray-600 uppercase tracking-wider">{s.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
