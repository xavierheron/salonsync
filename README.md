# SalonSync

A full-stack salon management platform built with React, Node.js, Express and MongoDB.

## Live Demo

- **Frontend:** https://salonsync.vercel.app
- **Backend API:** https://salonsync-backend.onrender.com

## Demo Accounts

Use these accounts to explore the platform. Registration is disabled in the demo.

| Role | Email | Password |
|---|---|---|
| Customer | customer@demo.com | demo1234 |
| Staff | staff@demo.com | demo1234 |
| Admin | admin@demo.com | demo1234 |

## Features

### Customer
- Book appointments from a dynamic service menu
- View upcoming and past appointments with tabs
- Reschedule or cancel appointments
- Make payments with card validation
- Update profile and change password

### Staff
- View and manage all customer appointments
- Mark paid appointments as completed
- Search and filter by customer, service or status

### Admin
- Full dashboard with revenue charts and stats
- Manage all appointments with date range search
- Export appointments to CSV
- Manage users — view, activate, deactivate or delete
- Manage services and pricing
- View staff dashboard

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Chart.js |
| Backend | Node.js, Express |
| Database | MongoDB Atlas |
| Auth | JWT + bcrypt |
| Email | Nodemailer (Gmail) |
| Security | Helmet, express-rate-limit |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |

## Local Development

### Prerequisites
- Node.js
- MongoDB Atlas account

### Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend folder:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

```bash
npm run dev
```

### Seed Demo Accounts
```bash
node seedDemo.js
node seedServices.js
```

### Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in the frontend folder:
```
REACT_APP_API_URL=http://localhost:5000/api
```

```bash
npm start
```

## Project Structure

```
salonsync/
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── styles/
│       └── utils/
└── backend/
    ├── middleware/
    ├── models/
    ├── routes/
    └── utils/
```

## License

MIT
