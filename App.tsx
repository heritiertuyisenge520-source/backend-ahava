
import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Profile } from './components/Profile';
import { Dashboard } from './components/Dashboard';
import { Attendance } from './components/Attendance';
import { View, User, PermissionRequest, Role, Song, Announcement, Event, AttendanceStatus } from './types';
import { Header } from './components/Header';
import { SongsIcon, PencilIcon, TrashIcon, SingersIcon, MailIcon, PhoneIcon, WhatsappIcon, SparklesIcon } from './components/Icons';
import { GoogleGenAI } from "@google/genai";
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Credentials } from './components/Credentials';
import LandingPage from './components/LandingPage';

// --- Registration Success Component ---
const RegistrationSuccess = ({ onSwitchToLogin }: { onSwitchToLogin: () => void }) => {
    return (
        <div className="min-h-screen bg-ahava-background flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-ahava-surface shadow-lg rounded-xl p-6 sm:p-8 border border-ahava-purple-dark">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-100 mb-4">Congratulations!</h1>
                        <p className="text-gray-300 mb-6">
                            Your data is stored in the Ahava Choir database. You can login using your full name and password you created.
                        </p>
                        <button
                            onClick={onSwitchToLogin}
                            className="w-full bg-ahava-purple-dark text-white font-semibold py-2 px-4 rounded-lg hover:bg-ahava-purple-medium transition-colors"
                        >
                            Go to Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- Songs Page Components (replaces placeholder) ---

const initialSongs: Song[] = [
    { 
        id: '1', 
        title: 'Niwowe Rutare', 
        composer: 'Fr. Jean Hakulimana', 
        lyrics: `Verse 1:
Niwowe rutare rwanjye, nkwihishaho Nyagasani.
Mu bibazo no mu byago, ni wowe buhungiro bwanjye.

Chorus:
Alleluia, Alleluia, waratsinze, Yesu Mwami.
Izina ryawe rihabwe icyubahiro, iteka ryose. Amina.`
    },
    { 
        id: '2', 
        title: 'Roho W\'Imana', 
        composer: 'Unknown', 
        lyrics: `Verse 1:
Roho w'Imana, ngwino muri twe,
Uze utuyobore, utumurikire.
Uduhe imbaraga, zo kugukorera,
No kugusingiza, mu buzima bwacu.

Chorus:
Ngwino, Roho w'Imana, ngwino!
Uze uturememo, imitima mishya.`
    },
];

interface AddSongModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (song: Omit<Song, 'id'>) => void;
    songToEdit: Song | null;
}

const AddSongModal = ({ isOpen, onClose, onSubmit, songToEdit }: AddSongModalProps) => {
    const [title, setTitle] = useState('');
    const [composer, setComposer] = useState('');
    const [lyrics, setLyrics] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            if (songToEdit) {
                setTitle(songToEdit.title);
                setComposer(songToEdit.composer);
                setLyrics(songToEdit.lyrics);
            } else {
                setTitle('');
                setComposer('');
                setLyrics('');
            }
        }
    }, [isOpen, songToEdit]);
    
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleClickOutside = (event: React.MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
            onClose();
        }
    };

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ title, composer, lyrics });
    };
    
    const modalTitle = songToEdit ? 'Edit Song' : 'Add New Song';
    const submitButtonText = songToEdit ? 'Save Changes' : 'Save Song';

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
            onClick={handleClickOutside}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-song-modal-title"
        >
            <div ref={modalRef} className="bg-ahava-surface rounded-lg shadow-xl p-8 w-full max-w-2xl border border-ahava-purple-medium">
                <div className="flex justify-between items-start mb-4">
                    <h2 id="add-song-modal-title" className="text-xl font-bold text-gray-100">{modalTitle}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl font-bold leading-none" aria-label="Close modal">&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-300">Song Title</label>
                            <input
                                type="text" id="title" value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 bg-ahava-purple-dark border border-ahava-purple-medium rounded-md shadow-sm text-gray-200 focus:outline-none focus:ring-ahava-magenta focus:border-ahava-magenta"
                            />
                        </div>
                        <div>
                            <label htmlFor="composer" className="block text-sm font-medium text-gray-300">Composer</label>
                            <input
                                type="text" id="composer" value={composer}
                                onChange={(e) => setComposer(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 bg-ahava-purple-dark border border-ahava-purple-medium rounded-md shadow-sm text-gray-200 focus:outline-none focus:ring-ahava-magenta focus:border-ahava-magenta"
                            />
                        </div>
                        <div>
                            <label htmlFor="lyrics" className="block text-sm font-medium text-gray-300">Lyrics & Notes</label>
                            <textarea
                                id="lyrics" value={lyrics}
                                onChange={(e) => setLyrics(e.target.value)}
                                required
                                rows={10}
                                placeholder="Enter the full lyrics and any musical notes here..."
                                className="mt-1 block w-full px-3 py-2 bg-ahava-purple-dark border border-ahava-purple-medium rounded-md shadow-sm text-gray-200 focus:outline-none focus:ring-ahava-magenta focus:border-ahava-magenta"
                            ></textarea>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="bg-ahava-purple-medium text-gray-200 font-semibold py-2 px-4 rounded-lg hover:bg-ahava-purple-light transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="bg-ahava-purple-dark text-white font-semibold py-2 px-4 rounded-lg hover:bg-ahava-purple-medium transition-colors">
                            {submitButtonText}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface SongListItemProps {
    song: Song;
    onSelect: (song: Song) => void;
    onEdit: (song: Song) => void;
    onDelete: (id: string) => void;
    canManage: boolean;
}

// FIX: Explicitly type component with React.FC to correctly handle the 'key' prop.
const SongListItem: React.FC<SongListItemProps> = ({ song, onSelect, onEdit, onDelete, canManage }) => {
    return (
        <div className="bg-ahava-surface p-4 rounded-lg shadow-sm flex items-center justify-between hover:shadow-lg transition-shadow border border-ahava-purple-dark hover:border-ahava-purple-medium">
            <div className="flex-1 cursor-pointer" onClick={() => onSelect(song)}>
                <p className="font-semibold text-gray-100 hover:underline">{song.title}</p>
                <p className="text-sm text-gray-400">by {song.composer}</p>
            </div>
            {canManage && (
                <div className="flex items-center space-x-2">
                    <button onClick={() => onEdit(song)} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-ahava-purple-medium transition-colors" aria-label="Edit song">
                        <PencilIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => onDelete(song.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-500/10 transition-colors" aria-label="Delete song">
                        <TrashIcon />
                    </button>
                </div>
            )}
        </div>
    );
};

const SongDetailView = ({ song, onBack }: { song: Song, onBack: () => void }) => {
    const [aiHelperContent, setAiHelperContent] = useState<string | null>(null);
    const [isHelperLoading, setIsHelperLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const callAiHelper = async (prompt: string) => {
        setIsHelperLoading(true);
        setAiHelperContent(null);
        setError(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
            });
            setAiHelperContent(response.text);
        } catch (e) {
            console.error("AI Helper failed:", e);
            setError("Sorry, the AI Assistant is currently unavailable.");
        } finally {
            setIsHelperLoading(false);
        }
    };

    const handleAnalyzeLyrics = () => {
        const prompt = `You are a music and choir expert. Briefly analyze the following song lyrics for a choir singer. Focus on the main themes, the overall mood, and any potential vocal challenges or dynamics to be aware of. Keep it concise and encouraging.\n\nLyrics:\n${song.lyrics}`;
        callAiHelper(prompt);
    };

    const handleSuggestWarmups = () => {
        const prompt = `You are a vocal coach. Suggest 3 simple and effective vocal warm-up exercises for a choir preparing to sing a song with the following lyrics. Tailor the warm-ups to the likely mood and vocal range suggested by the text.\n\nLyrics:\n${song.lyrics}`;
        callAiHelper(prompt);
    };

    const handleTranslate = () => {
        const prompt = `You are a linguistics expert specializing in Kinyarwanda. Translate the following Kinyarwanda lyrics into English. After the translation, provide a simple phonetic pronunciation guide for the Kinyarwanda words for an English speaker. \n\nLyrics:\n${song.lyrics}`;
        callAiHelper(prompt);
    };

    return (
        <div>
            <div className="bg-ahava-surface p-6 rounded-lg shadow-md mb-6 border border-ahava-purple-dark">
                <button onClick={onBack} className="text-sm font-semibold text-ahava-purple-light hover:underline mb-4">&larr; Back to Song List</button>
                <h2 className="text-2xl font-bold text-gray-100">{song.title}</h2>
                <p className="text-md text-gray-400 mb-6">by {song.composer}</p>
                <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap">
                    {song.lyrics}
                </div>
            </div>
            <div className="bg-ahava-surface p-6 rounded-lg shadow-md border border-ahava-purple-dark">
                <div className="flex items-center mb-4">
                    <SparklesIcon className="h-6 w-6 text-ahava-magenta mr-3" />
                    <h3 className="text-xl font-bold text-gray-100">AI Practice Assistant</h3>
                </div>
                <div className="flex flex-wrap gap-3 mb-4">
                    <button onClick={handleAnalyzeLyrics} disabled={isHelperLoading} className="bg-ahava-purple-light text-white font-semibold py-2 px-4 rounded-lg hover:bg-ahava-purple-medium transition-colors disabled:opacity-50 disabled:cursor-wait">Analyze Lyrics</button>
                    <button onClick={handleSuggestWarmups} disabled={isHelperLoading} className="bg-ahava-purple-light text-white font-semibold py-2 px-4 rounded-lg hover:bg-ahava-purple-medium transition-colors disabled:opacity-50 disabled:cursor-wait">Suggest Warm-ups</button>
                    <button onClick={handleTranslate} disabled={isHelperLoading} className="bg-ahava-purple-light text-white font-semibold py-2 px-4 rounded-lg hover:bg-ahava-purple-medium transition-colors disabled:opacity-50 disabled:cursor-wait">Translate & Pronounce</button>
                </div>
                <div className="min-h-[150px] bg-ahava-background p-4 rounded-lg whitespace-pre-wrap font-mono text-sm text-gray-300 overflow-y-auto">
                    {isHelperLoading && <p className="text-center text-gray-400 animate-pulseSlow">AI Assistant is thinking...</p>}
                    {error && <p className="text-center text-red-400">{error}</p>}
                    {aiHelperContent && <p>{aiHelperContent}</p>}
                    {!isHelperLoading && !aiHelperContent && !error && <p className="text-center text-gray-400">Select an option above to get started!</p>}
                </div>
            </div>
        </div>
    );
};


const Songs = ({ user, onMenuClick }: { user: User, onMenuClick?: () => void }) => {
    const [songs, setSongs] = useState<Song[]>(initialSongs);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSong, setEditingSong] = useState<Song | null>(null);
    const [selectedSong, setSelectedSong] = useState<Song | null>(null);

    const canManageSongs = user.role === 'Song Conductor' || user.role === 'President';

    const handleOpenAddModal = () => {
        setEditingSong(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (song: Song) => {
        setEditingSong(song);
        setIsModalOpen(true);
    };
    
    const handleDeleteSong = (songId: string) => {
        if (window.confirm('Are you sure you want to delete this song?')) {
            setSongs(prevSongs => prevSongs.filter(song => song.id !== songId));
        }
    };

    const handleSubmitSong = (songData: Omit<Song, 'id'>) => {
        if (editingSong) {
            setSongs(songs.map(s => s.id === editingSong.id ? { ...s, ...songData, id: s.id } : s));
        } else {
            const newSong: Song = {
                id: new Date().toISOString(),
                ...songData,
            };
            setSongs(prevSongs => [newSong, ...prevSongs]);
        }
        setIsModalOpen(false);
        setEditingSong(null);
    };

    const AddSongButton = () => (
        <button 
            onClick={handleOpenAddModal}
            className="bg-ahava-purple-dark text-white font-semibold py-2 px-4 rounded-lg hover:bg-ahava-purple-medium transition-colors flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Add Song
        </button>
    );

    return (
        <div className="min-h-full bg-ahava-background">
            <Header
                breadcrumbs={['Dashboard']}
                title="Songs"
                titleIcon={<SongsIcon className="h-6 w-6" />}
                actionButton={canManageSongs ? <AddSongButton /> : undefined}
                onMenuClick={onMenuClick}
            />
            <div className="p-4 md:p-8">
                {selectedSong ? (
                    <SongDetailView song={selectedSong} onBack={() => setSelectedSong(null)} />
                ) : (
                    <div className="space-y-4">
                        {songs.length > 0 ? (
                            songs.map(song => (
                                <SongListItem 
                                    key={song.id}
                                    song={song}
                                    onSelect={setSelectedSong}
                                    onEdit={handleOpenEditModal}
                                    onDelete={handleDeleteSong}
                                    canManage={canManageSongs}
                                />
                            ))
                        ) : (
                            <div className="bg-ahava-surface text-center p-8 rounded-lg shadow-sm border border-ahava-purple-dark">
                                <h3 className="text-lg font-semibold text-gray-200">No Songs in Library</h3>
                                <p className="text-gray-400 mt-2">Add a new song to get started.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <AddSongModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmitSong}
                songToEdit={editingSong}
            />
        </div>
    );
};

// --- End of Songs Page Components ---

// --- Singers Page Components ---

interface SingerCardProps {
    singer: User;
}

// FIX: Explicitly type component with React.FC to correctly handle the 'key' prop.
const SingerCard: React.FC<SingerCardProps> = ({ singer }) => {
    const getInitials = (name: string) => {
        const names = name.split(' ');
        if (names.length === 0) return '';
        const firstInitial = names[0]?.[0] || '';
        const lastInitial = names.length > 1 ? names[names.length - 1]?.[0] || '' : '';
        return `${firstInitial}${lastInitial}`.toUpperCase();
    }

    const formattedPhoneNumber = singer.phoneNumber?.replace(/[^0-9]/g, '');

    return (
        <div className="bg-ahava-surface rounded-lg shadow-md p-6 flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-ahava-purple-dark hover:border-ahava-purple-medium">
            <div className="flex items-center mb-4">
                 {singer.profilePictureUrl ? (
                    <img src={singer.profilePictureUrl} alt={singer.name} className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-ahava-purple-light" />
                 ) : (
                    <div className="w-16 h-16 bg-indigo-200 flex items-center justify-center rounded-full mr-4 border-2 border-ahava-purple-light">
                        <span className="text-2xl font-bold text-indigo-800">{getInitials(singer.name)}</span>
                    </div>
                 )}
                <div>
                    <h2 className="text-xl font-bold text-gray-100">{singer.name}</h2>
                    <p className="text-sm text-gray-400">{singer.role}</p>
                </div>
            </div>
            <div className="space-y-3 mt-4 flex-grow">
                <div className="flex items-center text-gray-300 text-sm">
                    <MailIcon className="w-4 h-4 mr-3 text-gray-500" />
                    <a href={`mailto:${singer.email}`} className="hover:underline hover:text-ahava-purple-light break-all">{singer.email}</a>
                </div>
                {singer.phoneNumber && (
                    <div className="flex items-center text-gray-300 text-sm">
                        <PhoneIcon className="w-4 h-4 mr-3 text-gray-500" />
                        <span>{singer.phoneNumber}</span>
                    </div>
                )}
            </div>
            {formattedPhoneNumber && (
                 <div className="mt-6">
                    <a
                        href={`https://wa.me/${formattedPhoneNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center py-2 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                        aria-label={`Chat with ${singer.name} on WhatsApp`}
                    >
                        <WhatsappIcon className="w-5 h-5 mr-2" />
                        Chat on WhatsApp
                    </a>
                </div>
            )}
        </div>
    );
};


const Singers = ({ singers, onMenuClick }: { singers: User[], onMenuClick?: () => void }) => {
    return (
        <div className="min-h-full bg-ahava-background">
            <Header
                breadcrumbs={['Dashboard']}
                title="Singers"
                titleIcon={<SingersIcon className="h-6 w-6" />}
                onMenuClick={onMenuClick}
            />
            <div className="p-4 md:p-8">
                {singers && singers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {singers.map(singer => (
                            <SingerCard key={singer.id} singer={singer} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-ahava-surface text-center p-8 rounded-lg shadow-sm border border-ahava-purple-dark">
                        <h3 className="text-lg font-semibold text-gray-200">No Singers Found</h3>
                        <p className="text-gray-400 mt-2">There are no registered singers in the system yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- End of Singers Page Components ---

// Admin user - will be created automatically on first startup
const adminUser: User = {
    id: 'admin_001',
    username: 'TUYISENGE.Heritier',
    name: 'Hertier TUYISENGE',
    email: 'admin@ahava.choir',
    phoneNumber: '+250787581007',
    profilePictureUrl: undefined,
    role: 'President',
    dateOfBirth: '1990-01-01',
    placeOfBirth: 'Kigali',
    placeOfResidence: 'Kigali',
    yearOfStudy: '',
    university: '',
    gender: 'Male',
    maritalStatus: 'Single',
    homeParishName: 'Ahava Parish',
    homeParishLocation: { cell: 'Central', sector: 'Nyarugenge', district: 'Nyarugenge' },
    schoolResidence: 'Kigali',
    password: '123'
};


const today = new Date();
const yesterday = new Date();
yesterday.setDate(today.getDate() - 1);
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

const futureDate = new Date();
futureDate.setDate(today.getDate() + 2);
const farFutureDate = new Date();
farFutureDate.setDate(today.getDate() + 10);

const startOfToday = new Date(today);
startOfToday.setHours(today.getHours() - 1, 0, 0, 0); // An event that started an hour ago
const endOfToday = new Date(today);
endOfToday.setHours(today.getHours() + 1, 0, 0, 0); // And ends in an hour

const initialEvents: Event[] = [
    { id: '1', name: 'Saturday Vigil Service', type: 'Service', date: yesterday.toISOString().split('T')[0], startTime: '17:00', endTime: '18:30' }, // Past
    { id: '2', name: 'Ongoing Weekly Practice', type: 'Practice', date: today.toISOString().split('T')[0], startTime: startOfToday.toTimeString().substring(0,5), endTime: endOfToday.toTimeString().substring(0,5) }, // In Progress
    { id: '3', name: 'Future Practice Session', type: 'Practice', date: futureDate.toISOString().split('T')[0], startTime: '10:00', endTime: '12:00' }, // Future
    { id: '4', name: 'Rehearsal', type: 'Practice', date: farFutureDate.toISOString().split('T')[0], startTime: '14:19', endTime: '14:49' }, // Far Future
];


const initialAnnouncements: Announcement[] = [
    {
        id: 'announcement-2',
        type: 'general',
        title: 'Upcoming Special Practice',
        author: 'Iradukunda Ange Mellisa (Song Conductor)',
        date: yesterday.toISOString(),
        content: 'Please note there will be a special practice session this Friday to prepare for the upcoming service.'
    },
    {
        id: 'announcement-1',
        type: 'general',
        title: 'Uniforms Ready for Pickup',
        author: 'TUYISENGE Heritier (President)',
        date: twoDaysAgo.toISOString(),
        content: 'All new members can collect their choir uniforms from the church before the concert.'
    },
];

const updateUsernames = (userList: User[]): User[] => {
    const lastNameCounts = new Map<string, number>();
    
    userList.forEach(user => {
        const nameParts = user.name.trim().split(/\s+/);
        const lastName = nameParts.pop()?.toLowerCase() || '';
        if (lastName) {
            lastNameCounts.set(lastName, (lastNameCounts.get(lastName) || 0) + 1);
        }
    });

    return userList.map(user => {
        const nameParts = user.name.trim().split(/\s+/);
        const lastName = nameParts.pop() || '';
        const firstName = nameParts[0] || '';
        
        let newUsername = lastName;
        if (lastNameCounts.get(lastName.toLowerCase()) > 1) {
            newUsername = `${lastName}.${firstName}`;
        }
        
        return { ...user, username: newUsername };
    });
};


export default function App() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [authView, setAuthView] = useState<'login' | 'register' | 'registration-success'>('register');
    const [users, setUsers] = useState<User[]>([adminUser]);
    const [events, setEvents] = useState<Event[]>(initialEvents);
    const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
    const [attendanceRecords, setAttendanceRecords] = useState<Record<string, Record<string, AttendanceStatus>>>({});
    const [activeView, setActiveView] = useState<View>(View.LANDING);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // No keyboard shortcuts needed

    const handleLogin = async (username: string, password: string): Promise<boolean> => {
        try {
            const response = await fetch('http://localhost:5007/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle different error messages
                if (response.status === 403) {
                    alert(data.message); // Show pending/rejected message
                    return false;
                } else if (response.status === 401) {
                    alert('Invalid credentials. Please try again.');
                    return false;
                } else {
                    alert(data.message || 'Login failed');
                    return false;
                }
            }

            // Login successful - try to get full user profile, fallback to login data if needed
            let user: User;
            try {
                const profileResponse = await fetch('http://localhost:5007/api/users/profile', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${data.token}`,
                    },
                });

                if (profileResponse.ok) {
                    const profileData = await profileResponse.json();
                    user = {
                        id: profileData._id,
                        username: profileData.username,
                        name: profileData.name,
                        email: profileData.email,
                        role: profileData.role,
                        phoneNumber: profileData.phoneNumber,
                        profilePictureUrl: profileData.profilePictureUrl,
                        dateOfBirth: profileData.dateOfBirth,
                        placeOfBirth: profileData.placeOfBirth,
                        placeOfResidence: profileData.placeOfResidence,
                        yearOfStudy: profileData.yearOfStudy,
                        university: profileData.university,
                        gender: profileData.gender,
                        maritalStatus: profileData.maritalStatus,
                        homeParishName: profileData.homeParishName,
                        homeParishLocation: profileData.homeParishLocation,
                        schoolResidence: profileData.schoolResidence,
                    };
                } else {
                    // Fallback: use login data and provide defaults for required fields
                    user = {
                        id: data._id,
                        username: data.username,
                        name: data.name,
                        email: data.email,
                        role: data.role,
                        phoneNumber: '', // Provide defaults
                        profilePictureUrl: undefined,
                        dateOfBirth: '',
                        placeOfBirth: '',
                        placeOfResidence: '',
                        yearOfStudy: '',
                        university: '',
                        gender: '',
                        maritalStatus: '',
                        homeParishName: '',
                        homeParishLocation: { cell: '', sector: '', district: '' },
                        schoolResidence: '',
                    };
                }
            } catch (profileError) {
                console.error('Profile fetch failed, using login data:', profileError);
                // Fallback: use login data with defaults
                user = {
                    id: data._id,
                    username: data.username,
                    name: data.name,
                    email: data.email,
                    role: data.role,
                    phoneNumber: '',
                    profilePictureUrl: undefined,
                    dateOfBirth: '',
                    placeOfBirth: '',
                    placeOfResidence: '',
                    yearOfStudy: '',
                    university: '',
                    gender: '',
                    maritalStatus: '',
                    homeParishName: '',
                    homeParishLocation: { cell: '', sector: '', district: '' },
                    schoolResidence: '',
                };
            }

            setCurrentUser(user);
            setActiveView(View.DASHBOARD);
            return true;
        } catch (error) {
            console.error('Login error:', error);
            alert('Network error. Please try again.');
            return false;
        }
    };

    const handleRegister = async (newUser: User, password: string): Promise<string | null> => {
        try {
            const response = await fetch('http://localhost:5007/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: newUser.name,
                    email: newUser.email,
                    phoneNumber: newUser.phoneNumber,
                    profilePictureUrl: newUser.profilePictureUrl,
                    dateOfBirth: newUser.dateOfBirth,
                    placeOfBirth: newUser.placeOfBirth,
                    placeOfResidence: newUser.placeOfResidence,
                    yearOfStudy: newUser.yearOfStudy,
                    university: newUser.university,
                    gender: newUser.gender,
                    maritalStatus: newUser.maritalStatus,
                    homeParishName: newUser.homeParishName,
                    homeParishLocation: newUser.homeParishLocation,
                    schoolResidence: newUser.schoolResidence,
                    password: password,
                    role: 'Singer'
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                return data.message || 'Registration failed';
            }

            // Registration successful
            setAuthView('registration-success');
            return null; // Success
        } catch (error) {
            console.error('Registration error:', error);
            return 'Network error. Please try again.';
        }
    };
    
    const handleLogout = () => {
        setCurrentUser(null);
        setActiveView(View.DASHBOARD);
    };

    const handleUpdateUser = (updatedUser: User) => {
        const updatedUsersList = users.map(u => u.id === updatedUser.id ? updatedUser : u);
        const usersWithCorrectUsernames = updateUsernames(updatedUsersList);
        setUsers(usersWithCorrectUsernames);

        const fullyUpdatedCurrentUser = usersWithCorrectUsernames.find(u => u.id === updatedUser.id);
        if (fullyUpdatedCurrentUser) {
            setCurrentUser(fullyUpdatedCurrentUser);
        }
    };

    const handleAdminAddUser = (userData: Omit<User, 'id' | 'password'>, password: string): string | null => {
        const existingUser = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
        if (existingUser) {
            return "An account with this email already exists.";
        }
        
        const newUser: User = {
            ...userData,
            id: `usr_${new Date().getTime()}`,
            username: '', 
            password: password,
        };
        const updatedUsers = updateUsernames([...users, newUser]);
        setUsers(updatedUsers.sort((a,b) => a.name.localeCompare(b.name)));
        return null; // success
    };
    
    const handleAdminUpdateUser = (updatedUser: User, newPassword?: string) => {
        const updatedUsersList = users.map(u => {
            if (u.id === updatedUser.id) {
                return { ...updatedUser, password: newPassword || u.password };
            }
            return u;
        });

        const usersWithCorrectUsernames = updateUsernames(updatedUsersList);
        setUsers(usersWithCorrectUsernames);

        if (currentUser && currentUser.id === updatedUser.id) {
            const fullyUpdatedCurrentUser = usersWithCorrectUsernames.find(u => u.id === updatedUser.id);
            if (fullyUpdatedCurrentUser) {
                setCurrentUser(fullyUpdatedCurrentUser);
            }
        }
    };

    const handleAdminDeleteUser = (userId: string) => {
        if (currentUser && currentUser.id === userId) {
            alert("You cannot delete your own account.");
            return;
        }
        setUsers(prev => prev.filter(u => u.id !== userId));
    };

    const handleAddPermissionRequest = (request: PermissionRequest) => {
        const newAnnouncement: Announcement = {
            id: new Date().toISOString(),
            type: 'permission',
            title: `Permission Request: ${request.userName}`,
            author: request.userName,
            date: new Date().toISOString(),
            content: `Reason: ${request.reason}. From ${new Date(request.startDate + 'T00:00:00').toLocaleDateString()} to ${new Date((request.endDate || request.startDate) + 'T00:00:00').toLocaleDateString()}.`,
        };
        setAnnouncements(prevAnnouncements => [newAnnouncement, ...prevAnnouncements]);
    };

    const handleSubmitEvent = (eventData: Omit<Event, 'id'>, editingId: string | null) => {
        if (editingId) {
            setEvents(events.map(e => e.id === editingId ? { ...e, ...eventData, id: e.id } : e)
                .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        } else {
            const newEvent: Event = {
                id: new Date().toISOString(),
                ...eventData,
            };
            setEvents(prevEvents => [newEvent, ...prevEvents]
                .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }
    };

    const handleDeleteEvent = (eventId: string) => {
        setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
    };

    const handleSubmitAnnouncement = (announcementData: { title: string; content: string }, editingId: string | null) => {
        if (editingId) {
            setAnnouncements(announcements.map(a => 
                a.id === editingId 
                ? { ...a, ...announcementData } 
                : a
            ).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        } else {
            if (!currentUser) return;
            const newAnnouncement: Announcement = {
                id: new Date().toISOString(),
                type: 'general',
                author: currentUser.name,
                date: new Date().toISOString(),
                ...announcementData,
            };
            setAnnouncements(prev => [newAnnouncement, ...prev]
                .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }
    };

    const handleDeleteAnnouncement = (announcementId: string) => {
        setAnnouncements(prev => prev.filter(a => a.id !== announcementId));
    };

    const handleSaveAttendance = (eventId: string, records: Record<string, AttendanceStatus>) => {
        setAttendanceRecords(prev => ({
            ...prev,
            [eventId]: records,
        }));
    };

    if (!currentUser) {
        if (authView === 'login') {
            return <Login onLogin={handleLogin} onSwitchToRegister={() => setAuthView('register')} />;
        } else if (authView === 'registration-success') {
            return <RegistrationSuccess onSwitchToLogin={() => setAuthView('login')} />;
        } else {
            return <Register onRegister={handleRegister} onSwitchToLogin={() => setAuthView('login')} />;
        }
    }

    // No landing page - users go directly to dashboard

    const onMenuClick = () => setIsSidebarOpen(true);

    const renderContent = () => {
        const commonProps = { onMenuClick };
        switch (activeView) {
            case View.PROFILE:
                return <Profile user={currentUser} onUpdateUser={handleUpdateUser} {...commonProps} />;
            case View.DASHBOARD:
                return <Dashboard 
                            user={currentUser} 
                            announcements={announcements} 
                            setActiveView={setActiveView} 
                            events={events} 
                            onSubmitEvent={handleSubmitEvent}
                            onDeleteEvent={handleDeleteEvent}
                            onSubmitAnnouncement={handleSubmitAnnouncement}
                            onDeleteAnnouncement={handleDeleteAnnouncement}
                            {...commonProps}
                        />;
            case View.ATTENDANCE_PERFORMANCE:
                return <Attendance 
                            user={currentUser} 
                            singers={users} 
                            onNewPermissionRequest={handleAddPermissionRequest}
                            events={events}
                            attendanceRecords={attendanceRecords}
                            onSaveAttendance={handleSaveAttendance}
                            {...commonProps}
                        />;
            case View.SINGERS:
                return <Singers singers={users} {...commonProps} />;
            case View.SONGS:
                return <Songs user={currentUser} {...commonProps} />;
            case View.CREDENTIALS:
                return <Credentials
                            users={users}
                            onAddUser={handleAdminAddUser}
                            onUpdateUser={handleAdminUpdateUser}
                            onDeleteUser={handleAdminDeleteUser}
                            {...commonProps}
                        />;
            default:
                return <Dashboard 
                            user={currentUser} 
                            announcements={announcements} 
                            setActiveView={setActiveView} 
                            events={events}
                            onSubmitEvent={handleSubmitEvent}
                            onDeleteEvent={handleDeleteEvent}
                            onSubmitAnnouncement={handleSubmitAnnouncement}
                            onDeleteAnnouncement={handleDeleteAnnouncement}
                            {...commonProps}
                        />;
        }
    };

    return (
        <div className="relative min-h-screen md:flex bg-ahava-background font-sans text-gray-300">
            {isSidebarOpen && (
                <div 
                    className="md:hidden fixed inset-0 bg-black bg-opacity-60 z-30" 
                    onClick={() => setIsSidebarOpen(false)}
                    aria-hidden="true"
                ></div>
            )}
            <Sidebar 
                activeView={activeView} 
                setActiveView={setActiveView} 
                user={currentUser} 
                onLogout={handleLogout}
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
            />
            <main className="flex-1 overflow-y-auto">
                {renderContent()}
            </main>
        </div>
    );
}
