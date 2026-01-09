import React, { useState } from 'react';
import type { User } from '../types';
import { CheckCircleIcon, KeyIcon, MailIcon } from './Icons';

// Rwanda Administrative Divisions Data
const RWANDA_PROVINCES = [
    'Kigali',
    'Northern',
    'Southern',
    'Eastern',
    'Western'
];

const RWANDA_DISTRICTS = {
    'Kigali': [
        'Gasabo',
        'Kicukiro',
        'Nyarugenge'
    ],
    'Northern': [
        'Burera',
        'Gakenke',
        'Gicumbi',
        'Musanze',
        'Rulindo'
    ],
    'Southern': [
        'Gisagara',
        'Huye',
        'Kamonyi',
        'Muhanga',
        'Nyamagabe',
        'Nyanza',
        'Nyaruguru',
        'Ruhango'
    ],
    'Eastern': [
        'Bugesera',
        'Gatsibo',
        'Kayonza',
        'Kirehe',
        'Ngoma',
        'Nyagatare',
        'Rwamagana'
    ],
    'Western': [
        'Karongi',
        'Ngororero',
        'Nyabihu',
        'Nyamasheke',
        'Rubavu',
        'Rusizi',
        'Rutsiro'
    ]
};

const RWANDA_REGIONS = [
    'Gicumbi',
    'Gihundwe',
    'Huye',
    'Kigali',
    'Muhoza',
    'Ngoma',
    'Nyabisundu',
    'Nyagatare',
    'Rubavu'
];

interface RegisterProps {
    onRegister: (user: User, password: string) => Promise<string | null>;
    onSwitchToLogin: () => void;
    onBack?: () => void;
}

