'use client';

import React from 'react';
import Link from 'next/link';

export default function DanceLoop() {
    return (
        <div className="min-h-screen bg-black text-white font-sans p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                        Dance Loop
                    </h1>
                    <Link href="/" className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                        Back to Home
                    </Link>
                </div>

                <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-8 border border-gray-800 flex items-center justify-center min-h-[400px]">
                    <p className="text-2xl font-light text-gray-400">Hello World</p>
                </div>
            </div>
        </div>
    );
}
