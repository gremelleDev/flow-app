# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

---

## Development Workflow

This project follows a **Feature Branching** workflow to ensure the `main` branch remains stable and deployable at all times.

1.  **Create a New Branch**: For any new feature or bug fix, create a new, descriptive branch from the `main` branch (e.g., `feat/add-subscribers-api` or `fix/login-page-styles`).
2.  **Develop in Isolation**: All work for the feature should be done on this dedicated branch.
3.  **Open a Pull Request**: Once the feature is complete and tested, open a Pull Request to merge the feature branch back into `main`. This allows for code review and discussion before changes are integrated.
4.  **Preview Deployments**: Cloudflare Pages will automatically generate a unique preview URL for each branch/pull request, allowing us to test changes in a live environment before merging.

## Data & Schema Migration Strategy

As the application evolves, the shape of the data we store in Cloudflare KV will change. We will use the following strategies to manage these changes gracefully.

### 1. Additive Changes
For simple, non-breaking changes (like adding a new, optional field to a JSON object), the application code will be written "defensively." It will check for the existence of the new field before using it, ensuring compatibility with older data records.

### 2. Breaking Changes
For breaking changes (e.g., renaming a field or changing a data type), a more formal migration process will be used. This typically involves writing a one-time migration script (e.g., a temporary Cloudflare Function) to iterate through the database and update all records to the new schema before the new application code is deployed.

### 3. Schema Versioning
As a best practice, we will include a `schemaVersion` number inside the JSON objects we store in KV (e.g., `{ "schemaVersion": 2, ... }`). This allows our code to easily identify the format of a data record and handle it appropriately.

---

## Project Status & Roadmap

### What We've Accomplished So Far
We have successfully built a robust, secure, and well-architected foundation for the application. The groundwork for all future features is now complete.

* **Project Foundation**: We have a modern application built with React, TypeScript, and Vite, deployed on Cloudflare Pages. The backend is powered by serverless Cloudflare Functions with Cloudflare KV as the database.
* **Secure End-to-End Feature**: The "Settings" page is fully functional. It allows for managing multiple email provider configurations, and all sensitive API keys are securely encrypted at rest before being saved.
* **Robust User Authentication**: We have a complete authentication system using Firebase.
    * Users can sign in via a dedicated login page (LoginPage.tsx).
    * User sessions are persistent, meaning users stay logged in even after refreshing the page.
* **Dynamic Role-Based Access Control (RBAC)**: We have a system for "super admin" users.
    * We successfully refactored the backend to be edge-native, replacing the heavy firebase-admin SDK with a lightweight utility (firebase-admin-api.ts) for performance.
    * We have a secure administrative endpoint (/api/set-admin) to assign a superAdmin role to any user.
    * Our frontend (App.tsx) now dynamically reads this role from the user's token and updates the UI accordingly, removing all hardcoded admin flags.
* **Secure Backend API Pattern**: We have established a reusable pattern for securing our backend.
    * We created an authentication middleware (auth-middleware.ts) that verifies Firebase ID Tokens on incoming requests.
    * We successfully applied this middleware to the /api/settings endpoint, removing the hardcoded tenantId and making it truly multi-tenant and secure.
* **Completed UI Polish**: We have implemented a full suite of UI and UX improvements.
    * A functional Logout button and user menu have been added to the TopBar.
    * The user profile icon now dynamically displays the user's initials.
    * The sidebar is now fully responsive, collapsing into a slide-out menu on mobile devices.

### What We're Currently Working On
We have now successfully completed all foundational and initial UI polish tasks. The application is stable, secure, and professional. We are at a clean slate, ready to begin building the core product features.

### Immediate Next Steps
With the application shell complete, our next focus is to begin implementing the Core MVP Features. The most logical place to start is by building out the backend for the Subscribers feature. This will involve:

1.  **Create a Subscribers API Endpoint**: We will create a new file, functions/api/subscribers.ts, to handle all subscriber-related actions.
2.  **Implement GET /api/subscribers**: The first function will be to fetch all subscribers for the logged-in user's tenant. It will use our authenticate middleware and the dynamic tenantId from the user's token.
3.  **Connect the Frontend**: We will update the getSubscribers function in src/utils/api.ts to call this new, real endpoint instead of returning stubbed data.

### Big Milestones We're Aiming For
After completing the Subscribers feature, we will continue building out the rest of the application.

* **Core MVP Features (Completion)**: Build out the Campaigns feature (UI and backend).
    * Implement the Public Subscribe Endpoint for tenant websites.
* **Email Sending Engine**: Develop the core backend logic (likely using Cloudflare Cron Triggers) that will handle the scheduling and sending of all emails based on campaign rules.
* **Full Super Admin Functionality**: Build out the TenantsPage to allow a super admin to view and manage data for different tenants.
* **Future User-Requested Features**:
    * Build a dedicated Sign-up Page to collect a user's full name.
    * Build an Account Settings/Billing Page.