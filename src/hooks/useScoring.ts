import { useState, useEffect, useRef } from 'react';

export const useScoring = () => {
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState('Ready');
    const [lastScore, setLastScore] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);
    const scoreRef = useRef(score);

    useEffect(() => {
        scoreRef.current = score;
    }, [score]);

    useEffect(() => {
        const saved = localStorage.getItem('just-dance-last-score');
        if (saved) {
            setLastScore(parseInt(saved, 10));
        }
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('just-dance-last-score', lastScore.toString());
        }
    }, [lastScore, isLoaded]);

    const handleScoreUpdate = (points: number, newFeedback: string) => {
        setScore(prev => prev + points);
        setFeedback(newFeedback);
    };

    const handleScoreReset = () => {
        setScore(0);
        setFeedback('Ready');
    };

    return {
        score,
        setScore,
        scoreRef,
        feedback,
        setFeedback,
        lastScore,
        setLastScore,
        isLoaded,
        handleScoreUpdate,
        handleScoreReset
    };
};
