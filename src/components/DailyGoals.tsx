import { useState, useEffect } from 'react';
import { Plus, X, Check, Target } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DailyGoal {
  id: string;
  goal_date: string;
  target_questions: number;
  completed_questions: number;
  is_completed: boolean;
}

interface DailyGoalsProps {
  userId: string;
  todaysSolvedCount: number;
}

export default function DailyGoals({ userId, todaysSolvedCount }: DailyGoalsProps) {
  const [goal, setGoal] = useState<DailyGoal | null>(null);
  const [loading, setLoading] = useState(true);
  const [targetInput, setTargetInput] = useState('5');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadTodayGoal();
  }, [userId]);

  const loadTodayGoal = async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('goal_date', today)
      .maybeSingle();

    if (!error && data) {
      setGoal(data);
    }
    setLoading(false);
  };

  const createGoal = async () => {
    const target = parseInt(targetInput);
    if (target < 1) return;

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_goals')
      .insert({
        user_id: userId,
        goal_date: today,
        target_questions: target,
        completed_questions: todaysSolvedCount,
        is_completed: todaysSolvedCount >= target,
      })
      .select()
      .single();

    if (!error && data) {
      setGoal(data);
      setShowForm(false);
      setTargetInput('5');
    }
  };

  const updateGoalProgress = async () => {
    if (!goal) return;

    const isNowComplete = todaysSolvedCount >= goal.target_questions;

    const { data, error } = await supabase
      .from('daily_goals')
      .update({
        completed_questions: todaysSolvedCount,
        is_completed: isNowComplete,
        updated_at: new Date().toISOString(),
      })
      .eq('id', goal.id)
      .select()
      .single();

    if (!error && data) {
      setGoal(data);
    }
  };

  const deleteGoal = async () => {
    if (!goal) return;

    await supabase.from('daily_goals').delete().eq('id', goal.id);
    setGoal(null);
    setShowForm(false);
  };

  useEffect(() => {
    if (goal && todaysSolvedCount !== goal.completed_questions) {
      updateGoalProgress();
    }
  }, [todaysSolvedCount]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 animate-pulse">
        <div className="h-24 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!goal && !showForm) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md p-6 border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target size={24} className="text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">Today's Goal</h3>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="p-2 hover:bg-blue-200 rounded-lg transition-colors"
          >
            <Plus size={20} className="text-blue-600" />
          </button>
        </div>
        <p className="text-blue-700 text-sm">Set a daily goal to stay motivated!</p>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border-2 border-blue-200">
        <div className="flex items-center gap-2 mb-4">
          <Target size={24} className="text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Set Daily Goal</h3>
        </div>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Questions to Solve
            </label>
            <input
              type="number"
              min="1"
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="5"
            />
          </div>
          <button
            onClick={createGoal}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Set Goal
          </button>
          <button
            onClick={() => setShowForm(false)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  const progress = (goal.completed_questions / goal.target_questions) * 100;
  const isComplete = goal.is_completed;

  return (
    <div
      className={`rounded-lg shadow-md p-6 border-2 ${
        isComplete
          ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
          : 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <Check size={24} className="text-green-600" />
          ) : (
            <Target size={24} className="text-orange-600" />
          )}
          <h3 className={`text-lg font-semibold ${isComplete ? 'text-green-900' : 'text-orange-900'}`}>
            Today's Goal
          </h3>
        </div>
        {!isComplete && (
          <button
            onClick={deleteGoal}
            className="p-2 hover:bg-red-200 rounded-lg transition-colors"
          >
            <X size={18} className="text-red-600" />
          </button>
        )}
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-baseline mb-2">
          <span
            className={`text-2xl font-bold ${
              isComplete ? 'text-green-600' : 'text-orange-600'
            }`}
          >
            {goal.completed_questions}/{goal.target_questions}
          </span>
          <span className={`text-sm font-medium ${isComplete ? 'text-green-700' : 'text-orange-700'}`}>
            {Math.round(progress)}%
          </span>
        </div>
        <div className={`w-full rounded-full h-3 ${isComplete ? 'bg-green-200' : 'bg-orange-200'}`}>
          <div
            className={`h-3 rounded-full transition-all ${
              isComplete ? 'bg-green-500' : 'bg-orange-500'
            }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {isComplete && (
        <div className="text-center">
          <p className="text-green-700 font-semibold text-sm">Goal Achieved!</p>
        </div>
      )}
      {!isComplete && (
        <p className={`text-sm ${goal.target_questions - goal.completed_questions === 1 ? 'text-orange-700 font-semibold' : 'text-orange-600'}`}>
          {goal.target_questions - goal.completed_questions} question{goal.target_questions - goal.completed_questions !== 1 ? 's' : ''} to go!
        </p>
      )}
    </div>
  );
}
