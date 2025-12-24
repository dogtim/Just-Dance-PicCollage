import React from 'react';
import { ActionMeshCheckpoint, Landmark } from '../../utils/poseComparison';

interface LandmarkDataComparisonPanelProps {
    processedVideoUrl: string | null;
    currentCheckpoint: ActionMeshCheckpoint | null;
    currentUserLandmarks: Landmark[] | null;
    showDebugInfo: boolean;
    panelRef: React.RefObject<HTMLDivElement | null>;
    panelPosition: { x: number; y: number };
    handleMouseDown: (e: React.MouseEvent) => void;
}

export const LandmarkDataComparisonPanel: React.FC<LandmarkDataComparisonPanelProps> = ({
    processedVideoUrl,
    currentCheckpoint,
    currentUserLandmarks,
    showDebugInfo,
    panelRef,
    panelPosition,
    handleMouseDown
}) => {
    if (!processedVideoUrl || !currentCheckpoint || !currentUserLandmarks || !showDebugInfo) return null;

    const landmarksToCompare = [
        { idx: 11, name: 'Left Shoulder' },
        { idx: 12, name: 'Right Shoulder' },
        { idx: 13, name: 'Left Elbow' },
        { idx: 14, name: 'Right Elbow' },
        { idx: 23, name: 'Left Hip' },
        { idx: 24, name: 'Right Hip' },
        { idx: 25, name: 'Left Knee' },
        { idx: 26, name: 'Right Knee' },
    ];

    return (
        <div
            ref={panelRef}
            className="absolute z-50 bg-gray-900/90 backdrop-blur-md rounded-xl border border-purple-600/30 shadow-2xl max-w-2xl max-h-[500px] overflow-hidden opacity-50"
            style={{
                left: panelPosition.x === 0 ? '50%' : `${panelPosition.x}px`,
                top: `${panelPosition.y}px`,
                transform: panelPosition.x === 0 ? 'translateX(-50%)' : 'none'
            }}
        >
            <div
                className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-gray-700 px-4 py-2 cursor-move select-none"
                onMouseDown={handleMouseDown}
            >
                <h3 className="text-white font-semibold text-sm">📊 Landmark Data Comparison</h3>
            </div>

            <div className="p-4 max-h-[440px] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Reference Pose Data */}
                    <div className="space-y-2">
                        <h4 className="text-yellow-400 font-semibold text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            Reference Pose (Target)
                        </h4>

                        <div className="space-y-1.5 text-xs font-mono">
                            {landmarksToCompare.map(({ idx, name }) => {
                                const lm = currentCheckpoint.landmarks[idx];
                                return (
                                    <div key={idx} className="bg-gray-800/50 rounded p-2">
                                        <div className="text-gray-300 font-semibold mb-1">{name} [{idx}]</div>
                                        <div className="grid grid-cols-2 gap-1 text-gray-400">
                                            <div>x: {lm.x.toFixed(3)}</div>
                                            <div>y: {lm.y.toFixed(3)}</div>
                                            <div>z: {lm.z.toFixed(3)}</div>
                                            <div className={lm.visibility > 0.5 ? 'text-green-400' : 'text-red-400'}>
                                                vis: {lm.visibility.toFixed(3)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* User Pose Data */}
                    <div className="space-y-2">
                        <h4 className="text-blue-400 font-semibold text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                            Your Pose (Live)
                        </h4>
                        <div className="space-y-1.5 text-xs font-mono">
                            {landmarksToCompare.map(({ idx, name }) => {
                                const lm = currentUserLandmarks[idx];
                                const refLm = currentCheckpoint.landmarks[idx];

                                // Calculate differences
                                const dx = Math.abs(lm.x - refLm.x);
                                const dy = Math.abs(lm.y - refLm.y);
                                const dz = Math.abs(lm.z - refLm.z);
                                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

                                return (
                                    <div key={idx} className="bg-gray-800/50 rounded p-2">
                                        <div className="text-gray-300 font-semibold mb-1 flex justify-between">
                                            <span>{name} [{idx}]</span>
                                            <span className={distance < 0.1 ? 'text-green-400' : distance < 0.2 ? 'text-yellow-400' : 'text-red-400'}>
                                                Δ {distance.toFixed(3)}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-1 text-gray-400">
                                            <div>x: {lm.x.toFixed(3)}</div>
                                            <div>y: {lm.y.toFixed(3)}</div>
                                            <div>z: {lm.z.toFixed(3)}</div>
                                            <div className={lm.visibility > 0.5 ? 'text-green-400' : 'text-red-400'}>
                                                vis: {lm.visibility.toFixed(3)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
