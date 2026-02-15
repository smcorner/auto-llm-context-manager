interface InfoCardProps {
  title: string;
  items: string[];
}

export function InfoCard({ title, items }: InfoCardProps) {
  if (items.length === 0) return null;

  return (
    <div className="bg-slate-700/50 p-5 rounded-xl border border-slate-600/30">
      <div className="font-bold text-violet-400 mb-3">{title}</div>
      <div className="flex flex-wrap gap-2">
        {items.slice(0, 10).map((item, index) => (
          <span
            key={index}
            className="bg-slate-800 px-3 py-1.5 rounded-full text-sm text-slate-300"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
