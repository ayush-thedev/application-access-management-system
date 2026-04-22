# Application Access Management System

A premium enterprise solution for Identity and Access Management (IAM), built with MySQL, FastAPI, and Next.js. This system provides a streamlined workflow for requesting, approving, and auditing application access across an organization.

## 🌟 Key Features

- **Role-Based Access Control (RBAC)**: Comprehensive system for managing users, applications, and permissions.
- **Smart Access Requests**: Request access with priority levels, justifications, and automatic status tracking.
- **Advanced Admin Dashboard**: Powerful interface for administrators to manage requests, users, and system settings.
- **Notification System**: Integrated alert system for real-time status updates on requests and approvals.
- **Audit Logging**: (PL/SQL Powered) Automated tracking of access changes and status transitions.
- **Responsive Modern UI**: Built with Shadcn/UI for a premium, accessible experience.

## 💻 Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS, Shadcn/UI, Lucide Icons.
- **Backend**: Python 3.11+, FastAPI, Pydantic v2.
- **Database**: MySQL 8.0+ (utilizing Triggers and Stored Procedures).
- **Styling**: Vanilla CSS + Tailwind CSS 4.0.

## 🛠 Prerequisites

- **Node.js**: 20+ (using `npm` or `pnpm`)
- **Python**: 3.11+
- **MySQL**: 8.0+

## 🚀 Getting Started

### 1. Repository Setup
```bash
git clone https://github.com/ayush-thedev/application-access-management-system.git
cd application-access-management-system
```

### 2. Database Configuration
1. Initialize the database using the provided scripts:
   ```bash
   # Create tables
   mysql -u root -p < backend/schema.sql
   # Seed with demo data
   mysql -u root -p < backend/seed_data.sql
   ```

2. Configure environment variables. Create a `.env` file in the `backend/` directory:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=access_management
   ```

### 3. Backend Setup (FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```
*API will be available at `http://localhost:8000`*

### 4. Frontend Setup (Next.js)
```bash
cd frontend
npm install
npm run dev
```
*Frontend will be available at `http://localhost:3000`*

---

## 🏗 Architecture & Structure

### Project Structure
```
├── backend/
│   ├── main.py           # Entry point & app configuration
│   ├── database.py       # Connection pooling & logic
│   ├── models.py         # Pydantic schemas & response models
│   ├── routes/           # Modular API routes (Auth, Apps, Requests, Notifications)
│   ├── schema.sql        # Database DDL
│   └── seed_data.sql     # Initial DML & Test cases
├── frontend/
│   ├── src/
│   │   ├── app/          # Next.js App Router (Pages & Layouts)
│   │   ├── components/   # Reusable UI (Shadcn, Custom Layouts)
│   │   ├── lib/          # API Client & State utilities
│   │   └── types/        # TypeScript definitions
│   └── public/           # Static assets
└── Project_Details_and_PLSQL.md # Technical documentation for academic submission
```

### Request Lifecycle
1. **Initiation**: User submits an access request via the Dashboard.
2. **Persistence**: Backend validates and stores the request in MySQL.
3. **Notification**: Stored procedures/routes trigger notifications for relevant admins.
4. **Approval**: Admin reviews and takes action (Approve/Reject).
5. **Role Provisioning**: On approval, the system automatically assigns the role to the user.
6. **Closing**: User receives a notification and access is granted.

---

## 🔑 Demo Users

| Role | Username | Password | Department |
|------|----------|----------|------------|
| **Admin** | `admin` | `password` | IT Operations |
| **User** | `alice` | `password` | Engineering |
| **User** | `bob` | `password` | Sales |

---

## 🔌 Core API Endpoints

### Authentication
- `POST /api/auth/login`: Authenticate and receive user profile.

### Applications & Roles
- `GET /api/applications`: Fetch all enterprise applications.
- `GET /api/applications/{id}/roles`: Fetch roles for a specific app.

### Access Requests
- `GET /api/requests`: List all requests (Admin) or user requests.
- `POST /api/requests`: Submit a new access request.
- `PATCH /api/requests/{id}/approve`: Approve a pending request.
- `PATCH /api/requests/{id}/reject`: Reject a request with feedback.

### Notifications
- `GET /api/notifications`: Retrieve latest alerts for the logged-in user.
- `PATCH /api/notifications/{id}/read`: Mark notification as seen.

---

## 🧪 Testing
We include basic sanity tests for database integrity:
```bash
python check_db.py  # Check MySQL connectivity
python test_insert.py # Test API-Database integration flow
```

## 📜 License
This project is licensed under the MIT License.
