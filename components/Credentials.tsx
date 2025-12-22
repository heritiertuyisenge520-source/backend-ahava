import React, { useState } from 'react';
import type { User, Role } from '../types';
import { Header } from './Header';
import { KeyIcon, PencilIcon, CheckCircleIcon, XCircleIcon } from './Icons';

// --- Pending User Approval Card ---
interface PendingUserCardProps {
    user: User;
    onApprove: (userId: string, role: Role) => void;
    onReject: (userId: string) => void;
}

const PendingUserCard: React.FC<PendingUserCardProps> = ({ user, onApprove, onReject }) => {
    const [selectedRole, setSelectedRole] = useState<Role>('Singer');

    const getInitials = (name: string) => {
        const names = name.split(' ');
        if (names.length === 0) return '';
        const firstInitial = names[0]?.[0] || '';
        const lastInitial = names.length > 1 ? names[names.length - 1]?.[0] || '' : '';
        return `${firstInitial}${lastInitial}`.toUpperCase();
    };

    return (
        <div className="bg-ahava-surface rounded-lg shadow-md p-6 border border-ahava-purple-dark">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                    {user.profilePictureUrl ? (
                        <img src={user.profilePictureUrl} alt={user.name} className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-ahava-purple-light" />
                    ) : (
                        <div className="w-16 h-16 bg-orange-200 flex items-center justify-center rounded-full mr-4 border-2 border-ahava-purple-light">
                            <span className="text-2xl font-bold text-orange-600">{getInitials(user.name)}</span>
                        </div>
                    )}
                    <div>
                        <h3 className="text-xl font-bold text-gray-100">{user.name}</h3>
                        <p className="text-gray-400">{user.username}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                </div>
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 text-sm font-medium rounded-full">
                    Pending Approval
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Personal Information</h4>
                    <div className="space-y-1 text-sm">
                        <p><span className="text-gray-400">Phone:</span> {user.phoneNumber || 'Not provided'}</p>
                        <p><span className="text-gray-400">Date of Birth:</span> {user.dateOfBirth || 'Not provided'}</p>
                        <p><span className="text-gray-400">Place of Birth:</span> {user.placeOfBirth || 'Not provided'}</p>
                        <p><span className="text-gray-400">Gender:</span> {user.gender || 'Not provided'}</p>
                        <p><span className="text-gray-400">Marital Status:</span> {user.maritalStatus || 'Not provided'}</p>
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Academic Information</h4>
                    <div className="space-y-1 text-sm">
                        <p><span className="text-gray-400">University:</span> {user.university || 'Not provided'}</p>
                        <p><span className="text-gray-400">Year of Study:</span> {user.yearOfStudy || 'Not provided'}</p>
                        <p><span className="text-gray-400">School Residence:</span> {user.schoolResidence || 'Not provided'}</p>
                    </div>
                </div>

                <div className="md:col-span-2">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Location Information</h4>
                    <div className="space-y-1 text-sm">
                        <p><span className="text-gray-400">Home Residence:</span> {user.placeOfResidence || 'Not provided'}</p>
                        <p><span className="text-gray-400">Home Parish:</span> {user.homeParishName || 'Not provided'}</p>
                        <p><span className="text-gray-400">Parish Location:</span>
                            {user.homeParishLocation?.cell || user.homeParishLocation?.sector || user.homeParishLocation?.district
                                ? `${user.homeParishLocation.cell}, ${user.homeParishLocation.sector}, ${user.homeParishLocation.district}`.replace(/^, |, $/, '')
                                : 'Not provided'
                            }
                        </p>
                    </div>
                </div>
            </div>

            <div className="border-t border-ahava-purple-medium pt-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium text-gray-300">Assign Role:</label>
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value as Role)}
                            className="px-3 py-1 bg-ahava-purple-dark border border-ahava-purple-medium rounded-md text-gray-200 focus:outline-none focus:ring-ahava-magenta focus:border-ahava-magenta text-sm"
                        >
                            <option value="Singer">Singer</option>
                            <option value="Secretary">Secretary</option>
                            <option value="Song Conductor">Song Conductor</option>
                            <option value="Accountant">Accountant</option>
                            <option value="Advisor">Advisor</option>
                            <option value="President">President</option>
                        </select>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => onReject(user.id)}
                            className="flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                        >
                            <XCircleIcon className="w-4 h-4 mr-2" />
                            Reject
                        </button>
                        <button
                            onClick={() => onApprove(user.id, selectedRole)}
                            className="flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <CheckCircleIcon className="w-4 h-4 mr-2" />
                            Confirm User
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- User List Item (for approved users) ---
interface UserListItemProps {
    user: User;
    onRoleChange: (userId: string, newRole: Role) => void;
}

