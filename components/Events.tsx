


import React, { useState, useRef, useEffect } from 'react';
import { Header } from './Header';
import { EventsIcon, PencilIcon, BuildingIcon, SongsIcon, TrashIcon, BellIcon } from './Icons';
import type { User, Event, Announcement } from '../types';
import { AddEventModal } from './AddEventModal';


// --- Announcement Modal ---
interface AddAnnouncementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (announcement: { title: string; content: string }) => void;
    announcementToEdit: Announcement | null;
}

const AddAnnouncementModal = ({ isOpen, onClose, onSubmit, announcementToEdit }: AddAnnouncementModalProps) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            if (announcementToEdit) {
                setTitle(announcementToEdit.title);
                setContent(announcementToEdit.content);
            } else {
                setTitle('');
                setContent('');
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
        onSubmit({ title, content });
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


// --- List Item Components ---
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
    return (
        <div className="bg-ahava-surface p-4 rounded-lg shadow-sm flex items-start justify-between hover:shadow-md transition-shadow space-x-4 border border-ahava-purple-dark hover:border-ahava-purple-medium">
            <div className="flex-1">
                <p className="font-semibold text-gray-100">{announcement.title}</p>
                <p className="text-sm text-gray-300 mt-1 whitespace-pre-wrap">{announcement.content}</p>
                <p className="text-xs text-gray-500 mt-2">
                    By {announcement.author} &bull; {new Date(announcement.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
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


// --- Main Events & Announcements Component ---

interface EventsProps {
    user: User;
    events: Event[];
    announcements: Announcement[];
    onSubmitEvent: (eventData: Omit<Event, 'id'>, editingId: string | null) => void;
    onDeleteEvent: (eventId: string) => void;
    onSubmitAnnouncement: (announcementData: { title: string; content: string }, editingId: string | null) => void;
    onDeleteAnnouncement: (announcementId: string) => void;
}

export const Events = ({ user, events, announcements, onSubmitEvent, onDeleteEvent, onSubmitAnnouncement, onDeleteAnnouncement }: EventsProps) => {
    const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
    const [reminders, setReminders] = useState<Record<string, string>>({});
    const timeoutRefs = useRef<Record<string, number>>({});

    const canManage = user.role === 'President';

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
        <div className="flex flex-wrap gap-2">
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

    return (
        <div className="min-h-full bg-ahava-background">
             <Header
                breadcrumbs={['Dashboard']}
                title="Events & Announcements"
                titleIcon={<EventsIcon className="h-6 w-6" />}
                actionButton={canManage ? <ActionButtons /> : undefined}
            />
            <div className="p-8">
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
                                        canManage={canManage}
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
                                        canManage={canManage}
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