import React from 'react';
import { Video } from '../../hooks/usePlaylist';

interface VideoItemProps {
    video: Video;
    onSelect: (url: string, title: string) => void;
}

export const VideoItem: React.FC<VideoItemProps> = ({ video, onSelect }) => {
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
};
