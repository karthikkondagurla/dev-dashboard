import React from 'react';

const LeetCodeStats = ({ data }) => {
    if (!data) return null;

    return (
        <div className="mb-8 animate-fade-in">
            <h3 className="text-xl font-semibold mb-4 text-text-primary border-l-4 border-accent pl-3">LeetCode Statistics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Total Solved */}
                <div className="bg-card-bg p-6 rounded-xl border border-border text-center flex flex-col justify-center h-full">
                    <h4 className="text-text-secondary text-sm uppercase tracking-wider mb-4">Total Solved</h4>
                    <div className="w-20 h-20 rounded-full border-[5px] border-accent flex items-center justify-center mx-auto mb-2 text-2xl font-bold">
                        {data.totalSolved}
                    </div>
                    <p className="text-xs text-text-secondary">/ {data.totalQuestions}</p>
                </div>

                {/* Easy */}
                <div className="bg-card-bg p-6 rounded-xl border border-border text-center flex flex-col justify-center h-full">
                    <h4 className="text-leetcode-easy text-sm uppercase tracking-wider mb-2">Easy</h4>
                    <p className="mb-3"><strong className="text-text-primary">{data.easySolved}</strong> / <span className="text-text-secondary">{data.easyTotal}</span></p>
                    <div className="h-1.5 bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-leetcode-easy transition-all duration-500" style={{ width: `${(data.easySolved / data.easyTotal) * 100}%` }}></div>
                    </div>
                </div>

                {/* Medium */}
                <div className="bg-card-bg p-6 rounded-xl border border-border text-center flex flex-col justify-center h-full">
                    <h4 className="text-leetcode-medium text-sm uppercase tracking-wider mb-2">Medium</h4>
                    <p className="mb-3"><strong className="text-text-primary">{data.mediumSolved}</strong> / <span className="text-text-secondary">{data.mediumTotal}</span></p>
                    <div className="h-1.5 bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-leetcode-medium transition-all duration-500" style={{ width: `${(data.mediumSolved / data.mediumTotal) * 100}%` }}></div>
                    </div>
                </div>

                {/* Hard */}
                <div className="bg-card-bg p-6 rounded-xl border border-border text-center flex flex-col justify-center h-full">
                    <h4 className="text-leetcode-hard text-sm uppercase tracking-wider mb-2">Hard</h4>
                    <p className="mb-3"><strong className="text-text-primary">{data.hardSolved}</strong> / <span className="text-text-secondary">{data.hardTotal}</span></p>
                    <div className="h-1.5 bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-leetcode-hard transition-all duration-500" style={{ width: `${(data.hardSolved / data.hardTotal) * 100}%` }}></div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default LeetCodeStats;
