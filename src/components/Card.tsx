import React from 'react';

interface CardProps {
  title: string;
  description: string;
  onView: () => void;
}

export const Card: React.FC<CardProps> = ({ title, description, onView }) => {
  return (
    <div className="bg-gray-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6 transition-all hover:border-blue-500/50">
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm mb-4">{description}</p>
      <button
        onClick={onView}
        className="w-full py-2 px-4 rounded-lg font-semibold text-white bg-blue-600/50 hover:bg-blue-600 transition-all"
        aria-label={`View details for ${title}`}
      >
        View
      </button>
    </div>
  );
};
