# Pace Tracker

A quick and simple web-based pace tracker. Uses the browser's `localStorage` to store timestamps and computes the average time between button presses. Built as a PWA with React, TypeScript, Vite, and Vite PWA.

## Prerequisites

- **Node.js** 18+ (for npm/npx and ES module support)
- **npm** (comes with Node.js)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Development

Run the Vite dev server with hot module replacement:

```bash
npm run dev
```

This starts a local dev server (typically at `http://localhost:5173`).

### 3. Build

Create a production-ready build:

```bash
npm run build
```

Output goes to the `dist/` directory.

### 4. Preview Production Build

Preview the built output locally:

```bash
npm run preview
```

## Testing

The project uses **Vitest** with a `jsdom` environment for DOM testing.

### Run all tests

```bash
npm test
```

### Watch mode

```bash
npm run test:watch
```

### Run with UI

```bash
npx vitest --ui
```

## CI/CD

A GitHub Actions workflow is configured at `.github/workflows/deploy.yml` for automated deployment.
