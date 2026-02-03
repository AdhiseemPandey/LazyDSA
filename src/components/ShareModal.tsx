import { useState, useEffect } from 'react';
import { X, Send, Loader, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Share {
  id: string;
  shared_with_email: string;
  access_level: string;
  created_at: string;
}

interface ShareModalProps {
  userId: string;
  userEmail: string;
  onClose: () => void;
}

export default function ShareModal({ userId, userEmail, onClose }: ShareModalProps) {
  const [email, setEmail] = useState('');
  const [accessLevel, setAccessLevel] = useState<'view' | 'edit'>('view');
  const [shares, setShares] = useState<Share[]>([]);
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadShares();
  }, [userId]);

  const loadShares = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('shared_progress')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (data) setShares(data);
    setLoading(false);
  };

  const shareProgress = async () => {
    if (!email.trim()) {
      setError('Please enter an email');
      return;
    }

    if (email === userEmail) {
      setError('Cannot share with yourself');
      return;
    }

    setSharing(true);
    setError('');

    const { error: err } = await supabase.from('shared_progress').insert({
      owner_id: userId,
      shared_with_email: email,
      access_level: accessLevel,
    });

    if (err) {
      setError(err.message);
    } else {
      setEmail('');
      setAccessLevel('view');
      loadShares();
    }

    setSharing(false);
  };

  const removeShare = async (id: string) => {
    await supabase.from('shared_progress').delete().eq('id', id);
    loadShares();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Share Progress</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            Your Email: <span className="font-semibold">{userEmail}</span>
          </p>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Share with Friend</h3>

          {error && (
            <div className="mb-3 p-2 bg-red-100 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <div className="space-y-3 mb-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="friend@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />

            <select
              value={accessLevel}
              onChange={(e) => setAccessLevel(e.target.value as 'view' | 'edit')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="view">View Only</option>
              <option value="edit">Can Edit</option>
            </select>

            <button
              onClick={shareProgress}
              disabled={sharing}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 text-sm"
            >
              {sharing ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Sharing...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Send Invite
                </>
              )}
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Shared With</h3>
          {loading ? (
            <div className="text-center py-4">
              <Loader size={20} className="animate-spin mx-auto text-gray-400" />
            </div>
          ) : shares.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">Not shared with anyone yet</p>
          ) : (
            <div className="space-y-2">
              {shares.map(share => (
                <div key={share.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{share.shared_with_email}</p>
                    <p className="text-xs text-gray-500 capitalize">{share.access_level} access</p>
                  </div>
                  <button
                    onClick={() => removeShare(share.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
