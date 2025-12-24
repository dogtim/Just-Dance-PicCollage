'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

interface VideoSlice {
    title: string;
    start: string | number;
    end: string | number;
}

interface ImportData {
    video_url: string;
    video_slices: VideoSlice[];
}

export default function DanceLoop() {
    const [url, setUrl] = useState('');
    const [videoId, setVideoId] = useState<string | null>(null);
    const [startTime, setStartTime] = useState<number>(0);
    const [endTime, setEndTime] = useState<number>(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [slices, setSlices] = useState<VideoSlice[]>([]);
    const [activeSliceIndex, setActiveSliceIndex] = useState<number | null>(null);

    const playerRef = useRef<any>(null);
    const [isPlayerReady, setIsPlayerReady] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const Player = ReactPlayer as any;

    const handleReset = () => {
        if (slices.length === 0) return;
        if (window.confirm('Are you sure you want to clear all slices? This action cannot be undone.')) {
            setSlices([]);
            setActiveSliceIndex(null);
        }
    };

    const cleanUrl = (input: string) => {
        let cleaned = input.trim();
        // Handle markdown artifacts: [label](url) or ](url)
        const mdLinkMatch = cleaned.match(/\[.*?\]\((.*?)\)/);
        if (mdLinkMatch) return mdLinkMatch[1];
        const partialMdMatch = cleaned.match(/\]\((.*?)\)/);
        if (partialMdMatch) return partialMdMatch[1];
        return cleaned;
    };

    const getSourceId = (url: string) => {
        const ytRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|\/shorts\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(ytRegExp);
        if (match) return match[2];

        // Handle local files or other URLs
        try {
            const parts = url.split('/');
            const filename = parts[parts.length - 1];
            return filename.split('.')[0] || 'video';
        } catch (e) {
            return 'video';
        }
    };

    const handleLoadVideo = useCallback((newUrl?: string) => {
        const rawUrl = (newUrl !== undefined ? newUrl : url).trim();
        if (rawUrl) {
            const cleaned = cleanUrl(rawUrl);
            console.log('Loading video:', cleaned);
            setVideoId(getSourceId(cleaned));
            setUrl(cleaned);
            setIsPlaying(true);

            // Reset times when new video loads manually
            setStartTime(0);
            setEndTime(0);
            setSlices([]);
            setActiveSliceIndex(null);
            setIsPlayerReady(false);
        }
    }, [url]);

    const handleExportJson = () => {
        if (!url || slices.length === 0) {
            alert('Nothing to export! Please load a video and add some slices first.');
            return;
        }

        const data: ImportData = {
            video_url: url,
            video_slices: slices.map(s => ({
                ...s,
                start: s.start.toString(),
                end: s.end.toString()
            }))
        };

        const jsonString = JSON.stringify(data, null, 4);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const exportUrl = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = exportUrl;
        link.download = `dance-loop-${videoId || 'playlist'}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(exportUrl);
    };

    const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data: ImportData = JSON.parse(event.target?.result as string);
                if (data.video_url) {
                    setUrl(data.video_url);
                    setVideoId(getSourceId(data.video_url));
                    setIsPlaying(true);
                }
                if (data.video_slices) {
                    setSlices(data.video_slices.map(s => ({
                        ...s,
                        start: s.start.toString(),
                        end: s.end.toString()
                    })));
                }
            } catch (err) {
                alert('Failed to parse JSON file. Please ensure it follows the correct format.');
                console.error(err);
            }
        };
        reader.readAsText(file);
    };

    const applySlice = (slice: VideoSlice, index: number) => {
        const start = parseFloat(slice.start.toString());
        const end = parseFloat(slice.end.toString());
        setStartTime(start);
        setEndTime(end);
        setActiveSliceIndex(index);

        if (playerRef.current) {
            playerRef.current.seekTo(start, 'seconds');
            setIsPlaying(true);
        }
    };

    const handleDeleteSlice = (index: number) => {
        setSlices(prev => prev.filter((_, i) => i !== index));
        setActiveSliceIndex(prev => {
            if (prev === index) return null;
            if (prev !== null && prev > index) return prev - 1;
            return prev;
        });
    };

    const onPlayerReady = () => {
        console.log('Player ready');
        setIsPlayerReady(true);
        if (endTime === 0 && playerRef.current) {
            const duration = playerRef.current.getDuration();
            console.log('Video duration:', duration);
            setEndTime(duration);
        }
    };

    const handleProgress = (state: any) => {
        if (isPlaying && endTime > 0 && state.playedSeconds >= endTime) {
            console.log('Looping back to:', startTime);
            playerRef.current?.seekTo(startTime, 'seconds');
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">🔁</span>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                            Dance Loop
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImportJson}
                            ref={fileInputRef}
                            className="hidden"
                        />
                        <button
                            onClick={handleReset}
                            className="px-5 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl transition-all border border-red-500/30 backdrop-blur-sm text-sm font-medium flex items-center gap-2"
                        >
                            <span>🗑️</span> Reset
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="px-5 py-2.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-xl transition-all border border-purple-500/30 backdrop-blur-sm text-sm font-medium flex items-center gap-2"
                        >
                            <span>📥</span> Import
                        </button>
                        <button
                            onClick={handleExportJson}
                            className="px-5 py-2.5 bg-pink-600/20 hover:bg-pink-600/30 text-pink-400 rounded-xl transition-all border border-pink-500/30 backdrop-blur-sm text-sm font-medium flex items-center gap-2"
                        >
                            <span>📤</span> Export
                        </button>
                        <Link href="/" className="px-5 py-2.5 bg-gray-800/80 hover:bg-gray-700 rounded-xl transition-all border border-gray-700 backdrop-blur-sm text-sm font-medium">
                            Back to Home
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Player Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="aspect-video bg-gray-900 rounded-3xl border border-gray-800 overflow-hidden shadow-2xl relative group">
                            {url ? (
                                <div className="w-full h-full relative">
                                    <Player
                                        key={url}
                                        ref={playerRef}
                                        url={url}
                                        playing={isPlaying}
                                        controls
                                        width="100%"
                                        height="100%"
                                        onReady={onPlayerReady}
                                        onStart={() => {
                                            console.log('Playback started');
                                            setIsPlaying(true);
                                        }}
                                        onPlay={() => {
                                            console.log('Player onPlay');
                                            setIsPlaying(true);
                                        }}
                                        onPause={() => {
                                            console.log('Player onPause');
                                            setIsPlaying(false);
                                        }}
                                        onBuffer={() => console.log('Player onBuffer')}
                                        onBufferEnd={() => console.log('Player onBufferEnd')}
                                        onError={(e: any) => console.error('Player error:', e)}
                                        onProgress={handleProgress}
                                        progressInterval={100}
                                    />

                                    {/* Custom Control Overlay (Optional/Subtle) */}
                                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                        {!isPlaying && isPlayerReady && (
                                            <button
                                                onClick={() => setIsPlaying(true)}
                                                className="pointer-events-auto p-6 bg-purple-600/80 hover:bg-purple-500 rounded-full transition-all shadow-2xl transform active:scale-95 border border-purple-400/50 backdrop-blur-sm"
                                            >
                                                <span className="text-3xl">▶️</span>
                                            </button>
                                        )}
                                    </div>

                                    {/* Play/Pause Toggle Hover Button */}
                                    <button
                                        onClick={() => setIsPlaying(!isPlaying)}
                                        className="absolute bottom-4 right-4 z-10 p-2.5 bg-black/60 hover:bg-black/80 rounded-xl border border-white/10 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300"
                                    >
                                        {isPlaying ? "⏸️ Pause" : "▶️ Play"}
                                    </button>
                                </div>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                                    <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6 border border-gray-700">
                                        <span className="text-4xl text-gray-500">📺</span>
                                    </div>
                                    <h2 className="text-xl font-semibold text-gray-300 mb-2">Ready to practice?</h2>
                                    <p className="text-gray-500 max-w-sm">Paste a YouTube URL or a local video path to start looping your practice sessions.</p>
                                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                                        <button
                                            onClick={() => {
                                                setUrl('/processed/1OPKKCIq3jA.mp4');
                                                handleLoadVideo('/processed/1OPKKCIq3jA.mp4');
                                            }}
                                            className="text-[10px] bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg border border-gray-700 text-gray-400 transition-colors"
                                        >
                                            Try Sample Local Video
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Slices Display */}
                        <div className="bg-gray-900/40 rounded-3xl p-6 border border-gray-800/50">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1 flex items-center gap-2">
                                <span>📑</span> Video Slices
                            </h3>
                            {slices.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {slices.map((slice, index) => (
                                        <div key={index} className="relative group">
                                            <button
                                                onClick={() => applySlice(slice, index)}
                                                className={`w-full p-4 rounded-2xl border transition-all text-left flex justify-between items-center ${activeSliceIndex === index
                                                    ? 'bg-purple-600/20 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                                                    : 'bg-gray-800/40 border-gray-700 hover:bg-gray-700/60 hover:border-gray-600'
                                                    }`}
                                            >
                                                <div className="flex flex-col">
                                                    <span className={`font-bold text-sm ${activeSliceIndex === index ? 'text-purple-300' : 'text-gray-200'}`}>
                                                        {slice.title}
                                                    </span>
                                                    <span className="text-xs text-gray-500 mt-1 font-mono">
                                                        {slice.start}s - {slice.end}s
                                                    </span>
                                                </div>
                                                <span className={`text-xl transition-transform group-hover:scale-110 ${activeSliceIndex === index ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                                    ▶️
                                                </span>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteSlice(index);
                                                }}
                                                className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-500/90 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg border border-red-400/50 z-10"
                                                title="Delete Slice"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 border-2 border-dashed border-gray-800 rounded-2xl flex flex-col items-center justify-center text-center px-6">
                                    <div className="text-3xl mb-3 opacity-20">📂</div>
                                    <p className="text-sm text-gray-500 max-w-[200px] leading-relaxed">
                                        No slices yet. Use the <span className="text-purple-400/80 font-semibold italic">Add</span> tool on the right to save move segments!
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Controls Section */}
                    <div className="space-y-6">
                        <div className="bg-gray-900/50 backdrop-blur-xl rounded-3xl p-6 border border-gray-800 shadow-xl space-y-8">
                            {/* URL Input */}
                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-gray-400 ml-1 uppercase tracking-wider">Video Source</label>
                                <div className="flex gap-2 p-1.5 bg-gray-950 rounded-2xl border border-gray-800 focus-within:border-purple-500/50 transition-all">
                                    <input
                                        type="text"
                                        placeholder="Paste YouTube URL or local path..."
                                        className="flex-1 bg-transparent px-4 py-2 outline-none text-sm placeholder:text-gray-600"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleLoadVideo()}
                                    />
                                    <button
                                        onClick={() => handleLoadVideo()}
                                        className="p-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl transition-all shadow-lg shadow-purple-900/20"
                                    >
                                        <span className="text-sm font-bold px-2">Load</span>
                                    </button>
                                </div>
                            </div>

                            {/* Loop Controls */}
                            <div className="space-y-6">
                                <label className="text-sm font-semibold text-gray-400 ml-1 uppercase tracking-wider">Loop Range (Seconds)</label>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center ml-1">
                                            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Start Time</div>
                                            <button
                                                onClick={() => {
                                                    if (playerRef.current) {
                                                        const current = playerRef.current.getCurrentTime();
                                                        setStartTime(parseFloat(current.toFixed(1)));
                                                    }
                                                }}
                                                className="text-[10px] text-purple-400 hover:text-purple-300 font-bold uppercase tracking-tighter"
                                            >
                                                Mark Current
                                            </button>
                                        </div>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            value={startTime}
                                            onChange={(e) => {
                                                setStartTime(Math.max(0, parseFloat(e.target.value) || 0));
                                                setActiveSliceIndex(null);
                                            }}
                                            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500/50 transition-all font-mono text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center ml-1">
                                            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">End Time</div>
                                            <button
                                                onClick={() => {
                                                    if (playerRef.current) {
                                                        const current = playerRef.current.getCurrentTime();
                                                        setEndTime(parseFloat(current.toFixed(1)));
                                                    }
                                                }}
                                                className="text-[10px] text-purple-400 hover:text-purple-300 font-bold uppercase tracking-tighter"
                                            >
                                                Mark Current
                                            </button>
                                        </div>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            value={endTime}
                                            onChange={(e) => {
                                                setEndTime(Math.max(0, parseFloat(e.target.value) || 0));
                                                setActiveSliceIndex(null);
                                            }}
                                            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500/50 transition-all font-mono text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-800/50 space-y-4">
                                    <div className="space-y-2">
                                        <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest ml-1">Slice Title</div>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="e.g. Chorus 1, Intro..."
                                                className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500/50 transition-all"
                                                id="new-slice-title"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        const input = e.currentTarget;
                                                        if (input.value.trim()) {
                                                            const newSlice: VideoSlice = {
                                                                title: input.value.trim(),
                                                                start: startTime,
                                                                end: endTime
                                                            };
                                                            setSlices(prev => [...prev, newSlice]);
                                                            input.value = '';
                                                        }
                                                    }
                                                }}
                                            />
                                            <button
                                                onClick={() => {
                                                    const input = document.getElementById('new-slice-title') as HTMLInputElement;
                                                    if (input.value.trim()) {
                                                        const newSlice: VideoSlice = {
                                                            title: input.value.trim(),
                                                            start: startTime,
                                                            end: endTime
                                                        };
                                                        setSlices(prev => [...prev, newSlice]);
                                                        input.value = '';
                                                    } else {
                                                        alert('Please enter a title for the slice');
                                                    }
                                                }}
                                                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-purple-400 rounded-xl transition-all border border-gray-700 text-xs font-bold uppercase tracking-wider"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>

                                    <p className="text-xs text-gray-500 leading-relaxed italic">
                                        Pro tip: Use the player controls to find your exact timestamps. The video will automatically loop back to {startTime}s once it hits {endTime}s.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* User Guide Card */}
                        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-3xl p-6 shadow-xl space-y-6">
                            <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 uppercase tracking-widest flex items-center gap-2">
                                <span>🚀</span> Quick Start Guide
                            </h3>

                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-6 h-6 bg-purple-600/30 text-purple-400 rounded-lg flex items-center justify-center text-xs font-bold border border-purple-500/30">1</div>
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        <span className="text-gray-200 font-semibold">Load Video:</span> Paste any YouTube link, Shorts, or local file path and hit "Load".
                                    </p>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-6 h-6 bg-purple-600/30 text-purple-400 rounded-lg flex items-center justify-center text-xs font-bold border border-purple-500/30">2</div>
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        <span className="text-gray-200 font-semibold">Define Loop:</span> Play the video, use <span className="text-purple-400 font-mono italic">Mark Current</span> to capture start/end points instantly.
                                    </p>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-6 h-6 bg-purple-600/30 text-purple-400 rounded-lg flex items-center justify-center text-xs font-bold border border-purple-500/30">3</div>
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        <span className="text-gray-200 font-semibold">Save Moves:</span> Give the segment a name and click <span className="text-purple-400 font-semibold italic">Add</span> to save it as a Slice.
                                    </p>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-6 h-6 bg-pink-600/30 text-pink-400 rounded-lg flex items-center justify-center text-xs font-bold border border-pink-500/30">4</div>
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        <span className="text-gray-200 font-semibold">Save Progress:</span> Use <span className="text-pink-400 font-semibold italic">Export</span> to download your practice slices for next time!
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-800/50">
                                <div className="flex items-center gap-2 text-xs text-purple-400/70 italic">
                                    <span>💡</span>
                                    <span>Practice tip: Loop 5-10s sections for muscle memory.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


