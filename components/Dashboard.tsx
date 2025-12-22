




import React, { useState, useEffect, useMemo, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import type { User, Announcement, Event } from '../types';
import { View } from '../types';
import { Header } from './Header';
import { DashboardIcon, ChartBarIcon, ClockIcon, BookIcon, EventsIcon, SongsIcon, SparklesIcon, PaperAirplaneIcon, PencilIcon, BuildingIcon, TrashIcon, BellIcon } from './Icons';
import { AddEventModal } from './AddEventModal';


// --- Announcement Modal (from Events.tsx) ---
interface AddAnnouncementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (announcement: { title: string; content: string; startTime?: string; endTime?: string }) => void;
    announcementToEdit: Announcement | null;
}

const AddAnnouncementModal = ({ isOpen, onClose, onSubmit, announcementToEdit }: AddAnnouncementModalProps) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            if (announcementToEdit) {
                setTitle(announcementToEdit.title);
                setContent(announcementToEdit.content);
                setStartTime(announcementToEdit.startTime || '');
                setEndTime(announcementToEdit.endTime || '');
            } else {
                setTitle('');
                setContent('');
                setStartTime('');
                setEndTime('');
            }
        }
    }, [isOpen, announcementToEdit]);

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
        onSubmit({ title, content, startTime: startTime || undefined, endTime: endTime || undefined });
    };

    const modalTitle = announcementToEdit ? 'Edit Announcement' : 'Add New Announcement';
    const submitButtonText = announcementToEdit ? 'Save Changes' : 'Post Announcement';

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
            onClick={handleClickOutside}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-announcement-modal-title"
        >
            <div ref={modalRef} className="bg-ahava-surface rounded-lg shadow-xl p-8 w-full max-w-lg border border-ahava-purple-medium">
                <div className="flex justify-between items-start mb-4">
                    <h2 id="add-announcement-modal-title" className="text-xl font-bold text-gray-100">{modalTitle}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl font-bold leading-none" aria-label="Close modal">&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-300">Title</label>
                            <input
                                type="text" id="title" value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 bg-ahava-purple-dark border border-ahava-purple-medium rounded-md shadow-sm text-gray-200 focus:outline-none focus:ring-ahava-magenta focus:border-ahava-magenta"
                            />
                        </div>
                        <div>
                            <label htmlFor="content" className="block text-sm font-medium text-gray-300">Content</label>
                            <textarea
                                id="content" value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                                rows={5}
                                placeholder="Enter the announcement details here..."
                                className="mt-1 block w-full px-3 py-2 bg-ahava-purple-dark border border-ahava-purple-medium rounded-md shadow-sm text-gray-200 focus:outline-none focus:ring-ahava-magenta focus:border-ahava-magenta"
                            ></textarea>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="startTime" className="block text-sm font-medium text-gray-300">Start Time (Optional)</label>
                                <input
                                    type="datetime-local" id="startTime" value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 bg-ahava-purple-dark border border-ahava-purple-medium rounded-md shadow-sm text-gray-200 focus:outline-none focus:ring-ahava-magenta focus:border-ahava-magenta"
                                />
                                <p className="text-xs text-gray-400 mt-1">When should this announcement become visible?</p>
                            </div>
                            <div>
                                <label htmlFor="endTime" className="block text-sm font-medium text-gray-300">End Time (Optional)</label>
                                <input
                                    type="datetime-local" id="endTime" value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 bg-ahava-purple-dark border border-ahava-purple-medium rounded-md shadow-sm text-gray-200 focus:outline-none focus:ring-ahava-magenta focus:border-ahava-magenta"
                                />
                                <p className="text-xs text-gray-400 mt-1">When should this announcement expire?</p>
                            </div>
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

// --- List Item Components (from Events.tsx) ---
interface ReminderPopoverProps {
    onSelect: (value: string) => void;
    onClear: () => void;
    onClose: () => void;
    eventDate: Date;
}

