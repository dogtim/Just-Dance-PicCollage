'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSettings } from '../context/SettingsContext';

// Hooks
import { useVideoProcessing } from '../hooks/useVideoProcessing';
import { useScoring } from '../hooks/useScoring';

// Components
import DanceCanvas from '../components/DanceCanvas';
import ScoreBoard from '../components/ScoreBoard';
import SamplePlaylist from '../components/SamplePlaylist';
import Leaderboard from '../components/Leaderboard';
import { UserNameDialog } from '../components/Home/UserNameDialog';
import { AppHeader } from '../components/Home/AppHeader';
import { saveScore } from '../utils/leaderboardService';

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
  const [currentVideoTitle, setCurrentVideoTitle] = useState<string>('');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [url, setUrl] = useState('');

  const {
    youtubeId,
    setYoutubeId,
    processingStatus,
    processedVideoUrl,
    processedMeshUrl,
    startProcessing
  } = useVideoProcessing();

  const {
    score,
    setScore,
    scoreRef,
    feedback,
    lastScore,
    setLastScore,
    isLoaded,
    handleScoreUpdate,
    handleScoreReset
  } = useScoring();

  // URL Parsing helper
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

  const handlePreset = (presetUrl: string, title?: string) => {
    setUrl(presetUrl);
    setCurrentVideoTitle(title || 'Unknown Video');
    const id = parseVideoId(presetUrl);
    if (id) {
      setLastScore(0);
      startProcessing(id, presetUrl, title || 'Unknown Video');
    }
  };

  // Handle custom URL from settings/search params
  useEffect(() => {
    const customUrl = searchParams.get('customUrl');
    if (customUrl && !youtubeId) {
      handlePreset(customUrl, 'Custom Video');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen text-white font-sans selection:bg-purple-500 selection:text-white relative overflow-hidden bg-black">
      {/* Background Image Layer */}
      <div className="absolute inset-0">
        <img
          src="/images/just_dance_2025.png"
          alt="Just Dance 2025 Background"
          className="w-full h-full object-cover opacity-70 border-40 border-black"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
      </div>

      {/* Modals & Overlays */}
      {showLeaderboard && (
        <Leaderboard
          currentVideoTitle={currentVideoTitle || 'Global'}
          onClose={() => setShowLeaderboard(false)}
        />
      )}

      {!userName && isLoaded && (
        <UserNameDialog onComplete={setUserName} />
      )}

      {processingStatus && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm text-white animate-in fade-in duration-300 cursor-progress">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mb-4 shadow-[0_0_15px_rgba(168,85,247,0.5)]"></div>
          <p className="text-xl font-bold animate-pulse tracking-wider">{processingStatus}</p>
        </div>
      )}

      {/* UI Content */}
      {!youtubeId && <AppHeader userName={userName} />}

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
        {!youtubeId ? (
          <div className="w-full max-w-2xl flex flex-col gap-6 items-center animate-in fade-in slide-in-from-bottom-10 duration-700">
            <div className={`transition-opacity duration-300 ${processingStatus ? 'pointer-events-none opacity-50 select-none' : ''}`}>
              <SamplePlaylist onSelect={handlePreset} />
            </div>
          </div>
        ) : (
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
              Exit
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
