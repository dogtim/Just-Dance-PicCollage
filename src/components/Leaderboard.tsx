import React, { useEffect, useState } from 'react';
import { getLeaderboard, LeaderboardEntry } from '../utils/leaderboardService';

interface LeaderboardProps {
    currentVideoTitle: string;
    onClose: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ currentVideoTitle, onClose }) => {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchScores = async () => {
            setLoading(true);
            const data = await getLeaderboard(currentVideoTitle);
            setEntries(data);
            setLoading(false);
        };

        if (currentVideoTitle) {
            fetchScores();
        }
    }, [currentVideoTitle]);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-gray-900 border border-purple-500/30 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-800/30">
                    <div>
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
                            Leaderboard
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">
                            {currentVideoTitle === 'Custom Video' ? 'Global Rankings' : currentVideoTitle}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white"
                    >
                        ✕
                    </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-2">
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                        </div>
                    ) : entries.length === 0 ? (
                        <div className="text-center text-gray-500 py-10">
                            No records yet. Be the first to dance!
                        </div>
                    ) : (
                        entries.map((entry, index) => (
                            <div
                                key={entry.id || index}
                                className={`flex items-center p-4 rounded-xl border border-gray-800/50 ${index < 3 ? 'bg-gray-800/40' : 'bg-gray-900/40'}`}
                            >
                                <div className={`w-8 h-8 flex items-center justify-center font-bold rounded-full mr-4 ${index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                                        index === 1 ? 'bg-gray-400/20 text-gray-400' :
                                            index === 2 ? 'bg-orange-700/20 text-orange-700' :
                                                'text-gray-600'
                                    }`}>
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-gray-200">{entry.userName}</div>
                                    <div className="text-xs text-gray-500">
                                        {entry.timestamp?.toDate ? entry.timestamp.toDate().toLocaleDateString() : 'Just now'}
                                    </div>
                                </div>
                                <div className="text-2xl font-black text-purple-400">
                                    {entry.score.toLocaleString()}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
