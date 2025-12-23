import { useRef, useState, useCallback, useEffect, RefObject } from 'react';
import Webcam from 'react-webcam';
import { createDetector, drawPose, IPoseDetector } from '../utils/poseDetector';
import {
    ActionMeshCheckpoint,
    calculatePoseSimilarity,
    getScoreFeedback,
    findNearestCheckpoint,
    resultsToLandmarks,
    Landmark
} from '../utils/poseComparison';

interface UsePoseDetectionProps {
    detectionModel: string;
    poseAlpha: number;
    actionMeshRef: RefObject<ActionMeshCheckpoint[] | null>;
    processedVideoUrl: string | null;
    processedVideoRef: RefObject<HTMLVideoElement | null>;
    onScoreUpdate: (points: number, feedback: string) => void;
    canvasRef: RefObject<HTMLCanvasElement | null>;
}

export const usePoseDetection = ({
    detectionModel,
    poseAlpha,
    actionMeshRef,
    processedVideoUrl,
    processedVideoRef,
    onScoreUpdate,
    canvasRef
}: UsePoseDetectionProps) => {
    const [detector, setDetector] = useState<IPoseDetector | null>(null);
    const [currentCheckpoint, setCurrentCheckpoint] = useState<ActionMeshCheckpoint | null>(null);
    const [currentUserLandmarks, setCurrentUserLandmarks] = useState<Landmark[] | null>(null);
    const [isPersonDetected, setIsPersonDetected] = useState(false);
    const lastScoredTimeRef = useRef<number>(0);

    const onResults = useCallback((results: any) => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
            const color = detectionModel === 'Meta 3D Body' ? '#00FFFF' : '#00FF00';
            drawPose(ctx, results, color, poseAlpha);

            if (actionMeshRef.current && processedVideoUrl && results.poseLandmarks) {
                const currentTime = processedVideoRef.current?.currentTime || 0;
                const timeSinceLastScore = currentTime - lastScoredTimeRef.current;

                if (timeSinceLastScore >= 0 && timeSinceLastScore < 0.4) {
                    return;
                }

                const checkpoint = findNearestCheckpoint(actionMeshRef.current, currentTime);
                if (checkpoint) {
                    setCurrentCheckpoint(checkpoint);
                    const userLandmarks = resultsToLandmarks(results);
                    if (userLandmarks) {
                        setCurrentUserLandmarks(userLandmarks);
                        const keyIndices = [11, 12, 13, 14, 23, 24, 25, 26];
                        const visibleCount = keyIndices.filter(i => userLandmarks[i]?.visibility > 0.5).length;
                        const visibilityRatio = visibleCount / keyIndices.length;

                        if (visibilityRatio < 0.2) {
                            setIsPersonDetected(false);
                            return;
                        }

                        setIsPersonDetected(true);
                        const similarity = calculatePoseSimilarity(userLandmarks, checkpoint.landmarks);
                        const { feedback, points } = getScoreFeedback(similarity);

                        if (points > 0) {
                            onScoreUpdate(points, feedback);
                            lastScoredTimeRef.current = currentTime;
                        }
                    }
                }
            }
        }
    }, [detectionModel, poseAlpha, actionMeshRef, processedVideoUrl, processedVideoRef, onScoreUpdate, canvasRef]);

    useEffect(() => {
        const initDetector = async () => {
            const det = createDetector(detectionModel);
            det.onResults(onResults);
            setDetector(det);
        };

        initDetector();

        return () => {
            if (detector) {
                detector.close();
            }
        };
    }, [detectionModel, onResults]);

    return {
        detector,
        currentCheckpoint,
        currentUserLandmarks,
        isPersonDetected,
        lastScoredTimeRef,
        setCurrentCheckpoint,
        setCurrentUserLandmarks,
        setIsPersonDetected
    };
};
