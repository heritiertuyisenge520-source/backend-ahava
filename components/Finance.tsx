import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { Header } from './Header';
import { BuildingIcon } from './Icons';

interface FinanceProps {
    user: User;
    onMenuClick?: () => void;
}

interface Contribution {
    _id: string;
    title: string;
    description: string;
    amountPerPerson: number;
    startDate: string;
    endDate: string;
    status: 'active' | 'closed';
    createdBy: {
        _id: string;
        name: string;
    };
}

interface PaymentRecord {
    _id: string;
    amount: number;
    datePaid: string;
    notes: string;
}

interface MemberPayment {
    userId: string;
    name: string;
    email: string;
    payment: {
        _id: string;
        isPaid: boolean;
        amountPaid: number;
        paymentHistory: PaymentRecord[];
    } | null;
    isPaid: boolean;
    amountPaid: number;
    paymentHistory: PaymentRecord[];
    datePaid: string | null;
}

interface AddPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (amount: number, notes: string) => void;
    memberName: string;
    remainingAmount: number;
    isLoading?: boolean;
}

const AddPaymentModal = ({ isOpen, onClose, onSubmit, memberName, remainingAmount, isLoading = false }: AddPaymentModalProps) => {
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setAmount(remainingAmount.toString());
            setNotes('');
        }
    }, [isOpen, remainingAmount]);

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const paymentAmount = parseFloat(amount);
        if (paymentAmount > 0 && paymentAmount <= remainingAmount) {
            onSubmit(paymentAmount, notes.trim());
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
            onClick={handleClickOutside}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-payment-modal-title"
        >
            <div ref={modalRef} className="bg-ahava-surface rounded-lg shadow-xl p-8 w-full max-w-md border border-ahava-purple-medium">
                <div className="flex justify-between items-start mb-4">
                    <h2 id="add-payment-modal-title" className="text-xl font-bold text-gray-100">
                        Add Payment for {memberName}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl font-bold leading-none" aria-label="Close modal">&times;</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="payment-amount" className="block text-sm font-medium text-gray-300 mb-2">
                                Payment Amount (RWF) *
                            </label>
                            <input
                                type="number"
                                id="payment-amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                min="0.01"
                                max={remainingAmount}
                                step="0.01"
                                required
                                className="w-full px-3 py-2 bg-ahava-purple-dark border border-ahava-purple-medium rounded-md text-gray-200 focus:outline-none focus:ring-ahava-magenta focus:border-ahava-magenta"
                                placeholder="Enter amount"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                Maximum: {remainingAmount.toLocaleString()} RWF
                            </p>
                        </div>

                        <div>
                            <label htmlFor="payment-notes" className="block text-sm font-medium text-gray-300 mb-2">
                                Notes (Optional)
                            </label>
                            <textarea
                                id="payment-notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 bg-ahava-purple-dark border border-ahava-purple-medium rounded-md text-gray-200 focus:outline-none focus:ring-ahava-magenta focus:border-ahava-magenta"
                                placeholder="Add any notes about this payment..."
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-ahava-purple-medium text-gray-200 font-semibold py-2 px-4 rounded-lg hover:bg-ahava-purple-light transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > remainingAmount}
                            className="bg-ahava-purple-dark text-white font-semibold py-2 px-4 rounded-lg hover:bg-ahava-purple-medium transition-colors disabled:opacity-50 disabled:cursor-wait"
                        >
                            {isLoading ? 'Adding...' : 'Add Payment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const Finance = ({ user, onMenuClick }: FinanceProps) => {
    const [activeTab, setActiveTab] = useState<'setup' | 'tracking'>('setup');
    const [contributions, setContributions] = useState<Contribution[]>([]);
    const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null);
    const [memberPayments, setMemberPayments] = useState<MemberPayment[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Modal states
    const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
    const [selectedMemberForPayment, setSelectedMemberForPayment] = useState<MemberPayment | null>(null);
    const [paymentLoading, setPaymentLoading] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        amountPerPerson: '',
        startDate: '',
        endDate: ''
    });

    // Fetch contributions
    const fetchContributions = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch('http://localhost:5007/api/contributions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setContributions(data);
            }
        } catch (error) {
            console.error('Failed to fetch contributions:', error);
        }
    };

    // Fetch member payments for a contribution
    const fetchMemberPayments = async (contributionId: string) => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`http://localhost:5007/api/contributions/${contributionId}/payments`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setSelectedContribution(data.contribution);
                setMemberPayments(data.memberPayments);
            } else {
                setError('Failed to fetch member payments');
            }
        } catch (error) {
            console.error('Failed to fetch member payments:', error);
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    // Create new contribution
    const handleCreateContribution = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch('http://localhost:5007/api/contributions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    amountPerPerson: parseFloat(formData.amountPerPerson),
                    startDate: formData.startDate,
                    endDate: formData.endDate
                })
            });

            if (response.ok) {
                const newContribution = await response.json();
                setContributions(prev => [newContribution, ...prev]);
                setFormData({ title: '', description: '', amountPerPerson: '', startDate: '', endDate: '' });
                alert('Contribution created successfully!');
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to create contribution');
            }
        } catch (error) {
            console.error('Failed to create contribution:', error);
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    // Open add payment modal
    const handleOpenAddPaymentModal = (member: MemberPayment) => {
        if (!selectedContribution) return;
        const remainingAmount = selectedContribution.amountPerPerson - member.amountPaid;
        if (remainingAmount <= 0) return;

        setSelectedMemberForPayment(member);
        setIsAddPaymentModalOpen(true);
    };

    // Handle modal submit
    const handleModalSubmit = async (amount: number, notes: string) => {
        if (!selectedMemberForPayment || !selectedContribution) return;

        setPaymentLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Authentication required. Please log in again.');
                return;
            }

            const response = await fetch(`http://localhost:5007/api/contributions/${selectedContribution._id}/payments/${selectedMemberForPayment.userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ amount, notes })
            });

            if (response.ok) {
                const result = await response.json();
                // Update the member payments list
                setMemberPayments(prev => prev.map(member =>
                    member.userId === selectedMemberForPayment.userId
                        ? {
                            ...member,
                            payment: result.payment,
                            isPaid: result.payment.isPaid,
                            amountPaid: result.payment.amountPaid,
                            paymentHistory: result.payment.paymentHistory,
                            datePaid: result.payment.datePaid
                        }
                        : member
                ));
                setIsAddPaymentModalOpen(false);
                setSelectedMemberForPayment(null);
                alert('Payment added successfully!');
            } else if (response.status === 403) {
                const errorData = await response.json();
                alert(`Access denied: ${errorData.message}\n\nOnly Secretary role can manage contributions and payments.`);
            } else {
                const errorData = await response.json();
                alert(`Failed to add payment: ${errorData.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Failed to add payment:', error);
            alert('Network error. Please check your connection and try again.');
        } finally {
            setPaymentLoading(false);
        }
    };

    // Mark payment as paid
    const handleMarkAsPaid = async (userId: string, amountPaid: number) => {
        if (!selectedContribution) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`http://localhost:5007/api/contributions/${selectedContribution._id}/payments/${userId}/mark-paid`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ amount: amountPaid })
            });

            if (response.ok) {
                const result = await response.json();
                // Update the member payments list
                setMemberPayments(prev => prev.map(member =>
                    member.userId === userId
                        ? {
                            ...member,
                            payment: result.payment,
                            isPaid: result.payment.isPaid,
                            amountPaid: result.payment.amountPaid,
                            paymentHistory: result.payment.paymentHistory,
                            datePaid: result.payment.datePaid
                        }
                        : member
                ));
                alert('Payment marked as paid!');
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Failed to mark payment');
            }
        } catch (error) {
            console.error('Failed to mark payment:', error);
            alert('Network error');
        }
    };

    useEffect(() => {
        fetchContributions();
    }, []);

    return (
        <div className="min-h-full bg-ahava-background">
            <Header
                breadcrumbs={['Dashboard']}
                title="Finance"
                titleIcon={<BuildingIcon className="h-6 w-6" />}
                onMenuClick={onMenuClick}
            />

            <div className="p-4 md:p-8">
                {/* Tabs */}
                <div className="flex space-x-1 mb-6">
                    <button
                        onClick={() => setActiveTab('setup')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            activeTab === 'setup'
                                ? 'bg-ahava-purple-dark text-white'
                                : 'bg-ahava-surface text-gray-300 hover:bg-ahava-purple-medium'
                        }`}
                    >
                        Setup Contribution
                    </button>
                    <button
                        onClick={() => setActiveTab('tracking')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            activeTab === 'tracking'
                                ? 'bg-ahava-purple-dark text-white'
                                : 'bg-ahava-surface text-gray-300 hover:bg-ahava-purple-medium'
                        }`}
                    >
                        Track Payments
                    </button>
                </div>

                {activeTab === 'setup' && (
                    <div className="bg-ahava-surface rounded-lg shadow-md p-6 border border-ahava-purple-dark">
                        <h3 className="text-xl font-bold text-gray-100 mb-4">Create New Contribution</h3>

                        {error && (
                            <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded mb-4">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleCreateContribution} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Contribution Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full px-3 py-2 bg-ahava-purple-dark border border-ahava-purple-medium rounded-md text-gray-200 focus:outline-none focus:ring-ahava-magenta focus:border-ahava-magenta"
                                    placeholder="e.g., Christmas Celebration Fund"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full px-3 py-2 bg-ahava-purple-dark border border-ahava-purple-medium rounded-md text-gray-200 focus:outline-none focus:ring-ahava-magenta focus:border-ahava-magenta"
                                    rows={3}
                                    placeholder="Optional description..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Amount per Person (RWF) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={formData.amountPerPerson}
                                    onChange={(e) => setFormData(prev => ({ ...prev, amountPerPerson: e.target.value }))}
                                    className="w-full px-3 py-2 bg-ahava-purple-dark border border-ahava-purple-medium rounded-md text-gray-200 focus:outline-none focus:ring-ahava-magenta focus:border-ahava-magenta"
                                    placeholder="5000"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Start Date *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.startDate}
                                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                        className="w-full px-3 py-2 bg-ahava-purple-dark border border-ahava-purple-medium rounded-md text-gray-200 focus:outline-none focus:ring-ahava-magenta focus:border-ahava-magenta"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        End Date *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.endDate}
                                        onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                        className="w-full px-3 py-2 bg-ahava-purple-dark border border-ahava-purple-medium rounded-md text-gray-200 focus:outline-none focus:ring-ahava-magenta focus:border-ahava-magenta"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-ahava-purple-dark text-white font-semibold py-2 px-4 rounded-lg hover:bg-ahava-purple-medium transition-colors disabled:opacity-50 disabled:cursor-wait"
                            >
                                {loading ? 'Creating...' : 'Create Contribution'}
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'tracking' && (
                    <div className="space-y-6">
                        {/* Select Contribution */}
                        <div className="bg-ahava-surface rounded-lg shadow-md p-6 border border-ahava-purple-dark">
                            <h3 className="text-xl font-bold text-gray-100 mb-4">Select Contribution to Track</h3>

                            {contributions.length === 0 ? (
                                <p className="text-gray-400">No contributions found. Create one first.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {contributions.map(contribution => (
                                        <button
                                            key={contribution._id}
                                            onClick={() => fetchMemberPayments(contribution._id)}
                                            className={`p-4 rounded-lg border text-left transition-colors ${
                                                selectedContribution?._id === contribution._id
                                                    ? 'border-ahava-magenta bg-ahava-purple-dark text-white'
                                                    : 'border-ahava-purple-medium bg-ahava-background text-gray-200 hover:border-ahava-purple-light'
                                            }`}
                                        >
                                            <h4 className="font-semibold">{contribution.title}</h4>
                                            <p className="text-sm text-gray-400 mt-1">
                                                {contribution.amountPerPerson.toLocaleString()} RWF per person
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {new Date(contribution.startDate).toLocaleDateString()} - {new Date(contribution.endDate).toLocaleDateString()}
                                            </p>
                                            <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                                                contribution.status === 'active'
                                                    ? 'bg-green-900/30 text-green-400'
                                                    : 'bg-gray-900/30 text-gray-400'
                                            }`}>
                                                {contribution.status}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Member Payments */}
                        {selectedContribution && (
                            <div className="bg-ahava-surface rounded-lg shadow-md p-6 border border-ahava-purple-dark">
                                <h3 className="text-xl font-bold text-gray-100 mb-4">
                                    Payment Status for "{selectedContribution.title}"
                                </h3>

                                {loading ? (
                                    <p className="text-center text-gray-400">Loading...</p>
                                ) : error ? (
                                    <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded">
                                        {error}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {memberPayments.map(member => {
                                            const remainingAmount = selectedContribution.amountPerPerson - member.amountPaid;
                                            const hasPartialPayments = member.paymentHistory && member.paymentHistory.length > 0;

                                            return (
                                                <div key={member.userId} className="p-4 bg-ahava-background rounded-lg border border-ahava-purple-dark/50">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div>
                                                            <h4 className="font-medium text-gray-100">{member.name}</h4>
                                                            <p className="text-sm text-gray-400">{member.email}</p>
                                                        </div>

                                                        <div className="text-right">
                                                            {member.isPaid ? (
                                                                <span className="text-green-400 font-semibold">Fully Paid ✅</span>
                                                            ) : (
                                                                <span className="text-orange-400 font-semibold">
                                                                    {remainingAmount.toLocaleString()} RWF Remaining
                                                                </span>
                                                            )}
                                                            <p className="text-xs text-gray-400 mt-1">
                                                                Total Paid: {member.amountPaid.toLocaleString()} RWF
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Payment History */}
                                                    {hasPartialPayments && (
                                                        <div className="mb-3">
                                                            <h5 className="text-sm font-medium text-gray-300 mb-2">Payment History</h5>
                                                            <div className="space-y-1 max-h-32 overflow-y-auto">
                                                                {member.paymentHistory.map((record, index) => (
                                                                    <div key={record._id || index} className="flex justify-between text-xs text-gray-400 bg-ahava-purple-dark/30 px-2 py-1 rounded">
                                                                        <span>{new Date(record.datePaid).toLocaleDateString()}</span>
                                                                        <span>{record.amount.toLocaleString()} RWF</span>
                                                                        {record.notes && <span className="text-gray-500">({record.notes})</span>}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Action Buttons */}
                                                    {!member.isPaid && (
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => handleOpenAddPaymentModal(member)}
                                                                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                                                            >
                                                                Add Payment
                                                            </button>
                                                            <button
                                                                onClick={() => handleMarkAsPaid(member.userId, remainingAmount)}
                                                                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                                                            >
                                                                Mark Fully Paid
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Add Payment Modal */}
            <AddPaymentModal
                isOpen={isAddPaymentModalOpen}
                onClose={() => {
                    setIsAddPaymentModalOpen(false);
                    setSelectedMemberForPayment(null);
                }}
                onSubmit={handleModalSubmit}
                memberName={selectedMemberForPayment?.name || ''}
                remainingAmount={selectedMemberForPayment && selectedContribution
                    ? selectedContribution.amountPerPerson - selectedMemberForPayment.amountPaid
                    : 0}
                isLoading={paymentLoading}
            />
        </div>
    );
};
