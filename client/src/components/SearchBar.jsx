import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
    const [username, setUsername] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (username.trim()) {
            onSearch(username.trim());
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto mb-8">
            <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter GitHub username..."
                className="flex-1 bg-card-bg border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-accent transition-colors"
            />
            <button
                type="submit"
                className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-opacity flex items-center justify-center"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
            </button>
        </form>
    );
};

export default SearchBar;
