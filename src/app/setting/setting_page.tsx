'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSettings, DetectionModel, GameMode } from '../../context/SettingsContext';
import { SettingSection } from '../../components/Setting/SettingSection';
import { CustomVideoInput } from '../../components/Setting/CustomVideoInput';

export default function Setting() {
    const {
        detectionModel, setDetectionModel,
        startDelay, setStartDelay,
        showDebugInfo, setShowDebugInfo,
        userName, setUserName,
        poseAlpha, setPoseAlpha,
        gameMode, setGameMode
    } = useSettings();

    const [url, setUrl] = useState('');
    const router = useRouter();

    const handleStartParty = useCallback(() => {
        if (url) {
            router.push(`/?customUrl=${encodeURIComponent(url)}`);
        }
    }, [url, router]);

    return (
        <div className="min-h-screen bg-black text-white font-sans p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                        Settings
                    </h1>
                    <Link href="/" className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                        Back to Home
                    </Link>
                </div>

                <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-8 border border-gray-800">
                    <div className="space-y-6">
                        {/* User Name */}
                        <SettingSection
                            title="DisplayName"
                            description="How you want to be addressed."
                            isFirst
                        >
                            <input
                                type="text"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className="w-full md:w-1/2 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-purple-500 transition-colors"
                            />
                        </SettingSection>

                        {/* Detection Model */}
                        <SettingSection
                            title="Detection Model"
                            description="Choose the AI model used for pose estimation."
                        >
                            <select
                                value={detectionModel}
                                onChange={(e) => setDetectionModel(e.target.value as DetectionModel)}
                                className="w-full md:w-1/2 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-purple-500 transition-colors appearance-none cursor-pointer"
                            >
                                <option value="Google Media Pipe">Google Media Pipe</option>
                                <option value="Meta 3D Body">Meta 3D Body</option>
                            </select>
                        </SettingSection>

                        {/* Start Delay */}
                        <SettingSection
                            title="Start Delay"
                            description="Set the countdown timer before the dance begins."
                        >
                            <div className="grid grid-cols-3 md:flex gap-4">
                                {[3, 5, 10].map((time) => (
                                    <button
                                        key={time}
                                        onClick={() => setStartDelay(time)}
                                        className={`px-8 py-3 rounded-xl border font-medium transition-all duration-200 ${startDelay === time
                                            ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/50'
                                            : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                                            }`}
                                    >
                                        <span className="text-lg">{time}</span>
                                        <span className="text-xs ml-1 opacity-70">sec</span>
                                    </button>
                                ))}
                            </div>
                        </SettingSection>

                        {/* Debug Dashboard */}
                        <SettingSection
                            title="Debug Dashboard"
                            description="Show detailed pose estimation data and accuracy metrics."
                        >
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowDebugInfo(true)}
                                    className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${showDebugInfo
                                        ? 'bg-purple-600/20 text-purple-400 border border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                                        : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
                                        }`}
                                >
                                    Enabled
                                </button>
                                <button
                                    onClick={() => setShowDebugInfo(false)}
                                    className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${!showDebugInfo
                                        ? 'bg-gray-700 text-white border border-gray-600'
                                        : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
                                        }`}
                                >
                                    Disabled
                                </button>
                            </div>
                        </SettingSection>

                        {/* Game Mode */}
                        <SettingSection
                            title="Game Mode"
                            description="Shuffle choreography or follow the original routine."
                        >
                            <div className="flex gap-4">
                                {(['Default', 'Random'] as GameMode[]).map((mode) => (
                                    <button
                                        key={mode}
                                        onClick={() => setGameMode(mode)}
                                        className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${gameMode === mode
                                            ? 'bg-purple-600/20 text-purple-400 border border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                                            : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
                                            }`}
                                    >
                                        {mode}
                                    </button>
                                ))}
                            </div>
                        </SettingSection>

                        {/* Skeleton Transparency Slider */}
                        <SettingSection
                            title="Skeleton Transparency"
                            description="Adjust the visibility of the real-time pose skeleton overlay."
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-purple-400 font-mono font-bold bg-purple-400/10 px-2 py-0.5 rounded text-sm">
                                    {(poseAlpha * 100).toFixed(0)}%
                                </span>
                            </div>
                            <div className="flex items-center gap-4 group">
                                <span className="text-xs text-gray-500">Clear</span>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={poseAlpha}
                                    onChange={(e) => setPoseAlpha(parseFloat(e.target.value))}
                                    className="flex-1 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 transition-all"
                                />
                                <span className="text-xs text-gray-500">Solid</span>
                            </div>
                        </SettingSection>

                        {/* Custom Video Input */}
                        <SettingSection
                            title="Custom Dance Video"
                            description="Process any YouTube video into a dance routine. Custom tracks are saved locally for quick access."
                        >
                            <CustomVideoInput
                                url={url}
                                setUrl={setUrl}
                                onStart={handleStartParty}
                            />
                        </SettingSection>
                    </div>
                </div>
            </div>
        </div>
    );
}
