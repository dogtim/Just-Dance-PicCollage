import React, { RefObject } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';

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
    onPlayerReady: YouTubeProps['onReady'];
    onPlayerStateChange: YouTubeProps['onStateChange'];
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
    onTogglePlay,
    onPlayerReady,
    onPlayerStateChange
}) => {
    return (
        <div className="relative w-full h-full bg-black rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
            {processedVideoUrl ? (
                <>
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

                    {countdown === null && (
                        <button
                            onClick={onTogglePlay}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-black/70 rounded-full p-4 transition-all duration-200 hover:scale-110"
                            title={isVideoPlaying ? "Pause" : "Play"}
                        >
                            {isVideoPlaying ? (
                                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                </svg>
                            ) : (
                                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            )}
                        </button>
                    )}
                </>
            ) : (
                <YouTube
                    videoId={youtubeId || undefined}
                    opts={{
                        width: '100%',
                        height: '100%',
                        playerVars: {
                            autoplay: 0,
                        },
                    }}
                    className="w-full h-full absolute top-0 left-0"
                    onReady={onPlayerReady}
                    onStateChange={onPlayerStateChange}
                />
            )}
        </div>
    );
};
