import { useEffect, useState } from 'react';
import { Building2, Users, DollarSign, TrendingUp } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { OverviewStats } from '@/lib/api';

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

  useEffect(() => {
    setMounted(true);
    fetchStats();
  }, [fetchStats]);

  if (!mounted || !overviewStats) {
    return (
      <header className="sticky top-0 z-50 border-b border-[#2A2D3E] bg-[#0F1117]/80 backdrop-blur-xl px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#D4A855] to-[#B8922E] text-sm font-bold text-[#1a1a1a]">
            金
          </div>
          <h1 className="text-lg font-semibold text-white">金融机构金融案件数据录入</h1>
        </div>
      </header>
    );
  }

  const stats = [
    { icon: Users, label: '总记录数', value: String(overviewStats.totalRecords), color: '#4A7CFF' },
    { icon: Building2, label: '客户数量', value: String(overviewStats.totalCustomers), color: '#D4A855' },
    { icon: DollarSign, label: '欠款总额', value: `¥${fmt(toNum(overviewStats.totalDebt))}`, color: '#F87171' },
    { icon: TrendingUp, label: '平均欠款', value: `¥${fmt(toNum(overviewStats.avgDebt))}`, color: '#A78BFA' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#2A2D3E] bg-[#0F1117]/80 backdrop-blur-xl px-6 py-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#D4A855] to-[#B8922E] text-sm font-bold text-[#1a1a1a]">
            金
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">金融机构金融案件数据录入</h1>
            <p className="text-xs text-gray-500">Financial Case Data Entry System</p>
          </div>
        </div>
        <div className="flex gap-3">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-2 rounded-xl border border-[#2A2D3E] bg-[#1C1E2A] px-4 py-2">
              <s.icon size={16} style={{ color: s.color }} />
              <span className="text-xs text-gray-400">{s.label}</span>
              <span className="text-sm font-bold text-white">{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
