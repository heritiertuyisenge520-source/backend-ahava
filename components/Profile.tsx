


import React, { useState, useRef, useEffect } from 'react';
import type { User } from '../types';
import { Header } from './Header';
import { ProfileIcon, PencilIcon, CameraIcon } from './Icons';

const ProfileField = ({ label, value }: { label: string, value: string | undefined }) => (
    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
        <dt className="text-sm font-medium text-gray-400">{label}</dt>
        <dd className="mt-1 text-sm text-gray-100 sm:col-span-2 sm:mt-0">{value || 'N/A'}</dd>
    </div>
);

const EditableProfileField = ({ label, name, value, onChange, type = 'text', options }: { label: string, name: string, value: string | undefined, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void, type?: string, options?: readonly string[] }) => {
    
    const sharedClasses = "block w-full px-3 py-2 bg-ahava-purple-dark border border-ahava-purple-medium rounded-md shadow-sm text-gray-200 focus:outline-none focus:ring-ahava-magenta focus:border-ahava-magenta";
    
    return (
        <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 items-center">
            <dt className="text-sm font-medium text-gray-400">{label}</dt>
            <dd className="mt-1 text-sm text-gray-100 sm:col-span-2 sm:mt-0">
                {type === 'select' ? (
                    <select
                        name={name}
                        value={value || ''}
                        onChange={onChange}
                        className={sharedClasses}
                    >
                        <option value="">Select...</option>
                        {options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                ) : (
                    <input
                        type={type}
                        name={name}
                        value={value || ''}
                        onChange={onChange}
                        className={type === 'date' ? `${sharedClasses} [color-scheme:dark]` : sharedClasses}
                    />
                )}
            </dd>
        </div>
    );
};

export const Profile = ({ user, onUpdateUser, onMenuClick }: { user: User | null, onUpdateUser: (user: User) => void, onMenuClick?: () => void }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<User | null>(user);
    const [imagePreview, setImagePreview] = useState<string | null>(user?.profilePictureUrl || null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [attendanceData, setAttendanceData] = useState<{
        Present: number;
        Absent: number;
        Excused: number;
        totalEvents: number;
        percentage: number;
    } | null>(null);
    const [loadingAttendance, setLoadingAttendance] = useState(true);

    useEffect(() => {
        const fetchAttendanceData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const response = await fetch(`http://localhost:5007/api/attendances/summary/${user.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    setAttendanceData(data);
                }
            } catch (error) {
                console.error('Failed to fetch attendance data:', error);
            } finally {
                setLoadingAttendance(false);
            }
        };

        if (user) {
            fetchAttendanceData();
        }
    }, [user]);

    if (!user) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold">No user data found.</h1>
                <p>Please log in again.</p>
            </div>
        )
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (formData) {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setImagePreview(result);
                if (formData) {
                    setFormData({ ...formData, profilePictureUrl: result });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (formData) {
            setFormData({
                ...formData,
                homeParishLocation: { ...formData.homeParishLocation, [name]: value }
            });
        }
    };

    const handleSave = () => {
        if (formData) {
            onUpdateUser(formData);
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData(user);
        setImagePreview(user.profilePictureUrl || null);
        setIsEditing(false);
    };

    const actionButton = isEditing ? (
        <div className="flex space-x-2">
            <button onClick={handleCancel} className="bg-ahava-purple-medium text-gray-200 font-semibold py-2 px-4 rounded-lg hover:bg-ahava-purple-light transition-colors">Cancel</button>
            <button onClick={handleSave} className="bg-ahava-purple-dark text-white font-semibold py-2 px-4 rounded-lg hover:bg-ahava-purple-medium transition-colors">Save Changes</button>
        </div>
    ) : (
        <button onClick={() => setIsEditing(true)} className="bg-ahava-purple-dark text-white font-semibold py-2 px-4 rounded-lg hover:bg-ahava-purple-medium transition-colors flex items-center">
            <PencilIcon className="mr-2" />
            Edit Profile
        </button>
    );
    
    const placeholderAvatar = `https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}&background=c7d2fe&color=3730a3&size=128`;
    const avatarSrc = (isEditing ? imagePreview : user.profilePictureUrl) || placeholderAvatar;

    return (
        <div className="bg-ahava-background min-h-full">
            <Header
                breadcrumbs={['Dashboard']}
                title="My Profile"
                titleIcon={<ProfileIcon className="h-6 w-6" />}
                actionButton={actionButton}
                onMenuClick={onMenuClick}
            />
            <div className="p-4 md:p-8">
                <div className="bg-ahava-surface shadow-md rounded-lg overflow-hidden border border-ahava-purple-dark">
                    {/* Profile Picture Section */}
                    <div className="px-4 py-5 sm:px-6 flex flex-col items-center border-b border-ahava-purple-medium">
                        <div className="relative">
                            <img
                                src={avatarSrc}
                                alt="Profile"
                                className="w-32 h-32 rounded-full object-cover border-4 border-ahava-surface shadow-lg"
                            />
                            {isEditing && (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 bg-ahava-purple-dark text-white rounded-full p-2 hover:bg-ahava-purple-medium transition-colors"
                                    aria-label="Change profile picture"
                                >
                                    <CameraIcon className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            className="hidden"
                            accept="image/png, image/jpeg"
                        />
                        {!isEditing && (
                            <h2 className="mt-4 text-2xl font-bold text-gray-100">{user.name}</h2>
                        )}
                    </div>
                    
                    {/* Personal Information */}
                    <div className="divide-y divide-ahava-purple-medium">
                        <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-lg font-medium leading-6 text-gray-100">Personal Information</h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-400">Details about the choir member.</p>
                        </div>
                        <dl className="divide-y divide-ahava-purple-medium">
                            {isEditing && formData ? (
                                <>
                                    <EditableProfileField label="Full Name" name="name" value={formData.name} onChange={handleChange} />
                                    <EditableProfileField label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} />
                                    <EditableProfileField label="Date of Birth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} />
                                    <EditableProfileField label="Place of Birth" name="placeOfBirth" value={formData.placeOfBirth} onChange={handleChange} />
                                    <EditableProfileField label="Gender" name="gender" type="select" options={['Male', 'Female']} value={formData.gender} onChange={handleChange} />
                                    <EditableProfileField label="Marital Status" name="maritalStatus" type="select" options={['Single', 'Married']} value={formData.maritalStatus} onChange={handleChange} />
                                </>
                            ) : (
                                <>
                                    <ProfileField label="Full Name" value={user.name} />
                                    <ProfileField label="Email Address" value={user.email} />
                                    <ProfileField label="Date of Birth" value={user.dateOfBirth} />
                                    <ProfileField label="Place of Birth" value={user.placeOfBirth} />
                                    <ProfileField label="Gender" value={user.gender} />
                                    <ProfileField label="Marital Status" value={user.maritalStatus} />
                                </>
                            )}
                        </dl>
                    </div>

                    {/* Academic Information */}
                    <div className="divide-y divide-ahava-purple-medium mt-8">
                        <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-lg font-medium leading-6 text-gray-100">Academic Information</h3>
                        </div>
                        <dl className="divide-y divide-ahava-purple-medium">
                            {isEditing && formData ? (
                                <>
                                    <EditableProfileField label="University" name="university" type="select" options={['University of Rwanda', 'East African']} value={formData.university} onChange={handleChange} />
                                    <EditableProfileField label="Year of Study" name="yearOfStudy" type="select" options={['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5']} value={formData.yearOfStudy} onChange={handleChange} />
                                    <EditableProfileField label="Residence at School" name="schoolResidence" value={formData.schoolResidence} onChange={handleChange} />
                                </>
                            ) : (
                                <>
                                    <ProfileField label="University" value={user.university} />
                                    <ProfileField label="Year of Study" value={user.yearOfStudy} />
                                    <ProfileField label="Residence at School" value={user.schoolResidence} />
                                </>
                            )}
                        </dl>
                    </div>

                    {/* Location Information */}
                    <div className="divide-y divide-ahava-purple-medium mt-8">
                        <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-lg font-medium leading-6 text-gray-100">Location Information</h3>
                        </div>
                        <dl className="divide-y divide-ahava-purple-medium">
                            {isEditing && formData ? (
                                <>
                                    <EditableProfileField label="Home Residence" name="placeOfResidence" value={formData.placeOfResidence} onChange={handleChange} />
                                    <EditableProfileField label="Home Parish Name" name="homeParishName" value={formData.homeParishName} onChange={handleChange} />
                                    <EditableProfileField label="Parish District" name="district" value={formData.homeParishLocation.district} onChange={handleLocationChange} />
                                    <EditableProfileField label="Parish Sector" name="sector" value={formData.homeParishLocation.sector} onChange={handleLocationChange} />
                                    <EditableProfileField label="Parish Cell" name="cell" value={formData.homeParishLocation.cell} onChange={handleLocationChange} />
                                </>
                            ) : (
                                <>
                                    <ProfileField label="Home Residence" value={user.placeOfResidence} />
                                    <ProfileField label="Home Parish Name" value={user.homeParishName} />
                                    <ProfileField label="Parish Location" value={`${user.homeParishLocation.cell}, ${user.homeParishLocation.sector}, ${user.homeParishLocation.district}`} />
                                </>
                            )}
                        </dl>
                    </div>

                    {/* Attendance Statistics */}
                    <div className="divide-y divide-ahava-purple-medium mt-8">
                        <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-lg font-medium leading-6 text-gray-100">Attendance Statistics</h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-400">Your attendance record across all choir events.</p>
                        </div>
                        <div className="px-4 py-5 sm:px-6">
                            {loadingAttendance ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ahava-purple-light"></div>
                                    <span className="ml-2 text-gray-400">Loading attendance data...</span>
                                </div>
                            ) : attendanceData ? (
                                <div className="space-y-6">
                                    {/* Attendance Percentage Circle */}
                                    <div className="flex justify-center">
                                        <div className="relative">
                                            <svg className="w-32 h-32 transform -rotate-90">
                                                <circle cx="64" cy="64" r="56" strokeWidth="12" stroke="currentColor" className="text-ahava-purple-dark" fill="transparent" />
                                                <circle
                                                    cx="64" cy="64" r="56" strokeWidth="12"
                                                    stroke="currentColor"
                                                    className={`${
                                                        attendanceData.percentage >= 80 ? 'text-ahava-purple-light' :
                                                        attendanceData.percentage >= 60 ? 'text-yellow-400' :
                                                        'text-red-400'
                                                    }`}
                                                    fill="transparent"
                                                    strokeDasharray={2 * Math.PI * 56}
                                                    strokeDashoffset={(2 * Math.PI * 56) - (attendanceData.percentage / 100) * (2 * Math.PI * 56)}
                                                    strokeLinecap="round"
                                                    style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className={`text-2xl font-bold ${
                                                    attendanceData.percentage >= 80 ? 'text-ahava-purple-light' :
                                                    attendanceData.percentage >= 60 ? 'text-yellow-400' :
                                                    'text-red-400'
                                                }`}>
                                                    {attendanceData.percentage}%
                                                </span>
                                                <span className="text-xs text-gray-400">Attendance</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Attendance Counts */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-green-900/20 border border-green-700 p-3 rounded-lg text-center">
                                            <p className="text-green-300 font-bold text-lg">{attendanceData.Present}</p>
                                            <p className="text-green-400 text-sm">Present</p>
                                        </div>
                                        <div className="bg-red-900/20 border border-red-700 p-3 rounded-lg text-center">
                                            <p className="text-red-300 font-bold text-lg">{attendanceData.Absent}</p>
                                            <p className="text-red-400 text-sm">Absent</p>
                                        </div>
                                        <div className="bg-yellow-900/20 border border-yellow-700 p-3 rounded-lg text-center">
                                            <p className="text-yellow-300 font-bold text-lg">{attendanceData.Excused}</p>
                                            <p className="text-yellow-400 text-sm">Excused</p>
                                        </div>
                                    </div>

                                    <div className="text-center text-sm text-gray-400">
                                        Total Events: {attendanceData.totalEvents}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-400">No attendance data available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
