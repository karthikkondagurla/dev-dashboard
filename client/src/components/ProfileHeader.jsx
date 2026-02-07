import React from 'react';

const ProfileHeader = ({ data }) => {
    if (!data) return null;

    return (
        <div className="flex flex-col md:flex-row items-center gap-6 bg-card-bg p-6 rounded-xl border border-border mb-8 animate-fade-in">
            <img
                src={data.avatar_url}
                alt="Avatar"
                className="w-24 h-24 rounded-full border-2 border-accent"
            />
            <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold text-text-primary m-0">{data.name || data.username}</h2>
                <p className="text-accent text-sm mb-2">@{data.username}</p>
                <p className="text-text-secondary mb-4 max-w-lg">{data.bio || 'No bio available'}</p>
                <div className="flex gap-4 justify-center md:justify-start text-sm text-text-secondary">
                    <span><strong className="text-text-primary">{data.followers}</strong> Followers</span>
                    <span><strong className="text-text-primary">{data.following}</strong> Following</span>
                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;
