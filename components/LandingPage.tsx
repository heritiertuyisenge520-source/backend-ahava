import React, { useState, useEffect, useRef } from 'react';
import { FacebookIcon, InstagramIcon, TwitterIcon, YoutubeIcon, MusicalNoteIcon } from './Icons';

interface LandingPageProps {
    onLogin: () => void;
    onRegister: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onRegister }) => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const [typedText, setTypedText] = useState('');
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const words = ['Excellence', 'Harmony', 'Passion', 'Community', 'Spirit'];

    // Typing effect for dynamic words
    useEffect(() => {
        const currentWord = words[currentWordIndex];
        let charIndex = 0;

        const typeWriter = setInterval(() => {
            if (charIndex < currentWord.length) {
                setTypedText(currentWord.slice(0, charIndex + 1));
                charIndex++;
            } else {
                clearInterval(typeWriter);
                setTimeout(() => {
                    setCurrentWordIndex((prev) => (prev + 1) % words.length);
                    setTypedText('');
                }, 2000);
            }
        }, 150);

        return () => clearInterval(typeWriter);
    }, [currentWordIndex]);

    // Mouse tracking for interactive effects
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setMousePosition({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                });
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Interactive musical notes component
    const AnimatedNote = ({ delay, position, interactive = false }: {
        delay: number;
        position: string;
        interactive?: boolean
    }) => {
        const [notePosition, setNotePosition] = useState({ x: 0, y: 0 });

        useEffect(() => {
            if (interactive) {
                const interval = setInterval(() => {
                    setNotePosition({
                        x: (Math.random() - 0.5) * 20,
                        y: (Math.random() - 0.5) * 20
                    });
                }, 2000 + Math.random() * 2000);
                return () => clearInterval(interval);
            }
        }, [interactive]);

        return (
            <div
                className={`absolute opacity-20 animate-bounce ${position} cursor-pointer hover:opacity-60 transition-opacity duration-300`}
                style={{
                    animationDelay: `${delay}s`,
                    animationDuration: '3s',
                    animationIterationCount: 'infinite',
                    transform: interactive ? `translate(${notePosition.x}px, ${notePosition.y}px)` : undefined
                }}
                onClick={() => {
                    // Add click effect
                    const element = document.createElement('div');
                    element.className = 'absolute w-4 h-4 bg-ahava-magenta rounded-full animate-ping';
                    element.style.left = `${mousePosition.x}px`;
                    element.style.top = `${mousePosition.y}px`;
                    containerRef.current?.appendChild(element);
                    setTimeout(() => element.remove(), 1000);
                }}
            >
                <MusicalNoteIcon className="w-8 h-8 text-ahava-magenta hover:text-ahava-purple-light transition-colors duration-300" />
            </div>
        );
    };

    // Interactive particle component
    const InteractiveParticle = ({ x, y, delay }: { x: number; y: number; delay: number }) => {
        const [particlePosition, setParticlePosition] = useState({ x: 0, y: 0 });

        useEffect(() => {
            const updatePosition = () => {
                const distance = Math.sqrt(
                    Math.pow(mousePosition.x - x, 2) + Math.pow(mousePosition.y - y, 2)
                );
                if (distance < 150) {
                    const angle = Math.atan2(mousePosition.y - y, mousePosition.x - x);
                    const force = (150 - distance) / 150;
                    setParticlePosition({
                        x: Math.cos(angle) * force * 30,
                        y: Math.sin(angle) * force * 30
                    });
                } else {
                    setParticlePosition({ x: 0, y: 0 });
                }
            };

            const interval = setInterval(updatePosition, 50);
            return () => clearInterval(interval);
        }, [mousePosition, x, y]);

        return (
            <div
                className="absolute w-2 h-2 bg-ahava-magenta rounded-full animate-pulse opacity-60 transition-all duration-300"
                style={{
                    left: `${x}px`,
                    top: `${y}px`,
                    animationDelay: `${delay}s`,
                    transform: `translate(${particlePosition.x}px, ${particlePosition.y}px)`
                }}
            />
        );
    };

    return (
        <div
            ref={containerRef}
            className="relative min-h-screen bg-gradient-to-br from-ahava-background via-ahava-purple-dark/20 to-ahava-background overflow-hidden cursor-default"
        >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <AnimatedNote delay={0} position="top-20 left-10" />
                <AnimatedNote delay={1} position="top-40 right-16" />
                <AnimatedNote delay={2} position="bottom-32 left-20" />
                <AnimatedNote delay={0.5} position="bottom-20 right-10" />
                <AnimatedNote delay={1.5} position="top-1/2 left-1/4" interactive />
                <AnimatedNote delay={2.5} position="top-1/3 right-1/3" interactive />
            </div>

            {/* Interactive Floating particles effect */}
            <div className="absolute inset-0">
                <InteractiveParticle x={window.innerWidth * 0.25} y={window.innerHeight * 0.25} delay={0} />
                <InteractiveParticle x={window.innerWidth * 0.75} y={window.innerHeight * 0.75} delay={1} />
                <InteractiveParticle x={window.innerWidth * 0.17} y={window.innerHeight * 0.5} delay={2} />
                <InteractiveParticle x={window.innerWidth * 0.83} y={window.innerHeight * 0.3} delay={0.5} />
                <InteractiveParticle x={window.innerWidth * 0.5} y={window.innerHeight * 0.8} delay={1.5} />
            </div>

            <div className="relative z-10 min-h-screen px-4 py-8">
                <div className="max-w-7xl mx-auto">
                    {/* Main Content Layout - Two Columns */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-screen">
                        {/* LEFT COLUMN - Content & Information */}
                        <div className="space-y-8 text-left">
                            {/* Choir Logo */}
                            <div className="mb-6">
                                <img
                                    src="/ahava logo.png"
                                    alt="Ahava University Choir Logo"
                                    className="w-24 h-24 md:w-32 md:h-32 mx-auto lg:mx-0 animate-pulse hover:scale-105 transition-transform duration-300 cursor-pointer"
                                    onClick={() => {
                                        // Add musical note effect on click
                                        const note = document.createElement('div');
                                        note.className = 'absolute text-4xl animate-bounce';
                                        note.textContent = '🎵';
                                        note.style.left = `${mousePosition.x}px`;
                                        note.style.top = `${mousePosition.y}px`;
                                        containerRef.current?.appendChild(note);
                                        setTimeout(() => note.remove(), 2000);
                                    }}
                                />
                            </div>

                            {/* Choir Logo/Title with Animation */}
                            <div className="mb-8">
                                <div className="relative mb-6">
                                    <h1
                                        className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-ahava-magenta via-ahava-purple-light to-ahava-magenta animate-pulse select-none"
                                        onMouseEnter={() => setIsHovered(true)}
                                        onMouseLeave={() => setIsHovered(false)}
                                        style={{
                                            textShadow: isHovered ? '0 0 20px rgba(168, 85, 247, 0.5)' : 'none',
                                            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        AHAVA choir
                                    </h1>
                                    <div className="absolute inset-0 text-5xl md:text-7xl font-bold text-ahava-magenta opacity-20 blur-sm animate-pulse">
                                        AHAVA choir
                                    </div>
                                </div>
                                <h2
                                    className="text-2xl md:text-3xl font-semibold text-gray-100 mb-4 transition-all duration-300 hover:text-ahava-purple-light cursor-pointer"
                                    onClick={() => {
                                        // Add sparkle effect on click
                                        const sparkle = document.createElement('div');
                                        sparkle.className = 'absolute text-4xl animate-ping';
                                        sparkle.textContent = '✨';
                                        sparkle.style.left = `${mousePosition.x}px`;
                                        sparkle.style.top = `${mousePosition.y}px`;
                                        containerRef.current?.appendChild(sparkle);
                                        setTimeout(() => sparkle.remove(), 1000);
                                    }}
                                >
                                    University of Rwanda Nyagatare Campus
                                </h2>
                                <div
                                    className="w-20 h-1 bg-gradient-to-r from-ahava-magenta to-ahava-purple-light rounded-full transition-all duration-500 hover:w-28"
                                ></div>
                            </div>

                            {/* Interactive Description with Dynamic Text */}
                            <div className="space-y-6">
                                <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                                    Welcome to <span className="text-ahava-magenta font-semibold hover:text-ahava-purple-light transition-colors duration-300 cursor-pointer">Ahava Choir</span> -
                                    where <span className="text-ahava-purple-light font-semibold relative">
                                        harmony
                                        <span className="absolute -top-1 -right-1 text-sm animate-bounce">♪</span>
                                    </span> meets{' '}
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 font-bold animate-pulse">
                                        {typedText || 'Excellence'}
                                    </span>.
                                </p>
                                <p
                                    className="text-base md:text-lg text-gray-400 leading-relaxed transition-all duration-300 hover:text-gray-300 cursor-pointer"
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.textShadow = '0 2px 4px rgba(0,0,0,0.3)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.textShadow = 'none';
                                    }}
                                >
                                    Ahava Choir is composed of passionate ADPR students from the University of Rwanda Nyagatare Campus,
                                    dedicated to spreading the gospel through beautiful worship songs and fostering spiritual growth
                                    in community.
                                </p>
                                <p className="text-sm md:text-base text-gray-500 transition-all duration-300 hover:text-gray-400">
                                    Manage your choir activities, track attendance, organize events, and connect with fellow musicians.
                                </p>

                                {/* Interactive Mission Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                                    <div
                                        className="bg-gradient-to-br from-ahava-purple-dark/20 to-ahava-magenta/20 p-4 rounded-xl border border-ahava-purple-medium/30 hover:border-ahava-purple-light/50 transition-all duration-300 hover:scale-105 hover:shadow-lg group cursor-pointer"
                                        onClick={() => {
                                            // Add sparkle effect
                                            const sparkle = document.createElement('div');
                                            sparkle.className = 'absolute text-2xl animate-ping';
                                            sparkle.textContent = '⭐';
                                            sparkle.style.left = `${mousePosition.x}px`;
                                            sparkle.style.top = `${mousePosition.y}px`;
                                            containerRef.current?.appendChild(sparkle);
                                            setTimeout(() => sparkle.remove(), 1000);
                                        }}
                                    >
                                        <div className="text-center">
                                            <div className="text-3xl mb-2 group-hover:animate-bounce">🎵</div>
                                            <div className="text-sm font-semibold text-ahava-magenta group-hover:text-ahava-purple-light transition-colors">
                                                Worship Music
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1 group-hover:text-gray-300 transition-colors">
                                                Beautiful gospel songs
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        className="bg-gradient-to-br from-ahava-purple-dark/20 to-ahava-magenta/20 p-4 rounded-xl border border-ahava-purple-medium/30 hover:border-ahava-purple-light/50 transition-all duration-300 hover:scale-105 hover:shadow-lg group cursor-pointer"
                                        onClick={() => {
                                            // Add heart effect
                                            const heart = document.createElement('div');
                                            heart.className = 'absolute text-2xl animate-ping';
                                            heart.textContent = '💜';
                                            heart.style.left = `${mousePosition.x}px`;
                                            heart.style.top = `${mousePosition.y}px`;
                                            containerRef.current?.appendChild(heart);
                                            setTimeout(() => heart.remove(), 1000);
                                        }}
                                    >
                                        <div className="text-center">
                                            <div className="text-3xl mb-2 group-hover:animate-pulse">🙏</div>
                                            <div className="text-sm font-semibold text-ahava-magenta group-hover:text-ahava-purple-light transition-colors">
                                                Spiritual Growth
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1 group-hover:text-gray-300 transition-colors">
                                                Deepening faith together
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        className="bg-gradient-to-br from-ahava-purple-dark/20 to-ahava-magenta/20 p-4 rounded-xl border border-ahava-purple-medium/30 hover:border-ahava-purple-light/50 transition-all duration-300 hover:scale-105 hover:shadow-lg group cursor-pointer"
                                        onClick={() => {
                                            // Add music note effect
                                            const note = document.createElement('div');
                                            note.className = 'absolute text-2xl animate-bounce';
                                            note.textContent = '🎶';
                                            note.style.left = `${mousePosition.x}px`;
                                            note.style.top = `${mousePosition.y}px`;
                                            containerRef.current?.appendChild(note);
                                            setTimeout(() => note.remove(), 2000);
                                        }}
                                    >
                                        <div className="text-center">
                                            <div className="text-3xl mb-2 group-hover:animate-spin">🎼</div>
                                            <div className="text-sm font-semibold text-ahava-magenta group-hover:text-ahava-purple-light transition-colors">
                                                Community Impact
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1 group-hover:text-gray-300 transition-colors">
                                                Spreading gospel message
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN - Action Buttons */}
                        <div className="flex flex-col items-center justify-center space-y-8 lg:items-start">
                            <div className="bg-ahava-surface/30 backdrop-blur-sm rounded-2xl p-8 border border-ahava-purple-medium/50 shadow-2xl">
                                <h3 className="text-xl md:text-2xl font-semibold text-gray-100 mb-6 text-center lg:text-left">
                                    Get Started Today
                                </h3>
                                <p className="text-gray-400 mb-8 text-center lg:text-left">
                                    Join our musical community and start your journey with Ahava Choir
                                </p>

                                {/* Action Buttons with Enhanced Animation */}
                                <div className="flex flex-col gap-4">
                                    <button
                                        onClick={onLogin}
                                        className="group relative w-full bg-gradient-to-r from-ahava-purple-dark to-ahava-purple-medium hover:from-ahava-purple-medium hover:to-ahava-purple-light text-white font-semibold py-4 px-8 rounded-xl transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-ahava-purple-light/25 overflow-hidden"
                                    >
                                        <span className="relative z-10 flex items-center justify-center">
                                            <span>Login</span>
                                            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </span>
                                        <div className="absolute inset-0 bg-gradient-to-r from-ahava-magenta to-ahava-purple-light opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                                    </button>
                                    <button
                                        onClick={onRegister}
                                        className="group relative w-full bg-transparent border-2 border-ahava-purple-light hover:border-ahava-magenta text-ahava-purple-light hover:text-white font-semibold py-4 px-8 rounded-xl transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-ahava-magenta/25 overflow-hidden"
                                    >
                                        <span className="relative z-10 flex items-center justify-center">
                                            <span>Register</span>
                                            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                            </svg>
                                        </span>
                                        <div className="absolute inset-0 bg-gradient-to-r from-ahava-magenta to-ahava-purple-light opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                                    </button>
                                </div>

                                <div className="mt-6 text-center">
                                    <p className="text-xs text-gray-500">
                                        New to our community? <span className="text-ahava-magenta">Register now!</span>
                                    </p>
                                </div>

                                {/* Social Media Links - Now inside the card */}
                                <div className="mt-8 pt-6 border-t border-ahava-purple-medium/30">
                                    <h4 className="text-sm font-medium text-gray-400 mb-2 text-center">Follow Us</h4>
                                    <p className="text-xs text-ahava-magenta font-medium mb-4 text-center">
                                        Ahava Choir CEP UR Nyagatare
                                    </p>
                                    <div className="flex justify-center space-x-4">
                                        <a
                                            href="https://facebook.com/ahavauniversitychoir"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group p-3 rounded-full bg-ahava-surface/50 hover:bg-ahava-purple-dark border border-ahava-purple-medium/50 transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:-translate-y-1"
                                            aria-label="Follow us on Facebook"
                                        >
                                            <FacebookIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                                        </a>
                                        <a
                                            href="https://instagram.com/ahavauniversitychoir"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group p-3 rounded-full bg-ahava-surface/50 hover:bg-ahava-purple-dark border border-ahava-purple-medium/50 transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:-translate-y-1"
                                            aria-label="Follow us on Instagram"
                                        >
                                            <InstagramIcon className="w-5 h-5 text-gray-400 group-hover:text-pink-400 transition-colors" />
                                        </a>
                                        <a
                                            href="https://twitter.com/ahavauchoir"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group p-3 rounded-full bg-ahava-surface/50 hover:bg-ahava-purple-dark border border-ahava-purple-medium/50 transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:-translate-y-1"
                                            aria-label="Follow us on Twitter"
                                        >
                                            <TwitterIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-300 transition-colors" />
                                        </a>
                                        <a
                                            href="https://youtube.com/@ahavauniversitychoir"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group p-3 rounded-full bg-ahava-surface/50 hover:bg-ahava-purple-dark border border-ahava-purple-medium/50 transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:-translate-y-1"
                                            aria-label="Subscribe to our YouTube channel"
                                        >
                                            <YoutubeIcon className="w-5 h-5 text-gray-400 group-hover:text-red-400 transition-colors" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer - Now just copyright */}
                    <div className="mt-16 text-center text-sm text-gray-500">
                        <p>&copy; 2026 Ahava University Choir</p>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default LandingPage;
