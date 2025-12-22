


import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { User, Event, PermissionRequest, AttendanceStatus } from '../types';
import { Header } from './Header';
import { ChartBarIcon, SongsIcon, BuildingIcon, PaperAirplaneIcon, CheckCircleIcon, DownloadIcon } from './Icons';
import { PermissionRequestModal } from './PermissionRequestModal';

// --- Types ---
type EventType = 'Practice' | 'Service' | 'None';
interface AttendanceData {
    day: number;
    status: AttendanceStatus;
    eventType: EventType;
}

const currentYear = new Date().getFullYear();

// --- Main Component ---
interface AttendanceProps {
    user: User | null;
    singers: User[];
    onNewPermissionRequest: (request: PermissionRequest) => void;
    events: Event[];
    attendanceRecords: Record<string, Record<string, AttendanceStatus>>;
    onSaveAttendance: (eventId: string, records: Record<string, AttendanceStatus>) => Promise<{ success: boolean; message: string }>;
    onSubmitEvent?: (eventData: Omit<Event, 'id'>, editingId: string | null) => void;
    onMenuClick?: () => void;
    onAttendanceSaved?: () => void;
}

export const Attendance = ({ user, singers, onNewPermissionRequest, events, attendanceRecords, onSaveAttendance, onSubmitEvent, onMenuClick, onAttendanceSaved }: AttendanceProps) => {
    if (!user) return <div className="p-8">Loading attendance data...</div>;

    const canManageAttendance = user.role === 'Advisor' || user.role === 'President';

    if (canManageAttendance) {
        const membersForAttendance = singers;
        return <AdvisorAttendanceView
                    user={user}
                    members={membersForAttendance}
                    events={events}
                    attendanceRecords={attendanceRecords}
                    onSave={onSaveAttendance}
                    onAttendanceSaved={onAttendanceSaved}
                    onMenuClick={onMenuClick}
                />;
    }

    return <SingerAttendanceView
                user={user}
                onNewPermissionRequest={onNewPermissionRequest}
                events={events}
                attendanceRecords={attendanceRecords}
                onMenuClick={onMenuClick}
            />;
};


// --- Advisor/President View ---
const getInitials = (name: string) => {
    const names = name.split(' ');
    return `${names[0]?.[0] || ''}${names.length > 1 ? names[names.length - 1]?.[0] || '' : ''}`.toUpperCase();
};


interface StatusSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    members: User[];
}

