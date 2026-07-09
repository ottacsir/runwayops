# RunwayOps
## Project Description
RunwayOps is a web-based Fashion Show Management System developed for the Web Programming II final project.
The system helps organizers manage fashion shows by providing features for managing shows, model applications, collections, looks, seating arrangements, assignments, and user accounts through a secure REST API and a responsive frontend.

## Features
- User Authentication
- Role-Based Authorization
- JWT Authentication
- Password Hashing using bcrypt
- Fashion Show Management
- Model Application Management
- Assignment Management
- Collection Management
- Look Management
- Seating Management
- User Management
- Responsive Frontend Interface

## Technology Stack
### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT (jsonwebtoken)
- bcryptjs
- dotenv
- CORS

### Frontend
- HTML5
- CSS3
- Vanilla JavaScript

### Development Tools
- VS Code
- Git
- GitHub

## Project Structure
RunwayOps
│
├── backend
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── public
│   ├── routes
│   ├── utils
│   ├── server.js
│   └── runwayops_schema.sql
│
├── package.json
├── package-lock.json
└── README.md

## Installation
Clone the repository
git clone https://github.com/ottacsir/runwayops.git
Install dependencies
npm install

## Environment Variables
Create a .env file inside the backend directory.
Example:
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=runwayops
JWT_SECRET=your_secret_key

An example configuration is provided in:
backend/.env.example

## Running the Application
Start the server
npm start
or
npm run dev
Open the frontend in your browser after the server starts.

## Database
The PostgreSQL database schema and DDL script are located in:
backend/runwayops_schema.sql
The schema contains the tables, primary keys, foreign keys, and relationships required for the application.

## Security Features
- JWT Authentication
- Password Hashing
- Role-Based Authorization
- Protected API Routes

## Author
Bezawit Bushe
Web Programming II Final Project