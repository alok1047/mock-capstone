 ELIF — Even Lost I Found

A centralized Lost & Found platform that helps people report, discover, and recover lost belongings.

ELIF (Even Lost I Found) is a full-stack Lost & Found platform designed to make reporting, discovering, and recovering lost items easier.

Instead of relying on scattered WhatsApp groups, social media posts, college notices, or physical lost-and-found desks, ELIF provides a centralized platform where users can report lost items, report found items, search listings, manage their reports, and connect the lost-and-found process in one place.

⸻

 Why ELIF?

Losing an important item is frustrating, while finding an item without knowing its owner creates another problem.

Traditional lost-and-found systems often suffer from:

* Scattered information
* No centralized database
* Poor searchability
* Duplicate or outdated posts
* Difficulty discovering relevant items
* Lack of structured reporting
* Lack of user accountability

ELIF provides a centralized digital workflow:

User loses an item
       ↓
Creates a Lost Item report
       ↓
Other users report Found Items
       ↓
Users search and browse listings
       ↓
Potential match is discovered
       ↓
Details are verified
       ↓
Item is returned

⸻

 Core Features

🔐 Authentication & Authorization

Users can securely create accounts and access protected functionality.

Features

* User registration
* User login
* JWT-based authentication
* Protected routes
* Authentication middleware
* Google authentication support
* User-specific item management
* Authorization for protected operations

⸻

 Lost Item Reporting

Users can create detailed reports for items they have lost.

A report can contain:

* Item name
* Description
* Category
* Location
* Date/time
* Images
* Additional identifying information
* Status

Example:

Item: Black Samsung S23
Category: Electronics
Location: College Campus
Date: 18 September
Description:
Black phone with a small scratch near the camera.

⸻

🔎 Found Item Reporting

Users who find an item can create a Found Item report.

The report can include:

* Item details
* Found location
* Found date
* Description
* Images
* Category
* Additional identifying information
* Current status

This creates two sides of the platform:

LOST ITEMS                  FOUND ITEMS
Lost Phone       ←────→     Found Phone
Lost Wallet      ←────→     Found Wallet
Lost ID Card     ←────→     Found ID Card
Lost Backpack    ←────→     Found Backpack

Users can manually compare the information and identify potential matches.

⸻

🔍 Search & Discovery

Users can browse and search through Lost and Found listings.

Listings can be organized or filtered using information such as:

* Lost / Found status
* Category
* Location
* Date
* Item name
* Description

This makes it easier to find relevant reports without manually checking every listing.

⸻

Image Upload & Management

ELIF supports image-based item reporting.

Users can upload images when creating Lost or Found reports.

Images provide important visual information that can help users identify their belongings.

The backend integrates with Cloudinary for image storage and delivery.

Typical flow:

Frontend
   ↓
Upload Image
   ↓
Backend
   ↓
Cloudinary
   ↓
Image URL
   ↓
MongoDB

The database stores image references/URLs rather than unnecessarily storing large image files directly inside MongoDB.

⸻

⭐ Reviews

ELIF includes a review system to allow users to provide feedback after interactions.

Reviews can help establish trust between users involved in the lost-and-found process.

Possible review information includes:

* Rating
* Review text
* Reviewer
* Reviewed user
* Associated item/interaction
* Timestamp

⸻

📋 Item Management

Users can manage the reports they have created.

Depending on their permissions, users can:

* Create reports
* View reports
* Edit reports
* Delete reports
* Update item status
* Manage uploaded images

This provides a complete CRUD workflow for Lost and Found listings.

⸻

🏗️ Tech Stack

Frontend

React
JavaScript
HTML
CSS

The frontend handles:

* User interface
* Authentication flows
* Forms
* Item listings
* Search and filtering
* Image uploads
* API communication
* User interactions

⸻

Backend

Node.js
Express.js

The backend provides:

* REST APIs
* Authentication
* Authorization
* Business logic
* Validation
* Database interaction
* Image handling
* Review APIs
* Error handling

⸻

Database

MongoDB
Mongoose

MongoDB stores application data such as:

Users
Lost Items
Found Items
Reviews
Item metadata
Image references

Mongoose provides:

* Schemas
* Models
* Validation
* Queries
* References
* MongoDB integration

⸻

Authentication

JWT
Passport.js
Google OAuth

JWT is used for authenticated API access, while Passport is used to integrate authentication strategies such as Google authentication.

⸻

Image Storage

Cloudinary

Cloudinary is used to store and serve uploaded item images.

⸻

🧩 Backend Architecture

The backend follows a modular Express architecture.

backend/
│
├── config/
│   ├── db.js
│   ├── cloudinary.js
│   └── passport.js
│
├── routes/
│   ├── authRoutes.js
│   ├── itemRoutes.js
│   └── reviewRoutes.js
│
├── models/
│   ├── User.js
│   ├── Item.js
│   └── Review.js
│
├── controllers/
│   ├── authController.js
│   ├── itemController.js
│   └── reviewController.js
│
├── middleware/
│   └── auth.js
│
├── services/
│   └── ...
│
├── server.js
├── package.json
└── .env

The exact structure may evolve as the project grows.

⸻

🔌 API Architecture

The backend exposes RESTful API endpoints.

Authentication

POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/...

Items

