import React, { useState } from 'react';

interface UserNameDialogProps {
    onComplete: (name: string) => void;
}

export const UserNameDialog: React.FC<UserNameDialogProps> = ({ onComplete }) => {
    const [nameInput, setNameInput] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (nameInput.trim()) {
            onComplete(nameInput.trim());
        }
    };

    return (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-500">
            <div className="bg-gray-900 border border-purple-500/30 p-8 rounded-2xl shadow-2xl max-w-md w-full space-y-6">
                <div className="text-center space-y-2">
                    <div className="text-5xl mb-4">👋</div>
                    <h2 className="text-2xl font-bold text-white">Welcome, Dancer!</h2>
                    <p className="text-gray-400">What should we call you?</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
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
    );
};
