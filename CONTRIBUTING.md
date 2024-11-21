# Contributing to Live Docs

Thank you for considering contributing to Live Docs! We welcome contributions of all kinds, including bug fixes, feature enhancements, documentation improvements, and more. Follow the guidelines below to help us keep the project organized and efficient.

---

## How Can You Contribute?

### 1. Reporting Bugs
If you find a bug in the app:
- **Search existing issues** to check if the bug has already been reported.
- If not, open a new issue and provide the following details:
  - A clear and descriptive title.
  - Steps to reproduce the issue.
  - Expected and actual behavior.
  - Screenshots or error logs (if applicable).
  
### 2. Suggesting Features
If you have an idea for a feature:
- Open a feature request issue and describe the feature in detail.
- Explain why the feature would be beneficial.
- Include mockups or examples if possible.

### 3. Improving Documentation
- Help us keep our documentation clear and up to date.
- Fix typos, improve explanations, or suggest better examples.

### 4. Contributing Code
- Pick an open issue labeled `help wanted` or `good first issue` to get started.
- If you have your own idea, open a discussion first to ensure it aligns with the project goals.

---

## Development Setup

### Prerequisites
Ensure you have the following tools installed:
- Node.js (>= 16.x)
- npm (or yarn)
- MongoDB

### Steps to Set Up the Project Locally

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

# Submitting Your Contribution

#### 1. Fork the Repo
Fork the repository and create a branch for your changes:
```bash
git checkout -b feature/your-feature-name
```

#### 2. Make Changes
- Follow the project’s code style.
- Test your changes thoroughly.

#### 3. Commit and Push
Commit your changes with a clear message:
```bash
git commit -m "Add feature: your-feature-name"
git push origin feature/your-feature-name
```
#### 4. Create a Pull Request

- Open a pull request from your forked repository to the main repository.
- Provide a detailed description of your changes.
- Reference any relevant issues.

# Code Style Guidelines
- Use Prettier for formatting.
- Follow the ESLint rules defined in the project.

# Need Help?
If you have any questions or need guidance, feel free to open a discussion or contact the maintainers.

Thank you for contributing to Live Docs! 🎉