GET    /api/items
POST   /api/items
GET    /api/items/:id
PUT    /api/items/:id
DELETE /api/items/:id

Reviews

GET    /api/reviews/...
POST   /api/reviews/...

Exact endpoints depend on the current implementation of each router.

⸻

🔄 Request Flow

A typical authenticated request follows this architecture:

Frontend
   │
   │ HTTP Request
   ▼
Express Server
   │
   ├── CORS
   ├── JSON Parser
   ├── Authentication
   └── Route
          │
          ▼
      Controller
          │
          ▼
       Service
          │
          ▼
      Mongoose
          │
          ▼
       MongoDB
          │
          ▼
      Response
          │
          ▼
       Frontend

⸻

🔐 Authentication Flow

A typical login flow:

User
 │
 │ Email + Password
 ▼
Frontend
 │
 │ POST /api/auth/login
 ▼
Express
 │
 ▼
Auth Controller
 │
 ▼
Validate Credentials
 │
 ▼
Generate JWT
 │
 ▼
Return Authentication Response
 │
 ▼
Frontend

For protected APIs:

Frontend
   │
   │ Authorization: Bearer <JWT>
   ▼
Backend
   │
   ▼
Authentication Middleware
   │
   ├── Invalid → 401 Unauthorized
   │
   └── Valid
         │
         ▼
      Controller
         │
         ▼
       Response

⸻

🗃️ Data Model — Conceptual

User

User
├── name
├── email
├── password / OAuth information
├── profile information
└── timestamps

Item

Item
├── title
├── description
├── category
├── type
│   ├── LOST
│   └── FOUND
├── location
├── date
├── images
├── owner/reporter
├── status
└── timestamps

Review

Review
├── reviewer
├── reviewed user
├── rating
├── comment
├── associated item/interaction
└── timestamps

The actual Mongoose schemas should be treated as the source of truth for the implementation.

⸻

🛡️ Security

ELIF follows common backend security practices.

Environment Variables

Sensitive credentials are stored in environment variables:

PORT=3000
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

Never commit .env or other secret credentials to GitHub.

Other Security Measures

* JWT-based authentication
* Protected API routes
* Authentication middleware
* CORS configuration
* Input validation
* Centralized error handling
* Authorization checks
* Environment-based secrets

⸻

❤️ ELIF User Journey

1. Create an Account

Sign Up
   ↓
Login
   ↓
Access Platform

2. Report a Lost Item

Create Lost Report
        ↓
Add Item Details
        ↓
Upload Image
        ↓
Submit Report

3. Report a Found Item

Create Found Report
        ↓
Add Item Details
        ↓
Upload Image
        ↓
Submit Report

4. Discover Potential Matches

Search / Browse
      ↓
Filter Listings
      ↓
Open Potential Match
      ↓
Compare Details

5. Recovery

Potential Match
      ↓
Verify Ownership
      ↓
Contact / Coordinate
      ↓
Item Recovered
      ↓
Update Status

⸻

🧪 Local Development

Prerequisites

Install:

* Node.js
* npm
* MongoDB or MongoDB Atlas
* Git

⸻

Clone the Repository

git clone <your-repository-url>
cd ELIF

⸻

Backend Setup

cd backend
npm install

Create a .env file:

PORT=3000
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

Start the backend:

npm run dev

or:

npm start

depending on the scripts configured in package.json.

⸻

🌐 Backend Health Check

Once the backend is running:

GET http://localhost:3000/

Response:

ELIF Backend Working

Health endpoint:

GET http://localhost:3000/health

Example response:

{
  "status": "ok",
  "uptime": 123.45,
  "timestamp": "2026-09-22T12:00:00.000Z"
}

⸻

🧪 API Testing

The API can be tested using:

* Postman
* Thunder Client
* Insomnia
* curl

Example:

curl http://localhost:3000/health

⸻

📁 Project Structure

ELIF
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   └── ...
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── server.js
│   └── package.json
│
├── README.md
└── .gitignore

⸻

📈 Future Improvements

Potential improvements include:

* Advanced search and filtering
* Image similarity search
* Duplicate report detection
* Real-time notifications
* In-app messaging
* Email notifications
* Push notifications
* Item ownership verification
* QR-based item identification
* Location-based discovery
* Admin moderation dashboard
* Spam and abuse detection
* Analytics dashboard
* Improved reporting and recovery workflows

⸻

🎯 Project Goals

ELIF aims to transform the traditional Lost & Found experience into a structured digital workflow.

The goal is to make the recovery process simple:

Report
  ↓
Discover
  ↓
Compare
  ↓
Verify
  ↓
Recover

⸻

💡 What ELIF Demonstrates

This project demonstrates practical experience with:

* Full-stack web development
* REST API design
* Node.js
* Express.js
* React
* MongoDB
* Mongoose
* JWT authentication
* OAuth / Passport
* CORS
* Middleware architecture
* Cloudinary integration
* Image handling
* CRUD operations
* Database modeling
* Authentication and authorization
* API security
* Error handling
* Frontend-backend integration
* Deployment architecture

⸻

👨‍💻 Project

ELIF — Even Lost I Found

A full-stack Lost & Found platform built to help users report, discover, verify, and recover lost belongings.

          ELIF
Report → Discover → Verify → Recover

⸻
