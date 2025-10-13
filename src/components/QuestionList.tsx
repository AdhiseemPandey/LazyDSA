import { useState } from 'react';
import { ExternalLink, Trash2, ArrowLeft, Plus, CheckCircle2, Circle, Filter } from 'lucide-react';
import { Question, Platform, Difficulty } from '../types';

interface QuestionListProps {
  platform: Platform;
  questions: Question[];
  onBack: () => void;
  onAddQuestion: () => void;
  onDeleteQuestion: (id: string) => void;
  onToggleSolved: (id: string) => void;
}

export default function QuestionList({
  platform,
  questions,
  onBack,
  onAddQuestion,
  onDeleteQuestion,
  onToggleSolved
}: QuestionListProps) {
  const [filterDifficulty, setFilterDifficulty] = useState<Difficulty | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'solved' | 'unsolved'>('all');

  const filteredQuestions = questions.filter(q => {
    const matchesDifficulty = filterDifficulty === 'all' || q.difficulty === filterDifficulty;
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'solved' && q.solved) ||
      (filterStatus === 'unsolved' && !q.solved);
    return matchesDifficulty && matchesStatus;
  });

  const getDifficultyBadge = (difficulty: Difficulty) => {
    const styles = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${styles[difficulty]}`}>
        {difficulty}
      </span>
    );
  };

  const stats = {
    total: questions.length,
    solved: questions.filter(q => q.solved).length,
    easy: questions.filter(q => q.difficulty === 'easy').length,
    medium: questions.filter(q => q.difficulty === 'medium').length,
    hard: questions.filter(q => q.difficulty === 'hard').length,
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Platforms</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-800">{platform.name}</h1>
        </div>
        <button
          onClick={onAddQuestion}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Question
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-600 text-sm">Total</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-600 text-sm">Solved</p>
          <p className="text-2xl font-bold text-green-600">{stats.solved}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-600 text-sm">Easy</p>
          <p className="text-2xl font-bold text-green-600">{stats.easy}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-600 text-sm">Medium</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.medium}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-600 text-sm">Hard</p>
          <p className="text-2xl font-bold text-red-600">{stats.hard}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-600" />
            <span className="font-medium text-gray-700">Filters:</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Difficulty:</span>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value as Difficulty | 'all')}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'solved' | 'unsolved')}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="solved">Solved</option>
              <option value="unsolved">Unsolved</option>
            </select>
          </div>
        </div>
      </div>

      {questions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">No questions added yet</p>
          <button
            onClick={onAddQuestion}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Your First Question
          </button>
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg">No questions match the selected filters</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Topic
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Difficulty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Link
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredQuestions.map((question) => (
                <tr key={question.id} className={`hover:bg-gray-50 transition-colors ${question.solved ? 'bg-green-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => onToggleSolved(question.id)}
                      className="focus:outline-none"
                      aria-label={question.solved ? 'Mark as unsolved' : 'Mark as solved'}
                    >
                      {question.solved ? (
                        <CheckCircle2 size={24} className="text-green-600" />
                      ) : (
                        <Circle size={24} className="text-gray-400" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {question.questionNo}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 max-w-md">
                    {question.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {question.topic}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getDifficultyBadge(question.difficulty)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    <a
                      href={question.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Open
                      <ExternalLink size={16} />
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      onClick={() => onDeleteQuestion(question.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      aria-label="Delete question"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
