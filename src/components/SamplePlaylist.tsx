'use client';

import React from 'react';

// Hooks
import { usePlaylist } from '../hooks/usePlaylist';

// Components
import { VideoItem } from './SamplePlaylist/VideoItem';
import { PlaylistSidebar } from './SamplePlaylist/PlaylistSidebar';
import { CustomPlaylistInfo } from './SamplePlaylist/CustomPlaylistInfo';

interface SamplePlaylistProps {
    onSelect: (url: string, title: string) => void;
}

const SamplePlaylist: React.FC<SamplePlaylistProps> = ({ onSelect }) => {
    const {
        selectedDifficulty,
        setSelectedDifficulty,
        isLoading,
        filteredVideos,
        difficulties,
        fileInputRef,
        handleFileUpload
    } = usePlaylist();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row gap-8 bg-gray-900/50 backdrop-blur-xl p-6 rounded-3xl border border-gray-800 shadow-2xl">
            {/* Left Sidebar */}
            <PlaylistSidebar
                difficulties={difficulties}
                selectedDifficulty={selectedDifficulty}
                onSelectDifficulty={setSelectedDifficulty}
            />

            {/* Right Content Panel */}
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
                    {filteredVideos.map((video, idx) => (
                        <VideoItem
                            key={`${video.title}-${idx}`}
                            video={video}
                            onSelect={onSelect}
                        />
                    ))}

                    {filteredVideos.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            {selectedDifficulty === 'My Library' ? (
                                <p>No videos in your library yet. Play a custom video to save it here!</p>
                            ) : selectedDifficulty === 'Custom Made' ? (
                                <CustomPlaylistInfo />
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
