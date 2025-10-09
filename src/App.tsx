import { useState } from 'react';
import { Plus, Code2 } from 'lucide-react';
import { Platform, Question, Difficulty } from './types';
import PlatformCard from './components/PlatformCard';
import AddPlatformModal from './components/AddPlatformModal';
import QuestionList from './components/QuestionList';
import AddQuestionModal from './components/AddQuestionModal';

function App() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showAddPlatform, setShowAddPlatform] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);

  const handleAddPlatform = (name: string) => {
    const newPlatform: Platform = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date(),
    };
    setPlatforms([...platforms, newPlatform]);
    setShowAddPlatform(false);
  };

  const handleDeletePlatform = (id: string) => {
    setPlatforms(platforms.filter(p => p.id !== id));
    setQuestions(questions.filter(q => q.platformId !== id));
    if (selectedPlatform?.id === id) {
      setSelectedPlatform(null);
    }
  };

  const handleAddQuestion = (questionNo: string, link: string, description: string, difficulty: Difficulty) => {
    if (!selectedPlatform) return;

    const newQuestion: Question = {
      id: crypto.randomUUID(),
      platformId: selectedPlatform.id,
      questionNo,
      link,
      description,
      difficulty,
      solved: false,
      createdAt: new Date(),
    };
    setQuestions([...questions, newQuestion]);
    setShowAddQuestion(false);
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleToggleSolved = (id: string) => {
    setQuestions(questions.map(q =>
      q.id === id ? { ...q, solved: !q.solved } : q
    ));
  };

  const getQuestionCount = (platformId: string) => {
    return questions.filter(q => q.platformId === platformId).length;
  };

  const getPlatformQuestions = (platformId: string) => {
    return questions.filter(q => q.platformId === platformId);
  };

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
            <h1 className="text-4xl font-bold text-gray-800">Question Tracker</h1>
          </div>
          <p className="text-gray-600 text-lg">Track your coding practice across multiple platforms</p>
        </div>

        <div className="mb-6 flex justify-end">
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
