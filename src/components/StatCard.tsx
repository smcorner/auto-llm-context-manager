interface StatCardProps {
  value: number;
  label: string;
}

export function StatCard({ value, label }: StatCardProps) {
  return (
    <div className="bg-slate-700/50 p-5 rounded-xl text-center border border-slate-600/30">
      <div className="text-3xl font-bold text-violet-400">{value}</div>
      <div className="text-sm text-slate-400 mt-1">{label}</div>
    </div>
  );
}
