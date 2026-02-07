# GitHub & LeetCode Stats Showcase

A premium, modern web application to display your GitHub and LeetCode statistics in a single, beautiful dashboard. Built with **React**, **Tailwind CSS**, and **Node.js**.

## 🚀 Features

*   **Unified Dashboard**: View GitHub and LeetCode stats side-by-side.
*   **GitHub Insights**:
    *   Profile overview (Followers, Following, Bio).
    *   Total Public Repositories & Total Stars (from top repos).
    *   **Contribution Heatmap**: A visual representation of your daily contributions (similar to GitHub's profile) with custom styling.
    *   **Top Repositories**: Display your most popular repos with language colors, stars, and forks.
*   **LeetCode Statistics**:
    *   Total Problems Solved.
    *   Breakdown by difficulty (Easy, Medium, Hard) with progress bars.
    *   Custom LeetCode-themed UI.
*   **Modern UI/UX**:
    *   **Dark Mode**: Sleek dark theme using GitHub's color palette.
    *   **Responsive Design**: Fully responsive layout for mobile and desktop.
    *   **Animations**: Smooth fade-in effects and transitions.

## 🛠️ Tech Stack

### Frontend
*   **React**: Core framework for building the user interface.
*   **Vite**: Next-generation frontend tooling for fast development and building.
*   **Tailwind CSS**: Utility-first CSS framework for rapid and custom styling.

### Backend
*   **Node.js & Express**: Lightweight server to handle API requests.
*   **GitHub GraphQL API**: Fetches detailed user and repository data.
*   **LeetCode GraphQL API**: Fetches user problem-solving stats.

## ⚙️ Prerequisites

*   **Node.js** (v18 or higher recommended)
*   **GitHub CLI (`gh`)**: Required for secure authentication to the GitHub API.
    *   Install: [https://cli.github.com/](https://cli.github.com/)
    *   Login: Run `gh auth login` in your terminal.

## 📦 Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/karthikkondagurla/dev-dashboard.git
    cd dev-dashboard
    ```

2.  **Install Dependencies**
    *   **Backend**:
        ```bash
        npm install
        ```
    *   **Frontend**:
        ```bash
        cd client
        npm install
        ```

3.  **Start the Application**

    You need to run both the backend (API) and frontend (UI).

    *   **Backend** (Terminal 1):
        ```bash
        # From root directory
        node server.js
        ```
        *Server runs on `http://localhost:3000`*

    *   **Frontend** (Terminal 2):
        ```bash
        # From client directory
        cd client
        npm run dev
        ```
        *App runs on `http://localhost:5173`*

4.  **Open in Browser**
    Visit **[http://localhost:5173](http://localhost:5173)** to see your dashboard!

## 📂 Project Structure

```
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components (Heatmap, StatsGrid, etc.)
│   │   ├── App.jsx         # Main application logic
│   │   └── index.css       # Tailwind directives
│   ├── tailwind.config.js  # Tailwind configuration (custom colors)
│   └── vite.config.js      # Vite config (API proxy)
├── public/                 # (Legacy static files)
├── server.js               # Express API Server
├── query.graphql           # GitHub GraphQL query
├── leetcode_query.graphql  # LeetCode GraphQL query
└── package.json            # Backend dependencies
```

## 🔒 Security Note
This application uses your local `gh` CLI credentials to authenticate with GitHub. The token is fetched securely at runtime and is **never** hardcoded or stored in the repository.

---
*Created by [Karthik Kondagurla](https://github.com/karthikkondagurla)*
