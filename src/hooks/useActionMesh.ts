import { useState, useEffect, useRef } from 'react';
import { ActionMeshCheckpoint } from '../utils/poseComparison';
import { getCachedAssetUrl } from '../utils/userLibrary';

export const useActionMesh = (youtubeId: string | null, processedVideoUrl: string | null, processedMeshUrl?: string | null) => {
    const [actionMesh, setActionMesh] = useState<ActionMeshCheckpoint[] | null>(null);
    const actionMeshRef = useRef<ActionMeshCheckpoint[] | null>(null);

    useEffect(() => {
        actionMeshRef.current = actionMesh;
    }, [actionMesh]);

    useEffect(() => {
        console.log('[ACTION MESH] useEffect triggered', { processedVideoUrl, youtubeId, processedMeshUrl });

        if (!processedVideoUrl || !youtubeId) {
            setActionMesh(null);
            return;
        }

        const loadMesh = async (retries = 5) => {
            let meshUrl = processedMeshUrl || `/processed/${youtubeId}_action_mesh.json`;

            console.log(`[ACTION MESH] Fetching from: ${meshUrl} (Retries left: ${retries})`);

            try {
                const res = await fetch(meshUrl);

                if (!res.ok) {
                    console.warn(`[ACTION MESH] Network fetch failed: ${res.status}. Checking cache...`);

                    try {
                        const cachedUrl = await getCachedAssetUrl(meshUrl);
                        if (cachedUrl && cachedUrl !== meshUrl) {
                            console.log('[ACTION MESH] Found in cache, using cached version.');
                            const cacheRes = await fetch(cachedUrl);
                            if (cacheRes.ok) {
                                const data = await cacheRes.json();
                                setActionMesh(data);
                                return;
                            }
                        }
                    } catch (e) {
                        console.warn('Cache check failed', e);
                    }

                    if (retries > 0) {
                        console.warn('[ACTION MESH] Retrying network in 1s...');
                        setTimeout(() => loadMesh(retries - 1), 1000);
                        return;
                    }
                    throw new Error(`HTTP error! status: ${res.status}`);
                }

                const data = await res.json();
                console.log('[ACTION MESH] Successfully loaded from Network:', data);
                setActionMesh(data);
            } catch (err: any) {
                console.error('[ACTION MESH] Error:', err);

                try {
                    const cachedUrl = await getCachedAssetUrl(meshUrl);
                    if (cachedUrl && cachedUrl !== meshUrl) {
                        const cacheRes = await fetch(cachedUrl);
                        const data = await cacheRes.json();
                        setActionMesh(data);
                        return;
                    }
                } catch (e) { }

                if (retries > 0) {
                    setTimeout(() => loadMesh(retries - 1), 1000);
                }
            }
        };

        loadMesh();
    }, [processedVideoUrl, youtubeId, processedMeshUrl]);

    return { actionMesh, actionMeshRef };
};
