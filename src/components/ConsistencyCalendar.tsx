import { Calendar, Flame } from 'lucide-react';
import { Question } from '../types';

interface ConsistencyCalendarProps {
  questions: Question[];
}

export default function ConsistencyCalendar({ questions }: ConsistencyCalendarProps) {
  const getSolvedDates = () => {
    const dateMap = new Map<string, number>();
    questions.forEach(q => {
      if (q.solved) {
        const date = new Date(q.solved_at || q.created_at).toDateString();
        dateMap.set(date, (dateMap.get(date) || 0) + 1);
      }
    });
    return dateMap;
  };

  const calculateStreak = () => {
    const solvedQuestions = questions.filter(q => q.solved);
    if (solvedQuestions.length === 0) return { current: 0, longest: 0 };

    const dateMap = new Map<string, boolean>();
    solvedQuestions.forEach(q => {
      const date = new Date(q.solved_at || q.created_at).toDateString();
      dateMap.set(date, true);
    });

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let currentDate = new Date();

    for (let i = 0; i < 365; i++) {
      const dateStr = currentDate.toDateString();
      if (dateMap.has(dateStr)) {
        tempStreak++;
        currentStreak = tempStreak;
      } else if (i === 0) {
        currentStreak = 0;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 0;
      }
      currentDate.setDate(currentDate.getDate() - 1);
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return { current: currentStreak, longest: longestStreak };
  };

  const getCalendarDays = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const solvedDates = getSolvedDates();
    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: null, count: 0 });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toDateString();
      const count = solvedDates.get(dateStr) || 0;
      days.push({ date: day, count, dateStr });
    }

    return days;
  };

  const streak = calculateStreak();
  const calendarDays = getCalendarDays();
  const monthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const getIntensityColor = (count: number) => {
    if (count === 0) return 'bg-gray-100';
    if (count === 1) return 'bg-blue-200';
    if (count === 2) return 'bg-blue-400';
    if (count === 3) return 'bg-blue-600';
    return 'bg-blue-800';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar size={24} className="text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">Consistency Tracker</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="flex items-center gap-1 mb-1">
              <Flame size={18} className="text-orange-500" />
              <span className="text-2xl font-bold text-orange-500">{streak.current}</span>
            </div>
            <p className="text-xs text-gray-600">Day Streak</p>
          </div>
        </div>
      </div>

      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-blue-600 font-semibold">Current Streak</p>
            <p className="text-3xl font-bold text-blue-800">{streak.current}</p>
          </div>
          <div>
            <p className="text-sm text-blue-600 font-semibold">Longest Streak</p>
            <p className="text-3xl font-bold text-blue-800">{streak.longest}</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">{monthName}</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-semibold text-gray-600 h-6 flex items-center justify-center">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, i) => (
              <div key={i} className="aspect-square">
                {day.date ? (
                  <div
                    title={day.count > 0 ? `${day.count} problems solved` : 'No activity'}
                    className={`w-full h-full rounded flex items-center justify-center text-xs font-semibold cursor-default transition-all ${getIntensityColor(day.count)} ${
                      day.count > 0 ? 'text-white' : 'text-gray-500'
                    }`}
                  >
                    {day.date}
                  </div>
                ) : (
                  <div className="w-full h-full"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs">
        <span className="text-gray-600">Less</span>
        <div className="flex gap-1">
          {['bg-gray-100', 'bg-blue-200', 'bg-blue-400', 'bg-blue-600', 'bg-blue-800'].map((color, i) => (
            <div key={i} className={`w-4 h-4 rounded ${color}`}></div>
          ))}
        </div>
        <span className="text-gray-600">More</span>
      </div>
    </div>
  );
}
