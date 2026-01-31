# Event Sponsorship & Collaboration Platform

A full-stack application for managing event sponsorships and collaborations between companies and event organizers.

## Project Structure

```
/event-sponsorship-platform
├── /frontend           # Next.js application
├── /backend            # Express.js API
├── README.md           # This file
└── .gitignore          # Git ignore file
```

## Tech Stack

### Frontend
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Linting**: ESLint

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Language**: TypeScript
- **Authentication**: JWT + bcryptjs
- **File Upload**: Multer
- **Logging**: Morgan
- **Environment**: dotenv

## Setup Instructions

### Prerequisites
- Node.js (v18 or later)
- npm or yarn
- MongoDB (local or cloud instance)

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

The backend will be available at `http://localhost:5000`

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/event-sponsorship
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Project Status

This project has been initialized with all necessary configurations and folder structures. Feature implementation will begin next.

## Folder Structure

### Frontend
```
/frontend
├── /app
│   ├── /auth
│   ├── /dashboard
│   ├── /events
│   ├── /components
│   ├── /services
│   └── /utils
├── /public
├── /styles
├── tailwind.config.js
├── next.config.js
├── tsconfig.json
└── package.json
```

### Backend
```
/backend
├── /src
│   ├── /config
│   ├── /controllers
│   ├── /models
│   ├── /routes
│   ├── /middlewares
│   ├── /services
│   ├── /utils
│   ├── app.ts
│   └── server.ts
├── tsconfig.json
├── nodemon.json
└── package.json
```

## Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Backend
- `npm run dev` - Start development server with nodemon
- `npm run build` - Compile TypeScript
- `npm run start` - Start production server
- `npm run lint` - Run ESLint (if configured)

## License

MIT
