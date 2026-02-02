import React from 'react';

interface ErrorProps {
    message?: string;
    retry?: () => void;
}

export const Error: React.FC<ErrorProps> = ({ message = 'Something went wrong', retry }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[200px] text-center p-4">
            <div className="text-red-500 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Error</h3>
            <p className="text-gray-500 mb-4">{message}</p>
            {retry && (
                <button
                    onClick={retry}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                    Try Again
                </button>
            )}
        </div>
    );
};
