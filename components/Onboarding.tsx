
import React from 'react';
import { Header } from './Header';
import { MenuIcon, CalendarIcon } from './Icons';
import type { OnboardingTask } from '../types';

const tasks: OnboardingTask[] = [
    { title: 'Member Profile', role: 'Membership Team', type: 'Manual', created: '1 Jan 1970' },
    { title: 'Voice Placement', role: 'Music Team', type: 'Form', formLink: 'form.placements.create', created: '1 Jan 1970' },
    { title: 'Pass Audition', role: 'Music Team', type: 'Manual', created: '1 Jan 1970' },
    { title: 'Pay Fees', role: 'Accounts Team', type: 'Manual', created: '1 Jan 1970' },
    { title: 'Provide Uniform', role: 'Uniforms Team', type: 'Manual', created: '1 Jan 1970' },
    { title: 'Create Account', role: 'Membership Team', type: 'Manual', created: '1 Jan 1970' },
];

interface TaskRowProps {
    task: OnboardingTask;
}

// FIX: Explicitly type component with React.FC to correctly handle the 'key' prop.
const TaskRow: React.FC<TaskRowProps> = ({ task }) => (
    <tr className="border-b border-gray-200">
        <td className="py-4 px-6 font-semibold text-purple-700 hover:underline cursor-pointer">{task.title}</td>
        <td className="py-4 px-6 text-gray-600">{task.role}</td>
        <td className="py-4 px-6 text-gray-600">
            {task.type}
            {task.formLink && <span className="text-xs text-gray-400 ml-2">({task.formLink})</span>}
        </td>
        <td className="py-4 px-6 text-gray-600">
            <div className="flex items-center">
                <CalendarIcon className="mr-2 text-gray-400" />
                {task.created}
            </div>
        </td>
    </tr>
);

const AddNewButton = () => (
    <button className="bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
        Add New
    </button>
);


export const Onboarding = () => {
    return (
        <div className="bg-ahava-background min-h-full">
            <Header 
                breadcrumbs={['Dashboard', 'Tasks']}
                title="Onboarding Tasks"
                titleIcon={<MenuIcon />}
                actionButton={<AddNewButton />}
            />
            <div className="p-8">
                <div className="bg-white rounded-lg shadow-md">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="py-3 px-6">Title</th>
                                <th scope="col" className="py-3 px-6">Role</th>
                                <th scope="col" className="py-3 px-6">Type</th>
                                <th scope="col" className="py-3 px-6">Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.map((task, index) => (
                                <TaskRow key={index} task={task} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};