'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type DetectionModel = 'Google Media Pipe' | 'Meta 3D Body';

interface SettingsContextType {
    detectionModel: DetectionModel;
    setDetectionModel: (model: DetectionModel) => void;
    startDelay: number;
    setStartDelay: (delay: number) => void;
    showDebugInfo: boolean;
    setShowDebugInfo: (show: boolean) => void;
    userName: string;
    setUserName: (name: string) => void;
    poseAlpha: number;
    setPoseAlpha: (alpha: number) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
    // Initialize state with default, but try to update from localStorage if available
    const [detectionModel, setDetectionModel] = useState<DetectionModel>('Google Media Pipe');
    const [startDelay, setStartDelay] = useState<number>(3);
    const [showDebugInfo, setShowDebugInfo] = useState<boolean>(false);
    const [userName, setUserName] = useState<string>('');
    const [poseAlpha, setPoseAlpha] = useState<number>(0.3);

    useEffect(() => {
        // Run only on client-side mount
        const savedModel = localStorage.getItem('just-dance-detection-model');
        if (savedModel && (savedModel === 'Google Media Pipe' || savedModel === 'Meta 3D Body')) {
            setDetectionModel(savedModel as DetectionModel);
        }

        const savedDelay = localStorage.getItem('just-dance-start-delay');
        if (savedDelay) {
            setStartDelay(parseInt(savedDelay, 10));
        }

        const savedDebug = localStorage.getItem('just-dance-show-debug');
        if (savedDebug) {
            setShowDebugInfo(savedDebug === 'true');
        }

        const savedName = localStorage.getItem('just-dance-username');
        if (savedName) {
            setUserName(savedName);
        }

        const savedAlpha = localStorage.getItem('just-dance-pose-alpha');
        if (savedAlpha) {
            setPoseAlpha(parseFloat(savedAlpha));
        }
    }, []);

    const updateDetectionModel = (model: DetectionModel) => {
        setDetectionModel(model);
        localStorage.setItem('just-dance-detection-model', model);
    };

    const updateStartDelay = (delay: number) => {
        setStartDelay(delay);
        localStorage.setItem('just-dance-start-delay', delay.toString());
    };

    const updateShowDebugInfo = (show: boolean) => {
        setShowDebugInfo(show);
        localStorage.setItem('just-dance-show-debug', String(show));
    };

    const updateUserName = (name: string) => {
        setUserName(name);
        localStorage.setItem('just-dance-username', name);
    };

    const updatePoseAlpha = (alpha: number) => {
        setPoseAlpha(alpha);
        localStorage.setItem('just-dance-pose-alpha', alpha.toString());
    };

    return (
        <SettingsContext.Provider value={{
            detectionModel,
            setDetectionModel: updateDetectionModel,
            startDelay,
            setStartDelay: updateStartDelay,
            showDebugInfo,
            setShowDebugInfo: updateShowDebugInfo,
            userName,
            setUserName: updateUserName,
            poseAlpha,
            setPoseAlpha: updatePoseAlpha
        }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
