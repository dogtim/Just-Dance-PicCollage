import React from 'react';

interface AppHeaderProps {
    userName: string | null;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ userName }) => {
    return (
        <header className="p-6 flex justify-between items-center border-b border-gray-800/50 bg-black/30 backdrop-blur-md sticky top-0 z-50 w-full">
            <div className="flex items-center gap-2">
                <span className="text-4xl">🕺</span>
                <div className="flex flex-col">
                    <h1 className="text-3xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 hover:scale-105 transition-transform cursor-default">
                        JUST DANCE FOR EVERYONE
                    </h1>
                    {userName && <span className="text-xs text-gray-400 font-mono tracking-wide">Hi, {userName}</span>}
                </div>
            </div>

            <div className="flex items-center gap-4">
                <a href="/danceLoop" className="p-2 bg-gray-800/80 rounded-full hover:bg-gray-700 transition-colors border border-gray-700 text-xl backdrop-blur-sm" title="Dance Loop">
                    🔁
                </a>
                <a href="/setting" className="p-2 bg-gray-800/80 rounded-full hover:bg-gray-700 transition-colors border border-gray-700 text-xl backdrop-blur-sm" title="Settings">
                    ⚙️
                </a>
            </div>
        </header>
    );
};
