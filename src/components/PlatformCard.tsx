import { Trash2 } from 'lucide-react';
import { Platform } from '../types';

interface PlatformCardProps {
  platform: Platform;
  questionCount: number;
  onSelect: () => void;
  onDelete: () => void;
}

export default function PlatformCard({ platform, questionCount, onSelect, onDelete }: PlatformCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
      <div className="flex justify-between items-start mb-4">
        <h3 onClick={onSelect} className="text-xl font-bold text-gray-800 flex-1">{platform.name}</h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-red-500 hover:text-red-700 transition-colors"
          aria-label="Delete platform"
        >
          <Trash2 size={20} />
        </button>
      </div>
      <div onClick={onSelect} className="flex-1">
        <p className="text-gray-600">{questionCount} question{questionCount !== 1 ? 's' : ''}</p>
      </div>
    </div>
  );
}
