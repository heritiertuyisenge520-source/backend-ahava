import React, { useState } from 'react';
import type { User } from '../types';
import { CheckCircleIcon, KeyIcon, MailIcon } from './Icons';

interface RegisterProps {
    onRegister: (user: User, password: string) => Promise<string | null>;
    onSwitchToLogin: () => void;
}

export const Register = ({ onRegister, onSwitchToLogin }: RegisterProps) => {
    const [formData, setFormData] = useState<User>({
        id: '',
        username: '',
        name: '', email: '', phoneNumber: '', dateOfBirth: '', placeOfBirth: '',
        yearOfStudy: '', university: '', gender: '', maritalStatus: '',
        homeParishName: '',
        homeParishLocation: { cell: '', sector: '', district: '' },
        schoolResidence: '',
        role: 'Singer',
        province: '', district: '', sector: '', cell: ''
    });

    // Auth State
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // UI State
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);

    // No cascading dropdown logic needed - simple text inputs

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            homeParishLocation: { ...prev.homeParishLocation, [name]: value }
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfilePicture(file);
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setProfilePicturePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const generateStrongPassword = () => {
        const length = 16;
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
        let retVal = "";
        for (let i = 0, n = charset.length; i < length; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * n));
        }
        setPassword(retVal);
        setConfirmPassword(retVal);
        setShowPassword(true);
        setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.username || !formData.email || !password || !confirmPassword) {
            setError('Please fill all required fields: Full Name, Username, Email, Password, and Confirm Password.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        setError('');
        setIsLoading(true);

        // Register user directly
        const registrationError = await onRegister(formData, password);

        setIsLoading(false);

        if (registrationError) {
            setError(registrationError);
        } else {
            // Pop message as requested
            alert("Registration successful! Please go and verify your email.");
            setIsSuccess(true);
        }
    };

    const inputClasses = "mt-1 block w-full px-3 py-2 bg-ahava-purple-dark border border-ahava-purple-medium rounded-md shadow-sm placeholder-gray-500 text-gray-200 focus:outline-none focus:ring-ahava-magenta focus:border-ahava-magenta sm:text-sm transition-all";
    const labelClasses = "block text-sm font-medium text-gray-300";

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-ahava-background flex flex-col justify-center items-center">
                <div className="w-full max-w-md p-4">
                    <div className="bg-ahava-surface shadow-lg rounded-xl p-8 text-center border border-ahava-purple-dark animate-fadeInUp">
                        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-gray-100">Registration Successful!</h1>
                        <p className="text-gray-300 mt-2 mb-6">Please check your email inbox to verify your account before logging in.</p>
                        <button
                            onClick={onSwitchToLogin}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-ahava-purple-dark hover:bg-ahava-purple-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ahava-purple-light transition-colors"
                        >
                            Go to Login
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // Registration Form View
    return (
        <div className="min-h-screen bg-ahava-background flex flex-col justify-center items-center py-12 px-4">
            <div className="w-full max-w-4xl">
                 <div className="bg-ahava-surface shadow-lg rounded-xl p-6 sm:p-8 border border-ahava-purple-dark">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-100 tracking-wider">Create Account</h1>
                        <p className="text-gray-400 mt-2">Join the Ahava Choir Management system.</p>
                    </div>
                    {error && <p className="bg-red-500/20 text-red-300 p-3 rounded-md mb-4 text-sm">{error}</p>}
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Personal Information */}
                        <fieldset disabled={isLoading}>
                            <legend className="text-lg font-medium text-gray-100 mb-4 border-b border-ahava-purple-medium pb-2">Personal Information</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="name" className={labelClasses}>Full Name</label>
                                    <input type="text" name="name" id="name" required value={formData.name} onChange={handleChange} className={inputClasses} />
                                </div>
                                <div>
                                    <label htmlFor="username" className={labelClasses}>Username</label>
                                    <input type="text" name="username" id="username" required value={formData.username} onChange={handleChange} className={inputClasses} placeholder="Choose a username" />
                                </div>
                                <div>
                                    <label htmlFor="email" className={labelClasses}>Email Address</label>
                                    <input type="email" name="email" id="email" required value={formData.email} onChange={handleChange} className={inputClasses} />
                                </div>
                                <div>
                                    <label htmlFor="phoneNumber" className={labelClasses}>Phone Number</label>
                                    <input type="tel" name="phoneNumber" id="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className={inputClasses} placeholder="+250 xxx xxx xxx" />
                                </div>
                                <div>
                                    <label htmlFor="dateOfBirth" className={labelClasses}>Date of Birth</label>
                                    <input type="date" name="dateOfBirth" id="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className={inputClasses + " [color-scheme:dark]"} />
                                </div>
                                <div>
                                    <label htmlFor="placeOfBirth" className={labelClasses}>Home Resident</label>
                                    <input type="text" name="placeOfBirth" id="placeOfBirth" value={formData.placeOfBirth} onChange={handleChange} className={inputClasses} />
                                </div>
                                <div>
                                    <label className={labelClasses}>Gender</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange} className={inputClasses}>
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClasses}>Marital Status</label>
                                    <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className={inputClasses}>
                                        <option value="">Select Status</option>
                                        <option value="Single">Single</option>
                                        <option value="Married">Married</option>
                                    </select>
                                </div>
                            </div>
                        </fieldset>

                        {/* Location Information */}
                        <fieldset disabled={isLoading}>
                            <legend className="text-lg font-medium text-gray-100 mb-4 border-b border-ahava-purple-medium pb-2">Location Information</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="province" className={labelClasses}>Province</label>
                                    <input type="text" name="province" id="province" value={formData.province} onChange={handleChange} className={inputClasses} placeholder="Enter province" />
                                </div>
                                <div>
                                    <label htmlFor="district" className={labelClasses}>District</label>
                                    <input type="text" name="district" id="district" value={formData.district} onChange={handleChange} className={inputClasses} placeholder="Enter district" />
                                </div>
                                <div>
                                    <label htmlFor="sector" className={labelClasses}>Sector</label>
                                    <input type="text" name="sector" id="sector" value={formData.sector} onChange={handleChange} className={inputClasses} placeholder="Enter sector" />
                                </div>
                                <div>
                                    <label htmlFor="cell" className={labelClasses}>Cell/Village</label>
                                    <input type="text" name="cell" id="cell" value={formData.cell} onChange={handleChange} className={inputClasses} placeholder="Enter cell/village" />
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="homeParishName" className={labelClasses}>Home Parish Name</label>
                                    <input type="text" name="homeParishName" id="homeParishName" value={formData.homeParishName} onChange={handleChange} className={inputClasses} placeholder="Enter parish name" />
                                </div>
                            </div>
                        </fieldset>

                        {/* Academic Information */}
                        <fieldset disabled={isLoading}>
                            <legend className="text-lg font-medium text-gray-100 mb-4 border-b border-ahava-purple-medium pb-2">Academic Information</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClasses}>University</label>
                                    <select name="university" value={formData.university} onChange={handleChange} className={inputClasses}>
                                        <option value="">Select University</option>
                                        <option value="University of Rwanda">University of Rwanda</option>
                                        <option value="East African">East African University</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClasses}>Year of Study</label>
                                    <select name="yearOfStudy" value={formData.yearOfStudy} onChange={handleChange} className={inputClasses}>
                                        <option value="">Select Year</option>
                                        <option value="Year 1">Year 1</option><option value="Year 2">Year 2</option><option value="Year 3">Year 3</option><option value="Year 4">Year 4</option><option value="Year 5">Year 5</option>
                                    </select>
                                </div>
                                 <div className="md:col-span-2">
                                    <label htmlFor="schoolResidence" className={labelClasses}>Place of Residence (at School)</label>
                                    <input type="text" name="schoolResidence" id="schoolResidence" value={formData.schoolResidence} onChange={handleChange} className={inputClasses} />
                                </div>
                            </div>
                        </fieldset>

                        {/* Profile Picture Upload */}
                        <fieldset disabled={isLoading}>
                            <legend className="text-lg font-medium text-gray-100 mb-4 border-b border-ahava-purple-medium pb-2">Profile Picture</legend>
                            <div className="flex flex-col items-center space-y-4">
                                <div className="flex flex-col items-center">
                                    {profilePicturePreview ? (
                                        <img
                                            src={profilePicturePreview}
                                            alt="Profile Preview"
                                            className="w-24 h-24 rounded-full object-cover border-2 border-ahava-purple-light"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 rounded-full bg-ahava-purple-dark border-2 border-ahava-purple-medium flex items-center justify-center">
                                            <span className="text-gray-400 text-sm">No Image</span>
                                        </div>
                                    )}
                                    <label htmlFor="profilePicture" className="mt-2 cursor-pointer">
                                        <span className="text-ahava-magenta hover:text-pink-400 text-sm font-medium transition-colors">
                                            {profilePicture ? 'Change Picture' : 'Upload Picture'}
                                        </span>
                                        <input
                                            type="file"
                                            id="profilePicture"
                                            name="profilePicture"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </label>
                                    {profilePicture && (
                                        <p className="text-xs text-gray-400 mt-1">{profilePicture.name}</p>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 text-center max-w-md">
                                    Upload a profile picture (optional). Supported formats: JPG, PNG, GIF. Max size: 5MB.
                                </p>
                            </div>
                        </fieldset>

                        {/* Password Section at the bottom */}
                        <fieldset disabled={isLoading}>
                            <legend className="text-lg font-medium text-gray-100 mb-4 border-b border-ahava-purple-medium pb-2">Security</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-ahava-purple-dark/30 rounded-lg border border-ahava-purple-medium/50">
                                <div className="md:col-span-2 flex justify-between items-center mb-1">
                                    <h4 className="text-sm font-semibold text-gray-300">Create Your Password</h4>
                                    <button
                                        type="button"
                                        onClick={generateStrongPassword}
                                        className="flex items-center text-xs text-ahava-magenta hover:text-pink-400 font-medium transition-colors focus:outline-none"
                                    >
                                        <KeyIcon className="w-4 h-4 mr-1" />
                                        Generate Strong Password
                                    </button>
                                </div>
                                <div>
                                    <label htmlFor="password" className={labelClasses}>Password</label>
                                    <div className="relative mt-1">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            id="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className={inputClasses}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="confirmPassword" className={labelClasses}>Confirm Password</label>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        id="confirmPassword"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={inputClasses}
                                    />
                                </div>
                                <div className="md:col-span-2 flex items-center">
                                    <input
                                        type="checkbox"
                                        id="showPassword"
                                        checked={showPassword}
                                        onChange={(e) => setShowPassword(e.target.checked)}
                                        className="h-4 w-4 text-ahava-magenta focus:ring-ahava-magenta border-gray-600 rounded bg-ahava-purple-dark"
                                    />
                                    <label htmlFor="showPassword" className="ml-2 block text-sm text-gray-400">
                                        Show Password
                                    </label>
                                </div>
                            </div>
                        </fieldset>

                        <div>
                            <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-ahava-purple-dark hover:bg-ahava-purple-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ahava-purple-light disabled:bg-ahava-purple-light disabled:cursor-not-allowed transition-colors">
                                {isLoading ? 'Registering...' : 'Register'}
                            </button>
                        </div>
                    </form>
                    <div className="text-center mt-6">
                        <p className="text-sm text-gray-400">
                            Already have an account?{' '}
                            <button onClick={onSwitchToLogin} className="font-medium text-ahava-magenta hover:text-purple-400">
                                Login
                            </button>
                        </p>
                    </div>
                 </div>
            </div>
        </div>
    );
};
