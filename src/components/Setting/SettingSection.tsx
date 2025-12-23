import React from 'react';

interface SettingSectionProps {
    title: string;
    description: string;
    children: React.ReactNode;
    isFirst?: boolean;
}

export const SettingSection: React.FC<SettingSectionProps> = ({ title, description, children, isFirst = false }) => {
    return (
        <div className={`flex flex-col gap-2 ${!isFirst ? 'pt-6 border-t border-gray-800' : ''}`}>
            <label className="text-lg font-semibold text-gray-200">{title}</label>
            <p className="text-sm text-gray-500 mb-2">{description}</p>
            {children}
        </div>
    );
};
