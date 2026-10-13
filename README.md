# 🔗 Linkup — IT Service Desk & Ticket Management

**Linkup is a web-based IT service desk application designed to help organizations manage internal technical support requests in one centralized platform.**

## 📌 About the Project

In organizations, employees frequently encounter technical issues that require assistance from an IT support team. Managing these requests through emails or informal messages can make it difficult to track progress, assign responsibility, and ensure timely resolution.

**Linkup addresses this problem by providing a centralized ticket management system.** Employees can create support tickets describing their technical issues, while authorized team members can manage assignments, prioritize requests, update ticket statuses, and record resolution notes.

The application also supports different user roles and organization-specific data, helping structure the support workflow for different teams.

### 🎯 Project Objectives

- Centralize technical support requests in one platform.
- Make ticket priorities and statuses easy to track.
- Improve coordination between employees, engineers, and team leads.
- Provide visibility into ticket assignments and resolution progress.
- Store ticket information persistently in a database.
- Demonstrate a practical full-stack web application using React, TypeScript, Node.js, Express, and MongoDB.

### 💡 The Problem Linkup Solves

Without a centralized ticketing system, support requests can become scattered, difficult to prioritize, or forgotten. Linkup organizes those requests into trackable tickets, giving users a clearer view of what needs attention, who is responsible, and what progress has been made.

## ✨ Features

- **Role-Based Access** — Different experiences for team leads, engineers, and employees.
- **Ticket Management** — Create, view, assign, and update support tickets.
- **Priority Tracking** — Categorize issues by priority, from low to urgent.
- **Status Management** — Track tickets through their lifecycle.
- **Assignment Workflow** — Assign tickets to the appropriate team member.
- **Resolution Notes** — Record notes when handling and resolving issues.
- **Organization Separation** — Associate tickets and users with their respective organizations.
- **Authentication** — Secure login using password hashing and token-based authentication.
- **Persistent Storage** — Store users and tickets in MongoDB.
- **Responsive Dashboard** — Access ticket information through a structured web interface.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Styling | CSS |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcrypt |
| Development Tools | Git, GitHub, Prettier |

---

## 📁 Project Structure

```text
Linkup/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── index.css
│   │   ├── main.tsx
│   │   └── style.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── index.ts
│   ├── .env.example
│   └── package.json
│
├── .gitignore
├── .prettierrc.json
├── .prettierignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Before running Linkup locally, install:

- [Node.js](https://nodejs.org/) — preferably a supported LTS version.
- npm, included with Node.js.
- A MongoDB Atlas database or another accessible MongoDB instance.
- Git.

### 1. Clone the Repository

```bash
git clone https://github.com/iamsuyashhhhh/Linkup.git
cd Linkup
```

### 2. Configure the Backend

Navigate to the backend directory:

```bash
cd server
npm install
```

Create a `.env` file by copying the example configuration:

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
```

Open `server/.env` and configure your environment variables:

```dotenv
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
```

Use a valid MongoDB connection string and a strong, unique JWT secret. Keep this file private and never commit it to GitHub.

> **Note:** The example variables must match the names used by the backend source code. If your project uses `MONGO_URI` instead of `MONGODB_URI`, configure the variable your code expects.

### 3. Start the Backend

From the `server` directory, run the development script defined in `server/package.json`:

```bash
npm run dev
```

If the script has a different name, check the available scripts with:

```bash
npm run
```

Confirm that the server starts successfully and connects to MongoDB before proceeding.

### 4. Configure and Start the Frontend

Open a second terminal:

```bash
cd Linkup/client
npm install
npm run dev
```

Open the local URL printed by Vite in your terminal, usually:

**http://localhost:5173**

The frontend also requires the backend API to be running and reachable at the API URL configured in the application.

---

## 🔐 Demo Accounts

The development setup includes the following demo accounts, provided the backend's demo-account initialization has run successfully.

| Role | Email |
|---|---|
| Team Lead | `lead@linkup.demo` |
| Engineer | `engineer@linkup.demo` |
| Employee — Northstar Retail | `employee@linkup.demo` |
| Employee — Acme Health | `employee@acme.demo` |

**Demo password:** `Demo123!`

These are development-only credentials. Do not use them for production accounts.

---

## 🔄 Typical Workflow

1. Sign in using an available demo account.
2. Create a support ticket with a title, description, category, and priority.
3. View the ticket in the dashboard.
4. Assign the ticket to an engineer when permitted by your role.
5. Update its status as work progresses.
6. Add resolution notes and track the ticket's progress.

Available actions depend on the authenticated user's role and the application's authorization rules.

---

## 🧪 Build & Verification

Build the frontend to verify its TypeScript compilation and production bundle:

```bash
cd client
npm install
npm run build
```

For backend development, use the scripts available in `server/package.json`.

Before submitting changes, verify login, ticket creation, ticket updates, assignment, and database persistence.

---

## 🔒 Security

- Environment files containing credentials are excluded from version control.
- `.env.example` documents the required configuration without exposing secrets.
- Password handling uses the authentication logic implemented in the backend.
- Database credentials and application secrets should be configured through environment variables.

---

## 🎯 Project Goal

Linkup aims to simplify IT support operations by bringing ticket creation, assignment, prioritization, and resolution tracking into one centralized platform.

The project demonstrates full-stack development, REST API integration, authentication, database modeling, and role-based workflows.

---

## 👨‍💻 Author

**Suyash Saxena**

B.Tech — Computer Engineering

GitHub: [@iamsuyashhhhh](https://github.com/iamsuyashhhhh)

---

*Built with React, TypeScript, Node.js, Express, and MongoDB.*
