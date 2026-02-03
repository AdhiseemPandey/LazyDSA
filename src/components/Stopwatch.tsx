import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Save, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Question } from '../types';

interface StopwatchProps {
  question: Question;
  userId: string;
  onClose: () => void;
  onSave: () => void;
}

export default function Stopwatch({ question, userId, onClose, onSave }: StopwatchProps) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    startSession();

    return () => {
      if (isRunning) {
        setIsRunning(false);
      }
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning]);

  const startSession = async () => {
    const { data, error } = await supabase
      .from('question_sessions')
      .insert({
        question_id: question.id,
        user_id: userId,
        time_spent_seconds: 0,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (!error && data) {
      setSessionId(data.id);
      setIsRunning(true);
    }
  };

  const saveSession = async () => {
    if (!sessionId) return;

    setSaving(true);
    const { error } = await supabase
      .from('question_sessions')
      .update({
        time_spent_seconds: seconds,
        ended_at: new Date().toISOString(),
      })
      .eq('id', sessionId);

    if (!error) {
      onSave();
      onClose();
    }
    setSaving(false);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setSeconds(0);
    setIsRunning(false);
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800">Question #{question.question_no}</h3>
            <p className="text-sm text-gray-600 mt-1 truncate">{question.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-8 mb-6 border border-blue-200">
          <div className="text-center">
            <div className="text-5xl font-mono font-bold text-blue-600 mb-4">
              {formatTime(seconds)}
            </div>
            <p className="text-sm text-blue-700">Time Spent</p>
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <button
            onClick={toggleTimer}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors ${
              isRunning
                ? 'bg-orange-500 text-white hover:bg-orange-600'
                : 'bg-blue-600 text-white hover:bg-blue-700'
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
                {seconds === 0 ? 'Start' : 'Resume'}
              </>
            )}
          </button>

          <button
            onClick={resetTimer}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <RotateCcw size={20} />
          </button>
        </div>

        <button
          onClick={saveSession}
          disabled={saving || seconds === 0}
          className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
        >
          <Save size={20} />
          {saving ? 'Saving...' : 'Save Session'}
        </button>
      </div>
    </div>
  );
}
