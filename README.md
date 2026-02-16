# Endoscopy Report System

An Electron-based desktop application for endoscopy and colonoscopy procedures. It captures live video from a camera, records procedures, takes snapshots, and generates PDF reports with patient and findings data.

## Features

- **Patient Information Form** – Enter patient ID, name, age, gender, practitioner, and procedure date
- **Live Camera Recording** – Capture video from a connected camera (e.g., endoscopy device)
- **Snapshot Capture** – Take still images during the procedure (Enter key shortcut)
- **Report Generation** – Create PDF reports with patient details and findings
- **Image Selection** – Review and select images for inclusion in the report
- **Import from USB** – Load images from USB storage
- **Settings** – Configure archive path for saved videos and images

## Tech Stack

- **Electron** – Desktop app shell
- **React** – UI (Vite + React 18)
- **MUI (Material UI)** – Components and layout
- **Vite** – Dev server and bundling for the React UI
- **MediaRecorder / getUserMedia** – Camera capture and video recording

## Prerequisites

- **Node.js** 18 or later
- **npm** (comes with Node.js)

## Installation

```bash
npm install
```

## How to Run

### Development (React UI)

The app uses Vite for the React frontend. You need two terminals:

**Terminal 1 – Start Vite dev server**

```bash
npm run vite
```

This starts the Vite dev server at `http://localhost:5173`.

**Terminal 2 – Start Electron**

```bash
npm run electron-dev
```

Electron opens and loads the React app from the Vite dev server. You can hot-reload during development.

### Legacy Mode

To run without the Vite dev server (uses the legacy HTML/JS UI):

```bash
npm run start
```

> **Note:** The main React-based workflow is intended for development with `npm run vite` + `npm run electron-dev`.

## Build for Production

Build packaged apps for macOS, Windows, and Linux:

```bash
npm run build
```

Platform-specific builds:

```bash
npm run build-mac    # macOS (darwin)
npm run build-win32  # Windows 32-bit
npm run build-win64  # Windows 64-bit
npm run build-linux  # Linux
```

Output is placed in the `build/` directory.

## Project Structure

```
├── src/
│   ├── main.js          # Electron main process
│   ├── main.jsx         # React entry point
│   ├── app.jsx          # Root React component
│   ├── index.html       # Vite HTML template (project root)
│   ├── components/      # React components
│   ├── contexts/        # React context (AppContext)
│   ├── hooks/           # Custom hooks (e.g. useScreenRecording)
│   ├── pages/           # Page components (PatientForm, RecordingPage, etc.)
│   └── utils/           # Utilities (e.g. pdfGenerator)
├── index.html           # Vite entry HTML
├── vite.config.js       # Vite configuration
└── package.json
```

## License

[BSD](LICENSE)

## Author

Ali Keshvari
