# Identity Governance System

Application Access Management System built with MySQL, FastAPI, and Next.js.

## Features

- **User Management**: Login with role-based access (user/admin)
- **Application Catalog**: Browse available enterprise applications
- **Access Requests**: Submit requests with justification and priority
- **Approval Workflow**: Admins can approve/reject requests
- **Role Assignment**: Automatic role assignment on approval
- **Time-bound Access**: Access expires automatically
- **Search & Filter**: Find requests by application, role, or status
- **Bulk Actions**: Approve multiple requests at once
- **Toast Notifications**: Real-time feedback on actions

## Tech Stack

- **Database**: MySQL
- **Backend**: Python + FastAPI
- **Frontend**: Next.js + TypeScript + Tailwind CSS

## Prerequisites

- Node.js 18+
- Python 3.9+
- MySQL 8.0+

## Setup

### 1. Database Setup

Create the database and import schema:

```sql
mysql -u root -p < backend/schema.sql
mysql -u root -p < backend/seed_data.sql
```

Or update `.env` with your MySQL credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=access_management
```

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
python main.py
```

The API will start on `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:3000`

## Demo Users

| Username | Role | Department |
|----------|------|------------|
| alice | user | Engineering |
| bob | user | Sales |
| charlie | user | Marketing |
| admin | admin | IT |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Mock login |
| GET | `/api/applications` | List applications |
| GET | `/api/applications/{id}/roles` | Get app roles |
| GET | `/api/requests` | Get requests |
| GET | `/api/requests/pending` | Get pending requests |
| POST | `/api/requests` | Create request |
| PATCH | `/api/requests/{id}/approve` | Approve request |
| PATCH | `/api/requests/{id}/reject` | Reject request |
| GET | `/api/user-roles/current-user/{username}` | Get user's access |

## Project Structure

```
├── backend/
│   ├── main.py           # FastAPI app
│   ├── database.py       # MySQL connection
│   ├── models.py         # Pydantic models
│   ├── routes/           # API endpoints
│   ├── schema.sql        # Table definitions
│   └── seed_data.sql     # Demo data
├── frontend/
│   ├── src/
│   │   ├── app/          # Next.js pages
│   │   ├── components/   # UI components
│   │   └── lib/          # API client, types
│   └── package.json
└── README.md
```

## License

MIT
