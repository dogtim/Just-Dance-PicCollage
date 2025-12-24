import React, { RefObject } from 'react';
import Webcam from 'react-webcam';

interface WebcamLayerProps {
    cameraLoaded: boolean;
    cameraError: string | null;
    webcamRef: RefObject<Webcam | null>;
    canvasRef: RefObject<HTMLCanvasElement | null>;
    detectionModel: string;
    setCameraLoaded: (loaded: boolean) => void;
    setCameraError: (error: string | null) => void;
}

export const WebcamLayer: React.FC<WebcamLayerProps> = ({
    cameraLoaded,
    cameraError,
    webcamRef,
    canvasRef,
    detectionModel,
    setCameraLoaded,
    setCameraError
}) => {
    return (
        <div className="relative w-full h-full bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
            {/* Loading/Error States */}
            {!cameraLoaded && !cameraError && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500 z-10">
                    <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        <p>Requesting Camera...</p>
                    </div>
                </div>
            )}

            {cameraError && (
                <div className="absolute inset-0 flex items-center justify-center text-red-400 z-10 p-6 text-center bg-gray-900/95 backdrop-blur-sm">
                    <div className="max-w-md space-y-4">
                        <p className="font-bold text-xl text-red-500">Camera Access Issue</p>
                        <p className="text-sm text-gray-300 bg-gray-800 p-3 rounded">{cameraError}</p>
                        <div className="text-xs text-gray-400 text-left space-y-2 border-t border-gray-700 pt-4">
                            <p><strong>Possible Solutions:</strong></p>
                            <ul className="list-disc pl-4 space-y-1">
                                <li>Check your address bar. You <strong>MUST</strong> use <code className="text-white">http://localhost:3000</code>.</li>
                                <li>Check browser permissions icon to allow access.</li>
                                <li>Refresh the page after changing settings.</li>
                            </ul>
                        </div>
                        <button
                            onClick={async () => {
                                setCameraError(null);
                                setCameraLoaded(false);
                                try {
                                    await navigator.mediaDevices.getUserMedia({ video: true });
                                    setCameraLoaded(true);
                                } catch (err: any) {
                                    setCameraError(err.message || 'Permission denied again.');
                                }
                            }}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-semibold"
                        >
                            Try Requesting Again
                        </button>
                    </div>
                </div>
            )}

            <Webcam
                ref={webcamRef}
                audio={false}
                mirrored
                className="absolute top-0 left-0 w-full h-full object-cover"
                style={{ opacity: cameraLoaded ? 0.7 : 0 }}
                onUserMedia={() => setCameraLoaded(true)}
                onUserMediaError={(err) => {
                    console.error("Webcam Error:", err);
                    let msg = typeof err === 'string' ? err : 'Could not access camera.';
                    if (window.location.hostname !== 'localhost' && window.location.protocol !== 'https:') {
                        msg = `Security Block: Camera only works on localhost or HTTPS.`;
                    }
                    setCameraError(msg);
                }}
            />

            <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none scale-x-[-1]"
                width={640}
                height={480}
            />

            {detectionModel === 'Meta 3D Body' && (
                <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs px-2 py-1 rounded opacity-80 pointer-events-none">
                    Meta 3D Body (Sim)
                </div>
            )}
        </div>
    );
};
