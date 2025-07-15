# Coderpad Clone

This is a collaborative code editor built with Next.js, TypeScript, and y-sweet for real-time synchronization. It allows multiple users to code together in a shared environment.

## UI
![Coderpad Clone Screenshot](/screenshot.png)

## Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Real-time Collaboration:** [y-sweet](https://y-sweet.dev/) / [Yjs](https://yjs.dev/)
*   **Code Editor:** [Monaco Editor](https://microsoft.github.io/monaco-editor/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Code Execution:** [Judge0](https://judge0.com/)

## Architecture

The application uses a client-server architecture. The frontend is a Next.js application that uses the App Router. The y-sweet service is used for real-time collaboration, and the Judge0 API is used for code execution.

When a user visits the site, they are redirected to a unique URL with a `doc` query parameter. This `doc` ID is used to create or retrieve a y-sweet document. The client then connects to the y-sweet service to enable real-time collaboration.

The code editor is built using Monaco Editor, and the code is synchronized between users using y-sweet. When a user runs the code, it is sent to a Next.js API route, which then forwards it to the Judge0 API for execution. The output is then displayed to the user.

## Folder Structure

```
.
├── app/
│   ├── api/
│   │   └── sandbox-session/
│   │       └── route.ts  // API route for code execution
│   ├── layout.tsx        // Root layout
│   └── page.tsx          // Main page
├── components/
│   ├── App.tsx           // Main application component
│   ├── CodeEditor.tsx    // Code editor component
│   ├── Header.tsx        // Header component
│   └── ShareLink.tsx     // Component to display and copy the shareable link
├── lib/
│   ├── colors.ts         // Color utilities
│   └── judge0.ts         // Judge0 service
└── public/
    └── ...
```

## Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/MikeLuu99/coderpad-clone.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd coderpad-clone
    ```
3.  Install the dependencies using pnpm:
    ```bash
    pnpm install
    ```

## Running the Application

1.  Start the y-sweet server and the Next.js development server:
    ```bash
    pnpm run dev
    ```
2.  Open your browser and navigate to `http://localhost:3000`.
