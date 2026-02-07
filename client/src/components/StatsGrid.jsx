import React from 'react';

const StatsGrid = ({ data }) => {
    if (!data) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-card-bg p-6 rounded-xl border border-border text-center transition-transform hover:-translate-y-1 hover:shadow-lg">
                <h3 className="text-text-secondary text-sm uppercase tracking-wider mb-2">Public Repos</h3>
                <p className="text-3xl font-bold text-text-primary">{data.public_repos}</p>
            </div>
            <div className="bg-card-bg p-6 rounded-xl border border-border text-center transition-transform hover:-translate-y-1 hover:shadow-lg">
                <h3 className="text-text-secondary text-sm uppercase tracking-wider mb-2">Top Repos Stars</h3>
                <p className="text-3xl font-bold text-text-primary">{data.total_stars}</p>
            </div>
        </div>
    );
};

export default StatsGrid;