export const Register = ({ onRegister, onSwitchToLogin, onBack }: RegisterProps) => {
    const [formData, setFormData] = useState<User>({
        id: '',
        username: '',
        name: '', email: '', phoneNumber: '', dateOfBirth: '', placeOfBirth: '',
        placeOfResidence: '',
        yearOfStudy: '', university: '', college: '', program: '', gender: '', maritalStatus: '',
        homeParishName: '',
        homeParishLocation: { cell: '', sector: '', district: '' },
        schoolResidence: '',
        role: 'Singer',
        province: '', district: '', sector: '', cell: '', region: '', parish: '', itorero: ''
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
    const [currentSection, setCurrentSection] = useState(0);
    
    // Define sections
    const sections = [
        'Personal Information',
        'Home Location Information',
        'Academic Information',
        'Security'
    ];

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

    const validateSection = (sectionIndex: number): boolean => {
        setError('');
        switch (sectionIndex) {
            case 0: // Personal Information
                // TODO: Re-enable validation later - currently disabled for testing
                // if (!formData.name || !formData.username || !formData.email) {
                //     setError('Please fill in all required fields: Full Name, Username, and Email.');
                //     return false;
                // }
                return true; // Allow skipping for testing
            case 1: // Location Information
                // Location fields are optional, so always allow progression
                return true;
            case 2: // Academic Information
                // Academic fields are optional, so always allow progression
                return true;
            case 3: // Security
                if (!password || !confirmPassword) {
                    setError('Please fill in both password fields.');
                    return false;
                }
                if (password.length < 6) {
                    setError('Password must be at least 6 characters long.');
                    return false;
                }
                if (password !== confirmPassword) {
                    setError('Passwords do not match.');
                    return false;
                }
                return true;
            default:
                return true;
        }
    };

    const handleNext = () => {
        if (validateSection(currentSection)) {
            if (currentSection < sections.length - 1) {
                setCurrentSection(currentSection + 1);
            }
        }
    };

    const handlePrevious = () => {
        if (currentSection > 0) {
            setCurrentSection(currentSection - 1);
            setError('');
        }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault();
        }

        // Validate final section before submitting
        if (!validateSection(3)) {
            setCurrentSection(3); // Go to security section if validation fails
            return;
        }

        if (!formData.name || !formData.username || !formData.email || !password || !confirmPassword) {
            setError('Please fill all required fields: Full Name, Username, Email, Password, and Confirm Password.');
            setCurrentSection(0); // Go to first section if basic fields are missing
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

    const inputClasses = "mt-1 block w-full px-4 py-3 bg-ahava-purple-dark border border-ahava-purple-medium rounded-lg shadow-sm placeholder-gray-500 text-gray-200 focus:outline-none focus:ring-2 focus:ring-ahava-magenta focus:border-ahava-magenta sm:text-sm transition-all duration-200 hover:border-ahava-purple-light";
    const labelClasses = "block text-sm font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5";

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
                {onBack && (
                    <button
                        onClick={onBack}
                        className="mb-4 text-ahava-purple-light hover:text-white flex items-center text-sm"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>
                )}
                 <div className="bg-ahava-surface shadow-lg rounded-xl p-6 sm:p-8 border border-ahava-purple-dark">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-100 tracking-wider">Create Account</h1>
                        <p className="text-gray-400 mt-2">Join the Ahava Choir Management system.</p>
                    </div>
                    
                    {/* Progress Indicator */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-2">
                            {sections.map((section, index) => (
                                <div key={index} className="flex items-center flex-1">
                                    <div className="flex flex-col items-center flex-1 cursor-pointer group" onClick={() => {
                                        if (index < currentSection) {
                                            setCurrentSection(index);
                                            setError('');
                                        }
                                    }}>
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 transform group-hover:scale-110 ${
                                            index < currentSection 
                                                ? 'bg-green-500 text-white shadow-lg shadow-green-500/50' 
                                                : index === currentSection 
                                                ? 'bg-ahava-magenta text-white ring-4 ring-ahava-magenta/30 animate-pulse' 
                                                : 'bg-ahava-purple-dark text-gray-400 group-hover:bg-ahava-purple-medium'
                                        }`}>
                                            {index < currentSection ? (
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : (
                                                <span className="text-base font-bold">{index + 1}</span>
                                            )}
                                        </div>
                                        <span className={`text-xs mt-2 text-center transition-colors ${index === currentSection ? 'text-ahava-magenta font-semibold' : index < currentSection ? 'text-green-400 font-medium' : 'text-gray-400 group-hover:text-gray-300'}`}>
                                            {section.split(' ')[0]}
                                        </span>
                                    </div>
                                    {index < sections.length - 1 && (
                                        <div className={`flex-1 h-1.5 mx-2 transition-all duration-500 rounded-full ${
                                            index < currentSection ? 'bg-green-500 shadow-sm shadow-green-500/50' : 'bg-ahava-purple-dark'
                                        }`} />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-ahava-purple-dark/50 rounded-full">
                                <div className="w-2 h-2 rounded-full bg-ahava-magenta animate-pulse"></div>
                                <span className="text-xs text-gray-400">Progress: {Math.round(((currentSection + 1) / sections.length) * 100)}%</span>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-4 rounded-lg mb-4 text-sm flex items-start gap-3 animate-fadeIn">
                            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}
                    
                    {/* Section Title */}
                    <div className="mb-8 text-center animate-fadeIn">
                        <div className="inline-flex items-center gap-2 mb-2">
                            <div className="w-1 h-8 bg-ahava-magenta rounded-full"></div>
                            <h2 className="text-3xl font-bold text-gray-100">{sections[currentSection]}</h2>
                            <div className="w-1 h-8 bg-ahava-magenta rounded-full"></div>
                        </div>
                        <p className="text-sm text-gray-400">Step {currentSection + 1} of {sections.length} • Complete all fields to continue</p>
                    </div>
                    
                    {/* Form Section Container - Only shows current section */}
                    <div className="min-h-[400px] flex items-start justify-center">
                        <form onSubmit={handleSubmit} className="w-full max-w-2xl">
                            {/* Personal Information */}
                            {currentSection === 0 && (
                            <fieldset disabled={isLoading} className="animate-fadeIn w-full">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label htmlFor="name" className={labelClasses}>
                                            <span>Full Name</span>
                                            <span className="text-red-400">*</span>
                                        </label>
                                        <input type="text" name="name" id="name" required value={formData.name} onChange={handleChange} className={inputClasses + (formData.name ? ' border-green-500/50' : '')} placeholder="NSENGIYUMVA Elias" />
                                        {formData.name && (
                                            <p className="text-xs text-green-400 flex items-center gap-1 mt-1">
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                Looks good!
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="username" className={labelClasses}>
                                            <span>Username</span>
                                            <span className="text-red-400">*</span>
                                        </label>
                                        <input type="text" name="username" id="username" required value={formData.username} onChange={handleChange} className={inputClasses + (formData.username ? ' border-green-500/50' : '')} placeholder="EliasNsengiyumva" />
                                        {formData.username && (
                                            <p className="text-xs text-green-400 flex items-center gap-1 mt-1">
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                Available
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="email" className={labelClasses}>
                                            <span>Email Address</span>
                                            <span className="text-red-400">*</span>
                                        </label>
                                        <input type="email" name="email" id="email" required value={formData.email} onChange={handleChange} className={inputClasses + (formData.email && formData.email.includes('@') ? ' border-green-500/50' : '')} placeholder="elais@gmail.com" />
                                        {formData.email && formData.email.includes('@') && (
                                            <p className="text-xs text-green-400 flex items-center gap-1 mt-1">
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                Valid email
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="phoneNumber" className={labelClasses}>Phone Number</label>
                                        <input type="tel" name="phoneNumber" id="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className={inputClasses + (formData.phoneNumber ? ' border-green-500/50' : '')} placeholder="+250 xxx xxx xxx" />
                                        {formData.phoneNumber && (
                                            <p className="text-xs text-gray-500 mt-1">Optional field</p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="dateOfBirth" className={labelClasses}>Date of Birth</label>
                                        <input type="date" name="dateOfBirth" id="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className={inputClasses + " [color-scheme:dark]" + (formData.dateOfBirth ? ' border-green-500/50' : '')} />
                                        {formData.dateOfBirth && (
                                            <p className="text-xs text-gray-500 mt-1">Selected</p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <label className={labelClasses}>Gender</label>
                                        <select name="gender" value={formData.gender} onChange={handleChange} className={inputClasses + (formData.gender ? ' border-green-500/50' : '')}>
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                        </select>
                                        {formData.gender && (
                                            <p className="text-xs text-gray-500 mt-1">Selected</p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <label className={labelClasses}>Marital Status</label>
                                        <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className={inputClasses + (formData.maritalStatus ? ' border-green-500/50' : '')}>
                                            <option value="">Select Status</option>
                                            <option value="Single">Single</option>
                                            <option value="Married">Married</option>
                                        </select>
                                        {formData.maritalStatus && (
                                            <p className="text-xs text-gray-500 mt-1">Selected</p>
                                        )}
                                    </div>
                                </div>
                            </fieldset>
                            )}

                            {/* Location Information */}
                            {currentSection === 1 && (
                            <fieldset disabled={isLoading} className="animate-fadeIn w-full">
                                <div className="mb-4 p-4 bg-ahava-purple-dark/30 rounded-lg border border-ahava-purple-medium/50">
                                    <p className="text-xs text-gray-400 flex items-center gap-2">
                                        <svg className="w-4 h-4 text-ahava-magenta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        All fields in this section are optional. Fill them to help us know your home location better.
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label htmlFor="province" className={labelClasses}>Province</label>
                                        <select name="province" id="province" value={formData.province} onChange={(e) => {
                                            handleChange(e);
                                            // Clear district when province changes
                                            setFormData(prev => ({ ...prev, district: '' }));
                                        }} className={inputClasses + (formData.province ? ' border-green-500/50' : '')}>
                                            <option value="">Select Province</option>
                                            {RWANDA_PROVINCES.map(province => (
                                                <option key={province} value={province}>{province}</option>
                                            ))}
                                        </select>
                                        {formData.province && (
                                            <p className="text-xs text-green-400 flex items-center gap-1 mt-1">
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                {formData.province} selected
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="district" className={labelClasses}>District</label>
                                        <select name="district" id="district" value={formData.district} onChange={handleChange} className={inputClasses + (formData.district ? ' border-green-500/50' : '')} disabled={!formData.province}>
                                            <option value="">{formData.province ? 'Select District' : 'Select Province first'}</option>
                                            {formData.province && RWANDA_DISTRICTS[formData.province as keyof typeof RWANDA_DISTRICTS]?.map(district => (
                                                <option key={district} value={district}>{district}</option>
                                            ))}
                                        </select>
                                        {formData.district && (
                                            <p className="text-xs text-green-400 flex items-center gap-1 mt-1">
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                {formData.district} selected
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="sector" className={labelClasses}>Sector</label>
                                        <input type="text" name="sector" id="sector" value={formData.sector} onChange={handleChange} className={inputClasses + (formData.sector ? ' border-green-500/50' : '')} placeholder="Enter sector" />
                                        {formData.sector && (
                                            <p className="text-xs text-gray-500 mt-1">Entered</p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="cell" className={labelClasses}>Cell</label>
                                        <input type="text" name="cell" id="cell" value={formData.cell} onChange={handleChange} className={inputClasses + (formData.cell ? ' border-green-500/50' : '')} placeholder="Enter cell" />
                                        {formData.cell && (
                                            <p className="text-xs text-gray-500 mt-1">Entered</p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="region" className={labelClasses}>Region (ururembo)</label>
                                        <select name="region" id="region" value={formData.region || ''} onChange={handleChange} className={inputClasses + (formData.region ? ' border-green-500/50' : '')}>
                                            <option value="">Select Region</option>
                                            {RWANDA_REGIONS.map(region => (
                                                <option key={region} value={region}>{region}</option>
                                            ))}
                                        </select>
                                        {formData.region && (
                                            <p className="text-xs text-green-400 flex items-center gap-1 mt-1">
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                {formData.region} selected
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="parish" className={labelClasses}>Parish</label>
                                        <input type="text" name="parish" id="parish" value={formData.parish || ''} onChange={handleChange} className={inputClasses + (formData.parish ? ' border-green-500/50' : '')} placeholder="ADPR Remera" />
                                        {formData.parish && (
                                            <p className="text-xs text-gray-500 mt-1">Entered</p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="itorero" className={labelClasses}>Itorero</label>
                                        <input type="text" name="itorero" id="itorero" value={formData.itorero || ''} onChange={handleChange} className={inputClasses + (formData.itorero ? ' border-green-500/50' : '')} placeholder="Remera" />
                                        {formData.itorero && (
                                            <p className="text-xs text-gray-500 mt-1">Entered</p>
                                        )}
                                    </div>
                                </div>
                            </fieldset>
                            )}

                            {/* Academic Information */}
                            {currentSection === 2 && (
                            <fieldset disabled={isLoading} className="animate-fadeIn w-full">
                                <div className="mb-4 p-4 bg-ahava-purple-dark/30 rounded-lg border border-ahava-purple-medium/50">
                                    <p className="text-xs text-gray-400 flex items-center gap-2">
                                        <svg className="w-4 h-4 text-ahava-magenta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                        Tell us about your academic background. All fields are optional.
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className={labelClasses}>University</label>
                                        <select name="university" value={formData.university} onChange={handleChange} className={inputClasses + (formData.university ? ' border-green-500/50' : '')}>
                                            <option value="">Select University</option>
                                            <option value="University of Rwanda">University of Rwanda</option>
                                            <option value="East African">East African University</option>
                                        </select>
                                        {formData.university && (
                                            <p className="text-xs text-green-400 flex items-center gap-1 mt-1">
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                {formData.university} selected
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <label className={labelClasses}>College</label>
                                        <select name="college" value={formData.college || ''} onChange={(e) => {
                                            handleChange(e);
                                            // Clear program when college changes
                                            setFormData(prev => ({ ...prev, program: '' }));
                                        }} className={inputClasses + (formData.college ? ' border-green-500/50' : '')} disabled={!formData.university}>
                                            <option value="">{formData.university ? 'Select College' : 'Select University first'}</option>
                                            <option value="College of Education">College of Education</option>
                                            <option value="College of Animal Science and Veterinary Medicine">College of Animal Science and Veterinary Medicine</option>
                                        </select>
                                        {formData.college && (
                                            <p className="text-xs text-green-400 flex items-center gap-1 mt-1">
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                {formData.college.split(' ')[0]} selected
                                            </p>
                                        )}
                                    </div>
                                    {(formData.college === 'College of Education' || formData.college === 'College of Animal Science and Veterinary Medicine') && (
                                    <div>
                                        <label className={labelClasses}>Program</label>
                                        <select name="program" value={formData.program || ''} onChange={(e) => {
                                            handleChange(e);
                                            // Clear Year 5 if switching from Veterinary to a non-Veterinary program
                                            if (formData.program === 'Bachelor in Veterinary' && e.target.value !== 'Bachelor in Veterinary' && formData.yearOfStudy === 'Year 5') {
                                                setFormData(prev => ({ ...prev, yearOfStudy: '' }));
                                            }
                                        }} className={inputClasses}>
                                            <option value="">Select Program</option>
                                            {formData.college === 'College of Education' && (
                                                <>
                                                    <option value="Bachelor of Education with Honours in French and English">Bachelor of Education with Honours in French and English</option>
                                                    <option value="Bachelor of Education with Honours in French and Kinyarwanda">Bachelor of Education with Honours in French and Kinyarwanda</option>
                                                    <option value="Bachelor of Education in Kinyarwanda and English">Bachelor of Education in Kinyarwanda and English</option>
                                                    <option value="Bachelor of Education with Honours in English and Literature in English">Bachelor of Education with Honours in English and Literature in English</option>
                                                    <option value="Bachelor of Education with Honours in Kinyarwanda and Literature in English">Bachelor of Education with Honours in Kinyarwanda and Literature in English</option>
                                                    <option value="Bachelor of Education with Honours in Performing arts and French">Bachelor of Education with Honours in Performing arts and French</option>
                                                    <option value="Bachelor of Education with Honours in Performing arts and Kinyarwanda">Bachelor of Education with Honours in Performing arts and Kinyarwanda</option>
                                                    <option value="Bachelor of Education with Honours in Performing arts and Kiswahili">Bachelor of Education with Honours in Performing arts and Kiswahili</option>
                                                    <option value="Bachelor of Education with Honours in Performing arts and English">Bachelor of Education with Honours in Performing arts and English</option>
                                                    <option value="Bachelor of Education with Honours in History and Geography">Bachelor of Education with Honours in History and Geography</option>
                                                    <option value="Bachelor of Education in Economics and Business Studies">Bachelor of Education in Economics and Business Studies</option>
                                                    <option value="Bachelor of Education with Honours in Geography and Economics">Bachelor of Education with Honours in Geography and Economics</option>
                                                    <option value="Bachelor of Education with Honours in Kiswahili and English">Bachelor of Education with Honours in Kiswahili and English</option>
                                                    <option value="Bachelor of Education with Honours in Kiswahili and Kinyarwanda">Bachelor of Education with Honours in Kiswahili and Kinyarwanda</option>
                                                    <option value="Bachelor of Education with Honours in French and Literature in English">Bachelor of Education with Honours in French and Literature in English</option>
                                                    <option value="Bachelor of Education with Honours in Early Childhood Education">Bachelor of Education with Honours in Early Childhood Education</option>
                                                    <option value="Bachelor of Education with Honours in Special Needs Education">Bachelor of Education with Honours in Special Needs Education</option>
                                                    <option value="Bachelor of Education with Honours in Educational Psychology">Bachelor of Education with Honours in Educational Psychology</option>
                                                </>
                                            )}
                                            {formData.college === 'College of Animal Science and Veterinary Medicine' && (
                                                <>
                                                    <option value="Bachelor in Veterinary">Bachelor in Veterinary</option>
                                                    <option value="Bachelor in Animal Production">Bachelor in Animal Production</option>
                                                    <option value="Bachelor in Aquaculture Management">Bachelor in Aquaculture Management</option>
                                                </>
                                            )}
                                        </select>
                                    </div>
                                    )}
                                    <div className="space-y-1">
                                        <label className={labelClasses}>Year of Study</label>
                                        <select name="yearOfStudy" value={formData.yearOfStudy} onChange={handleChange} className={inputClasses + (formData.yearOfStudy ? ' border-green-500/50' : '')} disabled={!formData.program}>
                                            <option value="">{formData.program ? 'Select Year' : 'Select Program first'}</option>
                                            {formData.program === 'Bachelor in Veterinary' ? (
                                                <>
                                                    <option value="Year 1">Year 1</option>
                                                    <option value="Year 2">Year 2</option>
                                                    <option value="Year 3">Year 3</option>
                                                    <option value="Year 4">Year 4</option>
                                                    <option value="Year 5">Year 5 (5-year program)</option>
                                                </>
                                            ) : formData.program ? (
                                                <>
                                                    <option value="Year 1">Year 1</option>
                                                    <option value="Year 2">Year 2</option>
                                                    <option value="Year 3">Year 3</option>
                                                    <option value="Year 4">Year 4 (4-year program)</option>
                                                </>
                                            ) : null}
                                        </select>
                                        {formData.yearOfStudy && (
                                            <p className="text-xs text-green-400 flex items-center gap-1 mt-1">
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                {formData.yearOfStudy} selected
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </fieldset>
                            )}

                            {/* Password Section at the bottom */}
                            {currentSection === 3 && (
                            <fieldset disabled={isLoading} className="animate-fadeIn w-full">
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
                                                onChange={(e) => {
                                                    setPassword(e.target.value);
                                                    // Clear error when user starts typing
                                                    if (error && error.includes('Password must be at least')) {
                                                        setError('');
                                                    }
                                                }}
                                                className={inputClasses + (password && password.length < 6 ? ' border-red-500' : '')}
                                                minLength={6}
                                            />
                                        </div>
                                        {password && password.length < 6 && (
                                            <p className="mt-1 text-xs text-red-400">Password must be at least 6 characters long.</p>
                                        )}
                                    </div>
                                    <div>
                                        <label htmlFor="confirmPassword" className={labelClasses}>Confirm Password</label>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            id="confirmPassword"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => {
                                                setConfirmPassword(e.target.value);
                                                // Clear error when user starts typing
                                                if (error && error.includes('Passwords do not match')) {
                                                    setError('');
                                                }
                                            }}
                                            className={inputClasses + (confirmPassword && password && confirmPassword !== password ? ' border-red-500' : '')}
                                        />
                                        {confirmPassword && password && confirmPassword !== password && (
                                            <p className="mt-1 text-xs text-red-400">Passwords do not match.</p>
                                        )}
                                        {confirmPassword && password && confirmPassword === password && password.length >= 6 && (
                                            <p className="mt-1 text-xs text-green-400">✓ Passwords match.</p>
                                        )}
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
                            )}
                        </form>
                    </div>
                    
                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-ahava-purple-medium">
                        <button
                            type="button"
                            onClick={handlePrevious}
                            disabled={currentSection === 0 || isLoading}
                            className="flex items-center px-6 py-3 border border-ahava-purple-medium rounded-lg shadow-sm text-sm font-semibold text-gray-300 bg-ahava-purple-dark hover:bg-ahava-purple-medium hover:border-ahava-purple-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ahava-purple-light disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Previous
                        </button>
                        
                        {currentSection < sections.length - 1 ? (
                            <button
                                type="button"
                                onClick={handleNext}
                                disabled={isLoading}
                                className="flex items-center px-8 py-3 border border-transparent rounded-lg shadow-lg shadow-ahava-magenta/30 text-sm font-semibold text-white bg-ahava-magenta hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ahava-magenta disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 hover:shadow-xl hover:shadow-ahava-magenta/40"
                            >
                                Continue to {sections[currentSection + 1].split(' ')[0]}
                                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="flex items-center px-8 py-3 border border-transparent rounded-lg shadow-lg shadow-green-500/30 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 hover:shadow-xl hover:shadow-green-500/40"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Registering...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Complete Registration
                                    </>
                                )}
                            </button>
                        )}
                    </div>
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
