const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
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

// Get LeetCode stats for a specific user
app.get('/api/leetcode/:username', async (req, res) => {
    const username = req.params.username;

    let query;
    try {
        query = fs.readFileSync(path.join(__dirname, 'leetcode_query.graphql'), 'utf8');
    } catch (err) {
        return res.status(500).json({ error: 'Failed to read LeetCode query file' });
    }

    try {
        const response = await fetch('https://leetcode.com/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            body: JSON.stringify({
                query: query,
                variables: { username: username }
            }),
        });

        if (!response.ok) {
            throw new Error(`LeetCode API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data.errors) {
            return res.status(404).json({ error: data.errors[0].message });
        }

        if (!data.data || !data.data.matchedUser) {
            return res.status(404).json({ error: 'LeetCode user not found' });
        }

        const user = data.data.matchedUser;
        const allQuestions = data.data.allQuestionsCount;
        const solved = user.submitStats.acSubmissionNum;

        // Helper to find count by difficulty
        const getSolved = (diff) => solved.find(s => s.difficulty === diff)?.count || 0;
        const getTotal = (diff) => allQuestions.find(q => q.difficulty === diff)?.count || 0;

        const stats = {
            username: user.username,
            ranking: user.profile.ranking,
            totalSolved: getSolved('All'),
            totalQuestions: getTotal('All'),
            easySolved: getSolved('Easy'),
            easyTotal: getTotal('Easy'),
            mediumSolved: getSolved('Medium'),
            mediumTotal: getTotal('Medium'),
            hardSolved: getSolved('Hard'),
            hardTotal: getTotal('Hard'),
        };

        res.json(stats);

    } catch (error) {
        console.error('LeetCode Fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch LeetCode data: ' + error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// MCP Client Setup
let mcpClient = null;

async function initMcpClient() {
    if (mcpClient) return mcpClient;
    try {
        const { Client } = await import('@modelcontextprotocol/sdk/client/index.js');
        const { StdioClientTransport } = await import('@modelcontextprotocol/sdk/client/stdio.js');

        const transport = new StdioClientTransport({
            command: 'npx',
            args: ['-y', '@upstash/context7-mcp']
        });

        const client = new Client({
            name: "dev-dashboard-client",
            version: "1.0.0",
        }, {
            capabilities: {}
        });

        await client.connect(transport);
        mcpClient = client;
        console.log('Connected to Context7 MCP');
    } catch (error) {
        console.error('Failed to connect to Context7 MCP:', error);
    }
    return mcpClient;
}

// Initialize MCP on startup
initMcpClient();

app.get('/api/mcp/tools', async (req, res) => {
    try {
        const client = await initMcpClient();
        if (!client) return res.status(503).json({ error: 'MCP client unavailable' });

        const tools = await client.listTools();
        res.json(tools);
    } catch (error) {
        console.error('MCP List Tools Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/mcp/call', express.json(), async (req, res) => {
    try {
        const client = await initMcpClient();
        if (!client) return res.status(503).json({ error: 'MCP client unavailable' });

        const { name, args } = req.body;
        const result = await client.callTool({
            name,
            arguments: args || {}
        });
        res.json(result);
    } catch (error) {
        console.error('MCP Call Tool Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Ollama Proxy
app.post('/api/llm/chat', express.json(), async (req, res) => {
    const { prompt, context } = req.body;
    const model = 'gemma3:1b';

    let fullPrompt = prompt;
    if (context) {
        fullPrompt = `Context:\n${context}\n\nQuestion:\n${prompt}\n\nAnswer:`;
    }

    try {
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: model,
                prompt: fullPrompt,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.statusText}`);
        }

        const data = await response.json();
        res.json({ response: data.response });

    } catch (error) {
        console.error('Ollama Chat Error:', error);
        res.status(500).json({ error: error.message });
    }
});
