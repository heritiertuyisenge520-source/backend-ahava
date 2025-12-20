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


// --- Songs Page Components ---

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
    const [songs, setSongs] = useState<Song[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSong, setEditingSong] = useState<Song | null>(null);
    const [selectedSong, setSelectedSong] = useState<Song | null>(null);
    const [loading, setLoading] = useState(true);

    const canManageSongs = user.role === 'Song Conductor' || user.role === 'President' || user.role === 'Advisor';

    // Fetch songs from API
    useEffect(() => {
        const fetchSongs = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const response = await fetch('http://localhost:5007/api/songs', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const songsData = await response.json();
                    const mappedSongs = songsData.map((song: any) => ({
                        id: song._id,
                        title: song.title,
                        composer: song.composer,
                        lyrics: song.lyrics
                    }));
                    setSongs(mappedSongs);
                }
            } catch (error) {
                console.error('Failed to fetch songs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSongs();
    }, []);

    const handleOpenAddModal = () => {
        setEditingSong(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (song: Song) => {
        setEditingSong(song);
        setIsModalOpen(true);
    };

    const handleDeleteSong = async (songId: string) => {
        if (!window.confirm('Are you sure you want to delete this song?')) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`http://localhost:5007/api/songs/${songId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setSongs(prevSongs => prevSongs.filter(song => song.id !== songId));
            } else {
                alert('Failed to delete song');
            }
        } catch (error) {
            console.error('Failed to delete song:', error);
            alert('Failed to delete song');
        }
    };

    const handleSubmitSong = async (songData: Omit<Song, 'id'>) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const method = editingSong ? 'PUT' : 'POST';
            const url = editingSong
                ? `http://localhost:5007/api/songs/${editingSong.id}`
                : 'http://localhost:5007/api/songs';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(songData)
            });

            if (response.ok) {
                const savedSong = await response.json();

                if (editingSong) {
                    setSongs(songs.map(s => s.id === editingSong.id ? {
                        id: savedSong._id,
                        title: savedSong.title,
                        composer: savedSong.composer,
                        lyrics: savedSong.lyrics
                    } : s));
                } else {
                    const newSong = {
                        id: savedSong._id,
                        title: savedSong.title,
                        composer: savedSong.composer,
                        lyrics: savedSong.lyrics
                    };
                    setSongs(prevSongs => [newSong, ...prevSongs]);
                }
                setIsModalOpen(false);
                setEditingSong(null);
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Failed to save song');
            }
        } catch (error) {
            console.error('Failed to save song:', error);
            alert('Failed to save song');
        }
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

// --- Singers Page Components (unchanged except props) ---

interface SingerCardProps {
    singer: User;
}

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

// --- Announcement data (fetched from API) ---

export default function App() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [authView, setAuthView] = useState<'login' | 'register' | 'registration-success'>('register');
    const [users, setUsers] = useState<User[]>([]); // Real approved users
    const [pendingUsers, setPendingUsers] = useState<User[]>([]); // Real pending users
    const [events, setEvents] = useState<Event[]>([]); // Events fetched from API
    const [announcements, setAnnouncements] = useState<Announcement[]>([]); // Announcements fetched from API
    const [attendanceRecords, setAttendanceRecords] = useState<Record<string, Record<string, AttendanceStatus>>>({});
    const [activeView, setActiveView] = useState<View>(View.DASHBOARD);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Fetch approved singers when user logs in (all authenticated users can see singers)
    useEffect(() => {
        if (currentUser) {
            const fetchSingers = async () => {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) return;

                    // Fetch approved singers
                    const singersRes = await fetch('http://localhost:5007/api/users/singers', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (singersRes.ok) {
                        const singersData = await singersRes.json();
                        const mappedSingers = singersData.map((user: any) => ({
                            id: user._id,
                            username: user.username,
                            name: user.name,
                            email: user.email,
                            role: user.role,
                            phoneNumber: user.phoneNumber || '',
                            profilePictureUrl: user.profilePictureUrl || undefined,
                            dateOfBirth: user.dateOfBirth || '',
                            placeOfBirth: user.placeOfBirth || '',
                            placeOfResidence: user.placeOfResidence || '',
                            yearOfStudy: user.yearOfStudy || '',
                            university: user.university || '',
                            gender: user.gender || '',
                            maritalStatus: user.maritalStatus || '',
                            homeParishName: user.homeParishName || '',
                            homeParishLocation: user.homeParishLocation || { cell: '', sector: '', district: '' },
                            schoolResidence: user.schoolResidence || '',
                            status: user.status,
                        }));
                        setUsers(mappedSingers);
                    }
                } catch (err) {
                    console.error('Failed to fetch singers:', err);
                }
            };
            fetchSingers();
        }
    }, [currentUser]);

    // Fetch events when user logs in (all authenticated users can see events)
    useEffect(() => {
        if (currentUser) {
            const fetchEvents = async () => {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) return;

                    // Fetch events
                    const eventsRes = await fetch('http://localhost:5007/api/events', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (eventsRes.ok) {
                        const eventsData = await eventsRes.json();
                        const mappedEvents = eventsData.map((event: any) => ({
                            id: event._id,
                            name: event.name,
                            type: event.type,
                            date: event.date,
                            startTime: event.startTime,
                            endTime: event.endTime
                        }));
                        setEvents(mappedEvents);
                    }
                } catch (err) {
                    console.error('Failed to fetch events:', err);
                }
            };
            fetchEvents();
        }
    }, [currentUser]);

    // Fetch announcements when user logs in (all authenticated users can see announcements)
    useEffect(() => {
        if (currentUser) {
            const fetchAnnouncements = async () => {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) return;

                    // Fetch announcements
                    const announcementsRes = await fetch('http://localhost:5007/api/announcements', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (announcementsRes.ok) {
                        const announcementsData = await announcementsRes.json();
                        const mappedAnnouncements = announcementsData.map((announcement: any) => ({
                            id: announcement._id,
                            type: announcement.type,
                            title: announcement.title,
                            author: announcement.author,
                            date: announcement.date,
                            content: announcement.content
                        }));
                        setAnnouncements(mappedAnnouncements);
                    }
                } catch (err) {
                    console.error('Failed to fetch announcements:', err);
                }
            };
            fetchAnnouncements();
        }
    }, [currentUser]);

    // Fetch pending users when admin logs in (only President or Advisor)
    useEffect(() => {
        if (currentUser && (currentUser.role === 'President' || currentUser.role === 'Advisor')) {
            const fetchPendingUsers = async () => {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) return;

                    // Fetch pending users
                    const pendingRes = await fetch('http://localhost:5007/api/users/pending', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (pendingRes.ok) {
                        const pendingData = await pendingRes.json();
                        const mappedPendingUsers = pendingData.map((user: any) => ({
                            id: user._id,
                            username: user.username,
                            name: user.name,
                            email: user.email,
                            role: user.role,
                            phoneNumber: user.phoneNumber || '',
                            profilePictureUrl: user.profilePictureUrl || undefined,
                            dateOfBirth: user.dateOfBirth || '',
                            placeOfBirth: user.placeOfBirth || '',
                            placeOfResidence: user.placeOfResidence || '',
                            yearOfStudy: user.yearOfStudy || '',
                            university: user.university || '',
                            gender: user.gender || '',
                            maritalStatus: user.maritalStatus || '',
                            homeParishName: user.homeParishName || '',
                            homeParishLocation: user.homeParishLocation || { cell: '', sector: '', district: '' },
                            schoolResidence: user.schoolResidence || '',
                        }));
                        setPendingUsers(mappedPendingUsers);
                    }
                } catch (err) {
                    console.error('Failed to fetch pending users:', err);
                }
            };
            fetchPendingUsers();
        }
    }, [currentUser]);

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
            if (response.status === 403) {
                alert(data.message);
                return false;
            } else if (response.status === 401) {
                alert('Invalid credentials. Please try again.');
                return false;
            } else {
                alert(data.message || 'Login failed');
                return false;
            }
        }

        // Store token
        localStorage.setItem('token', data.token);

        // Use the data from login response directly — it has everything!
        const user: User = {
            id: data._id || data.id,
            username: data.username,
            name: data.name,
            email: data.email,
            role: data.role,
            phoneNumber: data.phoneNumber || '',
            profilePictureUrl: data.profilePictureUrl || undefined,
            dateOfBirth: data.dateOfBirth || '',
            placeOfBirth: data.placeOfBirth || '',
            placeOfResidence: data.placeOfResidence || '',
            yearOfStudy: data.yearOfStudy || '',
            university: data.university || '',
            gender: data.gender || '',
            maritalStatus: data.maritalStatus || '',
            homeParishName: data.homeParishName || '',
            homeParishLocation: data.homeParishLocation || { cell: '', sector: '', district: '' },
            schoolResidence: data.schoolResidence || '',
        };

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
        // ... (unchanged)
        try {
            const response = await fetch('http://localhost:5007/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: newUser.username,
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
                    province: newUser.province,
                    district: newUser.district,
                    sector: newUser.sector,
                    cell: newUser.cell,
                    password: password,
                    role: 'Singer'
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                return data.message || 'Registration failed';
            }

            setAuthView('registration-success');
            return null;
        } catch (error) {
            console.error('Registration error:', error);
            return 'Network error. Please try again.';
        }
    };
    
    const handleLogout = () => {
        setCurrentUser(null);
        setActiveView(View.DASHBOARD);
        localStorage.removeItem('token');
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

    const handleSubmitEvent = async (eventData: Omit<Event, 'id'>, editingId: string | null) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const method = editingId ? 'PUT' : 'POST';
            const url = editingId
                ? `http://localhost:5007/api/events/${editingId}`
                : 'http://localhost:5007/api/events';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(eventData)
            });

            if (response.ok) {
                const savedEvent = await response.json();

                if (editingId) {
                    setEvents(events.map(e => e.id === editingId ? {
                        id: savedEvent._id,
                        name: savedEvent.name,
                        type: savedEvent.type,
                        date: savedEvent.date,
                        startTime: savedEvent.startTime,
                        endTime: savedEvent.endTime
                    } : e));
                } else {
                    const newEvent = {
                        id: savedEvent._id,
                        name: savedEvent.name,
                        type: savedEvent.type,
                        date: savedEvent.date,
                        startTime: savedEvent.startTime,
                        endTime: savedEvent.endTime
                    };
                    setEvents(prevEvents => [newEvent, ...prevEvents]
                        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                }
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Failed to save event');
            }
        } catch (error) {
            console.error('Failed to save event:', error);
            alert('Failed to save event');
        }
    };

    const handleDeleteEvent = async (eventId: string) => {
        if (!window.confirm('Are you sure you want to delete this event?')) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`http://localhost:5007/api/events/${eventId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
            } else {
                alert('Failed to delete event');
            }
        } catch (error) {
            console.error('Failed to delete event:', error);
            alert('Failed to delete event');
        }
    };

    const handleSubmitAnnouncement = async (announcementData: { title: string; content: string }, editingId: string | null) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const method = editingId ? 'PUT' : 'POST';
            const url = editingId
                ? `http://localhost:5007/api/announcements/${editingId}`
                : 'http://localhost:5007/api/announcements';

            const body = editingId
                ? announcementData
                : { ...announcementData, type: 'general' };

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                const savedAnnouncement = await response.json();

                if (editingId) {
                    setAnnouncements(announcements.map(a => a.id === editingId ? {
                        id: savedAnnouncement._id,
                        type: savedAnnouncement.type,
                        title: savedAnnouncement.title,
                        author: savedAnnouncement.author,
                        date: savedAnnouncement.date,
                        content: savedAnnouncement.content
                    } : a));
                } else {
                    const newAnnouncement = {
                        id: savedAnnouncement._id,
                        type: savedAnnouncement.type,
                        title: savedAnnouncement.title,
                        author: savedAnnouncement.author,
                        date: savedAnnouncement.date,
                        content: savedAnnouncement.content
                    };
                    setAnnouncements(prev => [newAnnouncement, ...prev]
                        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                }
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Failed to save announcement');
            }
        } catch (error) {
            console.error('Failed to save announcement:', error);
            alert('Failed to save announcement');
        }
    };

    const handleDeleteAnnouncement = async (announcementId: string) => {
        if (!window.confirm('Are you sure you want to delete this announcement?')) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`http://localhost:5007/api/announcements/${announcementId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setAnnouncements(prev => prev.filter(a => a.id !== announcementId));
            } else {
                alert('Failed to delete announcement');
            }
        } catch (error) {
            console.error('Failed to delete announcement:', error);
            alert('Failed to delete announcement');
        }
    };

    const handleSaveAttendance = (eventId: string, records: Record<string, AttendanceStatus>) => {
        setAttendanceRecords(prev => ({
            ...prev,
            [eventId]: records,
        }));
    };

    const handleUserApproved = (approvedUser: User) => {
        // Add to approved users list
        setUsers(prevUsers => [...prevUsers, approvedUser]);
        // Remove from pending users list
        setPendingUsers(prevPending => prevPending.filter(user => user.id !== approvedUser.id));
    };

    const handleUserRejected = (userId: string) => {
        // Remove from pending users list
        setPendingUsers(prevPending => prevPending.filter(user => user.id !== userId));
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

    const onMenuClick = () => setIsSidebarOpen(true);

    const approvedUsers = users.filter(u => u.status === 'approved');

    const renderContent = () => {
        const commonProps = { onMenuClick };
        switch (activeView) {
            case View.PROFILE:
                return <Profile user={currentUser} onUpdateUser={() => {}} {...commonProps} />;
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
                            singers={approvedUsers}
                            onNewPermissionRequest={handleAddPermissionRequest}
                            events={events}
                            attendanceRecords={attendanceRecords}
                            onSaveAttendance={handleSaveAttendance}
                            {...commonProps}
                        />;
            case View.SINGERS:
                return <Singers singers={approvedUsers} {...commonProps} />;
            case View.SONGS:
                return <Songs user={currentUser} {...commonProps} />;
            case View.CREDENTIALS:
                return <Credentials
                            users={users}
                            pendingUsers={pendingUsers}
                            onUserApproved={handleUserApproved}
                            onUserRejected={handleUserRejected}
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
