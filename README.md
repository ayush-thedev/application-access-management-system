# Application Access Management System

[![GitHub last commit](https://img.shields.io/github/last-commit/ayush-thedev/application-access-management-system?style=for-the-badge)](https://github.com/ayush-thedev/application-access-management-system/commits/main)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

A premium enterprise solution for Identity and Access Management (IAM). This system provides a streamlined workflow for requesting, approving, and auditing application access across an organization.

## Tech Stack

### Backend
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Pydantic](https://img.shields.io/badge/Pydantic-E92063?style=for-the-badge&logo=pydantic&logoColor=white)

### Frontend
![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Radix UI](https://img.shields.io/badge/Radix_UI-161618?style=for-the-badge&logo=radix-ui&logoColor=white)

## Features

- **Role-Based Access Control (RBAC)**: Comprehensive system for managing users, applications, and permissions.
- **Smart Access Requests**: Request access with priority levels, justifications, and automatic status tracking.
- **Advanced Admin Dashboard**: Powerful interface for administrators to manage requests, users, and system settings including an aesthetic grid view for roles.
- **Notification System**: Integrated alert system for real-time status updates on requests and approvals.
- **Comprehensive Audit Logging**: Automated tracking of all system mutations—user onboarding, app management, and access decisions—using database triggers.
- **Responsive Modern UI**: Premium, accessible experience built with Shadcn/UI and Radix primitives.

## Quick Start

### 1. Prerequisites

- Node.js 20 or higher
- Python 3.11 or higher
- MySQL 8.0 or higher

### 2. Repository Setup

```bash
git clone https://github.com/ayush-thedev/application-access-management-system.git
cd application-access-management-system
```

### 3. Database Initialization

1. Create the database and tables:
   ```bash
   mysql -u root -p < backend/schema.sql
   ```

2. Seed the database with demo data:
   ```bash
   mysql -u root -p < backend/seed_data.sql
   ```

3. Create a `.env` file in the `backend/` directory:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=access_management
   ```

### 4. Running the Application

#### Backend (FastAPI)
```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Unix/macOS
source venv/bin/activate

pip install -r requirements.txt
python main.py
```
Backend runs at: `http://localhost:8000`

#### Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: `http://localhost:3000`

## Project Structure

| Directory | Description |
|-----------|-------------|
| `backend/` | FastAPI server, database logic, and SQL scripts |
| `frontend/` | Next.js application with Shadcn/UI components |
| `backend/routes/` | Modular API endpoints for Auth, Apps, and Requests |
| `backend/models.py` | Data validation and response schemas |

## Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | password |
| User | alice | password |
| User | bob | password |

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User authentication |
| GET | `/api/applications` | List active applications |
| POST | `/api/requests` | Submit new access request |
| PATCH| `/api/requests/{id}/approve` | Approve a request (Admin) |
| GET | `/api/audit` | Fetch system audit logs (Admin) |
| GET | `/api/user-roles` | Fetch all user-role assignments (Admin) |

## Automation (PL/SQL)

The system utilizes advanced database features for integrity and automation:
- **Procedures**: `DeactivateDeptAccess`, `IdentifyStaleRequests` (Escalation)
- **Functions**: `fn_GetActiveRoleCount`, `fn_CheckDuplicateRequest`
- **Triggers**: `trg_AutoSetupAppRoles`, `trg_LogAccessDecision`, `trg_LogUserOnboarding`, `trg_LogAppCreation` (Audit)

## License

This project is licensed under the MIT License.
