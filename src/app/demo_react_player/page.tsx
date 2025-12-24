'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

export default function DemoReactPlayer() {
    const [hasMounted, setHasMounted] = useState(false);
    const [status, setStatus] = useState('Initializing...');
    const [isPlaying, setIsPlaying] = useState(true);
    const url = 'https://www.youtube.com/watch?v=LXb3EKWsInQ';

    const Player = ReactPlayer as any;

    useEffect(() => {
        setHasMounted(true);
        setStatus('Mounted. Checking if can play...');
    }, []);

    if (!hasMounted) {
        return <div className="min-h-screen bg-black text-white p-8">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center">
            <div className="max-w-4xl w-full space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                        React Player Official Test
                    </h1>
                    <Link href="/" className="px-5 py-2.5 bg-gray-800/80 hover:bg-gray-700 rounded-xl transition-all border border-gray-700 backdrop-blur-sm text-sm font-medium">
                        Back to Home
                    </Link>
                </div>

                <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl text-sm font-mono">
                    <p className="text-gray-400">Status: <span className="text-purple-400">{status}</span></p>
                    <p className="text-gray-400">URL: <span className="text-blue-400">{url}</span></p>
                    <p className="text-gray-400">Playing State: <span className={isPlaying ? "text-green-400" : "text-red-400"}>{isPlaying ? 'PLAYING' : 'PAUSED'}</span></p>
                </div>

                <div className="aspect-video bg-gray-900 rounded-3xl border border-gray-800 overflow-hidden shadow-2xl relative">
                    <Player
                        src={url}
                        playing={isPlaying}
                        controls
                        muted={true}
                        width="100%"
                        height="100%"
                        onReady={() => setStatus('Player Ready (onReady fired)')}
                        onStart={() => setStatus('Playback Started')}
                        onPlay={() => {
                            setStatus('Playing');
                            setIsPlaying(true);
                        }}
                        onPause={() => {
                            setStatus('Paused');
                            setIsPlaying(false);
                        }}
                        onError={(e: any) => setStatus('Error: ' + JSON.stringify(e))}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800">
                        <h2 className="text-xl font-semibold mb-4 text-purple-400">Standard Pattern</h2>
                        <pre className="bg-black/50 p-4 rounded-xl font-mono text-xs text-gray-300 overflow-x-auto">
                            {`import ReactPlayer from 'react-player'

<ReactPlayer 
  url='${url}' 
  playing={isPlaying}
  onPlay={() => setIsPlaying(true)}
  onPause={() => setIsPlaying(false)}
  controls 
/>`}
                        </pre>
                    </div>

                    <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800">
                        <h2 className="text-xl font-semibold mb-4 text-pink-400">Alternative Options</h2>
                        <div className="space-y-2">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
                            >
                                Force Reload Page
                            </button>
                            <p className="text-[10px] text-gray-500 italic mt-4">
                                If the player shows a standard Play button but remains black, it usually means the YouTube API script failed to load or the URL wasn't recognized by the player.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
