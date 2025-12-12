
import React, { useState, useEffect, useRef } from 'react';
import type { User, Role } from '../types';
import { Header } from './Header';
import { KeyIcon, PencilIcon, TrashIcon } from './Icons';

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


// --- Main Credentials Component ---

interface CredentialsProps {
    users: User[];
    onAddUser: (user: Omit<User, 'id' | 'password'>, password: string) => string | null;
    onUpdateUser: (user: User, newPassword?: string) => void;
    onDeleteUser: (userId: string) => void;
    onMenuClick?: () => void;
}

export const Credentials: React.FC<CredentialsProps> = ({ users, onAddUser, onUpdateUser, onDeleteUser, onMenuClick }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

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

    return (
        <div className="min-h-full bg-ahava-background">
            <Header
                breadcrumbs={['Dashboard']}
                title="Manage Credentials"
                titleIcon={<KeyIcon className="h-6 w-6" />}
                actionButton={<AddUserButton />}
                onMenuClick={onMenuClick}
            />
            <div className="p-4 md:p-8">
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