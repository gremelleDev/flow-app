# FunnelFlow Project

FunnelFlow is a powerful, multi-tenant SaaS platform designed to simplify email marketing automation. It provides users with the tools to create and manage sophisticated email autoresponder campaigns, handle subscriber lists, and integrate with their preferred email sending services.

The core goal of this project is to offer a flexible and secure email marketing solution for businesses and creators. Each user or organization operates within their own isolated tenant account, ensuring data privacy. A key feature is the ability for users to securely connect their own email providers (e.g., Resend, Brevo) via encrypted API keys, giving them full control over their sending infrastructure and reputation.

Architecturally, FunnelFlow is built on a modern, high-performance, serverless-first stack. The frontend is a responsive React application (built with Vite and TypeScript), and the backend is powered by Cloudflare's edge network, utilizing Cloudflare Functions for API endpoints and Cloudflare KV for data storage. Security and scalability are paramount, with a robust authentication system built on Firebase and a secure API layer that uses JWTs and role-based access control to manage user and tenant data.


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
    * Users can sign in via a dedicated login page (`LoginPage.tsx`).
    * User sessions are persistent, meaning users stay logged in even after refreshing the page.
* **Dynamic Role-Based Access Control (RBAC)**: We have a system for "super admin" users.
    * We successfully refactored the backend to be edge-native, replacing the heavy `firebase-admin` SDK with a lightweight utility (`firebase-admin-api.ts`) for performance.
    * We have a secure administrative endpoint (`/api/set-admin`) to assign a `superAdmin` role to any user.
    * Our frontend (`App.tsx`) now dynamically reads this role from the user's token and updates the UI accordingly, removing all hardcoded admin flags.
* **Secure Backend API Pattern**: We have established a reusable pattern for securing our backend.
    * We created an authentication middleware (`auth-middleware.ts`) that verifies Firebase ID Tokens on incoming requests.
    * We successfully applied this middleware to the `/api/settings` endpoint, removing the hardcoded `tenantId` and making it truly multi-tenant and secure.
* **Completed UI Polish**: We have implemented a full suite of UI and UX improvements.
    * A functional Logout button and user menu have been added to the `TopBar`.
    * The user profile icon now dynamically displays the user's initials.
    * The sidebar is now fully responsive, collapsing into a slide-out menu on mobile devices.
* **Core Subscriber Management**: The first full-stack CRUD feature is complete.
    * We created a secure and dynamic API at `/api/subscribers` with `GET`, `POST`, and `DELETE` handlers.
    * We connected the `SubscribersPage` to the live backend, replacing all stubbed data.
    * Users can now view, add, and delete subscribers for their tenant, with all changes reflected in the UI instantly.

### What We're Currently Working On
The initial implementation of the core Subscribers feature is now functionally complete on the `feat/subscribers-api` branch. This branch is stable and ready for final review and merging into `main`.

### Immediate Next Steps
With the subscribers feature complete, our immediate focus is to merge our progress and make key architectural improvements before starting the next product feature.

1.  **Merge Feature Branch**: We will merge the `feat/subscribers-api` branch into `main` to lock in our progress and keep the main branch up-to-date.
2.  **Refactor Subscribers API**: As a code quality task, we will refactor the `functions/api/subscribers/[[id]].ts` file to separate routing logic from business logic, setting a clean pattern for future API endpoints.
3.  **Implement URL-Based Routing**: We will integrate the `react-router-dom` library to make application pages bookmarkable and solve the "redirect on refresh" issue, creating a more robust user experience.

### Big Milestones We're Aiming For
After completing the immediate architectural improvements, we will continue building out the rest of the application's core functionality.

* **Core MVP Features (Completion)**: Build out the Campaigns feature (UI and backend).
    * Implement the Public Subscribe Endpoint for tenant websites.
* **Subscriber Segmentation**:
    * Design and implement a system for adding tags and lists to subscribers.
    * Update the UI to allow for managing tags and filtering the subscriber list.
* **Email Sending Engine**: Develop the core backend logic (likely using Cloudflare Cron Triggers) that will handle the scheduling and sending of all emails based on campaign rules.
* **Full Super Admin Functionality**: Build out the `TenantsPage` to allow a super admin to view and manage data for different tenants.
* **Future User-Requested Features**:
    * Build a dedicated Sign-up Page to collect a user's full name.
    * Build an Account Settings/Billing Page.

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

