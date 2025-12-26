


import React, { useState, useEffect, useRef } from 'react';

interface ExistingPermission {
    id: string;
    startDate: string;
    endDate: string;
    reason: string;
    status: string;
}

interface PermissionRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (request: { startDate: string; endDate: string; reason: string; details: string }) => void;
    confirmationContent: React.ReactNode | null;
    existingPermission?: ExistingPermission | null;
}

export const PermissionRequestModal = ({ isOpen, onClose, onSubmit, confirmationContent, existingPermission }: PermissionRequestModalProps) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [details, setDetails] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);

    // Reset form when modal opens, but only if we are not showing a confirmation
    useEffect(() => {
        if (isOpen && !confirmationContent) {
            setStartDate('');
            setEndDate('');
            setReason('');
            setDetails('');
        }
    }, [isOpen, confirmationContent]);
    
    // Close on escape key
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    // Close on clicking outside
    const handleClickOutside = (event: React.MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
            onClose();
        }
    };


    if (!isOpen) return null;
    
    const inputClasses = "mt-1 block w-full px-3 py-2 bg-ahava-purple-dark border border-ahava-purple-medium rounded-md shadow-sm text-gray-200 focus:outline-none focus:ring-ahava-magenta focus:border-ahava-magenta disabled:bg-ahava-purple-dark/50 disabled:cursor-not-allowed";
    const labelClasses = "block text-sm font-medium text-gray-300";

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ startDate, endDate, reason, details });
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
            onClick={handleClickOutside}
            role="dialog"
            aria-modal="true"
            aria-labelledby="permission-modal-title"
        >
            <div ref={modalRef} className="bg-ahava-surface rounded-lg shadow-xl p-8 w-full max-w-lg border border-ahava-purple-medium">
                {confirmationContent ? (
                    <>
                        {confirmationContent}
                        <div className="mt-8 flex justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                className="bg-ahava-purple-dark text-white font-semibold py-2 px-4 rounded-lg hover:bg-ahava-purple-medium transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </>
                ) : existingPermission ? (
                    <>
                        <div className="flex justify-between items-start mb-4">
                            <h2 id="permission-modal-title" className="text-xl font-bold text-gray-100">
                                {existingPermission.status === 'pending' ? 'Pending Permission Request' : 'Existing Approved Permission'}
                            </h2>
                            <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl font-bold leading-none" aria-label="Close modal">&times;</button>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-ahava-purple-dark/50 p-4 rounded-lg border border-ahava-purple-medium">
                                <div className="flex items-center mb-3">
                                    <div className={`w-3 h-3 rounded-full mr-2 ${
                                        existingPermission.status === 'approved' ? 'bg-green-500' :
                                        existingPermission.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'
                                    }`}></div>
                                    <span className={`text-sm font-medium ${
                                        existingPermission.status === 'approved' ? 'text-green-400' :
                                        existingPermission.status === 'pending' ? 'text-yellow-400' : 'text-gray-400'
                                    }`}>
                                        {existingPermission.status.charAt(0).toUpperCase() + existingPermission.status.slice(1)} Permission
                                    </span>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Start Date:</span>
                                        <span className="text-gray-200">{new Date(existingPermission.startDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">End Date:</span>
                                        <span className="text-gray-200">{new Date(existingPermission.endDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Reason:</span>
                                        <span className="text-gray-200">{existingPermission.reason}</span>
                                    </div>
                                </div>
                            </div>
                            {existingPermission.status === 'pending' ? (
                                <div className="bg-yellow-900/20 border border-yellow-700 p-4 rounded-lg">
                                    <p className="text-yellow-300 text-sm">
                                        You already have a pending permission request. Please wait for it to be reviewed before submitting a new one.
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-green-900/20 border border-green-700 p-4 rounded-lg">
                                    <p className="text-green-300 text-sm">
                                        You already have an approved permission for this period. You cannot request overlapping permissions.
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="mt-8 flex justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                className="bg-ahava-purple-dark text-white font-semibold py-2 px-4 rounded-lg hover:bg-ahava-purple-medium transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex justify-between items-start mb-4">
                            <h2 id="permission-modal-title" className="text-xl font-bold text-gray-100">Request Permission for Absence</h2>
                            <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl font-bold leading-none" aria-label="Close modal">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="startDate" className={labelClasses}>Start Date</label>
                                        <input
                                            type="date"
                                            id="startDate"
                                            value={startDate}
                                            onChange={(e) => {
                                                const newStartDate = e.target.value;
                                                setStartDate(newStartDate);
                                                if (endDate && newStartDate > endDate) {
                                                    setEndDate('');
                                                }
                                            }}
                                            required
                                            className={inputClasses + " [color-scheme:dark]"}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="endDate" className={labelClasses}>End Date <span className="text-gray-500">(optional)</span></label>
                                        <input
                                            type="date"
                                            id="endDate"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            min={startDate}
                                            disabled={!startDate}
                                            className={inputClasses + " [color-scheme:dark]"}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="reason" className={labelClasses}>Reason</label>
                                    <select
                                        id="reason"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        required
                                        className={inputClasses}
                                    >
                                        <option value="" disabled>Select a reason...</option>
                                        <option value="Sickness">Sickness</option>
                                        <option value="Family Emergency">Family Emergency</option>
                                        <option value="Academic Commitments">Academic Commitments</option>
                                        <option value="Work Commitments">Work Commitments</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="details" className={labelClasses}>Details <span className="text-gray-500">(optional)</span></label>
                                    <textarea
                                        id="details"
                                        value={details}
                                        onChange={(e) => setDetails(e.target.value)}
                                        rows={4}
                                        placeholder="Please provide a brief explanation for your absence."
                                        className={inputClasses}
                                    ></textarea>
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end space-x-3">
                                <button type="button" onClick={onClose} className="bg-ahava-purple-medium text-gray-200 font-semibold py-2 px-4 rounded-lg hover:bg-ahava-purple-light transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="bg-ahava-purple-dark text-white font-semibold py-2 px-4 rounded-lg hover:bg-ahava-purple-medium transition-colors">
                                    Submit Request
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};
