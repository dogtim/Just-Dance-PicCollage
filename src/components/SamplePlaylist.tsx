import React from 'react';
import samplePlaylist from '../data/sample_playlist.json';

interface SamplePlaylistProps {
    onSelect: (url: string, title: string) => void;
}

const SamplePlaylist: React.FC<SamplePlaylistProps> = ({ onSelect }) => {
    return (
        <div className="w-full max-w-lg mt-12">
            <h3 className="text-gray-400 font-semibold mb-4 text-sm uppercase tracking-wider text-center">Sample Playlist</h3>
            <div className="flex flex-col gap-3">
                {samplePlaylist.videos.map((video, idx) => {
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
