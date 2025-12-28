
import React from 'react';
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

// FIX: Explicitly type component with React.FC to correctly handle the 'key' prop.
const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick }) => (
    <li>
        <button
            onClick={onClick}
            className={`w-full flex items-center py-2.5 px-6 text-sm font-medium transition-colors duration-200 relative ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'}`}
        >
            {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-ahava-magenta rounded-r-full"></div>}
            <div className="mr-4">{icon}</div>
            {label}
        </button>
    </li>
);

export const Sidebar = ({ activeView, setActiveView, user, onLogout, isSidebarOpen, setIsSidebarOpen }: SidebarProps) => {
    // Define navigation items in the desired order
    const navItems = [
        // Dashboard - accessible to all
        { id: View.DASHBOARD, label: 'DASHBOARD', icon: <DashboardIcon />, roles: ['all'] },

        // Attendance - for all members (view performance), management for President/Advisor only
        { id: View.ATTENDANCE_PERFORMANCE, label: 'ATTENDANCE', icon: <ChartBarIcon />, roles: ['all'] },

        // Members (Singers) - for all except Accountant
        { id: View.SINGERS, label: 'MEMBERS', icon: <SingersIcon />, roles: ['President', 'Secretary', 'Advisor', 'Singer', 'Song Conductor'] },

        // Songs Library - for all members (view songs), management for Song Conductor only
        { id: View.SONGS, label: 'SONGS LIBRARY', icon: <SongsIcon />, roles: ['all'] },

        // Profile - accessible to all
        { id: View.PROFILE, label: 'PROFILE', icon: <ProfileIcon />, roles: ['all'] },

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

    return (
        <aside className={`w-64 bg-ahava-purple-dark text-white flex flex-col fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="h-16 flex items-center justify-between px-4 border-b border-ahava-purple-medium">
                <h1 className="text-xl font-bold tracking-wider ml-4">AHAVA CHOIR</h1>
                <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white" aria-label="Close sidebar">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            <div className="flex items-center p-4 border-b border-ahava-purple-medium">
                {user.profilePictureUrl ? (
                    <img src={user.profilePictureUrl} alt={user.name} className="w-12 h-12 rounded-md mr-4 object-cover" />
                ) : (
                    <div className="w-12 h-12 bg-orange-200 flex items-center justify-center rounded-md mr-4">
                        <span className="text-2xl font-bold text-orange-600">{getInitials(user.name)}</span>
                    </div>
                )}
                <div>
                    <h2 className="font-semibold">{getAbbreviatedName(user.name)}</h2>
                </div>
            </div>
            <nav className="flex-1 mt-4" onClick={() => setIsSidebarOpen(false)}>
                <ul>
                    {filteredNavItems.map(item => (
                        <NavItem
                            key={item.id}
                            icon={item.icon}
                            label={item.label}
                            isActive={activeView === item.id}
                            onClick={() => setActiveView(item.id)}
                        />
                    ))}
                </ul>
            </nav>
            <div className="p-2 border-t border-ahava-purple-medium">
                 <button
                    onClick={onLogout}
                    className="w-full flex items-center py-2.5 px-6 text-sm font-medium transition-colors duration-200 relative text-gray-400 hover:text-white"
                    aria-label="Logout"
                >
                    <div className="mr-4"><LogoutIcon /></div>
                    Logout
                </button>
            </div>
        </aside>
    );
};
