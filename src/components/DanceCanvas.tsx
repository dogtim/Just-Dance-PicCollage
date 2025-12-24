'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { YouTubeProps, YouTubePlayer } from 'react-youtube';
import { useSettings } from '../context/SettingsContext';

// Hooks
import { useActionMesh } from '../hooks/useActionMesh';
import { useVideoResolution } from '../hooks/useVideoResolution';
import { useCountdown } from '../hooks/useCountdown';
import { useDraggable } from '../hooks/useDraggable';
import { usePoseDetection } from '../hooks/usePoseDetection';

// Components
import { LoadingOverlay } from './DanceCanvas/LoadingOverlay';
import { DebugInfoPanel } from './DanceCanvas/DebugInfoPanel';
import { LandmarkDataComparisonPanel } from './DanceCanvas/LandmarkComparisonPanel';
import { VideoLayer } from './DanceCanvas/VideoLayer';
import { WebcamLayer } from './DanceCanvas/WebcamLayer';

interface DanceCanvasProps {
    youtubeId: string | null;
    onScoreUpdate: (points: number, feedback: string) => void;
    onScoreReset: () => void;
    onVideoEnded?: () => void;
    processedVideoUrl: string | null;
    processedMeshUrl?: string | null;
}

const DanceCanvas: React.FC<DanceCanvasProps> = ({
    youtubeId,
    onScoreUpdate,
    onScoreReset,
    onVideoEnded,
    processedVideoUrl,
    processedMeshUrl
}) => {
    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const processedVideoRef = useRef<HTMLVideoElement>(null);
    const requestRef = useRef<number>(null);
    const isRunning = useRef<boolean>(false);

    const [player, setPlayer] = useState<YouTubePlayer | null>(null);
    const [cameraLoaded, setCameraLoaded] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [isVideoReady, setIsVideoReady] = useState(false);

    const { detectionModel, startDelay, showDebugInfo, poseAlpha } = useSettings();

    // Custom Hooks
    const { actionMesh, actionMeshRef } = useActionMesh(youtubeId, processedVideoUrl, processedMeshUrl);
    const { finalVideoUrl, handleVideoError } = useVideoResolution(processedVideoUrl);

    const {
        detector,
        currentCheckpoint,
        currentUserLandmarks,
        isPersonDetected,
        lastScoredTimeRef
    } = usePoseDetection({
        detectionModel,
        poseAlpha,
        actionMeshRef,
        processedVideoUrl,
        processedVideoRef,
        onScoreUpdate,
        canvasRef
    });

    const { countdown, startCountdown, stopCountdown } = useCountdown(() => {
        if (processedVideoRef.current) {
            processedVideoRef.current.play();
        }
    });

    const { panelPosition, panelRef, handleMouseDown } = useDraggable();

    // Animation Loop
    const loop = useCallback(async () => {
        if (
            isRunning.current &&
            webcamRef.current &&
            webcamRef.current.video &&
            webcamRef.current.video.readyState === 4 &&
            detector
        ) {
            await detector.send(webcamRef.current.video);
        }
        requestRef.current = requestAnimationFrame(loop);
    }, [detector]);

    useEffect(() => {
        if (isRunning.current && detector) {
            requestRef.current = requestAnimationFrame(loop);
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [loop, detector]);

    // YouTube Event Handlers
    const onPlayerReady: YouTubeProps['onReady'] = (event) => {
        setPlayer(event.target);
    };

    const onPlayerStateChange: YouTubeProps['onStateChange'] = (event) => {
        if (event.data === 1) { // Playing
            isRunning.current = true;
            loop();
        } else {
            isRunning.current = false;
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        }
    };

    // Video Event Handlers
    const handleVideoPlay = () => {
        isRunning.current = true;
        setIsVideoPlaying(true);
        loop();
    };

    const handleVideoPause = () => {
        isRunning.current = false;
        setIsVideoPlaying(false);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };

    const handleVideoEnded = () => {
        isRunning.current = false;
        setIsVideoPlaying(false);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        if (onVideoEnded) onVideoEnded();
        onScoreReset();
        lastScoredTimeRef.current = 0;
    };

    const handleTogglePlay = () => {
        if (processedVideoRef.current) {
            if (isVideoPlaying) {
                processedVideoRef.current.pause();
                stopCountdown();
            } else {
                startCountdown(startDelay);
            }
        }
    };

    const isReady = cameraLoaded &&
        (!processedMeshUrl || actionMesh !== null) &&
        (!processedVideoUrl || isVideoReady);

    const isLoading = !isReady;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full relative">
            <LoadingOverlay
                isLoading={isLoading}
                cameraError={cameraError}
                cameraLoaded={cameraLoaded}
                processedMeshUrl={processedMeshUrl}
                actionMesh={actionMesh}
                processedVideoUrl={processedVideoUrl}
                isVideoReady={isVideoReady}
            />

            <DebugInfoPanel
                processedVideoUrl={processedVideoUrl}
                showDebugInfo={showDebugInfo}
                currentCheckpoint={currentCheckpoint}
                currentUserLandmarks={currentUserLandmarks}
                actionMesh={actionMesh}
                processedVideoRef={processedVideoRef}
            />

            <VideoLayer
                processedVideoUrl={processedVideoUrl}
                youtubeId={youtubeId}
                finalVideoUrl={finalVideoUrl}
                isVideoPlaying={isVideoPlaying}
                countdown={countdown}
                startDelay={startDelay}
                processedVideoRef={processedVideoRef}
                handleVideoError={handleVideoError}
                setIsVideoReady={setIsVideoReady}
                onVideoPlay={handleVideoPlay}
                onVideoPause={handleVideoPause}
                onVideoEnded={handleVideoEnded}
                onTogglePlay={handleTogglePlay}
                onPlayerReady={onPlayerReady}
                onPlayerStateChange={onPlayerStateChange}
            />

            <WebcamLayer
                cameraLoaded={cameraLoaded}
                cameraError={cameraError}
                webcamRef={webcamRef}
                canvasRef={canvasRef}
                detectionModel={detectionModel}
                setCameraLoaded={setCameraLoaded}
                setCameraError={setCameraError}
            />

            <LandmarkDataComparisonPanel
                processedVideoUrl={processedVideoUrl}
                currentCheckpoint={currentCheckpoint}
                currentUserLandmarks={currentUserLandmarks}
                showDebugInfo={showDebugInfo}
                panelRef={panelRef}
                panelPosition={panelPosition}
                handleMouseDown={handleMouseDown}
            />
        </div>
    );
};

export default DanceCanvas;
