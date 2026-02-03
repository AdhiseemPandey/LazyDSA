import { useState, useEffect } from 'react';
import { X, Bookmark, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Question } from '../types';

interface QuestionModalProps {
  question: Question;
  userId: string;
  onClose: () => void;
}

export default function QuestionModal({ question, userId, onClose }: QuestionModalProps) {
  const [note, setNote] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadNoteAndBookmark();
  }, [question.id, userId]);

  const loadNoteAndBookmark = async () => {
    const { data: noteData } = await supabase
      .from('question_notes')
      .select('note_text')
      .eq('question_id', question.id)
      .eq('user_id', userId)
      .maybeSingle();

    if (noteData) {
      setNote(noteData.note_text);
    }

    const { data: bookmarkData } = await supabase
      .from('question_bookmarks')
      .select('id')
      .eq('question_id', question.id)
      .eq('user_id', userId)
      .maybeSingle();

    setIsBookmarked(!!bookmarkData);
  };

  const saveNote = async () => {
    setSaving(true);

    const { data: existing } = await supabase
      .from('question_notes')
      .select('id')
      .eq('question_id', question.id)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('question_notes')
        .update({ note_text: note, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      await supabase.from('question_notes').insert({
        question_id: question.id,
        user_id: userId,
        note_text: note,
      });
    }

    setSaving(false);
  };

  const toggleBookmark = async () => {
    if (isBookmarked) {
      await supabase
        .from('question_bookmarks')
        .delete()
        .eq('question_id', question.id)
        .eq('user_id', userId);
    } else {
      await supabase.from('question_bookmarks').insert({
        question_id: question.id,
        user_id: userId,
      });
    }

    setIsBookmarked(!isBookmarked);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800">Q{question.question_no}: {question.description}</h2>
            <p className="text-sm text-gray-600 mt-2">{question.topic} - {question.difficulty}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <a
            href={question.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm"
          >
            Open Question Link
          </a>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-semibold text-gray-700">Your Notes</label>
            <button
              onClick={toggleBookmark}
              className={`flex items-center gap-1 px-3 py-1 rounded text-sm transition-colors ${
                isBookmarked
                  ? 'bg-yellow-200 text-yellow-800'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {isBookmarked ? (
                <>
                  <Bookmark size={16} />
                  Bookmarked
                </>
              ) : (
                <>
                  <BookmarkOff size={16} />
                  Bookmark
                </>
              )}
            </button>
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add your notes here... (approach, solution hints, tricky parts)"
            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <button
            onClick={saveNote}
            disabled={saving}
            className="mt-3 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Note'}
          </button>
        </div>
      </div>
    </div>
  );
}
