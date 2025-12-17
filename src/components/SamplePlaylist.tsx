import React, { useEffect, useState, useRef } from 'react';
import localPlaylist from '../data/sample_playlist.json';
import { storage } from '@/lib/firebase';
import { ref, getDownloadURL } from 'firebase/storage';
import { getLibrary, LibraryItem } from '../utils/userLibrary';

interface SamplePlaylistProps {
    onSelect: (url: string, title: string) => void;
}

interface Video {
    title: string;
    url: string;
    difficulty: string;
    isCustom?: boolean;
}

interface PlaylistData {
    videos: Video[];
}

// Module-level cache to persist state across component remounts
let cachedPlaylist: PlaylistData | null = null;

const SamplePlaylist: React.FC<SamplePlaylistProps> = ({ onSelect }) => {
    const [playlist, setPlaylist] = useState<PlaylistData>(cachedPlaylist || (localPlaylist as PlaylistData));
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
    const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setLibraryItems(getLibrary());
    }, []);

    useEffect(() => {
        // If we already have a cached playlist (from previous upload or fetch), don't refetch
        if (cachedPlaylist) return;

        const fetchPlaylist = async () => {
            try {
                const url = await getDownloadURL(ref(storage, 'sample_playlist.json'));
                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();
                    setPlaylist(data);
                    cachedPlaylist = data; // Update cache
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

    // Get unique difficulties and add 'All' and 'Custom Made'
    const difficulties = ['All', ...Array.from(new Set(playlist.videos.map(v => v.difficulty))), 'Custom Made', 'My Library'];

    let filteredVideos: Video[] = [];
    if (selectedDifficulty === 'All') {
        filteredVideos = playlist.videos;
    } else if (selectedDifficulty === 'Custom Made') {
        filteredVideos = playlist.videos.filter(v => v.isCustom);
    } else if (selectedDifficulty === 'My Library') {
        filteredVideos = libraryItems.map(item => ({
            title: item.title,
            url: item.originalUrl,
            difficulty: 'Custom',
            isCustom: true
        }));
    } else {
        filteredVideos = playlist.videos.filter(v => v.difficulty === selectedDifficulty);
    }

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const customData = JSON.parse(content);

                if (customData.videos && Array.isArray(customData.videos)) {
                    const newVideos = customData.videos.map((v: Video) => ({
                        ...v,
                        isCustom: true
                    }));

                    setPlaylist(prev => {
                        const newState = {
                            ...prev,
                            videos: [...prev.videos, ...newVideos]
                        };
                        cachedPlaylist = newState; // Update cache
                        return newState;
                    });
                }
            } catch (error) {
                console.error("Error parsing custom playlist:", error);
                alert("Invalid JSON file");
            }
        };
        reader.readAsText(file);

        // Reset input value to allow uploading same file again
        if (event.target) {
            event.target.value = '';
        }
    };

    return (
        <div className="w-full max-w-4xl md:min-w-[800px] mt-12 bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6 flex flex-col md:flex-row gap-6">
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
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-gray-400 font-semibold text-xs uppercase tracking-wider">
                        {selectedDifficulty === 'All' ? 'All Videos' : `${selectedDifficulty} Videos`}
                    </h3>
                    {selectedDifficulty === 'Custom Made' && (
                        <div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                accept=".json"
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors"
                            >
                                Upload Playlist
                            </button>
                        </div>
                    )}
                </div>

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
                                        {video.isCustom && (
                                            <>
                                                <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                                <span className="text-blue-400">Custom</span>
                                            </>
                                        )}
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
                            {selectedDifficulty === 'My Library' ? (
                                <p>No videos in your library yet. Play a custom video to save it here!</p>
                            ) : selectedDifficulty === 'Custom Made' ? (
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
        },
    ]
}`}
                                        </pre>
                                    </div>
                                </div>
                            ) : (
                                'No videos found for this difficulty.'
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SamplePlaylist;
