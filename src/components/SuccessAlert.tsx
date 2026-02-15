interface SuccessAlertProps {
  visible: boolean;
}

export function SuccessAlert({ visible }: SuccessAlertProps) {
  if (!visible) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-pulse">
      <div className="bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-emerald-500/30 flex items-center gap-2">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Conversation Processed Successfully! Context saved for future use.
      </div>
    </div>
  );
}
