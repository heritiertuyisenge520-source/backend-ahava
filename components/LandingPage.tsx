import React from 'react';

interface LandingPageProps {
    onContinue: () => void;
    onQuickLogin?: (username: string, password: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onContinue, onQuickLogin }) => {
    const handleQuickLogin = (username: string, password: string) => {
        if (onQuickLogin) {
            onQuickLogin(username, password);
        }
    };

    return (
        <div className="min-h-screen bg-ahava-background flex flex-col items-center justify-center text-center px-4 py-8">
            <div className="max-w-4xl w-full">
                <h1 className="text-4xl md:text-6xl font-bold text-gray-100 mb-6">
                    Welcome to Ahava Choir Management
                </h1>
                <p className="text-lg md:text-xl text-gray-400 mb-8">
                    Harmonize your choir's activities with our comprehensive management system.
                    Manage singers, songs, events, and more with ease.
                </p>

                {/* Quick Login Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-ahava-surface p-6 rounded-lg border border-ahava-purple-medium hover:border-ahava-purple-light transition-colors">
                        <h3 className="text-xl font-semibold text-gray-100 mb-2">President</h3>
                        <p className="text-gray-400 text-sm mb-4">Full administrative access</p>
                        <div className="space-y-2 mb-4">
                            <div className="text-xs text-gray-500">
                                <span className="font-medium">Username:</span> TUYISENGE.Hertier
                            </div>
                            <div className="text-xs text-gray-500">
                                <span className="font-medium">Password:</span> 123
                            </div>
                        </div>
                        <button
                            onClick={() => handleQuickLogin('TUYISENGE.Hertier', '123')}
                            className="w-full bg-ahava-purple-dark hover:bg-ahava-purple-medium text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                        >
                            Login as President
                        </button>
                    </div>

                    <div className="bg-ahava-surface p-6 rounded-lg border border-ahava-purple-medium hover:border-ahava-purple-light transition-colors">
                        <h3 className="text-xl font-semibold text-gray-100 mb-2">Song Conductor</h3>
                        <p className="text-gray-400 text-sm mb-4">Manage songs and musical content</p>
                        <div className="space-y-2 mb-4">
                            <div className="text-xs text-gray-500">
                                <span className="font-medium">Username:</span> IRAGENA
                            </div>
                            <div className="text-xs text-gray-500">
                                <span className="font-medium">Password:</span> 123
                            </div>
                        </div>
                        <button
                            onClick={() => handleQuickLogin('IRAGENA', '123')}
                            className="w-full bg-ahava-purple-dark hover:bg-ahava-purple-medium text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                        >
                            Login as Song Conductor
                        </button>
                    </div>

                    <div className="bg-ahava-surface p-6 rounded-lg border border-ahava-purple-medium hover:border-ahava-purple-light transition-colors">
                        <h3 className="text-xl font-semibold text-gray-100 mb-2">Advisor</h3>
                        <p className="text-gray-400 text-sm mb-4">Guidance and oversight role</p>
                        <div className="space-y-2 mb-4">
                            <div className="text-xs text-gray-500">
                                <span className="font-medium">Username:</span> TUYISENGE.Gad
                            </div>
                            <div className="text-xs text-gray-500">
                                <span className="font-medium">Password:</span> 123
                            </div>
                        </div>
                        <button
                            onClick={() => handleQuickLogin('TUYISENGE.Gad', '123')}
                            className="w-full bg-ahava-purple-dark hover:bg-ahava-purple-medium text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                        >
                            Login as Advisor
                        </button>
                    </div>
                </div>

                {/* Continue Button */}
                <button
                    onClick={onContinue}
                    className="group flex flex-col items-center space-y-4 bg-ahava-purple-dark hover:bg-ahava-purple-medium text-white font-semibold py-6 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg mx-auto"
                    aria-label="Continue to Dashboard"
                >
                    <span className="text-lg">Get Started</span>
                    <svg
                        className="w-8 h-8 animate-bounce group-hover:animate-pulse"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default LandingPage;
