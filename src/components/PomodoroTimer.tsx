import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, X } from 'lucide-react';

interface PomodoroTimerProps {
  onClose: () => void;
}

export default function PomodoroTimer({ onClose }: PomodoroTimerProps) {
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isWorkSession, setIsWorkSession] = useState(true);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          if (prev === 0) {
            const minutesToUse = isWorkSession ? workMinutes : breakMinutes;
            if (minutesToUse === 0) return 0;

            if (isWorkSession) {
              setSessionsCompleted((s) => s + 1);
            }
            setIsWorkSession(!isWorkSession);
            return (minutesToUse - 1) * 60;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, isWorkSession, workMinutes, breakMinutes]);

  const totalSeconds = (isWorkSession ? workMinutes : breakMinutes) * 60;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const progress = ((totalSeconds - seconds) / totalSeconds) * 100;

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setSeconds(0);
    setIsWorkSession(true);
    setSessionsCompleted(0);
  };

  const skipSession = () => {
    setSeconds(0);
    setIsWorkSession(!isWorkSession);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Pomodoro Timer</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <div className="mb-8">
          <div className="relative w-48 h-48 mx-auto mb-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                fill="none"
                stroke={isWorkSession ? '#3b82f6' : '#10b981'}
                strokeWidth="8"
                strokeDasharray={`${(progress / 100) * 552.92} 552.92`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-4xl font-mono font-bold text-gray-800">
                {minutes.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
              </div>
              <div className={`text-sm font-medium mt-2 ${isWorkSession ? 'text-blue-600' : 'text-green-600'}`}>
                {isWorkSession ? 'Focus Time' : 'Break Time'}
              </div>
            </div>
          </div>

          <div className="text-center mb-6 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Sessions Completed: <span className="font-bold text-lg text-blue-600">{sessionsCompleted}</span>
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Work (min)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={workMinutes}
                onChange={(e) => setWorkMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                disabled={isRunning}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Break (min)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={breakMinutes}
                onChange={(e) => setBreakMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                disabled={isRunning}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mb-4">
          <button
            onClick={toggleTimer}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors text-white ${
              isRunning
                ? 'bg-orange-500 hover:bg-orange-600'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isRunning ? (
              <>
                <Pause size={20} />
                Pause
              </>
            ) : (
              <>
                <Play size={20} />
                Start
              </>
            )}
          </button>

          <button
            onClick={skipSession}
            disabled={!isRunning}
            className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 font-medium"
          >
            Skip
          </button>

          <button
            onClick={resetTimer}
            className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <RotateCcw size={20} />
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          Close
        </button>
      </div>
    </div>
  );
}
