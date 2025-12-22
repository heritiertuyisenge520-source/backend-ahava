


import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Header } from './Header';
import { SingersIcon, MailIcon, PhoneIcon, WhatsappIcon } from './Icons';

interface AttendanceSummary {
    Present: number;
    Absent: number;
    Excused: number;
    totalEvents: number;
}

interface SingerCardProps {
    singer: User;
    attendanceSummary?: AttendanceSummary;
}

// FIX: Explicitly type component with React.FC to correctly handle the 'key' prop.
const SingerCard: React.FC<SingerCardProps> = ({ singer, attendanceSummary }) => {
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

                {/* Overall Performance Statistics */}
                {attendanceSummary && attendanceSummary.totalEvents > 0 && (
                    <div className="mt-4 p-3 bg-ahava-background rounded-lg border border-ahava-purple-medium">
                        <h4 className="text-sm font-semibold text-gray-200 mb-3">Overall Performance</h4>

                        {/* Attendance Counts */}
                        <div className="grid grid-cols-3 gap-2 text-center mb-3">
                            <div className="bg-green-900/30 p-2 rounded">
                                <p className="text-green-300 font-bold text-sm">{attendanceSummary.Present}</p>
                                <p className="text-green-400 text-xs">Present</p>
                            </div>
                            <div className="bg-red-900/30 p-2 rounded">
                                <p className="text-red-300 font-bold text-sm">{attendanceSummary.Absent}</p>
                                <p className="text-red-400 text-xs">Absent</p>
                            </div>
                            <div className="bg-yellow-900/30 p-2 rounded">
                                <p className="text-yellow-300 font-bold text-sm">{attendanceSummary.Excused}</p>
                                <p className="text-yellow-400 text-xs">Excused</p>
                            </div>
                        </div>

                        {/* Performance Metrics */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">Attendance Rate:</span>
                                <span className={`font-semibold ${
                                    ((attendanceSummary.Present + attendanceSummary.Excused) / attendanceSummary.totalEvents * 100) >= 80
                                        ? 'text-green-400'
                                        : ((attendanceSummary.Present + attendanceSummary.Excused) / attendanceSummary.totalEvents * 100) >= 60
                                        ? 'text-yellow-400'
                                        : 'text-red-400'
                                }`}>
                                    {Math.round((attendanceSummary.Present + attendanceSummary.Excused) / attendanceSummary.totalEvents * 100)}%
                                </span>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">Total Events:</span>
                                <span className="text-gray-200 font-semibold">{attendanceSummary.totalEvents}</span>
                            </div>

                            {/* Performance Indicator */}
                            <div className="mt-3 pt-2 border-t border-ahava-purple-medium">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-400">Performance:</span>
                                    <div className="flex items-center space-x-1">
                                        {Array.from({ length: 5 }, (_, i) => {
                                            const attendanceRate = (attendanceSummary.Present + attendanceSummary.Excused) / attendanceSummary.totalEvents;
                                            const starRating = Math.round(attendanceRate * 5);
                                            return (
                                                <span
                                                    key={i}
                                                    className={`text-sm ${
                                                        i < starRating ? 'text-yellow-400' : 'text-gray-600'
                                                    }`}
                                                >
                                                    ★
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
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


const Singers = ({ singers, onMenuClick, user }: { singers: User[], onMenuClick?: () => void, user?: User }) => {
    const [attendanceSummaries, setAttendanceSummaries] = useState<Record<string, AttendanceSummary>>({});
    const [loadingSummaries, setLoadingSummaries] = useState(true);

    useEffect(() => {
        const fetchAttendanceSummaries = async () => {
            if (!singers || singers.length === 0) {
                console.log('No singers to fetch summaries for');
                setLoadingSummaries(false);
                return;
            }

            console.log('Fetching attendance summaries for singers:', singers.map(s => `${s.name} (${s.id})`));

            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.log('No auth token available');
                    return;
                }

                const response = await fetch('http://localhost:5007/api/attendances/summaries', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                console.log('API response status:', response.status);

                if (response.ok) {
                    const summaries = await response.json();
                    console.log('Received summaries:', summaries);
                    console.log('Summary keys:', Object.keys(summaries));
                    setAttendanceSummaries(summaries);
                } else {
                    console.error('API error:', response.status, response.statusText);
                }
            } catch (error) {
                console.error('Failed to fetch attendance summaries:', error);
            } finally {
                setLoadingSummaries(false);
            }
        };

        fetchAttendanceSummaries();
    }, [singers]);

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
                        {singers.map(singer => {
                            const summary = attendanceSummaries[singer.id];
                            console.log(`Singer ${singer.name}: id=${singer.id}, summary=`, summary);
                            return (
                                <SingerCard
                                    key={singer.id}
                                    singer={singer}
                                    attendanceSummary={summary}
                                />
                            );
                        })}
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