const ReminderPopover: React.FC<ReminderPopoverProps> = ({ onSelect, onClear, onClose, eventDate }) => {
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    const reminderOptions = [
        { label: '1 Hour Before', value: '1-hour', ms: 3600000 },
        { label: '1 Day Before', value: '1-day', ms: 86400000 },
    ];

    return (
        <div
            ref={popoverRef}
            className="absolute right-0 top-10 mt-2 w-48 bg-ahava-surface rounded-md shadow-lg z-20 border border-ahava-purple-medium"
            role="dialog"
            aria-label="Set reminder"
        >
            <div className="py-1">
                <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Remind me</p>
                {reminderOptions.map(option => {
                    const isOptionDisabled = eventDate.getTime() - option.ms < Date.now();
                    return (
                        <button
                            key={option.value}
                            onClick={() => onSelect(option.value)}
                            disabled={isOptionDisabled}
                            className="w-full text-left block px-3 py-2 text-sm text-gray-200 hover:bg-ahava-purple-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                        >
                            {option.label}
                        </button>
                    );
                })}
                <div className="border-t border-ahava-purple-medium my-1"></div>
                <button
                    onClick={onClear}
                    className="w-full text-left block px-3 py-2 text-sm text-red-400 hover:bg-red-500/20"
                >
                    Clear Reminder
                </button>
            </div>
        </div>
    );
};

interface EventListItemProps {
    event: Event;
    onEdit: (event: Event) => void;
    onDelete: (id: string) => void;
    canManage: boolean;
    reminder?: string;
    onSetReminder: (eventId: string, reminderValue: string | null) => void;
}

