import React from 'react';
import { ActionMeshCheckpoint } from '../../utils/poseComparison';

interface DebugInfoPanelProps {
    processedVideoUrl: string | null;
    showDebugInfo: boolean;
    currentCheckpoint: ActionMeshCheckpoint | null;
    currentUserLandmarks: any;
    actionMesh: ActionMeshCheckpoint[] | null;
    processedVideoRef: React.RefObject<HTMLVideoElement | null>;
}

export const DebugInfoPanel: React.FC<DebugInfoPanelProps> = ({
    processedVideoUrl,
    showDebugInfo,
    currentCheckpoint,
    currentUserLandmarks,
    actionMesh,
    processedVideoRef
}) => {
    if (!processedVideoUrl || !showDebugInfo) return null;

    return (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 bg-black/70 backdrop-blur-md rounded-lg border border-yellow-600/30 p-2.5 shadow-2xl max-w-md">
            <h3 className="text-yellow-400 font-semibold text-xs mb-1.5 flex items-center gap-1">
                <span>🔍</span>
                <span>Debug Info</span>
            </h3>
            <div className="text-xs font-mono space-y-0.5">
                <div className="flex items-center gap-2">
                    <span className={processedVideoUrl ? 'text-green-400' : 'text-red-400'}>
                        {processedVideoUrl ? '✓' : '✗'}
                    </span>
                    <span className="text-gray-300">Video: {processedVideoUrl ? 'Loaded' : 'Not loaded'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className={currentCheckpoint ? 'text-green-400' : 'text-red-400'}>
                        {currentCheckpoint ? '✓' : '✗'}
                    </span>
                    <span className="text-gray-300">
                        Checkpoint: {currentCheckpoint ? `${currentCheckpoint.time.toFixed(1)}s` : 'None'}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className={currentUserLandmarks ? 'text-green-400' : 'text-red-400'}>
                        {currentUserLandmarks ? '✓' : '✗'}
                    </span>
                    <span className="text-gray-300">
                        Landmarks: {currentUserLandmarks ? 'Detected' : 'None'}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className={actionMesh ? 'text-green-400' : 'text-red-400'}>
                        {actionMesh ? '✓' : '✗'}
                    </span>
                    <span className="text-gray-300">
                        Mesh: {actionMesh ? `${actionMesh.length} pts` : 'Not loaded'}
                    </span>
                </div>
                {processedVideoRef.current && (
                    <div className="flex items-center gap-2">
                        <span className="text-blue-400">⏱️</span>
                        <span className="text-gray-300">
                            {processedVideoRef.current.currentTime.toFixed(1)}s / {processedVideoRef.current.duration.toFixed(1)}s
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};
