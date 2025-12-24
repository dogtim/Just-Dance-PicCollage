import { useState, useEffect, useRef } from 'react';
import localPlaylist from '../data/sample_playlist.json';
import { getLibrary, LibraryItem } from '../utils/userLibrary';

export interface Video {
    title: string;
    url: string;
    difficulty: string;
    isCustom?: boolean;
}

export interface PlaylistData {
    videos: Video[];
}

let cachedPlaylist: PlaylistData | null = null;

export const usePlaylist = () => {
    const [playlist, setPlaylist] = useState<PlaylistData | null>(cachedPlaylist);
    const [selectedDifficulty, setSelectedDifficulty] = useState('All');
    const [isLoading, setIsLoading] = useState(!cachedPlaylist);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchPlaylist = async () => {
        setIsLoading(true);
        try {
            const data = localPlaylist as PlaylistData;
            cachedPlaylist = data;
            setPlaylist(data);
        } catch (error) {
            console.error('Error fetching playlist:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!cachedPlaylist) {
            fetchPlaylist();
        }
    }, []);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                if (json.videos && Array.isArray(json.videos)) {
                    const customVideos = json.videos.map((v: any) => ({
                        ...v,
                        isCustom: true
                    }));

                    setPlaylist(prev => {
                        const newPlaylist = {
                            videos: [...(prev?.videos || []), ...customVideos]
                        };
                        cachedPlaylist = newPlaylist;
                        return newPlaylist;
                    });
                    setSelectedDifficulty('Custom Made');
                }
            } catch (err) {
                console.error('Error parsing playlist JSON:', err);
                alert('Invalid JSON file format. Please check the example.');
            }
        };
        reader.readAsText(file);
    };

    const difficulties = ['All', 'Easy', 'Medium', 'Hard', 'Custom Made', 'My Library'];

    const getFilteredVideos = (): Video[] => {
        if (!playlist) return [];

        if (selectedDifficulty === 'My Library') {
            const library = getLibrary();
            return library.map((item: LibraryItem) => ({
                title: item.title,
                url: item.originalUrl,
                difficulty: item.difficulty || 'Custom',
                isCustom: true
            }));
        }

        if (selectedDifficulty === 'All') return playlist.videos;

        if (selectedDifficulty === 'Custom Made') {
            return playlist.videos.filter(v => v.isCustom);
        }

        return playlist.videos.filter(v => v.difficulty === selectedDifficulty && !v.isCustom);
    };

    const filteredVideos = getFilteredVideos();

    return {
        playlist,
        selectedDifficulty,
        setSelectedDifficulty,
        isLoading,
        filteredVideos,
        difficulties,
        fileInputRef,
        handleFileUpload
    };
};
