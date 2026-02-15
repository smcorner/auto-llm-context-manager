interface CopyNotificationProps {
  visible: boolean;
}

export function CopyNotification({ visible }: CopyNotificationProps) {
  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-violet-600 text-white px-6 py-3 rounded-lg font-medium shadow-lg">
        📋 Copied to clipboard!
      </div>
    </div>
  );
}
