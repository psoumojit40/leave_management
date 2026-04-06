# Leave Management System

A comprehensive leave management system built with a MERN stack (MongoDB, Express, React/Next.js, Node.js) using TypeScript.

## Project Structure

This project follows a monorepo layout with two main applications:

- `client/` - Next.js 13+ application using App Router with route groups for role-based access control
- `server/` - Express.js API with layered architecture (routes → controllers → services → models)

## Features

- Role-Based Access Control (RBAC) for employees, managers, and administrators
- Leave request submission, approval workflow, and tracking
- Attendance marking and reporting
- Holiday management
- Audit logging for all actions
- Automated email notifications
- Scheduled jobs for reminders and reports

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   - Copy `.env.example` to `.env` in both `client/` and `server/` directories
   - Configure the environment variables as needed

3. Start the development servers:
   ```bash
   npm run dev
   ```

## Documentation

- [API Specification](docs/api-spec.md)
- [RBAC Policy](docs/rbac-policy.md)
- [Database Schema](docs/db-schema.md)

## License

MIT