# Forge Launch Post-Countdown3 Final Project

<<<<<<< HEAD
Hello! This is our final project for Week 1 of the Forge Launch program demonstrating our ability to create a web app with a persistent Firestore database.

## How to View the Website

1. Open a terminal in this project folder.

2. Install dependencies:

```bash
npm install
```

4. Start the local dev server:

=======
This is our Forge Launch Week 1 final project: a school dashboard web app with Firestore-backed people, class, and calendar data, plus S3-hosted profile images.

## Package Dependencies

### Root app (`/`)

- `@emotion/react`
- `@emotion/styled`
- `@mui/icons-material`
- `@mui/material`
- `@mui/x-date-pickers`
- `axios`
- `dayjs`
- `firebase`
- `firebase-admin`
- `react`
- `react-dom`
- `react-router-dom`

### Server (`/server`)

- `@aws-sdk/client-s3`
- `@aws-sdk/s3-request-presigner`
- `axios`
- `cors`
- `dotenv`
- `express`

## How to View the Website

1. Install the root dependencies:

```bash
npm install
```

2. Install the server dependencies:

```bash
cd server
npm install
```

3. Start the backend server in one terminal:

```bash
cd server
node server.js
```

4. Start the frontend in a second terminal from the project root:

>>>>>>> 90abaf0787e3d03d506b9c07a70acea0914337ae
```bash
npm run dev
```

5. Open the local URL shown in the terminal, usually `http://localhost:5173`, in your browser.

<<<<<<< HEAD
If you only want to check the production build locally, run `npm run build` and then `npm run preview`.
=======
## Required Environment Keys

The app relies on Firebase and AWS configuration for some features. If you do not have the Firebase config values or the AWS keys/bucket settings, parts of the app may not work correctly:

- Firestore data loading and saving requires the Firebase client config.
- Profile images require the backend S3 credentials and bucket name in `server/.env`.

If those values are missing, you may still be able to open the app, but database-backed data and image loading may fail.

## Optional Production Preview

If you want to check the production build locally, run:

```bash
npm run build
npm run preview
```
>>>>>>> 90abaf0787e3d03d506b9c07a70acea0914337ae
