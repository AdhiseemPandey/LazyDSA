import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { Difficulty, Topic } from '../types';
import { supabase } from '../lib/supabase';

interface AddQuestionModalProps {
  platformName: string;
  onClose: () => void;
  onAdd: (questionNo: string, link: string, description: string, difficulty: Difficulty, topic: string) => void;
}

export default function AddQuestionModal({ platformName, onClose, onAdd }: AddQuestionModalProps) {
  const [questionNo, setQuestionNo] = useState('');
  const [link, setLink] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [topic, setTopic] = useState('');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    const { data } = await supabase
      .from('topics')
      .select('*')
      .order('is_default', { ascending: false })
      .order('name');

    if (data) {
      setTopics(data);
      if (data.length > 0 && !topic) {
        setTopic(data[0].name);
      }
    }
  };

  const handleAddTopic = async () => {
    if (!newTopicName.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('topics')
      .insert([{ name: newTopicName.trim(), user_id: user.id, is_default: false }]);

    if (!error) {
      setNewTopicName('');
      setShowAddTopic(false);
      await loadTopics();
      setTopic(newTopicName.trim());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (questionNo.trim() && link.trim() && description.trim() && topic) {
      onAdd(questionNo.trim(), link.trim(), description.trim(), difficulty, topic);
      setQuestionNo('');
      setLink('');
      setDescription('');
      setDifficulty('medium');
      setTopic(topics[0]?.name || '');
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
            <div className="flex gap-3 flex-wrap">
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
          <div className="mb-4">
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
              Topic
            </label>
            {!showAddTopic ? (
              <div className="flex gap-2">
                <select
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {topics.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name} {t.is_default ? '' : '(Custom)'}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowAddTopic(true)}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  title="Add custom topic"
                >
                  <Plus size={20} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter custom topic"
                />
                <button
                  type="button"
                  onClick={handleAddTopic}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddTopic(false);
                    setNewTopicName('');
                  }}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  <X size={20} />
                </button>
              </div>
            )}
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
