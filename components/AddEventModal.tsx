


import React, { useState, useEffect, useRef } from 'react';
import type { Event } from '../types';

interface AddEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (event: Omit<Event, 'id'>) => void;
    eventToEdit: Event | null;
}

const eventNames = [
    'Practice',
    'Full Fast Praying',
    'Morning Devotion',
    'Friday Service',
    'Sunday Service',
    'Other...',
];

export const AddEventModal = ({ isOpen, onClose, onSubmit, eventToEdit }: AddEventModalProps) => {
    const [name, setName] = useState('');
    const [customName, setCustomName] = useState('');
    const [type, setType] = useState<'Practice' | 'Service'>('Practice');
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            if (eventToEdit) {
                if (eventNames.includes(eventToEdit.name)) {
                    setName(eventToEdit.name);
                    setCustomName('');
                } else {
                    setName('Other...');
                    setCustomName(eventToEdit.name);
                }
                setType(eventToEdit.type);
                setDate(eventToEdit.date);
                setStartTime(eventToEdit.startTime);
                setEndTime(eventToEdit.endTime);
            } else {
                // Reset form for adding new
                setName('');
                setCustomName('');
                setType('Practice');
                setDate('');
                setStartTime('');
                setEndTime('');
            }
        }
    }, [isOpen, eventToEdit]);
    
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    const handleClickOutside = (event: React.MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
            onClose();
        }
    };

    if (!isOpen) return null;
    
    const inputClasses = "mt-1 block w-full px-3 py-2 bg-ahava-purple-dark border border-ahava-purple-medium rounded-md shadow-sm text-gray-200 focus:outline-none focus:ring-ahava-magenta focus:border-ahava-magenta";
    const labelClasses = "block text-sm font-medium text-gray-300";

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalName = name === 'Other...' ? customName : name;
        if (!finalName) {
            alert("Please provide an event name.");
            return;
        }
        onSubmit({ name: finalName, type, date, startTime, endTime });
    };
    
    const modalTitle = eventToEdit ? 'Edit Event' : 'Add New Event';
    const submitButtonText = eventToEdit ? 'Save Changes' : 'Post Event';

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
            onClick={handleClickOutside}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-event-modal-title"
        >
            <div ref={modalRef} className="bg-ahava-surface rounded-lg shadow-xl p-8 w-full max-w-lg border border-ahava-purple-medium">
                <div className="flex justify-between items-start mb-4">
                    <h2 id="add-event-modal-title" className="text-xl font-bold text-gray-100">{modalTitle}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl font-bold leading-none" aria-label="Close modal">&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="eventName" className={labelClasses}>Event Name</label>
                            <select
                                id="eventName"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className={inputClasses}
                            >
                                <option value="" disabled>Select an event...</option>
                                {eventNames.map(eventName => (
                                    <option key={eventName} value={eventName}>{eventName}</option>
                                ))}
                            </select>
                        </div>

                        {name === 'Other...' && (
                            <div className="animate-fadeInUp">
                                <label htmlFor="customEventName" className={labelClasses}>Custom Event Name</label>
                                <input
                                    type="text"
                                    id="customEventName"
                                    value={customName}
                                    onChange={(e) => setCustomName(e.target.value)}
                                    required
                                    placeholder="e.g., Christmas Caroling"
                                    className={inputClasses}
                                />
                            </div>
                        )}

                        <div>
                            <label htmlFor="eventType" className={labelClasses}>Event Type</label>
                            <select
                                id="eventType"
                                value={type}
                                onChange={(e) => setType(e.target.value as 'Practice' | 'Service')}
                                required
                                className={inputClasses}
                            >
                                <option value="Practice">Practice</option>
                                <option value="Service">Service</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="date" className={labelClasses}>Date</label>
                            <input
                                type="date"
                                id="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                                className={inputClasses + " [color-scheme:dark]"}
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="startTime" className={labelClasses}>Start Time</label>
                                <input
                                    type="time"
                                    id="startTime"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    required
                                    className={inputClasses + " [color-scheme:dark]"}
                                />
                            </div>
                            <div>
                                <label htmlFor="endTime" className={labelClasses}>End Time</label>
                                <input
                                    type="time"
                                    id="endTime"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    required
                                    className={inputClasses + " [color-scheme:dark]"}
                                />
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