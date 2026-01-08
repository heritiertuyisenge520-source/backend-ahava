import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Header } from './Header';
import { SingersIcon, WhatsappIcon } from './Icons';

interface MembersProps {
    user: User;
    onMenuClick?: () => void;
}

export const Members = ({ user, onMenuClick }: MembersProps) => {
    const [members, setMembers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch all approved members
    useEffect(() => {
        const fetchMembers = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Authentication required');
                    return;
                }

                const response = await fetch('http://localhost:5007/api/users/singers', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    const mappedMembers = data.map((member: any) => ({
                        id: member._id,
                        username: member.username,
                        name: member.name,
                        email: member.email,
                        phoneNumber: member.phoneNumber || '',
                        profilePictureUrl: member.profilePictureUrl || undefined,
                        role: member.role,
                        dateOfBirth: member.dateOfBirth || '',
                        placeOfBirth: member.placeOfBirth || '',
                        placeOfResidence: member.placeOfResidence || '',
                        yearOfStudy: member.yearOfStudy || '',
                        university: member.university || '',
                        gender: member.gender || '',
                        maritalStatus: member.maritalStatus || '',
                        homeParishName: member.homeParishName || '',
                        homeParishLocation: member.homeParishLocation || { cell: '', sector: '', district: '' },
                        schoolResidence: member.schoolResidence || '',
                        status: member.status,
                    }));
                    setMembers(mappedMembers);
                } else {
                    setError('Failed to fetch members');
                }
            } catch (error) {
                console.error('Failed to fetch members:', error);
                setError('Network error');
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, []);

    // Format phone number for WhatsApp (remove spaces, dashes, and ensure country code)
    const formatPhoneForWhatsApp = (phone: string): string => {
        if (!phone) return '';
        // Remove all non-digit characters
        let cleaned = phone.replace(/\D/g, '');
        // If it doesn't start with country code, assume it's a local number
        // For Rwanda, country code is 250
        if (cleaned.length > 0 && !cleaned.startsWith('250')) {
            // If it starts with 0, replace with 250
            if (cleaned.startsWith('0')) {
                cleaned = '250' + cleaned.substring(1);
            } else {
                // Otherwise, prepend 250
                cleaned = '250' + cleaned;
            }
        }
        return cleaned;
    };

    // Open WhatsApp chat
    const handleWhatsAppClick = (phoneNumber: string) => {
        const formattedPhone = formatPhoneForWhatsApp(phoneNumber);
        if (!formattedPhone) {
            alert('Phone number not available');
            return;
        }
        // Open WhatsApp with the phone number
        window.open(`https://wa.me/${formattedPhone}`, '_blank');
    };

    const getInitials = (name: string) => {
        const names = name.trim().split(/\s+/);
        if (names.length === 0) return '';
        const firstInitial = names[0]?.[0] || '';
        const lastInitial = names.length > 1 ? names[names.length - 1]?.[0] || '' : '';
        return `${firstInitial}${lastInitial}`.toUpperCase();
    };

    return (
        <div className="min-h-full bg-ahava-background">
            <Header
                breadcrumbs={['Dashboard']}
                title="Members"
                titleIcon={<SingersIcon className="h-6 w-6" />}
                onMenuClick={onMenuClick}
            />

            <div className="p-4 md:p-8">
                {loading ? (
                    <div className="text-center text-gray-400 py-8">Loading members...</div>
                ) : error ? (
                    <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded">
                        {error}
                    </div>
                ) : members.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">No members found.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {members.map((member) => (
                            <div
                                key={member.id}
                                className="bg-ahava-surface rounded-lg shadow-md p-6 border border-ahava-purple-dark hover:border-ahava-purple-light transition-colors"
                            >
                                <div className="flex items-start space-x-4">
                                    {/* Profile Picture or Initials */}
                                    {member.profilePictureUrl ? (
                                        <img
                                            src={member.profilePictureUrl}
                                            alt={member.name}
                                            className="w-16 h-16 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 bg-ahava-purple-medium flex items-center justify-center rounded-full">
                                            <span className="text-xl font-bold text-white">
                                                {getInitials(member.name)}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex-1 min-w-0">
                                        {/* Name */}
                                        <h3 className="text-lg font-semibold text-gray-100 mb-1 truncate">
                                            {member.name}
                                        </h3>

                                        {/* Email */}
                                        <div className="flex items-center text-sm text-gray-400 mb-3">
                                            <span className="truncate">{member.email}</span>
                                        </div>

                                        {/* WhatsApp Button */}
                                        {member.phoneNumber ? (
                                            <button
                                                onClick={() => handleWhatsAppClick(member.phoneNumber || '')}
                                                className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                                            >
                                                <WhatsappIcon className="h-5 w-5" />
                                                <span>Chat on WhatsApp</span>
                                            </button>
                                        ) : (
                                            <div className="w-full text-center text-sm text-gray-500 py-2">
                                                No phone number available
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

