import React, { RefObject } from 'react';
import dynamic from 'next/dynamic';
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

interface VideoLayerProps {
    processedVideoUrl: string | null;
    youtubeId: string | null;
    finalVideoUrl: string | null;
    isVideoPlaying: boolean;
    countdown: number | null;
    startDelay: number;
    processedVideoRef: RefObject<HTMLVideoElement | null>;
    handleVideoError: () => void;
    setIsVideoReady: (ready: boolean) => void;
    onVideoPlay: () => void;
    onVideoPause: () => void;
    onVideoEnded: () => void;
    onTogglePlay: () => void;
}

export const VideoLayer: React.FC<VideoLayerProps> = ({
    processedVideoUrl,
    youtubeId,
    finalVideoUrl,
    isVideoPlaying,
    countdown,
    startDelay,
    processedVideoRef,
    handleVideoError,
    setIsVideoReady,
    onVideoPlay,
    onVideoPause,
    onVideoEnded,
    onTogglePlay
}) => {
    const Player = ReactPlayer as any;

    return (
        <div className="relative w-full h-full bg-black rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
            {/* Unified Countdown Overlay */}
            {countdown !== null && countdown > 0 && (
                <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
                    <div className="flex flex-col items-center">
                        <div className="text-[120px] font-black text-white leading-none tracking-tighter drop-shadow-2xl animate-pulse">
                            {countdown}
                        </div>
                        <div className="text-2xl text-purple-400 font-bold uppercase tracking-widest mt-4">
                            Get Ready!
                        </div>
                    </div>
                </div>
            )}

            {processedVideoUrl ? (
                <video
                    ref={processedVideoRef}
                    src={finalVideoUrl || processedVideoUrl || ''}
                    onError={handleVideoError}
                    className="w-full h-full absolute top-0 left-0 object-contain"
                    controls={false}
                    autoPlay={false}
                    playsInline
                    onLoadedData={() => setIsVideoReady(true)}
                    onPlay={onVideoPlay}
                    onPause={onVideoPause}
                    onEnded={onVideoEnded}
                />
            ) : youtubeId ? (
                <div className="w-full h-full absolute top-0 left-0">
                    <Player
                        url={`https://www.youtube.com/watch?v=${youtubeId}`}
                        playing={isVideoPlaying}
                        width="100%"
                        height="100%"
                        onReady={() => {
                            setIsVideoReady(true);
                        }}
                        onPlay={onVideoPlay}
                        onPause={onVideoPause}
                        onEnded={onVideoEnded}
                        config={{
                            youtube: {
                                playerVars: { showinfo: 0, autoplay: 0, controls: 1 }
                            }
                        }}
                    />
                </div>
            ) : null}

            {/* Common Play/Pause Toggle Button */}
            {countdown === null && (isVideoPlaying || !isVideoPlaying) && (
                <button
                    onClick={onTogglePlay}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-black/70 rounded-full p-4 transition-all duration-200 hover:scale-110 group"
                    title={isVideoPlaying ? "Pause" : "Play"}
                >
                    {isVideoPlaying ? (
                        <svg className="w-12 h-12 text-white opacity-40 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        </svg>
                    ) : (
                        <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    )}
                </button>
            )}
        </div>
    );
};