const StatusSummaryModal = ({ isOpen, onClose, title, members }: StatusSummaryModalProps) => {
    const modalRef = useRef<HTMLDivElement>(null);

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

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
            onClick={handleClickOutside}
            role="dialog"
            aria-modal="true"
            aria-labelledby="summary-modal-title"
        >
            <div ref={modalRef} className="bg-ahava-surface rounded-lg shadow-xl p-6 w-full max-w-md border border-ahava-purple-medium">
                <div className="flex justify-between items-start mb-4">
                    <h2 id="summary-modal-title" className="text-xl font-bold text-gray-100">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl font-bold leading-none" aria-label="Close modal">&times;</button>
                </div>
                <div className="max-h-96 overflow-y-auto pr-2">
                    {members.length > 0 ? (
                        <ul className="space-y-3">
                            {members.map(member => (
                                <li key={member.id} className="flex items-center p-2 bg-ahava-background rounded-md">
                                    {member.profilePictureUrl ? (
                                        <img src={member.profilePictureUrl} alt={member.name} className="w-10 h-10 rounded-full object-cover mr-3" />
                                    ) : (
                                        <div className="w-10 h-10 bg-indigo-200 flex items-center justify-center rounded-full mr-3">
                                            <span className="font-bold text-indigo-800">{getInitials(member.name)}</span>
                                        </div>
                                    )}
                                    <span className="font-medium text-gray-200">{member.name}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-gray-400 py-8">No members with this status.</p>
                    )}
                </div>
            </div>
        </div>
    );
};


interface SingerAttendanceRowProps {
    singer: User;
    status: AttendanceStatus;
    onStatusChange: (singerId: string, newStatus: AttendanceStatus) => void;
    activePermissions?: any[];
}

const SingerAttendanceRow: React.FC<SingerAttendanceRowProps> = ({ singer, status, onStatusChange, activePermissions }) => {
    const placeholderAvatar = `https://ui-avatars.com/api/?name=${singer.name.replace(' ', '+')}&background=c7d2fe&color=3730a3&size=96`;
    const avatarSrc = singer.profilePictureUrl || placeholderAvatar;

    const statusOptions: AttendanceStatus[] = ['Present', 'Absent', 'Excused'];
    const statusClasses = {
        'Present': 'bg-green-500 text-white',
        'Absent': 'bg-red-500 text-white',
        'Excused': 'bg-yellow-500 text-black',
        'default': 'bg-ahava-purple-medium text-gray-200 hover:bg-ahava-purple-light',
    };

    const userPermission = activePermissions?.find(p => p.userId === singer.id);

    const handleStatusClick = (newStatus: AttendanceStatus) => {
        // If trying to change from Excused to Present/Absent and user has active permission
        if (status === 'Excused' && (newStatus === 'Present' || newStatus === 'Absent') && userPermission) {
            const startDate = new Date(userPermission.startDate).toLocaleDateString();
            const endDate = userPermission.endDate ? new Date(userPermission.endDate).toLocaleDateString() : startDate;
            alert(`This member has an approved permission request from ${startDate} to ${endDate} because of: ${userPermission.reason}. They must remain marked as Excused.`);
            return;
        }
        onStatusChange(singer.id, newStatus);
    };

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-ahava-background rounded-lg transition-colors hover:bg-ahava-purple-dark/40 gap-3 sm:gap-0">
            <div className="flex items-center space-x-4 w-full sm:w-auto">
                 {singer.profilePictureUrl ? (
                    <img src={avatarSrc} alt={singer.name} className="w-10 h-10 rounded-full object-cover" />
                 ) : (
                    <div className="w-16 h-16 bg-indigo-200 flex items-center justify-center rounded-full">
                        <span className="font-bold text-indigo-800">{getInitials(singer.name)}</span>
                    </div>
                 )}
                <div>
                    <p className="font-medium text-gray-100">{singer.name}</p>
                    <p className="text-sm text-gray-400">{singer.role}</p>
                    {userPermission && status === 'Excused' && (
                        <p className="text-xs text-yellow-400 mt-1">Has approved permission</p>
                    )}
                </div>
            </div>
            <div className="flex space-x-2 w-full sm:w-auto justify-end sm:justify-start">
                {statusOptions.map(option => (
                    <button
                        key={option}
                        onClick={() => handleStatusClick(option)}
                        className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 ${
                            status === option ? statusClasses[option] : statusClasses['default']
                        }`}
                    >
                        {option}
                    </button>
                ))}
            </div>
        </div>
    );
};

interface SaveConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    summary: { Present: number; Absent: number; Excused: number; total: number };
    isLoading: boolean;
}

const SaveConfirmationModal = ({ isOpen, onClose, onConfirm, summary, isLoading }: SaveConfirmationModalProps) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !isLoading) onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose, isLoading]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div ref={modalRef} className="bg-ahava-surface rounded-lg shadow-xl p-6 w-full max-w-md border border-ahava-purple-medium">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-gray-100">Confirm Attendance Save</h2>
                    {!isLoading && (
                        <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl font-bold leading-none">&times;</button>
                    )}
                </div>

                <div className="space-y-4 mb-6">
                    <p className="text-gray-300">Please review the attendance summary before saving:</p>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-900/20 border border-green-700 p-3 rounded-lg text-center">
                            <p className="text-green-300 font-bold text-lg">{summary.Present}</p>
                            <p className="text-green-400 text-sm">Present</p>
                        </div>
                        <div className="bg-red-900/20 border border-red-700 p-3 rounded-lg text-center">
                            <p className="text-red-300 font-bold text-lg">{summary.Absent}</p>
                            <p className="text-red-400 text-sm">Absent</p>
                        </div>
                        <div className="bg-yellow-900/20 border border-yellow-700 p-3 rounded-lg text-center">
                            <p className="text-yellow-300 font-bold text-lg">{summary.Excused}</p>
                            <p className="text-yellow-400 text-sm">Excused</p>
                        </div>
                        <div className="bg-gray-900/20 border border-gray-600 p-3 rounded-lg text-center">
                            <p className="text-gray-300 font-bold text-lg">{summary.total}</p>
                            <p className="text-gray-400 text-sm">Total</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="bg-ahava-purple-medium text-gray-200 font-semibold py-2 px-4 rounded-lg hover:bg-ahava-purple-light transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="bg-ahava-purple-dark text-white font-semibold py-2 px-6 rounded-lg hover:bg-ahava-purple-medium transition-colors disabled:opacity-50 flex items-center"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                            </>
                        ) : (
                            'Save Attendance'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

interface AdvisorAttendanceViewProps {
    members: User[];
    events: Event[];
    attendanceRecords: Record<string, Record<string, AttendanceStatus>>;
    onSave: (eventId: string, records: Record<string, AttendanceStatus>) => Promise<{ success: boolean; message: string }>;
    onSubmitEvent?: (eventData: Omit<Event, 'id'>, editingId: string | null) => void;
    onMenuClick?: () => void;
    onAttendanceSaved?: () => void;
}

const AdvisorAttendanceView = ({ members, events, attendanceRecords, onSave, onMenuClick, onAttendanceSaved, user }: AdvisorAttendanceViewProps & { user: User }) => {
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
    const [activePermissions, setActivePermissions] = useState<any[]>([]);
    const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState<{title: string; members: User[]}>({title: '', members: []});
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const advisorOverallSummary = useMemo(() => {
        const summary: Record<AttendanceStatus, number> = { 'Present': 0, 'Absent': 0, 'Excused': 0, 'No Event': 0 };
        const now = new Date();

        events.forEach(event => {
            const eventDateTime = new Date(`${event.date}T${event.endTime}`);
            const isPast = eventDateTime < now;
            if (isPast) {
                const status = attendanceRecords[event.id]?.[user.id];
                if (status && (status === 'Present' || status === 'Absent' || status === 'Excused')) {
                    summary[status]++;
                } else {
                    summary['Absent']++;
                }
            }
        });
        return summary;
    }, [events, attendanceRecords, user.id]);

    const selectableEvents = useMemo(() => {
        const today = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
        return events
            .filter(event => event.date >= today) // Show events from today onwards (including future events)
            .sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.startTime}`);
                const dateB = new Date(`${b.date}T${b.startTime}`);
                return dateA.getTime() - dateB.getTime(); // Sort by date ascending (earliest first)
            });
    }, [events]);

    const selectedEvent = useMemo(() => {
        if (!selectedEventId) return null;
        return events.find(e => e.id === selectedEventId) || null;
    }, [selectedEventId, events]);

    const summary = useMemo(() => {
        const counts: Record<Extract<AttendanceStatus, 'Present'|'Absent'|'Excused'>, number> = { Present: 0, Absent: 0, Excused: 0 };
        for (const status of Object.values(attendance)) {
            if (status === 'Present' || status === 'Absent' || status === 'Excused') {
                counts[status]++;
            }
        }
        return counts;
    }, [attendance]);

    // Fetch active permissions when event is selected
    useEffect(() => {
        const fetchActivePermissions = async () => {
            if (!selectedEvent || !selectedEvent.date) {
                setActivePermissions([]);
                return;
            }

            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const response = await fetch(`http://localhost:5007/api/permissions/active/${selectedEvent.date}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const permissions = await response.json();
                    setActivePermissions(permissions);
                }
            } catch (error) {
                console.error('Error fetching active permissions:', error);
                setActivePermissions([]);
            }
        };

        fetchActivePermissions();
    }, [selectedEvent]);

    useEffect(() => {
        if (!selectedEventId) {
            setAttendance({});
            return;
        };
        const initialAttendance: Record<string, AttendanceStatus> = {};
        members.forEach(member => {
            const existingStatus = attendanceRecords[selectedEventId]?.[member.id];
            const hasActivePermission = activePermissions.some(p => p.userId === member.id);

            // If user has active permission and no existing attendance, set to Excused
            if (hasActivePermission && !existingStatus) {
                initialAttendance[member.id] = 'Excused';
            } else {
                initialAttendance[member.id] = existingStatus || 'Absent';
            }
        });
        setAttendance(initialAttendance);
    }, [selectedEventId, members, attendanceRecords, activePermissions]);

    const handleOpenModal = (status: 'Present' | 'Absent' | 'Excused') => {
        const filteredMembers = members.filter(m => attendance[m.id] === status).sort((a,b) => a.name.localeCompare(b.name));
        setModalData({
            title: `Members Marked as ${status}`,
            members: filteredMembers,
        });
        setIsModalOpen(true);
    };

    const handleStatusChange = (memberId: string, newStatus: AttendanceStatus) => {
        setAttendance(prev => ({ ...prev, [memberId]: newStatus }));
    };

    const handleSave = () => {
        setIsSaveModalOpen(true);
    };

    const handleConfirmSave = async () => {
        if (!selectedEventId) return;

        console.log('Frontend: Saving attendance for event:', selectedEventId);
        console.log('Frontend: Attendance data to save:', attendance);
        console.log('Frontend: Attendance data keys:', Object.keys(attendance));
        console.log('Frontend: Sample attendance data:', Object.entries(attendance).slice(0, 3));

        setIsSaving(true);
        try {
            const result = await onSave(selectedEventId, attendance);
            console.log('Frontend: Save result:', result);

            setSaveMessage({
                type: result.success ? 'success' : 'error',
                message: result.message
            });
            setIsSaveModalOpen(false);

            // Trigger refresh of parent components after successful save
            if (result.success && onAttendanceSaved) {
                onAttendanceSaved();
            }

            // Auto-hide success message after 5 seconds
            if (result.success) {
                setTimeout(() => setSaveMessage(null), 5000);
            }
        } catch (error) {
            console.error('Frontend: Error saving attendance:', error);
            setSaveMessage({
                type: 'error',
                message: 'Failed to save attendance. Please try again.'
            });
            setIsSaveModalOpen(false);
        } finally {
            setIsSaving(false);
        }
    };



    const advisorTotal = advisorOverallSummary.Present + advisorOverallSummary.Absent + advisorOverallSummary.Excused;

    return (
         <div className="bg-ahava-background min-h-full">
            <Header
                breadcrumbs={['Dashboard']}
                title="Take Attendance"
                titleIcon={<ChartBarIcon className="h-6 w-6" />}
                onMenuClick={onMenuClick}
            />
            <div className="p-4 md:p-8">
                <div className="bg-ahava-surface p-6 rounded-lg shadow-md border border-ahava-purple-dark mb-8">
                    <h3 className="text-xl font-bold text-gray-100 mb-4 text-center">Your Attendance Performance</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="md:col-span-1">
                            <AttendancePieChart summary={advisorOverallSummary} />
                        </div>
                        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <StatCard title="Present" value={advisorOverallSummary.Present} color="bg-green-500" percentage={advisorTotal > 0 ? (advisorOverallSummary.Present / advisorTotal) * 100 : -1} />
                            <StatCard title="Excused" value={advisorOverallSummary.Excused} color="bg-yellow-500" percentage={advisorTotal > 0 ? (advisorOverallSummary.Excused / advisorTotal) * 100 : -1} />
                            <StatCard title="Absent" value={advisorOverallSummary.Absent} color="bg-red-500/80" percentage={advisorTotal > 0 ? (advisorOverallSummary.Absent / advisorTotal) * 100 : -1} />
                        </div>
                    </div>
                </div>

                <div className="bg-ahava-surface p-6 rounded-lg shadow-md border border-ahava-purple-dark">
                    <div>
                        <label htmlFor="event-select" className="block text-lg font-medium text-gray-100 mb-2">Select an Event</label>
                        <p className="text-sm text-gray-400 mb-4">Choose a past or ongoing event to take or view attendance.</p>
                        <select
                            id="event-select"
                            value={selectedEventId || ''}
                            onChange={(e) => setSelectedEventId(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-ahava-purple-dark border border-ahava-purple-medium rounded-md shadow-sm text-gray-200 focus:outline-none focus:ring-ahava-magenta focus:border-ahava-magenta"
                        >
                            <option value="" disabled>Select an event...</option>
                            {selectableEvents.map(event => (
                                <option key={event.id} value={event.id}>
                                    {event.name} - {new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {selectedEventId && selectedEvent ? (
                    (() => {
                        const eventAttendance = attendanceRecords[selectedEventId];
                        const hasAttendance = eventAttendance && Object.keys(eventAttendance).length > 0;

                        if (hasAttendance) {
                            return (
                                <div className="mt-8 bg-ahava-surface p-6 rounded-lg shadow-md animate-fadeInUp border border-ahava-purple-dark">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-100 mb-2">Attendance Already Recorded</h3>
                                        <p className="text-gray-300 mb-4">The attendance for "{selectedEvent.name}" has already been taken and saved.</p>
                                        <p className="text-sm text-gray-400">You cannot modify attendance records once they have been saved.</p>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div className="mt-8 bg-ahava-surface p-6 rounded-lg shadow-md animate-fadeInUp border border-ahava-purple-dark">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-100">{selectedEvent.name}</h3>
                                        <p className="text-sm text-gray-400">{new Date(selectedEvent.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>
                                     <button onClick={handleSave} className="bg-ahava-purple-dark text-white font-semibold py-2 px-6 rounded-lg hover:bg-ahava-purple-medium transition-colors w-full sm:w-auto">Save Attendance</button>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                                    {(['Present', 'Absent', 'Excused'] as const).map(status => {
                                        const colors = { Present: { bg: 'bg-green-900/40', border: 'border-green-700', hover: 'hover:bg-green-900/60', text: 'text-green-300', value: 'text-green-200' },
                                                         Absent: { bg: 'bg-red-900/40', border: 'border-red-700', hover: 'hover:bg-red-900/60', text: 'text-red-300', value: 'text-red-200' },
                                                         Excused: { bg: 'bg-yellow-900/40', border: 'border-yellow-700', hover: 'hover:bg-yellow-900/60', text: 'text-yellow-300', value: 'text-yellow-200' } };
                                        const color = colors[status];
                                        return (
                                            <button
                                                key={status}
                                                onClick={() => handleOpenModal(status)}
                                                className={`p-4 rounded-lg text-center ${color.bg} border ${color.border} ${color.hover} transition-colors`}
                                            >
                                                <p className={`text-xs ${color.text} uppercase font-semibold`}>{status}</p>
                                                <p className={`font-bold text-3xl ${color.value}`}>{summary[status]}</p>
                                            </button>
                                        );
                                    })}
                                     <div className="p-4 rounded-lg text-center bg-ahava-background border border-ahava-purple-dark">
                                        <p className="text-xs text-gray-400 uppercase font-semibold">Total</p>
                                        <p className="font-bold text-3xl text-gray-200">{members.length}</p>
                                    </div>
                                </div>

                                <div className="border-t border-ahava-purple-medium pt-6 space-y-3">
                                    <h4 className="text-lg font-semibold text-gray-200 mb-2">Choir Roster</h4>
                                    {members.map(member => (
                                        <SingerAttendanceRow key={member.id} singer={member} status={attendance[member.id] || 'Absent'} onStatusChange={handleStatusChange} activePermissions={activePermissions} />
                                    ))}
                                </div>
                            </div>
                        );
                    })()
                ) : (
                    <div className="mt-8 bg-ahava-surface p-6 rounded-lg shadow-md flex flex-col items-center justify-center h-64 text-center text-gray-400 border border-ahava-purple-dark">
                        <ChartBarIcon className="w-16 h-16 text-ahava-purple-dark mb-4" />
                        <h3 className="text-xl font-semibold text-gray-200">Ready to take attendance?</h3>
                        <p className="max-w-xs mt-2">Please select an event from the dropdown above to begin.</p>
                    </div>
                )}
            </div>
            {saveMessage && (
                <div className={`fixed bottom-8 right-8 py-3 px-6 rounded-lg shadow-xl flex items-center animate-fadeInUp z-50 border ${
                    saveMessage.type === 'success' ? 'bg-green-600 text-white border-green-400' : 'bg-red-600 text-white border-red-400'
                }`}>
                    <CheckCircleIcon className="w-6 h-6 mr-3" />
                    <span className="font-semibold">{saveMessage.message}</span>
                    {saveMessage.type === 'error' && (
                        <button
                            onClick={() => setSaveMessage(null)}
                            className="ml-4 text-white hover:text-gray-200"
                        >
                            ✕
                        </button>
                    )}
                </div>
            )}
            <StatusSummaryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalData.title}
                members={modalData.members}
            />
            <SaveConfirmationModal
                isOpen={isSaveModalOpen}
                onClose={() => setIsSaveModalOpen(false)}
                onConfirm={handleConfirmSave}
                summary={{ ...summary, total: members.length }}
                isLoading={isSaving}
            />
        </div>
    );
};


// --- Singer View Components ---
const AttendancePieChart = ({ summary }: { summary: Record<AttendanceStatus, number> }) => {
    const total = summary.Present + summary.Absent + summary.Excused;
    
    if (total === 0) {
        return (
             <div className="relative flex items-center justify-center w-48 h-48 mx-auto">
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    <circle cx="50" cy="50" r="40" strokeWidth="20" stroke="currentColor" className="text-ahava-purple-dark" fill="transparent" />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-gray-400">N/A</span>
                    <span className="text-sm text-gray-500">No Data</span>
                </div>
            </div>
        )
    }

    const present = summary.Present || 0;
    const excused = summary.Excused || 0;

    const presentPercentage = (present / total) * 100;
    const excusedPercentage = (excused / total) * 100;

    const radius = 40;
    const circumference = 2 * Math.PI * radius;

    const presentLength = (presentPercentage / 100) * circumference;
    const excusedLength = ((excusedPercentage) / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center w-48 h-48 mx-auto">
            <svg viewBox="0 0 100" className="transform -rotate-90">
                <circle cx="50" cy="50" r={radius} strokeWidth="20" stroke="currentColor" className="text-ahava-purple-dark" fill="transparent" />
                
                <circle cx="50" cy="50" r={radius} strokeWidth="20" stroke="currentColor" className="text-red-500/50" fill="transparent" strokeDasharray={`${circumference} ${circumference}`} />
                {excusedLength > 0 && <circle cx="50" cy="50" r={radius} strokeWidth="20" stroke="currentColor" className="text-ahava-purple-light" fill="transparent" strokeDasharray={`${excusedLength + presentLength} ${circumference}`} />}
                {presentLength > 0 && <circle cx="50" cy="50" r={radius} strokeWidth="20" stroke="currentColor" className="text-ahava-purple-medium" fill="transparent" strokeDasharray={`${presentLength} ${circumference}`} />}
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-100">{presentPercentage.toFixed(0)}%</span>
                <span className="text-sm text-gray-400">Present</span>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, color, percentage }: { title: string, value: number, color: string, percentage: number }) => (
    <div className="bg-ahava-background p-4 rounded-lg flex items-center border border-ahava-purple-dark">
        <div className={`w-3 h-12 rounded-full ${color} mr-4`}></div>
        <div>
            <p className="text-sm text-gray-400">{title}</p>
            <div className="flex items-baseline space-x-2">
                <p className="text-2xl font-bold text-gray-100">{value} days</p>
                {percentage > -1 && (
                     <p className="text-base font-semibold text-gray-400">({percentage.toFixed(0)}%)</p>
                )}
            </div>
        </div>
    </div>
);

const AttendanceHistoryList = ({ events, attendanceRecords, userId }: { events: Event[], attendanceRecords: Record<string, Record<string, AttendanceStatus>>, userId: string }) => {
    const now = new Date();

    const sortedEvents = events
        .filter(event => new Date(`${event.date}T${event.endTime}`) < now) // Only past events
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Most recent first

    const getStatusDisplay = (status: AttendanceStatus | undefined) => {
        const statusConfig = {
            'Present': { text: 'Present', color: 'text-green-400', bg: 'bg-green-900/20' },
            'Absent': { text: 'Absent', color: 'text-red-400', bg: 'bg-red-900/20' },
            'Excused': { text: 'Excused', color: 'text-yellow-400', bg: 'bg-yellow-900/20' },
        };
        if (status && statusConfig[status]) {
            return statusConfig[status];
        }
        return { text: 'Not Recorded', color: 'text-gray-400', bg: 'bg-gray-900/20' };
    };

    if (sortedEvents.length === 0) {
        return (
            <div className="text-center text-gray-400 py-8">
                <p>No past events found.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-200 mb-4">Attendance History</h4>
            {sortedEvents.map(event => {
                const status = attendanceRecords[event.id]?.[userId];
                const statusDisplay = getStatusDisplay(status);
                const eventDate = new Date(event.date + 'T00:00:00');

                return (
                    <div key={event.id} className={`p-4 rounded-lg border ${statusDisplay.bg} border-ahava-purple-dark`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h5 className="font-semibold text-gray-100">{event.name}</h5>
                                <p className="text-sm text-gray-400">
                                    {eventDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • {event.type}
                                </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusDisplay.color} ${statusDisplay.bg}`}>
                                {statusDisplay.text}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

interface SingerAttendanceViewProps {
    user: User;
    onNewPermissionRequest: (request: PermissionRequest) => void;
    events: Event[];
    attendanceRecords: Record<string, Record<string, AttendanceStatus>>;
    onMenuClick?: () => void;
}

const SingerAttendanceView = ({ user, onNewPermissionRequest, events, attendanceRecords, onMenuClick }: SingerAttendanceViewProps) => {
    const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
    const [permissionConfirmation, setPermissionConfirmation] = useState<React.ReactNode | null>(null);

    const overallSummary = useMemo(() => {
        const summary: Record<AttendanceStatus, number> = { 'Present': 0, 'Absent': 0, 'Excused': 0, 'No Event': 0 };
        const now = new Date();

        console.log('Calculating overallSummary for user', user.id);
        events.forEach(event => {
            const eventDateTime = new Date(`${event.date}T${event.endTime}`);
            const isPast = eventDateTime < now;
            console.log('Event', event.name, 'date', event.date, 'endTime', event.endTime, 'isPast', isPast);
            if (isPast) {
                const status = attendanceRecords[event.id]?.[user.id];
                console.log('status for user', status);
                if (status && (status === 'Present' || status === 'Absent' || status === 'Excused')) {
                    summary[status]++;
                } else {
                    summary['Absent']++;
                }
            }
        });
        console.log('final summary', summary);
        return summary;
    }, [events, attendanceRecords, user.id]);

    const handlePermissionSubmit = (request: { startDate: string; endDate: string; reason: string; details: string }) => {
        onNewPermissionRequest({ ...request, userName: user.name });
        setPermissionConfirmation(
            <div className="text-center">
                <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-100">Request Submitted!</h2>
                <p className="text-gray-300 mt-2">Your permission request has been sent to the committee for review.</p>
            </div>
        );
    };

    const total = overallSummary.Present + overallSummary.Absent + overallSummary.Excused;

    return (
        <div className="bg-ahava-background min-h-full">
            <Header
                breadcrumbs={['Dashboard']}
                title="My Attendance & Performance"
                titleIcon={<ChartBarIcon className="h-6 w-6" />}
                onMenuClick={onMenuClick}
                actionButton={
                    <button
                        onClick={() => {
                            setPermissionConfirmation(null);
                            setIsPermissionModalOpen(true);
                        }}
                        className="bg-ahava-purple-dark text-white font-semibold py-2 px-4 rounded-lg hover:bg-ahava-purple-medium transition-colors flex items-center"
                    >
                        <PaperAirplaneIcon className="mr-2" />
                        Request Permission
                    </button>
                }
            />
            <div className="p-4 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 bg-ahava-surface p-6 rounded-lg shadow-md border border-ahava-purple-dark">
                        <h3 className="text-xl font-bold text-gray-100 mb-4 text-center">Overall Performance</h3>
                        <AttendancePieChart summary={overallSummary} />
                        <div className="mt-6 space-y-3">
                            <StatCard title="Present" value={overallSummary.Present} color="bg-green-500" percentage={total > 0 ? (overallSummary.Present / total) * 100 : -1} />
                            <StatCard title="Excused" value={overallSummary.Excused} color="bg-yellow-500" percentage={total > 0 ? (overallSummary.Excused / total) * 100 : -1} />
                            <StatCard title="Absent" value={overallSummary.Absent} color="bg-red-500/80" percentage={total > 0 ? (overallSummary.Absent / total) * 100 : -1} />
                        </div>
                    </div>
                    <div className="lg:col-span-2 bg-ahava-surface p-6 rounded-lg shadow-md border border-ahava-purple-dark">
                        <AttendanceHistoryList events={events} attendanceRecords={attendanceRecords} userId={user.id} />
                    </div>
                </div>
            </div>
            <PermissionRequestModal
                isOpen={isPermissionModalOpen}
                onClose={() => setIsPermissionModalOpen(false)}
                onSubmit={handlePermissionSubmit}
                confirmationContent={permissionConfirmation}
            />
        </div>
    );
};
