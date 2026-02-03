import { useState, useEffect } from 'react';
import { X, Clock, AlertCircle, CheckCircle, Flame } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Reminder {
  id: string;
  reminder_type: string;
  title: string;
  message: string;
  scheduled_for: string;
}

interface ReminderNotificationProps {
  userId: string;
  onClose: () => void;
}

export default function ReminderNotification({ userId, onClose }: ReminderNotificationProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showing, setShowing] = useState(false);

  useEffect(() => {
    checkReminders();
    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [userId]);

  const checkReminders = async () => {
    const { data } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', userId)
      .is('shown_at', null)
      .lte('scheduled_for', new Date().toISOString())
      .order('scheduled_for', { ascending: true });

    if (data && data.length > 0) {
      setReminders(data);
      setCurrentIndex(0);
      setShowing(true);
    }
  };

  const dismissReminder = async () => {
    if (reminders[currentIndex]) {
      await supabase
        .from('reminders')
        .update({ dismissed_at: new Date().toISOString(), shown_at: new Date().toISOString() })
        .eq('id', reminders[currentIndex].id);

      const newReminders = reminders.filter((_, i) => i !== currentIndex);
      if (newReminders.length === 0) {
        setShowing(false);
        onClose();
      } else {
        setReminders(newReminders);
        setCurrentIndex(Math.min(currentIndex, newReminders.length - 1));
      }
    }
  };

  const markAsShown = async () => {
    if (reminders[currentIndex]) {
      await supabase
        .from('reminders')
        .update({ shown_at: new Date().toISOString() })
        .eq('id', reminders[currentIndex].id);

      const newReminders = reminders.filter((_, i) => i !== currentIndex);
      if (newReminders.length === 0) {
        setShowing(false);
        onClose();
      } else {
        setReminders(newReminders);
        setCurrentIndex(Math.min(currentIndex, newReminders.length - 1));
      }
    }
  };

  if (!showing || reminders.length === 0) {
    return null;
  }

  const current = reminders[currentIndex];
  const reminderIcon = {
    daily: <Clock size={24} className="text-blue-600" />,
    weekly: <Flame size={24} className="text-orange-600" />,
    monthly: <CheckCircle size={24} className="text-green-600" />,
    achievement: <AlertCircle size={24} className="text-purple-600" />,
  }[current.reminder_type] || <Clock size={24} />;

  const reminderBg = {
    daily: 'from-blue-50 to-blue-100 border-blue-200',
    weekly: 'from-orange-50 to-orange-100 border-orange-200',
    monthly: 'from-green-50 to-green-100 border-green-200',
    achievement: 'from-purple-50 to-purple-100 border-purple-200',
  }[current.reminder_type] || 'from-gray-50 to-gray-100 border-gray-200';

  return (
    <div className="fixed bottom-6 right-6 z-[9999] max-w-sm animate-in slide-in-from-bottom-5 duration-300">
      <div className={`bg-gradient-to-br ${reminderBg} rounded-lg shadow-xl p-6 border`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            {reminderIcon}
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 capitalize">{current.title}</h3>
              <p className="text-sm text-gray-700 mt-1">{current.message}</p>
            </div>
          </div>
          <button
            onClick={dismissReminder}
            className="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <div className="flex gap-2 text-xs">
          <button
            onClick={dismissReminder}
            className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors font-medium"
          >
            Dismiss
          </button>
          <button
            onClick={markAsShown}
            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
          >
            Got it!
          </button>
        </div>

        {reminders.length > 1 && (
          <p className="text-xs text-gray-600 mt-3 text-center">
            {currentIndex + 1} of {reminders.length} reminders
          </p>
        )}
      </div>
    </div>
  );
}
