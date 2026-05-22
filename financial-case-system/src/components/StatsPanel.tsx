import { useEffect } from 'react';
import {
  Users, Building2, DollarSign, TrendingUp, ArrowUpRight,
  BarChart3, AlertTriangle
} from 'lucide-react';
import { useStore } from '@/store/useStore';

function toNum(v: string | number): number {
  return typeof v === 'number' ? v : parseFloat(String(v)) || 0;
}

function fmt(n: number): string {
  if (n >= 1e8) return (n / 1e8).toFixed(2) + '亿';
  if (n >= 1e4) return (n / 1e4).toFixed(2) + '万';
  return n.toFixed(2);
}

function BarChart({ data, color }: { data: { label: string; value: number; count: number }[]; color: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-2">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="w-20 shrink-0 text-right text-[11px] text-gray-400">{d.label}</span>
          <div className="h-5 flex-1 overflow-hidden rounded bg-[#22253A]">
            <div
              className="h-full rounded transition-all duration-500"
              style={{ width: `${(d.value / max) * 100}%`, backgroundColor: color, opacity: 0.7 }}
            />
          </div>
          <span className="w-20 shrink-0 text-[11px] text-gray-300">{d.count}条</span>
        </div>
      ))}
    </div>
  );
}

export default function StatsPanel() {
  const overviewStats = useStore((s) => s.overviewStats);
  const debtDistribution = useStore((s) => s.debtDistribution);
  const overdueAnalysis = useStore((s) => s.overdueAnalysis);
  const customerStats = useStore((s) => s.customerStats);
  const fetchStats = useStore((s) => s.fetchStats);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const cards = overviewStats
    ? [
        { icon: Users, label: '总记录数', value: String(overviewStats.totalRecords), color: '#4A7CFF' },
        { icon: Building2, label: '客户数量', value: String(overviewStats.totalCustomers), color: '#D4A855' },
        { icon: DollarSign, label: '欠款总额', value: `¥${fmt(toNum(overviewStats.totalDebt))}`, color: '#F87171' },
        { icon: TrendingUp, label: '平均欠款', value: `¥${fmt(toNum(overviewStats.avgDebt))}`, color: '#A78BFA' },
        { icon: ArrowUpRight, label: '最大欠款', value: `¥${fmt(toNum(overviewStats.maxDebt))}`, color: '#FB923C' },
        { icon: BarChart3, label: '已还总额', value: `¥${fmt(toNum(overviewStats.totalRepaid))}`, color: '#34D399' },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-3 gap-3 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-[#2A2D3E] bg-[#1C1E2A] p-4 transition-colors hover:border-[#3A3D5E]">
            <div className="mb-2 flex items-center gap-2">
              <c.icon size={16} style={{ color: c.color }} />
              <span className="text-[11px] text-gray-400">{c.label}</span>
            </div>
            <div className="text-lg font-bold text-white">{c.value}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-[#2A2D3E] bg-[#1C1E2A] p-5">
          <h3 className="mb-4 text-sm font-medium text-white">欠款分布</h3>
          <BarChart data={debtDistribution.map((d) => ({ ...d }))} color="#4A7CFF" />
        </div>
        <div className="rounded-xl border border-[#2A2D3E] bg-[#1C1E2A] p-5">
          <h3 className="mb-4 text-sm font-medium text-white">逾期分析</h3>
          <BarChart data={overdueAnalysis.map((d) => ({ ...d }))} color="#F87171" />
        </div>
      </div>

      {/* Customer Stats */}
      <div className="rounded-xl border border-[#2A2D3E] bg-[#1C1E2A] p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-white">
          <AlertTriangle size={14} /> 客户统计
        </h3>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {customerStats.map((c) => (
            <div key={c.customerId} className="rounded-lg border border-[#2A2D3E] bg-[#22253A] p-3">
              <div className="mb-1 truncate text-xs font-medium text-white">{c.customerName}</div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-400">记录数</span>
                <span className="text-gray-300">{c.recordCount}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-400">总欠款</span>
                <span className="text-[#F87171]">¥{fmt(toNum(c.totalDebt))}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
