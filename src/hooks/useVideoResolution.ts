import { useState, useEffect } from 'react';
import { getCachedAssetUrl } from '../utils/userLibrary';

export const useVideoResolution = (processedVideoUrl: string | null) => {
    const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!processedVideoUrl) {
            setFinalVideoUrl(null);
            return;
        }

        if (processedVideoUrl.startsWith('blob:')) {
            setFinalVideoUrl(processedVideoUrl);
            return;
        }

        setFinalVideoUrl(processedVideoUrl);
    }, [processedVideoUrl]);

    const handleVideoError = async () => {
        if (processedVideoUrl && !finalVideoUrl?.startsWith('blob:')) {
            console.log('Video network load failed, trying cache...');
            try {
                const cachedUrl = await getCachedAssetUrl(processedVideoUrl);
                if (cachedUrl && cachedUrl !== processedVideoUrl) {
                    setFinalVideoUrl(cachedUrl);
                }
            } catch (e) {
                console.warn('Cache fallback failed', e);
            }
        }
    };

    return { finalVideoUrl, handleVideoError };
};
