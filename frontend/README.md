# Secure Tasker Frontend

A React frontend application for the Secure Tasker government task management system. This application provides a clean, professional interface for managing tasks and secret data with role-based access control.

## Features

- **JWT Authentication**: Secure login with JWT tokens and automatic refresh
- **Role-Based Access Control**:
  - **Secret Group**: View and update tasks and secret data
  - **Supervisor Group**: Full CRUD operations on all resources
- **Responsive Design**: Government-style UI with clean, professional appearance
- **Task Management**: Create, read, update, and delete tasks with completion tracking
- **Secret Data Management**: Secure handling of classified information
- **Dashboard**: Overview of system statistics and quick actions

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Running Django backend server

## Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`

## Configuration

The API base URL can be configured using the `VITE_API_BASE_URL` environment variable. By default, it points to `http://localhost:8000`.

To set a custom API URL, create a `.env.local` file in the frontend directory:

```
VITE_API_BASE_URL=http://your-backend-url:port
```

## User Roles

### Secret Group Users
- View all tasks and secret data
- Update existing tasks and secret data
- Cannot create new items or delete existing ones

### Supervisor Group Users
- Full CRUD access to all tasks and secret data
- Can create, read, update, and delete all resources
- Can mark tasks as completed and assign completion details

## API Endpoints Used

- `POST /api/token/` - User authentication
- `POST /api/token/refresh/` - Token refresh
- `GET /api/secret/user-permissions/` - Get user permissions
- `GET/POST/PUT/DELETE /api/tasks/` - Task management
- `GET/POST/PUT/DELETE /api/tasks/supervisor/` - Supervisor task access
- `GET/POST/PUT/DELETE /api/secret/` - Secret data management
- `GET/POST/PUT/DELETE /api/secret/supervisor/` - Supervisor secret access

## Security Features

- Encrypted secret data storage
- JWT token-based authentication
- Automatic token refresh
- Role-based UI rendering
- Secure API communication

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure

```
src/
├── components/          # React components
│   ├── Layout.jsx      # Main layout with navigation
│   ├── Login.jsx       # Authentication form
│   ├── Dashboard.jsx   # Main dashboard
│   ├── TaskList.jsx    # Task listing
│   ├── TaskDetail.jsx  # Task details view
│   ├── TaskForm.jsx    # Task creation/editing
│   ├── SecretList.jsx  # Secret data listing
│   ├── SecretDetail.jsx # Secret data details
│   └── SecretForm.jsx  # Secret data creation/editing
├── context/
│   └── AuthContext.jsx # Authentication context
├── services/
│   ├── api.js         # Axios configuration
│   └── auth.js        # Authentication utilities
└── App.jsx            # Main application component
```