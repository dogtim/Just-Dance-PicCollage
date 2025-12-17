import React, { useEffect, useState } from 'react';
import localPlaylist from '../data/sample_playlist.json';
import { storage } from '@/lib/firebase';
import { ref, getDownloadURL } from 'firebase/storage';

interface SamplePlaylistProps {
    onSelect: (url: string, title: string) => void;
}

interface Video {
    title: string;
    url: string;
    difficulty: string;
}

interface PlaylistData {
    videos: Video[];
}

const SamplePlaylist: React.FC<SamplePlaylistProps> = ({ onSelect }) => {
    const [playlist, setPlaylist] = useState<PlaylistData>(localPlaylist as PlaylistData);
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');

    useEffect(() => {
        const fetchPlaylist = async () => {
            try {
                const url = await getDownloadURL(ref(storage, 'sample_playlist.json'));
                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();
                    setPlaylist(data);
                }
            } catch (error: any) {
                if (error.code === 'storage/unauthorized') {
                    console.warn("⚠️ Firebase Storage Permission Denied. using local playlist fallback. \nTo fix this: Go to Firebase Console > Storage > Rules and allow public read/write.");
                } else {
                    console.log("Using local playlist fallback", error);
                }
            }
        };
        fetchPlaylist();
    }, []);

    // Get unique difficulties and add 'All'
    const difficulties = ['All', ...Array.from(new Set(playlist.videos.map(v => v.difficulty)))];

    const filteredVideos = selectedDifficulty === 'All'
        ? playlist.videos
        : playlist.videos.filter(v => v.difficulty === selectedDifficulty);

    return (
        <div className="w-full max-w-4xl mt-12 bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6 flex flex-col md:flex-row gap-6">
            {/* Left Navigation Panel (Difficulty Filter) */}
            <div className="w-full md:w-1/4 flex flex-col gap-2">
                <h3 className="text-gray-400 font-semibold mb-3 text-xs uppercase tracking-wider">Difficulty</h3>
                {difficulties.map((diff) => (
                    <button
                        key={diff}
                        onClick={() => setSelectedDifficulty(diff)}
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

            {/* Right Content Panel (Filtered Videos) */}
            <div className="flex-1">
                <h3 className="text-gray-400 font-semibold mb-4 text-xs uppercase tracking-wider">
                    {selectedDifficulty === 'All' ? 'All Videos' : `${selectedDifficulty} Videos`}
                </h3>
                <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredVideos.map((video, idx) => {
                        let styleConfig = {
                            color: 'purple',
                            icon: '📱',
                            borderColor: 'hover:border-purple-500/50',
                            bgColor: 'bg-purple-500/10',
                            textColor: 'group-hover:text-purple-400'
                        };

                        if (video.difficulty === 'Medium') {
                            styleConfig = {
                                color: 'pink',
                                icon: '🎵',
                                borderColor: 'hover:border-pink-500/50',
                                bgColor: 'bg-pink-500/10',
                                textColor: 'group-hover:text-pink-400'
                            };
                        } else if (video.difficulty === 'Hard') {
                            styleConfig = {
                                color: 'yellow',
                                icon: '👟',
                                borderColor: 'hover:border-yellow-500/50',
                                bgColor: 'bg-yellow-500/10',
                                textColor: 'group-hover:text-yellow-400'
                            };
                        }

                        const format = video.url.includes('shorts') ? 'YouTube Shorts' : 'Standard Video';

                        return (
                            <button
                                key={`${video.title}-${idx}`}
                                onClick={() => onSelect(video.url, video.title)}
                                className={`flex items-center gap-4 p-4 bg-gray-800/40 hover:bg-gray-800/80 border border-gray-700/50 ${styleConfig.borderColor} rounded-xl transition-all group text-left`}
                            >
                                <div className={`w-10 h-10 rounded-full ${styleConfig.bgColor} flex items-center justify-center text-xl group-hover:scale-110 transition-transform shrink-0`}>
                                    {styleConfig.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className={`font-semibold text-gray-200 ${styleConfig.textColor} transition-colors truncate`}>{video.title}</div>
                                    <div className="text-xs text-gray-500 flex items-center gap-2">
                                        <span>{format}</span>
                                        <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                        <span className={
                                            video.difficulty === 'Easy' ? 'text-purple-400' :
                                                video.difficulty === 'Medium' ? 'text-pink-400' :
                                                    'text-yellow-400'
                                        }>{video.difficulty}</span>
                                    </div>
                                </div>
                                <div className={`text-gray-600 ${styleConfig.textColor} transition-colors text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100`}>
                                    Play
                                </div>
                            </button>
                        );
                    })}
                    {filteredVideos.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            No videos found for this difficulty.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SamplePlaylist;
