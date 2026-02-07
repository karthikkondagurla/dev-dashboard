import React from 'react';

const RepoList = ({ repos }) => {
    if (!repos || repos.length === 0) return null;

    return (
        <section className="animate-fade-in">
            <h3 className="text-xl font-semibold mb-4 text-text-primary border-l-4 border-accent pl-3">Top Repositories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {repos.map((repo) => (
                    <div key={repo.name} className="bg-card-bg p-6 rounded-xl border border-border transition-all hover:-translate-y-1 hover:shadow-lg flex flex-col h-full">
                        <div className="flex-1">
                            <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="text-lg font-bold text-accent hover:underline mb-2 block truncate">
                                {repo.name}
                            </a>
                            <p className="text-text-secondary text-sm mb-4 line-clamp-3">
                                {repo.description || 'No description'}
                            </p>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-text-secondary mt-auto pt-4 border-t border-border">
                            {repo.language && (
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: repo.languageColor || '#fff' }}></span>
                                    {repo.language}
                                </span>
                            )}
                            <span className="flex items-center gap-1">★ {repo.stargazerCount}</span>
                            <span className="flex items-center gap-1">⑂ {repo.forksCount}</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default RepoList;
