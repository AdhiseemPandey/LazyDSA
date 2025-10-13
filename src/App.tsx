import { useState, useEffect } from 'react';
import { Plus, Code2, LogOut, BarChart3 } from 'lucide-react';
import { Platform, Question, Difficulty } from './types';
import { supabase } from './lib/supabase';
import PlatformCard from './components/PlatformCard';
import AddPlatformModal from './components/AddPlatformModal';
import QuestionList from './components/QuestionList';
import AddQuestionModal from './components/AddQuestionModal';
import Analytics from './components/Analytics';
import Auth from './components/Auth';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showAddPlatform, setShowAddPlatform] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadPlatforms();
      loadQuestions();
    } else {
      setPlatforms([]);
      setQuestions([]);
      setSelectedPlatform(null);
    }
  }, [user]);

  const loadPlatforms = async () => {
    const { data } = await supabase
      .from('platforms')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setPlatforms(data);
  };

  const loadQuestions = async () => {
    const { data } = await supabase
      .from('questions')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setQuestions(data);
  };

  const handleAddPlatform = async (name: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('platforms')
      .insert([{ name, user_id: user.id }])
      .select()
      .single();

    if (!error && data) {
      setPlatforms([data, ...platforms]);
      setShowAddPlatform(false);
    }
  };

  const handleDeletePlatform = async (id: string) => {
    await supabase.from('platforms').delete().eq('id', id);
    setPlatforms(platforms.filter(p => p.id !== id));
    setQuestions(questions.filter(q => q.platform_id !== id));
    if (selectedPlatform?.id === id) {
      setSelectedPlatform(null);
    }
  };

  const handleAddQuestion = async (
    questionNo: string,
    link: string,
    description: string,
    difficulty: Difficulty,
    topic: string
  ) => {
    if (!selectedPlatform || !user) return;

    const { data, error } = await supabase
      .from('questions')
      .insert([{
        platform_id: selectedPlatform.id,
        user_id: user.id,
        question_no: questionNo,
        link,
        description,
        difficulty,
        topic,
        solved: false,
      }])
      .select()
      .single();

    if (!error && data) {
      setQuestions([data, ...questions]);
      setShowAddQuestion(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    await supabase.from('questions').delete().eq('id', id);
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleToggleSolved = async (id: string) => {
    const question = questions.find(q => q.id === id);
    if (!question) return;

    const { data, error } = await supabase
      .from('questions')
      .update({ solved: !question.solved })
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      setQuestions(questions.map(q => q.id === id ? data : q));
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const getQuestionCount = (platformId: string) => {
    return questions.filter(q => q.platform_id === platformId).length;
  };

  const getPlatformQuestions = (platformId: string) => {
    return questions.filter(q => q.platform_id === platformId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  if (showAnalytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
        <Analytics questions={questions} onBack={() => setShowAnalytics(false)} />
      </div>
    );
  }

  if (selectedPlatform) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
        <QuestionList
          platform={selectedPlatform}
          questions={getPlatformQuestions(selectedPlatform.id)}
          onBack={() => setSelectedPlatform(null)}
          onAddQuestion={() => setShowAddQuestion(true)}
          onDeleteQuestion={handleDeleteQuestion}
          onToggleSolved={handleToggleSolved}
        />
        {showAddQuestion && (
          <AddQuestionModal
            platformName={selectedPlatform.name}
            onClose={() => setShowAddQuestion(false)}
            onAdd={handleAddQuestion}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Code2 size={40} className="text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-800">lazyDSA</h1>
          </div>
          <p className="text-gray-600 text-sm">by Adhiseem</p>
          <p className="text-gray-500 mt-1">Track your coding practice across multiple platforms</p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <span className="text-sm text-gray-600">{user.email}</span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => setShowAnalytics(true)}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
          >
            <BarChart3 size={20} />
            View Analytics
          </button>
          <button
            onClick={() => setShowAddPlatform(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <Plus size={20} />
            Add Platform
          </button>
        </div>

        {platforms.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Code2 size={64} className="mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No Platforms Yet</h2>
            <p className="text-gray-500 mb-6">Start by adding a platform like LeetCode or Codeforces</p>
            <button
              onClick={() => setShowAddPlatform(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Platform
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platforms.map((platform) => (
              <PlatformCard
                key={platform.id}
                platform={platform}
                questionCount={getQuestionCount(platform.id)}
                onSelect={() => setSelectedPlatform(platform)}
                onDelete={() => handleDeletePlatform(platform.id)}
              />
            ))}
          </div>
        )}
      </div>

      {showAddPlatform && (
        <AddPlatformModal
          onClose={() => setShowAddPlatform(false)}
          onAdd={handleAddPlatform}
        />
      )}
    </div>
  );
}

export default App;
