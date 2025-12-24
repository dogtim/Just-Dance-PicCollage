export interface LibraryItem {
    id: string;
    title: string;
    originalUrl: string;
    videoPath: string;
    meshPath: string;
    timestamp: number;
    difficulty?: string;
}

const STORAGE_KEY = 'just_dance_user_library';
const CACHE_NAME = 'just-dance-media-v1';

export const getLibrary = (): LibraryItem[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
};

export const saveToLibrary = (item: LibraryItem) => {
    if (typeof window === 'undefined') return;
    const library = getLibrary();

    // Check duplicates by ID
    const exists = library.some(i => i.id === item.id);
    if (exists) return; // Already saved

    const updated = [item, ...library];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const removeFromLibrary = (id: string) => {
    if (typeof window === 'undefined') return;
    const library = getLibrary();
    const updated = library.filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    // We leave the cache alone for now or could iterate and delete
};

export const cacheAssets = async (videoUrl: string, meshUrl: string) => {
    if (typeof window === 'undefined' || !('caches' in window)) return;

    try {
        const cache = await caches.open(CACHE_NAME);
        // AddAll automatically fetches and puts in cache
        await cache.addAll([videoUrl, meshUrl].filter(Boolean));
        console.log('Assets cached successfully:', videoUrl, meshUrl);
    } catch (err) {
        console.warn('Failed to cache assets:', err);
    }
};

export const getCachedAssetUrl = async (url: string): Promise<string> => {
    if (typeof window === 'undefined' || !('caches' in window)) return url;

    try {
        const cache = await caches.open(CACHE_NAME);
        const response = await cache.match(url);
        if (response) {
            const blob = await response.blob();
            console.log('Cache Hit for:', url);
            return URL.createObjectURL(blob);
        }
    } catch (e) {
        console.warn('Cache match failed:', e);
    }
    return url;
};
