import { useState, useEffect } from 'react';
import { Plus, LogOut, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Platform {
  id: string;
  name: string;
}

export default function PopupApp() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [todaysSolved, setTodaysSolved] = useState(0);
  const [totalSolved, setTotalSolved] = useState(0);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [questionNo, setQuestionNo] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) loadData(session.user.id);
    });
  }, []);

  const loadData = async (userId: string) => {
    const [platformsRes, questionsRes] = await Promise.all([
      supabase.from('platforms').select('*').eq('user_id', userId),
      supabase.from('questions').select('*').eq('user_id', userId),
    ]);

    if (platformsRes.data) setPlatforms(platformsRes.data);
    if (questionsRes.data) {
      const today = new Date().toDateString();
      const todayCount = questionsRes.data.filter(
        (q: any) => q.solved && new Date(q.solved_at || q.created_at).toDateString() === today
      ).length;
      setTodaysSolved(todayCount);
      setTotalSolved(questionsRes.data.filter((q: any) => q.solved).length);
    }
  };

  const handleQuickAdd = async () => {
    if (!user || !selectedPlatform || !questionNo) return;
    await supabase.from('questions').insert([
      { user_id: user.id, platform_id: selectedPlatform, question_no: questionNo, difficulty: 'medium', solved: false },
    ]);
    setQuestionNo('');
    setSelectedPlatform('');
    setShowQuickAdd(false);
    loadData(user.id);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.close();
  };

  const openFullApp = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-600">Loading...</div></div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Sign in to lazyDSA</h2>
          <button onClick={openFullApp} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Open Full App
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-800">lazyDSA</h1>
          <button onClick={handleSignOut} className="p-2 hover:bg-gray-100 rounded-lg" title="Sign out">
            <LogOut size={16} className="text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{todaysSolved}</div>
            <div className="text-xs text-gray-600">Today</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{totalSolved}</div>
            <div className="text-xs text-gray-600">Total Solved</div>
          </div>
        </div>

        {showQuickAdd ? (
          <div className="bg-white rounded-lg shadow-md p-4 space-y-3">
            <h3 className="font-semibold text-gray-800">Quick Add</h3>
            <select value={selectedPlatform} onChange={(e) => setSelectedPlatform(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="">Select Platform</option>
              {platforms.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Question Number"
              value={questionNo}
              onChange={(e) => setQuestionNo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <div className="flex gap-2">
              <button onClick={handleQuickAdd} className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                Add
              </button>
              <button onClick={() => setShowQuickAdd(false)} className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowQuickAdd(true)} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium">
            <Plus size={18} />
            Quick Add Question
          </button>
        )}

        <button onClick={openFullApp} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
          <ExternalLink size={16} />
          Open Full App
        </button>
      </div>
    </div>
  );
}
