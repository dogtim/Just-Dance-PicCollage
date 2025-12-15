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

    return (
        <div className="w-full max-w-lg mt-12">
            <h3 className="text-gray-400 font-semibold mb-4 text-sm uppercase tracking-wider text-center">Sample Playlist</h3>
            <div className="flex flex-col gap-3">
                {playlist.videos.map((video, idx) => {
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

                    const format = video.url.includes('shorts') ? 'YouTube Shorts Format' : 'Standard YouTube Video';

                    return (
                        <button
                            key={idx}
                            onClick={() => onSelect(video.url, video.title)}
                            className={`flex items-center gap-4 p-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 ${styleConfig.borderColor} rounded-xl transition-all group text-left`}
                        >
                            <div className={`w-10 h-10 rounded-full ${styleConfig.bgColor} flex items-center justify-center text-xl group-hover:scale-110 transition-transform`}>
                                {styleConfig.icon}
                            </div>
                            <div className="flex-1">
                                <div className={`font-semibold text-gray-200 ${styleConfig.textColor} transition-colors`}>{video.title}</div>
                                <div className="text-xs text-gray-500">{format} • {video.difficulty}</div>
                            </div>
                            <div className={`text-gray-600 ${styleConfig.textColor} transition-colors`}>
                                Play
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default SamplePlaylist;
