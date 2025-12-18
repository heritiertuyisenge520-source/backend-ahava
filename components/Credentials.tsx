
import React, { useState, useEffect, useRef } from 'react';
import type { User, Role } from '../types';
import { Header } from './Header';
import { KeyIcon, PencilIcon, TrashIcon, CheckCircleIcon, XCircleIcon } from './Icons';

// --- Add/Edit User Modal ---

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (user: Omit<User, 'id' | 'password'>, password: string) => string | null;
  onUpdate: (user: User, newPassword?: string) => void;
  userToEdit: User | null;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onSubmit, onUpdate, userToEdit }) => {
  const [formData, setFormData] = useState({ name: '', email: '', role: 'Singer' as Role });
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
        setError('');
        if (userToEdit) {
            setFormData({ name: userToEdit.name, email: userToEdit.email, role: userToEdit.role });
            setPassword('');
        } else {
            setFormData({ name: '', email: '', role: 'Singer' });
            setPassword('');
        }
    }
  }, [isOpen, userToEdit]);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
        setError('Name and email are required.');
        return;
    }
    if (!userToEdit && !password) {
        setError('Password is required for new users.');
        return;
    }
    setError('');

    if (userToEdit) {
        const updatedUser = { ...userToEdit, ...formData };
        onUpdate(updatedUser, password || undefined);
        onClose();
    } else {
        // FIX: Add missing 'username' property to satisfy the User type.
        // It's derived from the name, similar to other parts of the application.
        const nameParts = formData.name.trim().split(/\s+/);
        const username = nameParts.pop() || nameParts[0] || '';

        const partialUser: Omit<User, 'id' | 'password'> = {
            ...formData,
            username,
            // Provide default empty values for other required User fields
            dateOfBirth: '', placeOfBirth: '', placeOfResidence: '', 
            yearOfStudy: '', university: '', gender: '', maritalStatus: '', 
            homeParishName: '', homeParishLocation: { cell: '', sector: '', district: '' }, 
            schoolResidence: '',
        };
        const resultError = onSubmit(partialUser, password);
        if (resultError) {
            setError(resultError);
        } else {
            onClose();
        }
    }
  };

  const modalTitle = userToEdit ? 'Edit User' : 'Add New User';
  const submitButtonText = userToEdit ? 'Save Changes' : 'Create User';
  const roles: Role[] = ['Singer', 'Song Conductor', 'Advisor', 'President'];

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
        onClick={handleClickOutside}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-user-modal-title"
    >
        <div ref={modalRef} className="bg-ahava-surface rounded-lg shadow-xl p-8 w-full max-w-lg border border-ahava-purple-medium">
            <div className="flex justify-between items-start mb-4">
                <h2 id="add-user-modal-title" className="text-xl font-bold text-gray-100">{modalTitle}</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl font-bold leading-none" aria-label="Close modal">&times;</button>
            </div>
            {error && <p className="bg-red-500/20 text-red-300 p-3 rounded-md mb-4 text-sm">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300">Full Name</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-ahava-purple-dark border border-ahava-purple-medium rounded-md shadow-sm text-gray-200 focus:outline-none focus:ring-ahava-magenta focus:border-ahava-magenta" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
                        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-ahava-purple-dark border border-ahava-purple-medium rounded-md shadow-sm text-gray-200 focus:outline-none focus:ring-ahava-magenta focus:border-ahava-magenta" />
                    </div>
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-300">Role</label>
                        <select id="role" name="role" value={formData.role} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-ahava-purple-dark border border-ahava-purple-medium rounded-md shadow-sm text-gray-200 focus:outline-none focus:ring-ahava-magenta focus:border-ahava-magenta">
                           {roles.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
                        <input type="password" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={userToEdit ? 'Leave blank to keep unchanged' : ''} className="mt-1 block w-full px-3 py-2 bg-ahava-purple-dark border border-ahava-purple-medium rounded-md shadow-sm text-gray-200 focus:outline-none focus:ring-ahava-magenta focus:border-ahava-magenta" />
                    </div>
                </div>
                <div className="mt-8 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="bg-ahava-purple-medium text-gray-200 font-semibold py-2 px-4 rounded-lg hover:bg-ahava-purple-light transition-colors">Cancel</button>
                    <button type="submit" className="bg-ahava-purple-dark text-white font-semibold py-2 px-4 rounded-lg hover:bg-ahava-purple-medium transition-colors">{submitButtonText}</button>
                </div>
            </form>
        </div>
    </div>
  );
};


// --- User List Item ---

interface UserListItemProps {
    user: User;
    onEdit: (user: User) => void;
    onDelete: (id: string) => void;
}

