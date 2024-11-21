# Live Docs

![Live Docs](https://github.com/user-attachments/assets/eaaeb1f0-22da-46be-9e29-9bef70e0039d)

## Overview

Live Docs is a collaborative document editing platform designed to streamline your workflow. Whether you're managing projects, sharing notes, or working on documents with a team, Live Docs provides real-time collaboration, a robust folder and document management system, and an intuitive user experience.

## Features

- **Collaborative Editing:** Work on documents simultaneously with team members using real-time updates.
- **Folder and Document Management:** Organize your content with support for folders, subfolders, and document structures.
- **User Roles and Permissions:** Control who can view, edit, or manage documents with customizable permissions.
- **Real-Time Notifications:** Stay updated on changes, comments, and alerts instantly.
- **Responsive Design:** Seamlessly use the app across devices.

## Tech Stack

The project is built with the following technologies:

1. **[Next.js](https://nextjs.org/):** A powerful React framework for server-side rendering and static site generation.
2. **[Shadcn & Tailwind CSS](https://shadcn.dev/):** A combination of UI components and utility-first styling for a clean and responsive design.
3. **[TypeScript](https://www.typescriptlang.org/):** For strong type safety and enhanced developer experience.
4. **[MongoDB](https://www.mongodb.com/):** A NoSQL database to store user data, folders, and documents efficiently.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/MOHAMED-EHAB-DEV/live-docs.git
   cd live-docs
   ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Set up your .env file with the required variables:
    ```env
    LIVEBLOCKS_SECRET_KEY=YOUR-LIVEBLOCKS-TOKEN
    
    SENTRY_AUTH_TOKEN=YOUR-SENTRY-TOKEN

    NEXT_PUBLIC_URL=http://localhost:3000
    NEXTAUTH_URL=http://localhost:3000

    NEXTAUTH_SECRET=YOUR-SECRET

    GOOGLE_CLIENT_ID=YOUR-GOOGLE-CLIENT-ID

    MONGODB_URI=YOUR-MONGODB-URI

    UPLOADTHING_TOKEN=YOUR-UPLOAD-THING-TOKEN

    ```
4. Start the development server:
    ```bash
    npm run dev
    ```
5. Visit the app in your browser at http://localhost:3000.

<h1>Contributing</h1>

Contributions are welcome! Feel free to open issues or submit pull requests to improve the app. Make sure to follow the [contribution guidelines](https://github.com/MOHAMED-EHAB-DEV/live-docs/blob/main/CONTRIBUTING.md).

<h1>License</h1>

This project is licensed under the MIT License.

Developed with ❤️ using Next.js, Tailwind CSS, TypeScript, and MongoDB.