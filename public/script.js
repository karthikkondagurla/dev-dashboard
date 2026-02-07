const searchBtn = document.getElementById('searchBtn');
const usernameInput = document.getElementById('usernameInput');
const statsContainer = document.getElementById('statsContainer');
const loading = document.getElementById('loading');
const errorDiv = document.getElementById('error');

// Event Listeners
searchBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    if (username) fetchStats(username);
});

usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const username = usernameInput.value.trim();
        if (username) fetchStats(username);
    }
});

// Initial Load: Fetch current auth user
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/user');
        if (response.ok) {
            const data = await response.json();
            usernameInput.value = data.username;
            fetchStats(data.username);
        }
    } catch (err) {
        console.log('No default user found or server error');
    }
});

async function fetchStats(username) {
    showLoading(true);
    hideError();
    statsContainer.classList.add('hidden');

    try {
        const response = await fetch(`/api/stats/${username}`);
        if (!response.ok) throw new Error('User not found or API error');

        const data = await response.json();
        renderStats(data);
        statsContainer.classList.remove('hidden');

        // Fetch LeetCode Stats (Assuming same username for now, or we could add a separate input)
        fetchLeetCodeStats(username);

    } catch (err) {
        showError(err.message);
    } finally {
        showLoading(false);
    }
}

async function fetchLeetCodeStats(username) {
    const lcSection = document.getElementById('leetcodeSection');
    try {
        const response = await fetch(`/api/leetcode/${username}`);
        if (!response.ok) {
            lcSection.classList.add('hidden');
            return;
        }

        const data = await response.json();
        renderLeetCodeStats(data);
        lcSection.classList.remove('hidden');
    } catch (err) {
        console.log('LeetCode fetch failed:', err);
        lcSection.classList.add('hidden');
    }
}

function renderLeetCodeStats(data) {
    document.getElementById('lcTotal').textContent = data.totalSolved;
    document.getElementById('lcTotalQuestions').textContent = data.totalQuestions;

    // Easy
    document.getElementById('lcEasy').textContent = data.easySolved;
    document.getElementById('lcEasyTotal').textContent = data.easyTotal;
    document.getElementById('lcEasyBar').style.width = `${(data.easySolved / data.easyTotal) * 100}%`;

    // Medium
    document.getElementById('lcMedium').textContent = data.mediumSolved;
    document.getElementById('lcMediumTotal').textContent = data.mediumTotal;
    document.getElementById('lcMediumBar').style.width = `${(data.mediumSolved / data.mediumTotal) * 100}%`;

    // Hard
    document.getElementById('lcHard').textContent = data.hardSolved;
    document.getElementById('lcHardTotal').textContent = data.hardTotal;
    document.getElementById('lcHardBar').style.width = `${(data.hardSolved / data.hardTotal) * 100}%`;
}

function renderStats(data) {
    // Profile Header
    document.getElementById('avatar').src = data.avatar_url;
    document.getElementById('name').textContent = data.name || data.username;
    document.getElementById('username').textContent = `@${data.username}`;
    document.getElementById('bio').textContent = data.bio || 'No bio available';
    document.getElementById('followers').textContent = data.followers;
    document.getElementById('following').textContent = data.following;

    // Stats Grid
    document.getElementById('publicRepos').textContent = data.public_repos;
    document.getElementById('totalStars').textContent = data.total_stars;

    // Render Heatmap
    renderHeatmap(data.contribution_calendar);

    // Repos Grid
    const reposGrid = document.getElementById('reposGrid');
    reposGrid.innerHTML = '';

    data.top_repos.forEach(repo => {
        const card = document.createElement('div');
        card.className = 'repo-card';

        card.innerHTML = `
            <div class="repo-header">
                <a href="${repo.html_url}" target="_blank" class="repo-name">${repo.name}</a>
                <p class="repo-desc">${repo.description || 'No description'}</p>
            </div>
            <div class="repo-stats">
                ${repo.language ? `<span><span class="language-dot" style="background-color: ${repo.languageColor || '#fff'}"></span>${repo.language}</span>` : ''}
                <span>★ ${repo.stargazerCount}</span>
                <span>⑂ ${repo.forksCount}</span>
            </div>
        `;
        reposGrid.appendChild(card);
    });
}

function renderHeatmap(calendar) {
    const container = document.getElementById('heatmapContainer');
    container.innerHTML = '';

    calendar.weeks.forEach(week => {
        const weekCol = document.createElement('div');
        weekCol.className = 'heatmap-week';

        week.contributionDays.forEach(day => {
            const dayDiv = document.createElement('div');
            dayDiv.className = `heatmap-day level-${getLevel(day.contributionCount)}`;
            dayDiv.title = `${day.contributionCount} contributions on ${day.date}`;
            weekCol.appendChild(dayDiv);
        });

        container.appendChild(weekCol);
    });
}

function getLevel(count) {
    if (count === 0) return 0;
    if (count <= 3) return 1;
    if (count <= 6) return 2;
    if (count <= 9) return 3;
    return 4;
}

function showLoading(isLoading) {
    if (isLoading) {
        loading.classList.remove('hidden');
    } else {
        loading.classList.add('hidden');
    }
}

function showError(msg) {
    errorDiv.classList.remove('hidden');
    errorDiv.querySelector('.error-msg').textContent = msg;
}

function hideError() {
    errorDiv.classList.add('hidden');
}
