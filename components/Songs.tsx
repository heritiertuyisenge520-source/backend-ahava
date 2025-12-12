


import React, { useState, useEffect, useRef } from 'react';
import type { User, Song } from '../types';
import { Header } from './Header';
import { SongsIcon, PencilIcon, TrashIcon, SparklesIcon } from './Icons';
import { GoogleGenAI } from "@google/genai";

// --- Songs Page Components (replaces placeholder) ---

// FIX: Add initial song data for the component's state.
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
    // FIX: Add state for managing songs.
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
    
    // FIX: Correct handleDeleteSong to use component state.
    const handleDeleteSong = (songId: string) => {
        if (window.confirm('Are you sure you want to delete this song?')) {
            setSongs(prevSongs => prevSongs.filter(song => song.id !== songId));
        }
    };

    // FIX: Correct handleSubmitSong to use component state.
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
                                    // FIX: Correctly pass the handleDeleteSong function.
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
                // FIX: Correctly pass the handleSubmitSong function.
                onSubmit={handleSubmitSong}
                songToEdit={editingSong}
            />
        </div>
    );
};