import React, { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import ProfileHeader from './components/ProfileHeader';
import StatsGrid from './components/StatsGrid';
import LeetCodeStats from './components/LeetCodeStats';
import Heatmap from './components/Heatmap';
import RepoList from './components/RepoList';
import McpChat from './components/McpChat';

function App() {
  const [username, setUsername] = useState('');
  const [data, setData] = useState(null);
  const [leetcodeData, setLeetCodeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initial load: Fetch current auth user
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          const userData = await response.json();
          // Don't auto-search if we want to show the MCP chat first, 
          // but arguably the user still wants their stats. 
          // Let's keep existing behavior.
          handleSearch(userData.username);
        }
      } catch (err) {
        console.log('No default user found or server error');
      }
    };
    fetchCurrentUser();
  }, []);

  const handleSearch = async (user) => {
    setUsername(user);
    setLoading(true);
    setError(null);
    setData(null);
    setLeetCodeData(null);

    try {
      const response = await fetch(`/api/stats/${user}`);
      if (!response.ok) throw new Error('User not found or API error');

      const statsData = await response.json();
      setData(statsData);

      // Fetch LeetCode Stats
      try {
        const lcResponse = await fetch(`/api/leetcode/${user}`);
        if (lcResponse.ok) {
          const lcData = await lcResponse.json();
          setLeetCodeData(lcData);
        }
      } catch (lcErr) {
        console.log('LeetCode fetch failed', lcErr);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            GitHub Stats Showcase
          </h1>
          <SearchBar onSearch={handleSearch} />

          <div className="mt-8">
            <McpChat />
          </div>
        </header>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-border border-t-accent rounded-full animate-spin mb-4"></div>
            <p className="text-text-secondary">Fetching data...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-10">
            <p className="text-red-500 text-lg bg-red-500/10 inline-block px-6 py-3 rounded-lg border border-red-500/20">
              {error}
            </p>
          </div>
        )}

        {!loading && !error && data && (
          <main className="animate-fade-in-up">
            <ProfileHeader data={data} />

            <StatsGrid data={data} />

            {leetcodeData && <LeetCodeStats data={leetcodeData} />}

            <Heatmap calendar={data.contribution_calendar} />

            <RepoList repos={data.top_repos} />
          </main>
        )}
      </div>
    </div>
  );
}

export default App;
