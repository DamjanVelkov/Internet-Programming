# MyLiga - La Liga Hub

A modern, responsive Angular web application for tracking Spanish La Liga football matches, standings, teams, and player statistics.

![Angular](https://img.shields.io/badge/Angular-17.3-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)
![License](https://img.shields.io/badge/License-Academic-green)

## 📋 Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Information](#api-information)

## ✨ Features

- **Home Dashboard** - Live scores, upcoming matches, and recent results at a glance
- **Standings Table** - Complete La Liga standings with team stats (wins, draws, losses, goals, points)
- **Match Details** - Detailed match information including:
  - Live scores and match status
  - Team lineups with player positions
  - Coach information
  - Match statistics (possession, shots, fouls, etc.)
  - Match timeline with goals, cards, and substitutions
- **Team Profiles** - Team details including:
  - Squad roster with player information
  - Recent match results
  - Upcoming fixtures
  - Team statistics
- **Player Statistics** - Top scorers and assists leaders
- **Favorites System** - Save favorite teams and matches for quick access
- **Theme Toggle** - Light and dark mode support
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile

## 📦 Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js** (version 18.x or higher)
  - Download from: https://nodejs.org/
  - Verify installation: `node --version`
  
- **npm** (comes with Node.js)
  - Verify installation: `npm --version`

- **Angular CLI** (version 17.x)
  - Install globally: `npm install -g @angular/cli@17`
  - Verify installation: `ng version`

## 🚀 Installation

1. **Navigate to the project directory**
   ```bash
   cd laliga-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   This will install all required packages defined in `package.json`.

## 🏃 Running the Application

### Development Server

```bash
ng serve
```

Or using npm:

```bash
npm start
```

Then open your browser and navigate to: **http://localhost:4200/**

The application will automatically reload when you make changes to the source files.

### Production Build

```bash
ng build --configuration production
```

Build artifacts will be stored in the `dist/` directory.

## 📁 Project Structure

```
laliga-hub/
├── src/
│   ├── app/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── header/         # Navigation header
│   │   │   ├── footer/         # Page footer
│   │   │   └── shared/         # Shared components (match cards, etc.)
│   │   ├── pages/              # Page components
│   │   │   ├── home/           # Home dashboard
│   │   │   ├── standings/      # League standings
│   │   │   ├── matches/        # Match list
│   │   │   ├── match-detail/   # Match details page
│   │   │   ├── teams/          # Teams list
│   │   │   ├── team-detail/    # Team profile page
│   │   │   ├── stats/          # Player statistics
│   │   │   └── favorites/      # Saved favorites
│   │   ├── services/           # Angular services
│   │   │   ├── sofascore.service.ts    # Main API service
│   │   │   ├── favorites.service.ts    # Favorites management
│   │   │   └── theme.service.ts        # Theme management
│   │   └── models/             # TypeScript interfaces
│   ├── assets/                 # Static assets (images, icons)
│   ├── styles.css              # Global styles
│   └── index.html              # Main HTML file
├── angular.json                # Angular configuration
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
└── README.md                   # This file
```

## 🔌 API Information

This application uses the **SofaScore API** to fetch real-time football data:

- Base URL: `https://api.sofascore.com/api/v1`
- La Liga Tournament ID: `8`

### Key API Endpoints Used:

| Endpoint | Description |
|----------|-------------|
| `/unique-tournament/{id}/season/{seasonId}/standings/total` | League standings |
| `/unique-tournament/{id}/season/{seasonId}/events/...` | Match list by date |
| `/event/{id}` | Match details |
| `/event/{id}/lineups` | Match lineups |
| `/event/{id}/statistics` | Match statistics |
| `/event/{id}/incidents` | Match events (goals, cards) |
| `/team/{id}` | Team information |
| `/team/{id}/players` | Team squad |

### Home Page
The dashboard displays live matches, recent results, and upcoming fixtures.

### Standings
Complete league table with sortable columns.

### Match Detail
Comprehensive match view with lineups, statistics, and timeline.

### Team Profile
Team information with squad roster and fixture list.

---

## 👨‍💻 Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server |
| `npm run build` | Build for production |
| `npm run watch` | Build in watch mode |
| `npm test` | Run unit tests |

### Technologies Used

- **Angular 17** - Frontend framework
- **TypeScript 5.4** - Programming language
- **RxJS** - Reactive programming
- **CSS3** - Styling with CSS variables for theming

---

## 📝 Notes

- The application requires an internet connection to fetch live data from the API
- Some match data (lineups, statistics) may not be available for all matches
- The favorites feature uses browser localStorage for persistence

---

**Developed for Internet Programming Course**
