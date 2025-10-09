import { useState } from 'react';
import { X } from 'lucide-react';
import { Difficulty } from '../types';

interface AddQuestionModalProps {
  platformName: string;
  onClose: () => void;
  onAdd: (questionNo: string, link: string, description: string, difficulty: Difficulty) => void;
}

export default function AddQuestionModal({ platformName, onClose, onAdd }: AddQuestionModalProps) {
  const [questionNo, setQuestionNo] = useState('');
  const [link, setLink] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (questionNo.trim() && link.trim() && description.trim()) {
      onAdd(questionNo.trim(), link.trim(), description.trim(), difficulty);
      setQuestionNo('');
      setLink('');
      setDescription('');
      setDifficulty('medium');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Add Question to {platformName}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="question-no" className="block text-sm font-medium text-gray-700 mb-2">
              Question Number
            </label>
            <input
              id="question-no"
              type="text"
              value={questionNo}
              onChange={(e) => setQuestionNo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 1, 42, 1567"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="question-link" className="block text-sm font-medium text-gray-700 mb-2">
              Question Link
            </label>
            <input
              id="question-link"
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://..."
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description of the problem"
              rows={3}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty
            </label>
            <div className="flex gap-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="easy"
                  checked={difficulty === 'easy'}
                  onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                  className="mr-2"
                />
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Easy</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="medium"
                  checked={difficulty === 'medium'}
                  onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                  className="mr-2"
                />
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">Medium</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="hard"
                  checked={difficulty === 'hard'}
                  onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                  className="mr-2"
                />
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">Hard</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Question
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