const UserListItem: React.FC<UserListItemProps> = ({ user, onRoleChange }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role>(user.role);

    const handleRoleUpdate = () => {
        if (selectedRole !== user.role) {
            onRoleChange(user.id, selectedRole);
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setSelectedRole(user.role);
        setIsEditing(false);
    };

    return (
        <div className="bg-ahava-background p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-ahava-purple-dark/30 transition-colors gap-3 sm:gap-2">
            <div className="flex-1 w-full sm:w-auto">
                <p className="font-semibold text-gray-100">{user.name}</p>
                <p className="text-sm text-gray-400">{user.email}</p>
            </div>
            <div className="flex items-center justify-between sm:justify-end space-x-4 w-full sm:w-auto">
                {isEditing ? (
                    <div className="flex items-center space-x-2">
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value as Role)}
                            className="px-2 py-1 bg-ahava-purple-dark border border-ahava-purple-medium rounded-md text-gray-200 text-sm focus:outline-none focus:ring-ahava-magenta focus:border-ahava-magenta"
                        >
                            <option value="Singer">Singer</option>
                            <option value="Secretary">Secretary</option>
                            <option value="Song Conductor">Song Conductor</option>
                            <option value="Accountant">Accountant</option>
                            <option value="Advisor">Advisor</option>
                            <option value="President">President</option>
                        </select>
                        <button
                            onClick={handleRoleUpdate}
                            className="text-green-400 hover:text-green-300 text-sm font-medium"
                        >
                            Save
                        </button>
                        <button
                            onClick={handleCancel}
                            className="text-gray-400 hover:text-gray-300 text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <>
                        <span className="text-sm font-medium text-ahava-purple-light bg-ahava-purple-dark/50 px-3 py-1 rounded-full">{user.role}</span>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="text-gray-400 hover:text-ahava-purple-light text-sm"
                        >
                            <PencilIcon className="w-4 h-4" />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

// --- Main Credentials Component ---
interface CredentialsProps {
    users: User[];          // Approved users
    pendingUsers: User[];    // Pending users from backend
    onMenuClick?: () => void;
    onUserApproved?: (approvedUser: User) => void;
    onUserRejected?: (userId: string) => void;
}

export const Credentials: React.FC<CredentialsProps> = ({ users, pendingUsers, onMenuClick, onUserApproved, onUserRejected }) => {
    const [activeTab, setActiveTab] = useState<'manage' | 'approve'>('approve');

    const handleApproveUser = async (userId: string, role: Role) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5007/api/users/${userId}/approve`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ role }),
            });

            if (response.ok) {
                const result = await response.json();
                const approvedUser = result.user;

                // Map the approved user to match our User interface
                const mappedUser: User = {
                    id: approvedUser._id,
                    username: approvedUser.username,
                    name: approvedUser.name,
                    email: approvedUser.email,
                    role: approvedUser.role,
                    phoneNumber: approvedUser.phoneNumber || '',
                    profilePictureUrl: approvedUser.profilePictureUrl || undefined,
                    dateOfBirth: approvedUser.dateOfBirth || '',
                    placeOfBirth: approvedUser.placeOfBirth || '',
                    placeOfResidence: approvedUser.placeOfResidence || '',
                    yearOfStudy: approvedUser.yearOfStudy || '',
                    university: approvedUser.university || '',
                    gender: approvedUser.gender || '',
                    maritalStatus: approvedUser.maritalStatus || '',
                    homeParishName: approvedUser.homeParishName || '',
                    homeParishLocation: approvedUser.homeParishLocation || { cell: '', sector: '', district: '' },
                    schoolResidence: approvedUser.schoolResidence || '',
                };

                const userName = approvedUser.name;
                alert(`${userName} is approved as ${role} in Ahava Choir!`);

                // Notify parent component to update state
                if (onUserApproved) {
                    onUserApproved(mappedUser);
                }
            } else {
                const error = await response.json();
                alert('Failed to approve user: ' + (error.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error approving user:', error);
            alert('Network error while approving user');
        }
    };

    const handleRejectUser = async (userId: string) => {
        if (!window.confirm('Are you sure you want to reject this user?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5007/api/users/${userId}/reject`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                alert('User rejected successfully!');

                // Notify parent component to update state
                if (onUserRejected) {
                    onUserRejected(userId);
                }
            } else {
                alert('Failed to reject user');
            }
        } catch (error) {
            console.error('Error rejecting user:', error);
            alert('Network error while rejecting user');
        }
    };

    const handleRoleChange = async (userId: string, newRole: Role) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5007/api/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ role: newRole }),
            });

            if (response.ok) {
                alert(`User role updated to ${newRole} successfully!`);
                // Refresh the page to show updated role
                window.location.reload();
            } else {
                const error = await response.json();
                alert('Failed to update user role: ' + (error.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error updating user role:', error);
            alert('Network error while updating user role');
        }
    };

    const tabs = [
        { id: 'manage' as const, label: 'Approved Users', count: users.length },
        { id: 'approve' as const, label: 'Pending Approval', count: pendingUsers.length },
    ];

    return (
        <div className="min-h-full bg-ahava-background">
            <Header
                breadcrumbs={['Dashboard']}
                title="Manage Credentials"
                titleIcon={<KeyIcon className="h-6 w-6" />}
                onMenuClick={onMenuClick}
            />
            <div className="p-4 md:p-8">
                {/* Tab Navigation */}
                <div className="mb-6">
                    <div className="flex space-x-1 bg-ahava-purple-dark/30 p-1 rounded-lg">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                                    activeTab === tab.id
                                        ? 'bg-ahava-purple-dark text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-ahava-purple-dark/50'
                                }`}
                            >
                                {tab.label} ({tab.count})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'manage' && (
                    <div className="bg-ahava-surface rounded-lg shadow-md border border-ahava-purple-dark">
                        <div className="p-4 border-b border-ahava-purple-medium">
                            <h3 className="text-lg font-semibold text-gray-200">Approved Users ({users.length})</h3>
                        </div>
                        <div className="divide-y divide-ahava-purple-medium">
                            {users.length === 0 ? (
                                <div className="p-8 text-center text-gray-400">
                                    No approved users yet.
                                </div>
                            ) : (
                                users
                                    .sort((a, b) => a.name.localeCompare(b.name))
                                    .map(user => (
                                        <UserListItem
                                            key={user.id}
                                            user={user}
                                            onRoleChange={handleRoleChange}
                                        />
                                    ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'approve' && (
                    <div className="space-y-6">
                        {pendingUsers.length === 0 ? (
                            <div className="bg-ahava-surface rounded-lg shadow-md border border-ahava-purple-dark p-8 text-center">
                                <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-200 mb-2">No Pending Users</h3>
                                <p className="text-gray-400">All registrations have been processed.</p>
                            </div>
                        ) : (
                            pendingUsers.map(user => (
                                <PendingUserCard
                                    key={user.id}
                                    user={user}
                                    onApprove={handleApproveUser}
                                    onReject={handleRejectUser}
                                />
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
