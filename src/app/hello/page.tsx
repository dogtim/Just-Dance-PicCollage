import React from 'react';

export default function HelloPage() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20 pointer-events-none" />

            <main className="relative z-10 text-center space-y-8 animate-in fade-in zoom-in duration-1000">
                <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                    <h1 className="relative text-6xl md:text-8xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 tracking-tighter">
                        HELLO WORLD
                    </h1>
                </div>

                <p className="text-gray-400 text-xl md:text-2xl font-light tracking-widest uppercase">
                    Welcome to the Dance Universe
                </p>

                <div className="pt-8">
                    <a
                        href="/"
                        className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all duration-300 backdrop-blur-sm text-sm font-medium tracking-widest uppercase hover:scale-105"
                    >
                        Return Home
                    </a>
                </div>
            </main>

            <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 opacity-50" />
        </div>
    );
}
