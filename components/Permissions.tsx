import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { CardIcon, CheckCircleIcon, XCircleIcon } from './Icons';
import { User } from '../types';

interface Permission {
    _id: string;
    userId: User;
    userName: string;
    startDate: string;
    endDate: string;
    reason: string;
    details: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

interface PermissionsProps {
    user: User;
    onMenuClick?: () => void;
}

export const Permissions = ({ user, onMenuClick }: PermissionsProps) => {
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchPermissions();
    }, []);

    const fetchPermissions = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch('http://localhost:5007/api/permissions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setPermissions(data);
            }
        } catch (error) {
            console.error('Error fetching permissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePermissionAction = async (permissionId: string, action: 'approved' | 'rejected') => {
        setActionLoading(permissionId);
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`http://localhost:5007/api/permissions/${permissionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: action })
            });

            if (response.ok) {
                // Update local state
                setPermissions(prev => prev.map(p =>
                    p._id === permissionId ? { ...p, status: action } : p
                ));
                alert(`Permission ${action} successfully!`);
            } else {
                alert('Failed to update permission status');
            }
        } catch (error) {
            console.error('Error updating permission:', error);
            alert('Failed to update permission status');
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-900/20 text-green-400 border-green-700';
            case 'rejected': return 'bg-red-900/20 text-red-400 border-red-700';
            default: return 'bg-yellow-900/20 text-yellow-400 border-yellow-700';
        }
    };

    const pendingPermissions = permissions.filter(p => p.status === 'pending');
    const approvedPermissions = permissions.filter(p => p.status === 'approved');
    const rejectedPermissions = permissions.filter(p => p.status === 'rejected');

    if (loading) {
        return (
            <div className="bg-ahava-background min-h-full">
                <Header
                    breadcrumbs={['Dashboard']}
                    title="Permission Requests"
                    titleIcon={<CardIcon className="h-6 w-6" />}
                    onMenuClick={onMenuClick}
                />
                <div className="p-8 flex justify-center">
                    <div className="text-gray-400">Loading permissions...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-ahava-background min-h-full">
            <Header
                breadcrumbs={['Dashboard']}
                title="Permission Requests"
                titleIcon={<CardIcon className="h-6 w-6" />}
                onMenuClick={onMenuClick}
            />
            <div className="p-4 md:p-8 space-y-8">
                {/* Pending Permissions */}
                <div className="bg-ahava-surface p-6 rounded-lg shadow-md border border-ahava-purple-dark">
                    <h3 className="text-xl font-bold text-gray-100 mb-4 flex items-center">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                        Pending Requests ({pendingPermissions.length})
                    </h3>
                    {pendingPermissions.length === 0 ? (
                        <p className="text-gray-400">No pending permission requests.</p>
                    ) : (
                        <div className="space-y-4">
                            {pendingPermissions.map(permission => (
                                <div key={permission._id} className="bg-ahava-background p-4 rounded-lg border border-ahava-purple-medium">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="font-semibold text-gray-100">{permission.userName}</h4>
                                            <p className="text-sm text-gray-400">
                                                {new Date(permission.startDate).toLocaleDateString()} - {new Date(permission.endDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(permission.status)}`}>
                                            {permission.status.charAt(0).toUpperCase() + permission.status.slice(1)}
                                        </span>
                                    </div>
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-300 mb-2"><strong>Reason:</strong> {permission.reason}</p>
                                        {permission.details && (
                                            <p className="text-sm text-gray-300"><strong>Details:</strong> {permission.details}</p>
                                        )}
                                    </div>
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() => handlePermissionAction(permission._id, 'approved')}
                                            disabled={actionLoading === permission._id}
                                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
                                        >
                                            <CheckCircleIcon className="w-4 h-4 mr-2" />
                                            {actionLoading === permission._id ? 'Approving...' : 'Approve'}
                                        </button>
                                        <button
                                            onClick={() => handlePermissionAction(permission._id, 'rejected')}
                                            disabled={actionLoading === permission._id}
                                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
                                        >
                                            <XCircleIcon className="w-4 h-4 mr-2" />
                                            {actionLoading === permission._id ? 'Rejecting...' : 'Reject'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Approved Permissions */}
                <div className="bg-ahava-surface p-6 rounded-lg shadow-md border border-ahava-purple-dark">
                    <h3 className="text-xl font-bold text-gray-100 mb-4 flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                        Approved Permissions ({approvedPermissions.length})
                    </h3>
                    {approvedPermissions.length === 0 ? (
                        <p className="text-gray-400">No approved permissions.</p>
                    ) : (
                        <div className="space-y-4">
                            {approvedPermissions.map(permission => (
                                <div key={permission._id} className="bg-ahava-background p-4 rounded-lg border border-ahava-purple-medium">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="font-semibold text-gray-100">{permission.userName}</h4>
                                            <p className="text-sm text-gray-400">
                                                {new Date(permission.startDate).toLocaleDateString()} - {new Date(permission.endDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(permission.status)}`}>
                                            {permission.status.charAt(0).toUpperCase() + permission.status.slice(1)}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-300 mb-2"><strong>Reason:</strong> {permission.reason}</p>
                                        {permission.details && (
                                            <p className="text-sm text-gray-300"><strong>Details:</strong> {permission.details}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Rejected Permissions */}
                <div className="bg-ahava-surface p-6 rounded-lg shadow-md border border-ahava-purple-dark">
                    <h3 className="text-xl font-bold text-gray-100 mb-4 flex items-center">
                        <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                        Rejected Permissions ({rejectedPermissions.length})
                    </h3>
                    {rejectedPermissions.length === 0 ? (
                        <p className="text-gray-400">No rejected permissions.</p>
                    ) : (
                        <div className="space-y-4">
                            {rejectedPermissions.map(permission => (
                                <div key={permission._id} className="bg-ahava-background p-4 rounded-lg border border-ahava-purple-medium">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="font-semibold text-gray-100">{permission.userName}</h4>
                                            <p className="text-sm text-gray-400">
                                                {new Date(permission.startDate).toLocaleDateString()} - {new Date(permission.endDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(permission.status)}`}>
                                            {permission.status.charAt(0).toUpperCase() + permission.status.slice(1)}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-300 mb-2"><strong>Reason:</strong> {permission.reason}</p>
                                        {permission.details && (
                                            <p className="text-sm text-gray-300"><strong>Details:</strong> {permission.details}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
