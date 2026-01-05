


import React, { useState } from 'react';

interface LoginProps {
    onLogin: (username: string, password: string) => Promise<boolean>;
    onSwitchToRegister: () => void;
    onBack?: () => void;
}

export const Login = ({ onLogin, onSwitchToRegister, onBack }: LoginProps) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) {
            setError('Please enter both username and password.');
            return;
        }
        
        setIsLoading(true);
        setError('');

        const success = await onLogin(username, password);

        setIsLoading(false);

        if (!success) {
            setError('Invalid credentials. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-ahava-background flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="mb-4 text-ahava-purple-light hover:text-white flex items-center text-sm"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>
                )}
                <div className="bg-ahava-surface shadow-lg rounded-xl p-6 sm:p-8 border border-ahava-purple-dark">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-100 tracking-wider">AHAVA CHOIR</h1>
                        <p className="text-gray-400 mt-2">Welcome back! Please login to your account.</p>
                    </div>
                    {error && <p className="bg-red-500/20 text-red-300 p-3 rounded-md mb-4 text-sm">{error}</p>}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-300">Username</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                autoComplete="username"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-ahava-purple-dark border border-ahava-purple-medium rounded-md shadow-sm placeholder-gray-500 text-gray-200 focus:outline-none focus:ring-ahava-magenta focus:border-ahava-magenta sm:text-sm"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-ahava-purple-dark border border-ahava-purple-medium rounded-md shadow-sm placeholder-gray-500 text-gray-200 focus:outline-none focus:ring-ahava-magenta focus:border-ahava-magenta sm:text-sm"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-ahava-purple-dark hover:bg-ahava-purple-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ahava-purple-light disabled:bg-ahava-purple-light disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Logging in...' : 'Login'}
                            </button>
                        </div>
                    </form>
                    <div className="text-center mt-6">
                        <p className="text-sm text-gray-400">
                            Don't have an account?{' '}
                            <button onClick={onSwitchToRegister} className="font-medium text-ahava-magenta hover:text-purple-400">
                                Register
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
