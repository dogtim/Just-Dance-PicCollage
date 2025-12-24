import React from 'react';

interface PlaylistSidebarProps {
    difficulties: string[];
    selectedDifficulty: string;
    onSelectDifficulty: (difficulty: string) => void;
}

export const PlaylistSidebar: React.FC<PlaylistSidebarProps> = ({
    difficulties,
    selectedDifficulty,
    onSelectDifficulty
}) => {
    return (
        <div className="w-full md:w-48 flex flex-col gap-2 shrink-0">
            <h3 className="text-gray-500 font-bold text-[10px] uppercase tracking-widest px-4 mb-2">Category</h3>
            {difficulties.map(diff => (
                <button
                    key={diff}
                    onClick={() => onSelectDifficulty(diff)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium text-sm
                        ${selectedDifficulty === diff
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                        }`}
                >
                    {diff}
                </button>
            ))}
        </div>
    );
};
