# Developer Productivity MVP

This project is a full-stack prototype designed to help developers move from raw metrics to actionable insights. Instead of just showing numbers, it interprets the "story" behind the data to help Individual Contributors (ICs) improve their workflow and delivery health.

## 🚀 Features

- **Core 5 Metrics**: Tracks Lead Time, Cycle Time, Bug Rate, Deployment Frequency, and PR Throughput.
- **Narrative Insights**: Automatically interprets data patterns (e.g., speed vs. quality tradeoffs).
- **Actionable Next Steps**: Provides practical recommendations for professional growth based on current performance.
- **Modern UI**: A premium, responsive dashboard built with React and a glassmorphic design system.

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, Lucide React (Icons), Vanilla CSS (Custom Glassmorphism).
- **Backend**: Node.js, Express.
- **Data Handling**: `xlsx` for parsing the provided assignment workbook.

---

## 🏃‍♂️ How to Run

Follow these steps to launch the application locally:

### 1. Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### 2. Start the Backend

Open a terminal and navigate to the backend directory:

```bash
cd backend
npm install
node index.js
```

The backend server will start at `http://localhost:3000`.

### 3. Start the Frontend

Open a **new** terminal and navigate to the frontend directory:

```bash
cd frontend
npm install
npm run dev
```

Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`).

---
