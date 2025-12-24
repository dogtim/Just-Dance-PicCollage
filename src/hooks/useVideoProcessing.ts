import { useState, useRef, useEffect } from 'react';
import { saveToLibrary, cacheAssets } from '../utils/userLibrary';

export const useVideoProcessing = () => {
    const [processingStatus, setProcessingStatus] = useState<string | null>(null);
    const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null);
    const [processedMeshUrl, setProcessedMeshUrl] = useState<string | null>(null);
    const [youtubeId, setYoutubeId] = useState<string | null>(null);
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const startProcessing = async (id: string, fullUrl: string, title: string = 'Custom Video') => {
        setProcessingStatus('Starting processing...');
        setProcessedVideoUrl(null);
        setProcessedMeshUrl(null);
        setYoutubeId(null);

        try {
            const res = await fetch('/api/process-video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ videoId: id, url: fullUrl }),
            });
            const data = await res.json();

            if (data.status === 'completed') {
                setProcessingStatus(null);
                setYoutubeId(id);
                setProcessedVideoUrl(data.videoUrl);
                setProcessedMeshUrl(data.meshUrl || null);
                cacheAssets(data.videoUrl, data.meshUrl);
                saveToLibrary({
                    id,
                    title,
                    originalUrl: fullUrl,
                    videoPath: data.videoUrl,
                    meshPath: data.meshUrl || '',
                    timestamp: Date.now()
                });
                return;
            }

            setProcessingStatus('Processing Dance Routine... This may take a minute.');

            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

            pollIntervalRef.current = setInterval(async () => {
                try {
                    const pollRes = await fetch(`/api/process-video?videoId=${id}`);
                    const pollData = await pollRes.json();

                    if (pollData.status === 'completed') {
                        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                        setProcessingStatus(null);
                        setYoutubeId(id);
                        setProcessedVideoUrl(pollData.videoUrl);
                        setProcessedMeshUrl(pollData.meshUrl || null);
                        cacheAssets(pollData.videoUrl, pollData.meshUrl);
                        saveToLibrary({
                            id,
                            title,
                            originalUrl: fullUrl,
                            videoPath: pollData.videoUrl,
                            meshPath: pollData.meshUrl || '',
                            timestamp: Date.now()
                        });
                    }
                } catch (e) {
                    console.error("Polling error", e);
                }
            }, 3000);

        } catch (e) {
            console.error(e);
            alert("Error starting video processing");
            setProcessingStatus(null);
        }
    };

    useEffect(() => {
        return () => {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        };
    }, []);

    return {
        youtubeId,
        setYoutubeId,
        processingStatus,
        processedVideoUrl,
        processedMeshUrl,
        startProcessing
    };
};
