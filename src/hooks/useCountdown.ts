import { useState, useEffect } from 'react';

export const useCountdown = (onComplete: () => void) => {
    const [countdown, setCountdown] = useState<number | null>(null);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (countdown !== null && countdown > 0) {
            timer = setTimeout(() => {
                setCountdown(curr => (curr !== null ? curr - 1 : null));
            }, 1000);
        } else if (countdown === 0) {
            onComplete();
            setCountdown(null);
        }
        return () => clearTimeout(timer);
    }, [countdown, onComplete]);

    const startCountdown = (duration: number) => {
        setCountdown(duration);
    };

    const stopCountdown = () => {
        setCountdown(null);
    };

    return { countdown, startCountdown, stopCountdown };
};
