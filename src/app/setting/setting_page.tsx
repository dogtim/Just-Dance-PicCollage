'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSettings, DetectionModel } from '../../context/SettingsContext';

export default function Setting() {
    const { detectionModel, setDetectionModel, startDelay, setStartDelay, showDebugInfo, setShowDebugInfo } = useSettings();
    const [url, setUrl] = useState('');
    const router = useRouter();

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
                        <div className="flex flex-col gap-2">
                            <label className="text-lg font-semibold text-gray-200">Detection Model</label>
                            <p className="text-sm text-gray-500 mb-2">Choose the AI model used for pose estimation.</p>

                            <select
                                value={detectionModel}
                                onChange={(e) => setDetectionModel(e.target.value as DetectionModel)}
                                className="w-full md:w-1/2 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-purple-500 transition-colors appearance-none cursor-pointer"
                            >
                                <option value="Google Media Pipe">Google Media Pipe</option>
                                <option value="Meta 3D Body">Meta 3D Body</option>
                            </select>
                        </div>

                        {/* Countdown Timer Layout */}
                        <div className="flex flex-col gap-2 pt-6 border-t border-gray-800">
                            <label className="text-lg font-semibold text-gray-200">Start Delay</label>
                            <p className="text-sm text-gray-500 mb-2">Set the countdown timer before the dance begins.</p>

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
                        </div>

                        {/* Debug Info Toggle */}
                        <div className="flex flex-col gap-2 pt-6 border-t border-gray-800">
                            <label className="text-lg font-semibold text-gray-200">Debug Dashboard</label>
                            <p className="text-sm text-gray-500 mb-2">Show detailed pose estimation data and accuracy metrics.</p>

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
                        </div>

                        {/* Custom Video Input */}
                        <div className="flex flex-col gap-2 pt-6 border-t border-gray-800">
                            <label className="text-lg font-semibold text-gray-200">Custom Dance Video</label>
                            <p className="text-sm text-gray-500 mb-2">Process any YouTube video into a dance routine. Custom tracks are saved locally for quick access.</p>

                            <div className="flex w-full gap-2 p-2 bg-gray-900 rounded-xl border border-gray-700 shadow-inner focus-within:border-purple-500 transition-colors">
                                <input
                                    type="text"
                                    placeholder="Paste YouTube URL..."
                                    className="flex-1 bg-transparent px-4 py-3 outline-none text-base placeholder:text-gray-600 w-full"
                                    onChange={(e) => setUrl(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && url) {
                                            router.push(`/?customUrl=${encodeURIComponent(url)}`);
                                        }
                                    }}
                                />
                                <button
                                    onClick={() => {
                                        if (url) {
                                            router.push(`/?customUrl=${encodeURIComponent(url)}`);
                                        }
                                    }}
                                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity whitespace-nowrap"
                                >
                                    Let's Party
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
