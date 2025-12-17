'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useSettings } from '../context/SettingsContext';
import DanceCanvas from '../components/DanceCanvas';
import ScoreBoard from '../components/ScoreBoard';
import SamplePlaylist from '../components/SamplePlaylist';
import { saveScore } from '../utils/leaderboardService';
import Leaderboard from '../components/Leaderboard';

export default function Home() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
      <HomeContent />
    </React.Suspense>
  );
}

function HomeContent() {
  const { userName, setUserName } = useSettings();
  const searchParams = useSearchParams();
  const [url, setUrl] = useState('');
  const [youtubeId, setYoutubeId] = useState<string | null>(null);
  const [currentVideoTitle, setCurrentVideoTitle] = useState<string>('');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('Ready');
  // Persist last score with safe hydration
  const [lastScore, setLastScore] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    // Load from local storage on client mount
    const saved = localStorage.getItem('just-dance-last-score');
    if (saved) {
      setLastScore(parseInt(saved, 10));
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    // Only save if we have loaded (prevents overwriting with default 0)
    if (isLoaded) {
      localStorage.setItem('just-dance-last-score', lastScore.toString());
    }
  }, [lastScore, isLoaded]);

  const parseVideoId = (inputUrl: string) => {
    let id = '';
    try {
      if (inputUrl.includes('v=')) {
        id = inputUrl.split('v=')[1].split('&')[0];
      } else if (inputUrl.includes('youtu.be/')) {
        id = inputUrl.split('youtu.be/')[1].split('?')[0];
      } else if (inputUrl.includes('shorts/')) {
        id = inputUrl.split('shorts/')[1].split('?')[0];
      }
    } catch (e) {
      console.error(e);
    }
    return id;
  };

  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null);
  const [processedMeshUrl, setProcessedMeshUrl] = useState<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startProcessing = async (id: string, fullUrl: string) => {
    setProcessingStatus('Starting processing...');
    setProcessedVideoUrl(null);
    setProcessedMeshUrl(null);
    setYoutubeId(null); // Clear previous session if any

    try {
      // Trigger processing
      const res = await fetch('/api/process-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: id, url: fullUrl }),
      });
      const data = await res.json();

      if (data.status === 'completed') {
        setProcessingStatus(null);
        setYoutubeId(id); // Set youtubeId FIRST
        setProcessedVideoUrl(data.videoUrl); // Then set processedVideoUrl
        setProcessedMeshUrl(data.meshUrl || null);
        return;
      }

      setProcessingStatus('Processing Dance Routine... This may take a minute.');

      // Poll for status
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

      pollIntervalRef.current = setInterval(async () => {
        try {
          const pollRes = await fetch(`/api/process-video?videoId=${id}`);
          const pollData = await pollRes.json();

          if (pollData.status === 'completed') {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            setProcessingStatus(null);
            setYoutubeId(id); // Set youtubeId FIRST
            setProcessedVideoUrl(pollData.videoUrl); // Then set processedVideoUrl
            setProcessedMeshUrl(pollData.meshUrl || null);
          } else if (pollData.status === 'not_found' || pollData.error) {
            // Check error
          }
        } catch (e) {
          console.error("Polling error", e);
        }
      }, 3000);

    } catch (e) {
      console.error(e);
      alert("Error starting video processing");
      setProcessingStatus(null);
    }
  };

  const handleStart = () => {
    const id = parseVideoId(url);
    if (id) {
      setCurrentVideoTitle('Custom Video');
      setLastScore(0);
      startProcessing(id, url);
    } else {
      alert("Invalid YouTube URL");
    }
  };

  const handlePreset = (presetUrl: string, title?: string) => {
    setUrl(presetUrl);
    setCurrentVideoTitle(title || 'Unknown Video');
    const id = parseVideoId(presetUrl);
    if (id) {
      setLastScore(0);
      startProcessing(id, presetUrl);
    }
  };

  // Handle custom URL from settings
  useEffect(() => {
    const customUrl = searchParams.get('customUrl');
    if (customUrl && !youtubeId) {
      setUrl(customUrl);
      setCurrentVideoTitle('Custom Video');
      const id = parseVideoId(customUrl);
      if (id) {
        setLastScore(0);
        startProcessing(id, customUrl);
      }
    }
  }, [searchParams]);

  // Cleanup polling on unmount
  React.useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // Keep score in ref to avoid stale closures in callbacks
  const scoreRef = useRef(score);
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  const handleScoreUpdate = (points: number, newFeedback: string) => {
    setScore(prev => prev + points);
    setFeedback(newFeedback);
  };

  const handleScoreReset = () => {
    setScore(0);
    setFeedback('Ready');
  };

  return (
    <div className="min-h-screen text-white font-sans selection:bg-purple-500 selection:text-white relative overflow-hidden bg-black">
      {/* Background Image Layer - Absolute Positioned */}
      <div className="absolute inset-0">
        <img
          src="/images/just_dance_2025.png"
          alt="Just Dance 2025 Background"
          className="w-full h-full object-cover opacity-70 border-40 border-black"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
      </div>

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <Leaderboard
          currentVideoTitle={currentVideoTitle || 'Global'}
          onClose={() => setShowLeaderboard(false)}
        />
      )}

      {/* User Name Setup Dialog */}
      {!userName && isLoaded && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-500">
          <div className="bg-gray-900 border border-purple-500/30 p-8 rounded-2xl shadow-2xl max-w-md w-full space-y-6">
            <div className="text-center space-y-2">
              <div className="text-5xl mb-4">👋</div>
              <h2 className="text-2xl font-bold text-white">Welcome, Dancer!</h2>
              <p className="text-gray-400">What should we call you?</p>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (nameInput.trim()) setUserName(nameInput.trim());
            }} className="space-y-4">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Your Name"
                className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors text-center text-lg"
                autoFocus
              />
              <button
                type="submit"
                disabled={!nameInput.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
              >
                Let's Dance!
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Global Loading Overlay */}
      {processingStatus && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm text-white animate-in fade-in duration-300 cursor-progress">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mb-4 shadow-[0_0_15px_rgba(168,85,247,0.5)]"></div>
          <p className="text-xl font-bold animate-pulse tracking-wider">{processingStatus}</p>
        </div>
      )}



      {/* Navbar / Header - Only show when NOT playing */}
      {!youtubeId && (
        <header className="p-6 flex justify-between items-center border-b border-gray-800/50 bg-black/30 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <span className="text-4xl">🕺</span>
            <div className="flex flex-col">
              <h1 className="text-3xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 hover:scale-105 transition-transform cursor-default">
                JUST DANCE FOR EVERYONE
              </h1>
              {userName && <span className="text-xs text-gray-400 font-mono tracking-wide">Hi, {userName}</span>}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a href="/setting" className="p-2 bg-gray-800/80 rounded-full hover:bg-gray-700 transition-colors border border-gray-700 text-xl backdrop-blur-sm" title="Settings">
              ⚙️
            </a>
          </div>
        </header>
      )}

      {/* Floating ScoreBoard - Only show when playing */}
      {youtubeId && (
        <div className="absolute top-6 right-6 z-50 pointer-events-none">
          <div className="pointer-events-auto">
            <ScoreBoard
              score={score}
              feedback={feedback}
              lastScore={lastScore}
              onShowLeaderboard={() => setShowLeaderboard(true)}
            />
          </div>
        </div>
      )}

      <main className={`flex flex-col items-center gap-8 relative z-10 ${youtubeId ? 'w-full h-screen p-4 overflow-hidden' : 'container mx-auto p-4 md:p-8'}`}>

        {/* Setup / Input Section */}
        {!youtubeId && (
          <div className="w-full max-w-2xl flex flex-col gap-6 items-center animate-in fade-in slide-in-from-bottom-10 duration-700">

            <div className={`transition-opacity duration-300 ${processingStatus ? 'pointer-events-none opacity-50 select-none' : ''}`}>
              <SamplePlaylist onSelect={handlePreset} />
            </div>
          </div>
        )}

        {/* Game Active Section */}
        {youtubeId && (
          <div className="w-full h-full flex flex-col gap-4 animate-in zoom-in-95 duration-500 relative">


            <DanceCanvas
              key={youtubeId}
              youtubeId={youtubeId}
              processedVideoUrl={processedVideoUrl}
              processedMeshUrl={processedMeshUrl}
              onScoreUpdate={handleScoreUpdate}
              onScoreReset={handleScoreReset}
              onVideoEnded={() => {
                const finalScore = scoreRef.current;
                console.log('Video ended. Saving score:', finalScore);
                setLastScore(finalScore);
                if (userName && finalScore > 0) {
                  saveScore(userName, currentVideoTitle, finalScore);
                }
              }}
            />

            <button
              onClick={() => { setYoutubeId(null); setScore(0); setLastScore(0); }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 px-8 py-3 bg-red-600/20 hover:bg-red-600/80 text-white backdrop-blur-md rounded-full transition-all border border-red-500/50 hover:scale-105 shadow-xl z-50 font-semibold"
            >
              Stop Session
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
