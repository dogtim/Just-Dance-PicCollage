import React from 'react';

interface CustomVideoInputProps {
    url: string;
    setUrl: (url: string) => void;
    onStart: () => void;
}

export const CustomVideoInput: React.FC<CustomVideoInputProps> = ({ url, setUrl, onStart }) => {
    return (
        <div className="flex w-full gap-2 p-2 bg-gray-900 rounded-xl border border-gray-700 shadow-inner focus-within:border-purple-500 transition-colors">
            <input
                type="text"
                placeholder="Paste YouTube URL..."
                className="flex-1 bg-transparent px-4 py-3 outline-none text-base placeholder:text-gray-600 w-full"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && url) {
                        onStart();
                    }
                }}
            />
            <button
                onClick={onStart}
                disabled={!url}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Let's Party
            </button>
        </div>
    );
};
