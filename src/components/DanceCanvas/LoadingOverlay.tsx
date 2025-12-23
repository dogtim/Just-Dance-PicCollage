import React from 'react';

interface LoadingOverlayProps {
    isLoading: boolean;
    cameraError: string | null;
    cameraLoaded: boolean;
    processedMeshUrl?: string | null;
    actionMesh: any;
    processedVideoUrl: string | null;
    isVideoReady: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
    isLoading,
    cameraError,
    cameraLoaded,
    processedMeshUrl,
    actionMesh,
    processedVideoUrl,
    isVideoReady
}) => {
    if (!isLoading || cameraError) return null;

    return (
        <div className="absolute inset-0 z-[60] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center text-white space-y-6">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-2xl">💃</div>
            </div>
            <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                    Setting up Stage...
                </h3>
                <div className="flex flex-col gap-1 text-sm text-gray-400 font-mono">
                    <div className="flex items-center gap-2">
                        <span className={cameraLoaded ? "text-green-500" : "text-yellow-500"}>{cameraLoaded ? "✓" : "○"}</span>
                        <span>Camera Access</span>
                    </div>
                    {processedMeshUrl && (
                        <div className="flex items-center gap-2">
                            <span className={actionMesh ? "text-green-500" : "text-yellow-500"}>{actionMesh ? "✓" : "○"}</span>
                            <span>Downloading Choreography</span>
                        </div>
                    )}
                    {processedVideoUrl && (
                        <div className="flex items-center gap-2">
                            <span className={isVideoReady ? "text-green-500" : "text-yellow-500"}>{isVideoReady ? "✓" : "○"}</span>
                            <span>Buffering Video</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
