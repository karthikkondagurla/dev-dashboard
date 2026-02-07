import React from 'react';

const Heatmap = ({ calendar }) => {
    if (!calendar || !calendar.weeks) return null;

    const getLevel = (count) => {
        if (count === 0) return 0;
        if (count <= 3) return 1;
        if (count <= 6) return 2;
        if (count <= 9) return 3;
        return 4;
    };

    return (
        <div className="mb-8 animate-fade-in">
            <h3 className="text-xl font-semibold mb-4 text-text-primary border-l-4 border-accent pl-3">Contribution Heatmap</h3>
            <div className="bg-card-bg p-6 rounded-xl border border-border overflow-hidden">
                <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-accent scrollbar-track-card-bg">
                    {calendar.weeks.map((week, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-1">
                            {week.contributionDays.map((day, dayIndex) => {
                                const level = getLevel(day.contributionCount);
                                // Map level to tailwind color class
                                const colorClass = {
                                    0: 'bg-heatmap-0',
                                    1: 'bg-heatmap-1',
                                    2: 'bg-heatmap-2',
                                    3: 'bg-heatmap-3',
                                    4: 'bg-heatmap-4',
                                }[level];

                                return (
                                    <div
                                        key={day.date}
                                        className={`w-3 h-3 rounded-sm ${colorClass} hover:ring-1 hover:ring-text-primary transition-all relative group`}
                                        title={`${day.contributionCount} contributions on ${day.date}`}
                                    >
                                        {/* Tooltip could be added here if needed, but 'title' attribute works for basic needs */}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Heatmap;
