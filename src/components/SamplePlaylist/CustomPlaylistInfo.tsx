import React from 'react';

export const CustomPlaylistInfo: React.FC = () => {
    return (
        <div className="flex flex-col items-center gap-6">
            <p className="text-lg font-medium text-gray-300">Upload a JSON playlist to see videos here.</p>
            <div className="w-full max-w-lg bg-gray-950 rounded-xl p-5 text-left overflow-x-auto border border-gray-800 shadow-2xl">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Example Format (playlist.json)</p>
                    <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-1 rounded">JSON</span>
                </div>
                <pre className="text-xs text-blue-300 font-mono leading-relaxed p-2">
                    {`{
    "playlist_title": "Tim's Pack",
    "description": "Young Forty",
    "videos": [
        {
            "title": "GANGNAM STYLE",
            "url": "https://www.youtube.com/shorts/52fgfXjW2rA",
            "difficulty": "Easy"
        },
        {
            "title": "YOONA - HOOT Dance Challenge",
            "url": "https://www.youtube.com/shorts/PymXEYUh9tI",
            "difficulty": "Medium"
        },
        {
            "title": "Mr. Simple - Super Junior by Yumi",
            "url": "https://www.youtube.com/shorts/aF5TlYE_JH4",
            "difficulty": "Medium"
        }
    ]
}`}
                </pre>
            </div>
        </div>
    );
};
