


import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Header } from './Header';
import { SingersIcon, MailIcon, PhoneIcon, WhatsappIcon } from './Icons';

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


const Singers = ({ singers, onMenuClick, user }: { singers: User[], onMenuClick?: () => void, user?: User }) => {
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
                            <SingerCard
                                key={singer.id}
                                singer={singer}
                            />
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