const UserListItem: React.FC<UserListItemProps> = ({ user, onEdit, onDelete }) => {
    return (
        <div className="bg-ahava-background p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-ahava-purple-dark/30 transition-colors gap-3 sm:gap-2">
            <div className="flex-1 w-full sm:w-auto">
                <p className="font-semibold text-gray-100">{user.name}</p>
                <p className="text-sm text-gray-400">{user.email}</p>
            </div>
            <div className="flex items-center justify-between sm:justify-end space-x-4 w-full sm:w-auto">
                <span className="text-sm font-medium text-ahava-purple-light bg-ahava-purple-dark/50 px-3 py-1 rounded-full">{user.role}</span>
                <div className="flex items-center space-x-1 flex-shrink-0">
                    <button onClick={() => onEdit(user)} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-ahava-purple-medium transition-colors" aria-label="Edit user">
                        <PencilIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => onDelete(user.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-500/10 transition-colors" aria-label="Delete user">
                        <TrashIcon />
                    </button>
                </div>
            </div>
        </div>
    );
};


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
                            <option value="Advisor">Advisor</option>
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

// --- Main Credentials Component ---

interface CredentialsProps {
    users: User[];
    onAddUser: (user: Omit<User, 'id' | 'password'>, password: string) => string | null;
    onUpdateUser: (user: User, newPassword?: string) => void;
    onDeleteUser: (userId: string) => void;
    onMenuClick?: () => void;
}

export const Credentials: React.FC<CredentialsProps> = ({ users, onAddUser, onUpdateUser, onDeleteUser, onMenuClick }) => {
    const [activeTab, setActiveTab] = useState<'manage' | 'approve'>('manage');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [pendingUsers, setPendingUsers] = useState<User[]>([]);
    const [isLoadingPending, setIsLoadingPending] = useState(false);

    // Fetch pending users when approve tab is selected
    useEffect(() => {
        if (activeTab === 'approve') {
            fetchPendingUsers();
        }
    }, [activeTab]);

    const fetchPendingUsers = async () => {
        setIsLoadingPending(true);
        try {
            const token = localStorage.getItem('token');
            console.log('Frontend: Fetching pending users with token:', token ? 'present' : 'missing');
            const response = await fetch('http://localhost:5007/api/users/pending', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            console.log('Frontend: Response status:', response.status);
            if (response.ok) {
                const data = await response.json();
                console.log('Frontend: Received pending users data:', data);
                console.log('Frontend: Number of pending users:', data.length);
                setPendingUsers(data);
            } else {
                console.error('Frontend: Failed to fetch pending users, status:', response.status);
                const errorText = await response.text();
                console.error('Frontend: Error response:', errorText);
            }
        } catch (error) {
            console.error('Frontend: Error fetching pending users:', error);
        } finally {
            setIsLoadingPending(false);
        }
    };

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
                // Refresh pending users list
                fetchPendingUsers();
                alert('User approved successfully!');
            } else {
                alert('Failed to approve user');
            }
        } catch (error) {
            console.error('Error approving user:', error);
            alert('Error approving user');
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
                // Refresh pending users list
                fetchPendingUsers();
                alert('User rejected successfully!');
            } else {
                alert('Failed to reject user');
            }
        } catch (error) {
            console.error('Error rejecting user:', error);
            alert('Error rejecting user');
        }
    };

    const handleOpenAddModal = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleDelete = (userId: string) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            onDeleteUser(userId);
        }
    };

    const AddUserButton = () => (
        <button
            onClick={handleOpenAddModal}
            className="bg-ahava-purple-dark text-white font-semibold py-2 px-4 rounded-lg hover:bg-ahava-purple-medium transition-colors flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Add User
        </button>
    );

    const tabs = [
        { id: 'manage' as const, label: 'Manage Users', count: users.length },
        { id: 'approve' as const, label: 'Approve Members', count: pendingUsers.length },
    ];

    return (
        <div className="min-h-full bg-ahava-background">
            <Header
                breadcrumbs={['Dashboard']}
                title="Manage Credentials"
                titleIcon={<KeyIcon className="h-6 w-6" />}
                actionButton={activeTab === 'manage' ? <AddUserButton /> : undefined}
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
                             <h3 className="text-lg font-semibold text-gray-200">All Users ({users.length})</h3>
                        </div>
                        <div className="divide-y divide-ahava-purple-medium">
                            {users.sort((a,b) => a.name.localeCompare(b.name)).map(user => (
                                <UserListItem
                                    key={user.id}
                                    user={user}
                                    onEdit={handleOpenEditModal}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'approve' && (
                    <div className="space-y-6">
                        {isLoadingPending ? (
                            <div className="bg-ahava-surface rounded-lg shadow-md border border-ahava-purple-dark p-8 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ahava-purple-light mx-auto mb-4"></div>
                                <p className="text-gray-400">Loading pending users...</p>
                            </div>
                        ) : pendingUsers.length === 0 ? (
                            <div className="bg-ahava-surface rounded-lg shadow-md border border-ahava-purple-dark p-8 text-center">
                                <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-200 mb-2">No Pending Users</h3>
                                <p className="text-gray-400">All user registrations have been processed.</p>
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

            <AddUserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={onAddUser}
                onUpdate={onUpdateUser}
                userToEdit={editingUser}
            />
        </div>
    );
};
