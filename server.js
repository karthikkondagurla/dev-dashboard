const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

const { exec } = require('child_process');

// Token will be fetched at startup
let GITHUB_TOKEN = '';

function getAuthToken() {
    return new Promise((resolve, reject) => {
        exec('gh auth token', (error, stdout, stderr) => {
            if (error) {
                console.warn('Could not retrieve token via gh CLI. Ensure you are logged in (gh auth login).');
                resolve(process.env.GITHUB_TOKEN || ''); // Fallback to env var
            } else {
                resolve(stdout.trim());
            }
        });
    });
}

// Initialize token
getAuthToken().then(token => {
    GITHUB_TOKEN = token;
    if (!GITHUB_TOKEN) {
        console.warn('WARNING: No GitHub token found. API calls will likely fail.');
    } else {
        console.log('GitHub token retrieved successfully.');
    }
});

async function fetchGitHubGraphQL(query, variables) {
    if (!GITHUB_TOKEN) {
        throw new Error('No GitHub token available. Please run `gh auth login` or set GITHUB_TOKEN environment variable.');
    }

    const response = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

// Get current authenticated user
app.get('/api/user', async (req, res) => {
    try {
        const query = `query { viewer { login } }`;
        const data = await fetchGitHubGraphQL(query);

        if (data.errors) {
            throw new Error(data.errors[0].message);
        }

        res.json({ username: data.data.viewer.login });
    } catch (error) {
        console.error('Auth check error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get stats for a specific user
app.get('/api/stats/:username', async (req, res) => {
    const username = req.params.username;

    // Read the query file content
    let query;
    try {
        query = fs.readFileSync(path.join(__dirname, 'query.graphql'), 'utf8');
    } catch (err) {
        return res.status(500).json({ error: 'Failed to read query file' });
    }

    try {
        const data = await fetchGitHubGraphQL(query, { login: username });

        if (data.errors) {
            console.error('GraphQL Errors:', data.errors);
            return res.status(404).json({ error: 'GraphQL Error: ' + data.errors[0].message });
        }

        if (!data.data || !data.data.user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = data.data.user;
        const calendar = user.contributionsCollection?.contributionCalendar;

        if (!calendar) {
            console.warn('Contribution calendar missing for', username);
        }

        // Transform data
        const stats = {
            username: user.login,
            name: user.name,
            avatar_url: user.avatarUrl,
            bio: user.bio,
            followers: user.followers.totalCount,
            following: user.following.totalCount,
            public_repos: user.repositories.totalCount,
            total_stars: user.repositories.nodes.reduce((acc, r) => acc + r.stargazerCount, 0),
            top_repos: user.repositories.nodes.map(repo => ({
                name: repo.name,
                html_url: repo.url,
                description: repo.description,
                stargazerCount: repo.stargazerCount,
                forksCount: repo.forkCount,
                language: repo.primaryLanguage ? repo.primaryLanguage.name : null,
                languageColor: repo.primaryLanguage ? repo.primaryLanguage.color : null
            })),
            contribution_calendar: calendar || { weeks: [] } // Fallback to avoid frontend crash
        };

        res.json(stats);

    } catch (error) {
        console.error('Fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch GitHub data: ' + error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
