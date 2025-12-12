


import React from 'react';
import { CodeIcon, MenuIcon } from './Icons';

interface HeaderProps {
    breadcrumbs: string[];
    title: string;
    titleIcon: React.ReactNode;
    actionButton?: React.ReactNode;
    children?: React.ReactNode;
    onMenuClick?: () => void;
}

export const Header = ({ breadcrumbs, title, titleIcon, actionButton, children, onMenuClick }: HeaderProps) => (
    <header className="bg-ahava-surface p-4 border-b border-ahava-purple-dark sticky top-0 z-20 md:static">
        <div className="flex justify-between items-center w-full">
            <div className="flex items-center">
                 <button onClick={onMenuClick} className="md:hidden mr-3 p-1 text-gray-400 hover:text-white" aria-label="Open menu">
                    <MenuIcon className="h-6 w-6"/>
                 </button>
                <div>
                    <p className="text-sm text-gray-400 hidden sm:block">{breadcrumbs.join(' > ')}</p>
                    <div className="flex items-center mt-2">
                        <span className="text-gray-400 mr-3">{titleIcon}</span>
                        <h1 className="text-2xl font-bold text-gray-100">{title}</h1>
                        {children}
                    </div>
                </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
                 {actionButton}
                <div className="flex items-center space-x-3 text-gray-400">
                    <button className="hover:text-white relative">
                        <CodeIcon />
                        <span className="absolute -top-1 -right-1.5 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">1</span>
                    </button>
                    <img src="https://picsum.photos/id/237/200/200" alt="User" className="w-9 h-9 rounded-full" />
                </div>
            </div>
        </div>
    </header>
);