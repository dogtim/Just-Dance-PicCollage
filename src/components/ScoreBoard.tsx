'use client';

import React from 'react';

interface ScoreBoardProps {
    score: number;
    feedback: string;
    lastScore?: number;
    onShowLeaderboard?: () => void;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ score, feedback, lastScore, onShowLeaderboard }) => {
    return (
        <div className="flex flex-col gap-4 p-6 bg-gray-900/80 backdrop-blur-md rounded-2xl border border-gray-700 text-white shadow-xl min-w-[200px]">
            {lastScore !== undefined && (
                <div className="pb-4 border-b border-gray-800">
                    <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Last Run</h3>
                    <div className="text-xl font-bold text-gray-400">
                        {lastScore.toLocaleString()}
                    </div>
                </div>
            )}
            <div>
                <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Total Score</h3>
                <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
                    {score.toLocaleString()}
                </div>
            </div>

            <div>
                <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Feedback</h3>
                <div className={`text-2xl font-bold ${feedback === 'Perfect' ? 'text-purple-400' :
                    feedback === 'Great' ? 'text-green-400' :
                        feedback === 'Good' ? 'text-yellow-400' :
                            'text-red-400'
                    }`}>
                    {feedback || 'Ready'}
                </div>
            </div>

            {onShowLeaderboard && (
                <button
                    onClick={onShowLeaderboard}
                    className="mt-2 w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-semibold text-gray-300 transition-colors flex items-center justify-center gap-2"
                >
                    <span>🏆</span> Leaderboard
                </button>
            )}
        </div>
    );
};

export default ScoreBoard;