const EventListItem: React.FC<EventListItemProps> = ({ event, onEdit, onDelete, canManage, reminder, onSetReminder }) => {
    const eventDateObj = new Date(event.date + 'T00:00:00');
    const fullEventDate = new Date(`${event.date}T${event.startTime}`);
    const isPastEvent = fullEventDate < new Date();
    
    const month = eventDateObj.toLocaleString('default', { month: 'short' }).toUpperCase();
    const day = eventDateObj.getDate().toString().padStart(2, '0');

    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const reminderButtonRef = useRef<HTMLButtonElement>(null);

    const eventIcon = event.type === 'Practice' 
        ? <SongsIcon className="h-5 w-5 text-ahava-purple-light" /> 
        : <BuildingIcon className="h-5 w-5 text-ahava-magenta" />;

    const handleSetReminder = (value: string) => {
        onSetReminder(event.id, value);
        setIsPopoverOpen(false);
    };

    const handleClearReminder = () => {
        onSetReminder(event.id, null);
        setIsPopoverOpen(false);
    };


    return (
        <div className="bg-ahava-surface p-4 rounded-lg shadow-sm flex items-center justify-between hover:shadow-md transition-shadow border border-ahava-purple-dark hover:border-ahava-purple-medium">
            <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 text-center font-bold w-12">
                    <p className="text-xs text-ahava-magenta">{month}</p>
                    <p className="text-2xl text-gray-200">{day}</p>
                </div>
                <div className="flex-1">
                    <p className="font-semibold text-gray-100">{event.name}</p>
                    <p className="text-sm text-gray-400">{event.startTime} - {event.endTime}</p>
                    <div className="flex items-center text-sm text-gray-400 mt-1">
                        {eventIcon}
                        <span className="ml-2">{event.type}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                {!isPastEvent && (
                    <div className="relative">
                        <button
                            ref={reminderButtonRef}
                            onClick={() => setIsPopoverOpen(prev => !prev)}
                            className={`p-2 rounded-full hover:bg-ahava-purple-medium transition-colors ${reminder ? 'text-ahava-magenta' : 'text-gray-400'}`}
                            aria-label="Set reminder"
                        >
                            <BellIcon className="h-5 w-5" />
                        </button>
                        {isPopoverOpen && (
                            <ReminderPopover
                                onSelect={handleSetReminder}
                                onClear={handleClearReminder}
                                onClose={() => setIsPopoverOpen(false)}
                                eventDate={fullEventDate}
                            />
                        )}
                    </div>
                )}
                {canManage && (
                    <>
                        <button onClick={() => onEdit(event)} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-ahava-purple-medium transition-colors" aria-label="Edit event">
                            <PencilIcon className="h-5 w-5" />
                        </button>
                        <button onClick={() => onDelete(event.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-500/10 transition-colors" aria-label="Delete event">
                            <TrashIcon />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

interface AnnouncementListItemProps {
    announcement: Announcement;
    onEdit: (announcement: Announcement) => void;
    onDelete: (id: string) => void;
    canManage: boolean;
}

const AnnouncementListItem: React.FC<AnnouncementListItemProps> = ({ announcement, onEdit, onDelete, canManage }) => {
    const now = new Date();
    const startTime = announcement.startTime ? new Date(announcement.startTime) : null;
    const endTime = announcement.endTime ? new Date(announcement.endTime) : null;

    const isScheduled = startTime && startTime > now;
    const isExpired = endTime && endTime < now;
    const isActive = !isScheduled && !isExpired;

    const getStatusInfo = () => {
        if (isScheduled) {
            return {
                text: `Visible ${startTime.toLocaleDateString()} at ${startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
                className: 'text-blue-400'
            };
        } else if (isExpired) {
            return {
                text: `Expired ${endTime.toLocaleDateString()}`,
                className: 'text-red-400'
            };
        } else if (endTime) {
            return {
                text: `Expires ${endTime.toLocaleDateString()} at ${endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
                className: 'text-yellow-400'
            };
        }
        return null;
    };

    const statusInfo = getStatusInfo();

    return (
        <div className={`bg-ahava-surface p-4 rounded-lg shadow-sm flex items-start justify-between hover:shadow-md transition-shadow space-x-4 border ${
            isExpired ? 'border-red-500/50 opacity-75' :
            isScheduled ? 'border-blue-500/50' :
            'border-ahava-purple-dark hover:border-ahava-purple-medium'
        }`}>
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-100">{announcement.title}</p>
                    {isActive && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                            Active
                        </span>
                    )}
                    {isScheduled && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            Scheduled
                        </span>
                    )}
                    {isExpired && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                            Expired
                        </span>
                    )}
                </div>
                <p className="text-sm text-gray-300 mt-1 whitespace-pre-wrap">{announcement.content}</p>
                <div className="text-xs text-gray-500 mt-2 space-y-1">
                    <p>By {announcement.author} &bull; {new Date(announcement.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    {statusInfo && (
                        <p className={statusInfo.className}>{statusInfo.text}</p>
                    )}
                </div>
            </div>
            {canManage && announcement.type === 'general' && (
                <div className="flex flex-col items-center space-y-2">
                    <button onClick={() => onEdit(announcement)} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-ahava-purple-medium transition-colors" aria-label="Edit announcement">
                        <PencilIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => onDelete(announcement.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-500/10 transition-colors" aria-label="Delete announcement">
                        <TrashIcon />
                    </button>
                </div>
            )}
        </div>
    );
};

// --- Dashboard Sub-components ---

const BibleVerseCard = () => {
    const [verseData, setVerseData] = useState<{ verse: string; reference: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchVerse = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: "Provide an inspirational bible verse suitable for a morning reflection. Ensure it's uplifting and encouraging.",
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            verse: { type: Type.STRING, description: "The full text of the bible verse." },
                            reference: { type: Type.STRING, description: "The book, chapter, and verse number (e.g., John 3:16)." },
                        },
                        required: ["verse", "reference"],
                    },
                },
            });

            const jsonString = response.text;
            const parsedData = JSON.parse(jsonString);
            setVerseData(parsedData);
        } catch (e) {
            console.error("Failed to fetch bible verse:", e);
            setError("Sorry, I couldn't fetch a verse right now. Please try again later.");
            setVerseData({
                verse: "The Lord is my shepherd; I shall not want.",
                reference: "Psalm 23:1"
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchVerse();
    }, []);
    
    const cardContent = () => {
        if (isLoading && !verseData) {
            return (
                <div className="text-center text-white/70 animate-pulseSlow">
                    <p>Fetching an inspirational verse...</p>
                </div>
            );
        }
        if (error && verseData) {
            return (
                <div key={verseData.reference} className="animate-fadeInUp">
                    <p className="text-center text-sm text-red-300 mb-4">{error}</p>
                    <blockquote className="text-center">
                        <p className="text-2xl font-serif text-white leading-relaxed" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.4)' }}>“{verseData.verse}”</p>
                        <cite className="block text-right mt-4 text-lg font-semibold text-white/90 not-italic">— {verseData.reference}</cite>
                    </blockquote>
                </div>
            );
        }
        if (verseData) {
            return (
                <blockquote key={verseData.reference} className="text-center animate-fadeInUp">
                    <p className="text-2xl font-serif text-white leading-relaxed" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.4)' }}>“{verseData.verse}”</p>
                    <cite className="block text-right mt-4 text-lg font-semibold text-white/90 not-italic">— {verseData.reference}</cite>
                </blockquote>
            );
        }
        return null;
    };

    return (
        <div 
            className="p-6 rounded-xl shadow-lg relative overflow-hidden bg-cover bg-center transition-transform duration-300 hover:scale-[1.02]"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1543002588-b9b6b62224c5?q=80&w=1974&auto=format&fit=crop')" }}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-ahava-purple-dark/80 to-ahava-purple-medium/70 backdrop-blur-sm"></div>
            <div className="relative z-10">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                        <BookIcon className="h-6 w-6 text-white/90 mr-3" />
                        <h3 className="text-lg font-semibold text-white">Verse of the Day</h3>
                    </div>
                    <button
                        onClick={fetchVerse}
                        disabled={isLoading}
                        className="text-sm bg-white/20 text-white font-semibold py-1 px-4 rounded-full hover:bg-white/30 backdrop-blur-md transition-colors disabled:opacity-50 disabled:cursor-wait"
                    >
                        {isLoading ? 'Loading...' : 'New Verse'}
                    </button>
                </div>
                <div className="min-h-[120px] flex items-center justify-center p-4">
                     {cardContent()}
                </div>
            </div>
        </div>
    );
};


const AttendanceSummaryCard = () => {
    const [attendanceData, setAttendanceData] = useState<{
        Present: number;
        Absent: number;
        Excused: number;
        totalEvents: number;
        percentage: number;
    } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttendanceData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const response = await fetch('http://localhost:5007/api/attendances/summaries', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const summaries = await response.json();

                    // Calculate overall choir attendance
                    let totalPresent = 0;
                    let totalAbsent = 0;
                    let totalExcused = 0;
                    let totalEvents = 0;
                    let memberCount = 0;

                    Object.values(summaries).forEach((memberData: any) => {
                        totalPresent += memberData.Present || 0;
                        totalAbsent += memberData.Absent || 0;
                        totalExcused += memberData.Excused || 0;
                        totalEvents = Math.max(totalEvents, memberData.totalEvents || 0);
                        memberCount++;
                    });

                    // Calculate average attendance percentage
                    const totalPossible = totalEvents * memberCount;
                    const totalAttended = totalPresent + totalExcused;
                    const averagePercentage = totalPossible > 0
                        ? Math.round((totalAttended / totalPossible) * 100)
                        : 0;

                    setAttendanceData({
                        Present: totalPresent,
                        Absent: totalAbsent,
                        Excused: totalExcused,
                        totalEvents: totalEvents,
                        percentage: averagePercentage
                    });
                }
            } catch (error) {
                console.error('Failed to fetch attendance data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAttendanceData();
    }, []);

    const percentage = attendanceData?.percentage || 0;

    const { colorClass, message } = useMemo(() => {
        if (percentage >= 85) {
            return { colorClass: 'text-ahava-purple-light', message: 'Excellent! Keep up the great attendance.' };
        } else if (percentage >= 70) {
            return { colorClass: 'text-yellow-400', message: 'Good work. Let\'s aim for higher!' };
        } else {
            return { colorClass: 'text-red-400', message: 'Your attendance is low. Please try to improve.' };
        }
    }, [percentage]);

    const circumference = 2 * Math.PI * 48; // 2 * pi * r
    const offset = circumference - (percentage / 100) * circumference;

    if (loading) {
        return (
            <div className="bg-ahava-surface p-6 rounded-lg shadow-md flex items-center justify-center h-full border border-ahava-purple-dark">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ahava-purple-light mx-auto mb-2"></div>
                    <p className="text-sm text-gray-400">Loading attendance data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-ahava-surface p-6 rounded-lg shadow-md flex items-center justify-between h-full border border-ahava-purple-dark">
            <div className="flex-1 pr-4">
                <h3 className="text-lg font-semibold text-gray-100">Overall Attendance</h3>
                <p className="text-sm text-gray-400 mb-3">Based on past events</p>
                <p className={`text-sm font-semibold ${colorClass}`}>{message}</p>
                {attendanceData && (
                    <div className="mt-3 text-xs text-gray-500 space-y-1">
                        <p>Total Events: {attendanceData.totalEvents}</p>
                        <p>Present: {attendanceData.Present} | Absent: {attendanceData.Absent} | Excused: {attendanceData.Excused}</p>
                    </div>
                )}
            </div>
            <div className="relative flex-shrink-0">
                <svg className="w-28 h-28 transform -rotate-90">
                    <circle cx="56" cy="56" r="48" strokeWidth="8" stroke="currentColor" className="text-ahava-purple-dark" fill="transparent" />
                    <circle
                        cx="56" cy="56" r="48" strokeWidth="8"
                        stroke="currentColor" className={colorClass}
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
                    />
                </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-3xl font-bold ${colorClass}`}>{percentage}%</span>
                </div>
            </div>
        </div>
    );
};

const CountdownCard = ({ event }: { event?: Event }) => {
    const [status, setStatus] = useState<'upcoming' | 'in-progress' | 'no-event'>('no-event');
    const [timeLeft, setTimeLeft] = useState<{ [key: string]: number }>({});

    useEffect(() => {
        if (!event) {
            setStatus('no-event');
            return;
        }

        const calculate = () => {
            const now = new Date();
            const startTime = new Date(`${event.date}T${event.startTime}`);
            const endTime = new Date(`${event.date}T${event.endTime}`);

            if (now < startTime) {
                setStatus('upcoming');
                const difference = +startTime - +now;
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            } else if (now >= startTime && now < endTime) {
                setStatus('in-progress');
                const difference = +endTime - +now;
                 setTimeLeft({
                    hours: Math.floor(difference / (1000 * 60 * 60)), // Total hours can exceed 24
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            } else {
                 // The parent component will handle filtering this out, so this state will be brief
                setStatus('no-event');
            }
        };

        calculate(); // Run once immediately
        const interval = setInterval(calculate, 1000);
        return () => clearInterval(interval);

    }, [event]);

    if (status === 'no-event') {
        return (
            <div className="bg-ahava-surface p-6 rounded-lg shadow-md flex items-center lg:col-span-2 border border-ahava-purple-dark">
                 <ClockIcon className="h-8 w-8 text-ahava-magenta mr-4" />
                <div>
                    <h3 className="text-lg font-semibold text-gray-100">No Upcoming Events</h3>
                    <p className="text-sm text-gray-400">Check the events page for updates.</p>
                </div>
            </div>
        );
    }
    
    if (status === 'in-progress') {
        const remainingTime = `${String(timeLeft.hours || 0).padStart(2, '0')}:${String(timeLeft.minutes || 0).padStart(2, '0')}:${String(timeLeft.seconds || 0).padStart(2, '0')}`;
         return (
            <div className="bg-yellow-900/40 border-l-4 border-yellow-500 p-6 rounded-lg shadow-md lg:col-span-2 animate-pulseSlow">
                <h3 className="text-lg font-semibold text-yellow-200 mb-1">Event In Progress!</h3>
                <p className="text-sm text-yellow-300 mb-4">
                    <span className="font-semibold">{event?.name}</span> is happening now.
                </p>
                <div className="text-center">
                    <p className="text-sm text-yellow-300">Time Remaining</p>
                    <p className="text-3xl font-bold text-yellow-200 tracking-wider">{remainingTime}</p>
                </div>
            </div>
         );
    }

    // status === 'upcoming'
    const timeParts = [
        { label: 'Days', value: timeLeft.days },
        { label: 'Hours', value: timeLeft.hours },
        { label: 'Mins', value: timeLeft.minutes },
        { label: 'Secs', value: timeLeft.seconds },
    ];

    return (
        <div className="bg-ahava-surface p-6 rounded-lg shadow-md lg:col-span-2 border border-ahava-purple-dark">
            <h3 className="text-lg font-semibold text-gray-100 mb-1">Next Event Countdown</h3>
            <p className="text-sm text-gray-400 mb-4">Time until <span className="font-semibold text-ahava-purple-light">{event?.name}</span></p>
            <div className="flex items-center justify-around text-center space-x-2">
                {timeParts.map(part => (
                    part.value !== undefined && (
                        <div key={part.label} className="flex flex-col items-center flex-1 p-2 bg-ahava-background rounded-lg">
                            <span className="text-3xl md:text-4xl font-bold text-gray-100 tracking-wider">{String(part.value).padStart(2, '0')}</span>
                            <span className="text-xs text-gray-400 uppercase">{part.label}</span>
                        </div>
                    )
                ))}
            </div>
        </div>
    );
};


// --- Main Dashboard Component ---
interface DashboardProps {
    user: User | null;
    announcements: Announcement[];
    setActiveView: (view: View) => void;
    events: Event[];
    onSubmitEvent: (eventData: Omit<Event, 'id'>, editingId: string | null) => void;
    onDeleteEvent: (eventId: string) => void;
    onSubmitAnnouncement: (announcementData: { title: string; content: string }, editingId: string | null) => void;
    onDeleteAnnouncement: (announcementId: string) => void;
    onMenuClick?: () => void;
}

export const Dashboard = ({ user, announcements, setActiveView, events, onSubmitEvent, onDeleteEvent, onSubmitAnnouncement, onDeleteAnnouncement, onMenuClick }: DashboardProps) => {
    // State and logic from original Events.tsx
    const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
    const [reminders, setReminders] = useState<Record<string, string>>({});
    const timeoutRefs = useRef<Record<string, number>>({});

    const canManageEvents = user?.role === 'President' || user?.role === 'Advisor';
    const canManageAnnouncements = user?.role === 'President' || user?.role === 'Advisor';

    const handleSetReminder = (eventId: string, reminderValue: string | null) => {
        if (timeoutRefs.current[eventId]) {
            clearTimeout(timeoutRefs.current[eventId]);
            delete timeoutRefs.current[eventId];
        }

        setReminders(prev => {
            const newReminders = { ...prev };
            if (reminderValue) {
                newReminders[eventId] = reminderValue;
            } else {
                delete newReminders[eventId];
            }
            return newReminders;
        });

        if (reminderValue) {
            const event = events.find(e => e.id === eventId);
            if (!event) return;

            const eventTime = new Date(`${event.date}T${event.startTime}`).getTime();
            let reminderOffset = 0;
            if (reminderValue === '1-hour') {
                reminderOffset = 3600000;
            } else if (reminderValue === '1-day') {
                reminderOffset = 86400000;
            }

            const reminderTime = eventTime - reminderOffset;
            const delay = reminderTime - Date.now();

            if (delay > 0) {
                const timeoutId = window.setTimeout(() => {
                    alert(`Reminder: Your event "${event.name}" at ${event.startTime} is starting soon!`);
                    setReminders(prev => {
                        const newReminders = { ...prev };
                        delete newReminders[eventId];
                        return newReminders;
                    });
                }, delay);
                timeoutRefs.current[eventId] = timeoutId;
            }
        }
    };

    useEffect(() => {
        const refs = timeoutRefs.current;
        return () => {
            Object.values(refs).forEach(clearTimeout);
        };
    }, []);

    const handleOpenAddEventModal = () => {
        setEditingEvent(null);
        setIsAddEventModalOpen(true);
    };

    const handleOpenEditEventModal = (event: Event) => {
        setEditingEvent(event);
        setIsAddEventModalOpen(true);
    };

    const handleDeleteEvent = (eventId: string) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            onDeleteEvent(eventId);
            handleSetReminder(eventId, null);
        }
    };
    
    const handleSubmitEvent = (eventData: Omit<Event, 'id'>) => {
        onSubmitEvent(eventData, editingEvent ? editingEvent.id : null);
        handleCloseEventModal();
    };

    const handleCloseEventModal = () => {
        setIsAddEventModalOpen(false);
        setEditingEvent(null);
    };

    const handleOpenAddAnnouncementModal = () => {
        setEditingAnnouncement(null);
        setIsAnnouncementModalOpen(true);
    };

    const handleOpenEditAnnouncementModal = (announcement: Announcement) => {
        setEditingAnnouncement(announcement);
        setIsAnnouncementModalOpen(true);
    };
    
    const handleDeleteAnnouncement = (announcementId: string) => {
        if (window.confirm('Are you sure you want to delete this announcement?')) {
            onDeleteAnnouncement(announcementId);
        }
    };
    
    const handleSubmitAnnouncement = (announcementData: { title: string; content: string }) => {
        onSubmitAnnouncement(announcementData, editingAnnouncement ? editingAnnouncement.id : null);
        handleCloseAnnouncementModal();
    };

    const handleCloseAnnouncementModal = () => {
        setIsAnnouncementModalOpen(false);
        setEditingAnnouncement(null);
    };

    const ActionButtons = () => (
        <div className="flex flex-col sm:flex-row gap-2">
            <button 
                onClick={handleOpenAddEventModal}
                className="bg-ahava-purple-dark text-white font-semibold py-2 px-4 rounded-lg hover:bg-ahava-purple-medium transition-colors flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                Add Event
            </button>
            <button 
                onClick={handleOpenAddAnnouncementModal}
                className="bg-ahava-magenta text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity flex items-center">
                <BellIcon className="h-5 w-5 mr-2" />
                Add Announcement
            </button>
        </div>
    );

    // Logic from original Dashboard
    const nextUpcomingEvent = useMemo(() => {
        const now = new Date();
        const futureEvents = events
            .filter(event => new Date(`${event.date}T${event.endTime}`) > now)
            .sort((a, b) => new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime());
        return futureEvents[0];
    }, [events]);

    if (!user) {
        return <div className="p-8">Loading dashboard...</div>;
    }

    return (
        <div className="bg-ahava-background min-h-full">
            <Header
                breadcrumbs={['Dashboard']}
                title={`Welcome, ${user.name.split(' ')[0]}!`}
                titleIcon={<DashboardIcon className="h-6 w-6" />}
                actionButton={(canManageEvents || canManageAnnouncements) ? <ActionButtons /> : undefined}
                onMenuClick={onMenuClick}
            />
            <div className="p-4 md:p-8">
                <div className="mb-6">
                    <BibleVerseCard />
                </div>
            
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <AttendanceSummaryCard />
                    <CountdownCard event={nextUpcomingEvent} />
                </div>

                {/* Merged Events & Announcements Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Events Column */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-100 mb-4">Upcoming Events</h2>
                        <div className="space-y-4">
                            {events.length > 0 ? (
                                events.map(event => (
                                    <EventListItem 
                                        key={event.id}
                                        event={event}
                                        onEdit={handleOpenEditEventModal}
                                        onDelete={handleDeleteEvent}
                                        canManage={!!canManage}
                                        reminder={reminders[event.id]}
                                        onSetReminder={handleSetReminder}
                                    />
                                ))
                            ) : (
                                <div className="bg-ahava-surface text-center p-8 rounded-lg shadow-sm border border-ahava-purple-dark">
                                    <h3 className="text-lg font-semibold text-gray-200">No Events Scheduled</h3>
                                    <p className="text-gray-400 mt-2">Check back later for updates or add a new event.</p>
                                </div>
                            )}
                        </div>
                    </div>

                     {/* Announcements Column */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-100 mb-4">Announcements</h2>
                        <div className="space-y-4">
                            {announcements.length > 0 ? (
                                announcements.map(announcement => (
                                    <AnnouncementListItem
                                        key={announcement.id}
                                        announcement={announcement}
                                        onEdit={handleOpenEditAnnouncementModal}
                                        onDelete={handleDeleteAnnouncement}
                                        canManage={!!canManage}
                                    />
                                ))
                            ) : (
                                <div className="bg-ahava-surface text-center p-8 rounded-lg shadow-sm border border-ahava-purple-dark">
                                    <h3 className="text-lg font-semibold text-gray-200">No Announcements</h3>
                                    <p className="text-gray-400 mt-2">There are no announcements at this time.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <AddEventModal 
                isOpen={isAddEventModalOpen}
                onClose={handleCloseEventModal}
                onSubmit={handleSubmitEvent}
                eventToEdit={editingEvent}
            />
            <AddAnnouncementModal
                isOpen={isAnnouncementModalOpen}
                onClose={handleCloseAnnouncementModal}
                onSubmit={handleSubmitAnnouncement}
                announcementToEdit={editingAnnouncement}
            />
        </div>
    );
};
