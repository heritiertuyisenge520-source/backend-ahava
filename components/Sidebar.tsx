
import React, { useState } from 'react';
import { View, User } from '../types';
import { ProfileIcon, DashboardIcon, SingersIcon, SongsIcon, EventsIcon, ChartBarIcon, LogoutIcon, KeyIcon, CardIcon, BuildingIcon } from './Icons';

interface SidebarProps {
    activeView: View;
    setActiveView: (view: View) => void;
    user: User;
    onLogout: () => void;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
}

interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}

// Enhanced NavItem with animations and better styling
const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    return (
        <li className="mb-1">
            <button
                onClick={onClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`group w-full flex items-center py-3 px-6 text-sm font-medium transition-all duration-300 relative overflow-hidden ${
                    isActive 
                        ? 'text-white bg-gradient-to-r from-ahava-purple-medium/50 to-ahava-purple-dark/30' 
                        : 'text-gray-400 hover:text-white'
                }`}
            >
                {/* Animated active indicator */}
                {isActive && (
                    <>
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-ahava-magenta to-purple-500 rounded-r-full animate-pulse"></div>
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-ahava-magenta rounded-r-full opacity-50"></div>
                        {/* Glow effect */}
                        <div className="absolute left-0 top-0 bottom-0 w-2 bg-ahava-magenta opacity-20 blur-sm"></div>
                    </>
                )}
                
                {/* Hover background effect */}
                {!isActive && isHovered && (
                    <div className="absolute inset-0 bg-gradient-to-r from-ahava-purple-medium/20 to-transparent transition-opacity duration-300"></div>
                )}
                
                {/* Icon with animation */}
                <div className={`mr-4 transition-all duration-300 relative z-10 ${
                    isActive 
                        ? 'text-ahava-magenta scale-110' 
                        : isHovered 
                            ? 'text-white scale-110 rotate-6' 
                            : 'group-hover:scale-105'
                }`}>
                    {icon}
                </div>
                
                {/* Label with slide animation */}
                <span className={`relative z-10 transition-all duration-300 ${
                    isActive ? 'font-bold' : 'font-medium'
                } ${isHovered && !isActive ? 'translate-x-1' : ''}`}>
                    {label}
                </span>
                
                {/* Arrow indicator for hover */}
                {isHovered && !isActive && (
                    <div className="absolute right-4 text-ahava-magenta opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 group-hover:translate-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                )}
            </button>
        </li>
    );
};

export const Sidebar = ({ activeView, setActiveView, user, onLogout, isSidebarOpen, setIsSidebarOpen }: SidebarProps) => {
    // Define navigation items in the desired order
    const navItems = [
        // Dashboard - accessible to all
        { id: View.DASHBOARD, label: 'DASHBOARD', icon: <DashboardIcon />, roles: ['all'] },

        // Attendance - for all members (view performance), management for President/Advisor only
        { id: View.ATTENDANCE_PERFORMANCE, label: 'ATTENDANCE', icon: <ChartBarIcon />, roles: ['all'] },


        // Songs Library - for all members (view songs), management for Song Conductor only
        { id: View.SONGS, label: 'SONGS LIBRARY', icon: <SongsIcon />, roles: ['all'] },

        // Profile - accessible to all
        { id: View.PROFILE, label: 'PROFILE', icon: <ProfileIcon />, roles: ['all'] },

        // Members - accessible to all
        { id: View.MEMBERS, label: 'MEMBERS', icon: <SingersIcon />, roles: ['all'] },

        // Permissions - for President, Secretary, Advisor
        { id: View.PERMISSIONS, label: 'PERMISSION', icon: <CardIcon />, roles: ['President', 'Secretary', 'Advisor'] },

        // Finance - for Secretary only
        { id: View.FINANCE, label: 'FINANCE', icon: <BuildingIcon />, roles: ['Secretary'] },

        // Credentials - for President and Advisor only (administrative access)
        { id: View.CREDENTIALS, label: 'CREDENTIALS', icon: <KeyIcon />, roles: ['President', 'Advisor'] },
    ];

    // Filter items based on user role
    const filteredNavItems = navItems.filter(item =>
        item.roles.includes('all') || item.roles.includes(user.role)
    );

    const getInitials = (name: string) => {
        const names = name.trim().split(/\s+/);
        if (names.length === 0) return '';
        const firstInitial = names[0]?.[0] || '';
        const lastInitial = names.length > 1 ? names[names.length - 1]?.[0] || '' : '';
        return `${firstInitial}${lastInitial}`.toUpperCase();
    }

    const getAbbreviatedName = (name: string) => {
        const names = name.trim().split(/\s+/);
        if (names.length === 0) return '';
        if (names.length === 1) return names[0];

        const firstName = names[0];
        const lastName = names[names.length - 1];
        return `${firstName.charAt(0)}. ${lastName}`;
    }

    const [isLogoutHovered, setIsLogoutHovered] = useState(false);

    return (
        <aside className={`w-64 bg-gradient-to-b from-ahava-purple-dark via-ahava-purple-dark to-ahava-purple-dark/95 text-white flex flex-col fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 shadow-2xl ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            {/* Header with enhanced styling */}
            <div className="h-20 flex items-center justify-between px-6 border-b border-ahava-purple-medium/50 bg-gradient-to-r from-ahava-purple-medium/30 to-transparent relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-ahava-magenta opacity-5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500 opacity-5 rounded-full -ml-12 -mb-12 blur-xl"></div>
                
                <div className="relative z-10 flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-ahava-magenta to-purple-500 rounded-lg flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform duration-300">
                        <span className="text-white font-bold text-lg">A</span>
                    </div>
                    <h1 className="text-xl font-bold tracking-wider bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                        AHAVA CHOIR
                    </h1>
                </div>
                <button 
                    onClick={() => setIsSidebarOpen(false)} 
                    className="md:hidden text-gray-400 hover:text-white hover:bg-ahava-purple-medium rounded-lg p-2 transition-all duration-200 relative z-10" 
                    aria-label="Close sidebar"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            
            {/* Enhanced User Profile Section */}
            <div className="flex items-center p-5 border-b border-ahava-purple-medium/50 bg-gradient-to-r from-ahava-purple-medium/20 to-transparent relative overflow-hidden group">
                {/* Animated background on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-ahava-magenta/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10 flex items-center w-full">
                    {user.profilePictureUrl ? (
                        <div className="relative">
                            <img 
                                src={user.profilePictureUrl} 
                                alt={user.name} 
                                className="w-14 h-14 rounded-xl mr-4 object-cover border-2 border-ahava-purple-light shadow-lg group-hover:scale-110 transition-transform duration-300" 
                            />
                            <div className="absolute bottom-0 right-4 w-4 h-4 bg-green-500 rounded-full border-2 border-ahava-purple-dark"></div>
                        </div>
                    ) : (
                        <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center rounded-xl mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300 relative overflow-hidden">
                            <span className="text-2xl font-bold text-white relative z-10">{getInitials(user.name)}</span>
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <h2 className="font-semibold text-white truncate">{getAbbreviatedName(user.name)}</h2>
                        <p className="text-xs text-gray-400 truncate">{user.role}</p>
                    </div>
                </div>
            </div>
            
            {/* Navigation with enhanced styling */}
            <nav className="flex-1 mt-2 overflow-y-auto custom-scrollbar" onClick={() => setIsSidebarOpen(false)}>
                <ul className="px-2 py-4">
                    {filteredNavItems.map((item, index) => (
                        <div 
                            key={item.id}
                            className="animate-fadeInUp"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <NavItem
                                icon={item.icon}
                                label={item.label}
                                isActive={activeView === item.id}
                                onClick={() => setActiveView(item.id)}
                            />
                        </div>
                    ))}
                </ul>
            </nav>
            
            {/* Enhanced Logout Button */}
            <div className="p-4 border-t border-ahava-purple-medium/50 bg-gradient-to-t from-ahava-purple-dark to-transparent">
                <button
                    onClick={onLogout}
                    onMouseEnter={() => setIsLogoutHovered(true)}
                    onMouseLeave={() => setIsLogoutHovered(false)}
                    className="w-full flex items-center justify-center py-3 px-6 text-sm font-medium transition-all duration-300 relative overflow-hidden group rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200"
                    aria-label="Logout"
                >
                    {/* Animated background */}
                    <div className={`absolute inset-0 bg-gradient-to-r from-red-500/20 to-transparent transition-opacity duration-300 ${
                        isLogoutHovered ? 'opacity-100' : 'opacity-0'
                    }`}></div>
                    
                    <div className={`mr-3 transition-transform duration-300 ${isLogoutHovered ? 'rotate-12 scale-110' : ''}`}>
                        <LogoutIcon />
                    </div>
                    <span className="relative z-10 font-semibold">Logout</span>
                    
                    {/* Hover arrow */}
                    {isLogoutHovered && (
                        <div className="absolute right-4 text-red-300 animate-pulse">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    )}
                </button>
            </div>
            
            {/* Decorative bottom gradient */}
            <div className="h-1 bg-gradient-to-r from-ahava-magenta via-purple-500 to-ahava-magenta opacity-50"></div>
        </aside>
    );
};
