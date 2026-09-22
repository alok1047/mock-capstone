ELIF — Even Lost I Found

ELIF is a full-stack Lost & Found platform that helps users report, discover, and recover lost belongings through a centralized web application.

What It Does

* User authentication with JWT and Google OAuth
* Create and manage Lost / Found item reports
* Search and filter reported items
* Upload and manage item images using Cloudinary
* User reviews and ratings
* Protected APIs with authentication and authorization
* RESTful API architecture for frontend-backend communication

Tech Stack

Frontend: React, JavaScript, HTML, CSS
Backend: Node.js, Express.js
Database: MongoDB, Mongoose
Authentication: JWT, Passport.js, Google OAuth
Image Storage: Cloudinary

Architecture

React Frontend
      |
      v
REST APIs
      |
      v
Express + Node.js
      |
      v
Authentication / Business Logic
      |
      v
MongoDB

Images are uploaded through the backend to Cloudinary, with their references stored in MongoDB.

Key API Modules

/api/auth       -> Authentication
/api/items      -> Lost & Found items
/api/reviews    -> Reviews & ratings

The backend follows a modular structure with separate routes, controllers, models, middleware, and configuration.

User Flow

Register / Login
      |
      v
Report Lost or Found Item
      |
      v
Browse / Search Listings
      |
      v
Identify Potential Match
      |
      v
Verify & Recover Item

Key Technical Highlights

* Full-stack application development
* REST API design
* JWT authentication and authorization
* Google OAuth integration
* MongoDB data modeling with Mongoose
* CRUD operations
* Cloudinary image storage
* Express middleware and centralized error handling
* Frontend-backend integration
* CORS and API security

Project Goal

ELIF replaces scattered lost-and-found posts with a centralized, searchable platform that makes recovering lost belongings simpler and more organized.
