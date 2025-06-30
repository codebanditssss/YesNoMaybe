import { X } from 'lucide-react';

interface NotificationModalProps {
  open: boolean;
  onClose: () => void;
}

export default function NotificationModal({ open, onClose }: NotificationModalProps) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-25"
        onClick={onClose}
      />
      <div
        className="fixed top-20 right-6 z-50 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4"
      >
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold">Notifications</h2>
          <button
            className="p-1 rounded hover:bg-gray-100"
            onClick={onClose}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        {/* Notification content goes here */}
        <div className="bg-gray-50 rounded-lg shadow p-4 mt-2">
          <p className="text-gray-700 text-sm font-medium">No new notifications.</p>
        </div>
      </div>
    </>
  );
} 