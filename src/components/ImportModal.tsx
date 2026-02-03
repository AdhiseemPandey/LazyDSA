import { useState } from 'react';
import { X, Upload, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Platform } from '../types';

interface ImportModalProps {
  platformId: string;
  platforms: Platform[];
  userId: string;
  onClose: () => void;
  onImport: () => void;
}

export default function ImportModal({ platformId, platforms, userId, onClose, onImport }: ImportModalProps) {
  const [link, setLink] = useState('');
  const [description, setDescription] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const platform = platforms.find(p => p.id === platformId);

  const extractQueueNo = (url: string): number => {
    const patterns = [
      /(?:leetcode|problems)\/(\d+)/,
      /problems\/(\d+)/,
      /\?id=(\d+)/,
      /\/(\d{4,5})/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return parseInt(match[1]);
    }
    return Math.floor(Math.random() * 10000);
  };

  const handleImport = async () => {
    if (!link.trim()) {
      setError('Please enter a link');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const queueNo = extractQueueNo(link);

      const { error: importError } = await supabase.from('question_imports').insert({
        user_id: userId,
        platform_id: platformId,
        original_url: link,
        imported_from: platform?.name || 'Unknown',
      });

      if (importError) throw importError;

      const { error: questionError } = await supabase.from('questions').insert({
        platform_id: platformId,
        user_id: userId,
        question_no: queueNo,
        description: description || 'Imported Question',
        topic: topic || 'Other',
        difficulty,
        link,
        solved: false,
      });

      if (questionError) throw questionError;

      onImport();
      onClose();
      setLink('');
      setDescription('');
      setTopic('');
      setDifficulty('medium');
    } catch (err: any) {
      setError(err.message || 'Failed to import question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Import Question</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        {platform && (
          <p className="text-sm text-gray-600 mb-4">Adding to: <span className="font-semibold">{platform.name}</span></p>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Link *
            </label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://leetcode.com/problems/..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Problem title or description"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Arrays, Graphs, DP"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Import
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
