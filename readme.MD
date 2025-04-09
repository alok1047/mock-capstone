
 ELIF ( Even lost , I found ) 

 Project Overview 
 
 The ELIF is a web-based platform designed to help users report, search, and claim lost or found items efficiently. It prevents fraudulent claims through a verification system, real-time chat, and a community-based validation process. 

 Key Features 

 1 - Report Lost or Found Items - Users submit details like category, location,description, and images. 
 2 - Item Search & Filtering - Find items based on location, category, and date. 
 3 - Admin Dashboard - Manage reports, handle flagged items, and prevent spam. 
 4 - User Authentication - Users can signup / login for authentication . 
 5 - Reward system (optional) - Encourages users to return items . 
 6  - Google Maps (optional) - Display item locations for better searchability. 

 Frontend 

 • React.js - For building a dynamic and user-friendly UI. 
 • React Router - For navigation between pages. 
 • Tailwind CSS - Styling & responsiveness. 

 Backend 

 • Node.js  - For handling server-side logic. 
 • Express.js  - For building API endpoints. 
 • MongoDB (NoSQL) - Storing items and users in a flexible structure. 
 • MySQL (Relational DB - optional alternative) - Structured storage for better relationships. 
 • JWT/ Auth0 or Firebase Authentication - Secure login system 
 • Cloudinary - Storing images instead of keeping them in database. 


 Deployment 

 •  Frontend - Netlify / Vercel . 
 •  Backend - Render. 

 Optional 

 •  socket.io - Real time chat configuration. 
 •  Google Maps Api - location based alerts 

 📌 Week 1: Planning & Initial Setup 
 • Day 1- 4: Research & Design 
 • DAY 1- 2 >> Low-fidelity design 
 • DAY 3 - 4 >> High-fidelity design 

 • Day 5 - 6 : GitHub Setup & Task Management 
 •  Set up GitHub repo (README, issues, projects)

 📌 Week 2:Backend Development & Authentication 
 • Day 7-9 : Set Up Backend (Node.js + Express) 
 • Set up user models and auth routes (login, signup). 
 • Set up Node.js and Express for the backend.… 
 • Implement user authentication (JWT for secure login/signup). 
 • Day 12: File Upload Functionality 
 • Integrate Cloudinary for uploading images of lost/found items. 
 • Store image URLs in the database alongside item details. 
 •  Implement file upload (Cloudinary) for item images (optional) . 
 • Day 10-11: Create Database Schema & APIs 
 • Design the database schema for lost items (fields: name, description,         status, location, image URL). 
 • Create GET API to fetch lost and found items, and POST API to report new lost/found items. 
 • Day 13: Claim Item Feature (PUT API) 
 • Implement PUT API to allow founders to claim lost items and update item status from Lost to Claimed. 
 • Store founder's contact info (email/phone) when claiming an item. 
 

 📌Week 3: Frontend Development & Core Features 
 •  Day 14: Deploy Backend Server 
 • Deploy the backend to Render and Ensure APIs work correctly after deployment. 
 • Day 15-16: Initialize React App & Set Up Navigation 
 • Initialize React app and install React Router for navigation between Lost Items page, Claim Items page, and Profile/Dashboard. 
 • Day 17-18: Display Lost & Found Items 
 • Create a component to display reported lost items, including their details (description, image, etc.). 
 • Implement search and filtering options for items based on location, category, and date. 
 • Fetch data from the backend and display it on the frontend. 
 • Day 19-20 : Creating other components 
 • Creating other pages like submit page .. found page .. and others . 
 • Day 21: Connect Frontend to Backend 
 • Set up API calls to the backend for submitting and fetching items. 



 📌Week 4: Final Features, Testing, and Deployment 
 • Day 22-23: Unit Testing with Jest 
 • Write at least 5 unit tests for key features (APIs, form submission). 

 • Day 24-25: Dockerize the Application (optional) 
 • Dockerize both frontend and backend applications for easier deployment and containerization. 
 • Test the dockerized application to ensure all components function correctly.containerization. 
 • Day 26: Final Testing and Debugging 
 • Conduct end-to-end testing to ensure that all the features (item reporting, claiming, chat) work as expected. 
 • Day 27-28: Final Deployment & Project Submission 
 • Deploy the final version of both the frontend and backend to production (via Render, Netlify, or Vercel). 
 • Ensure the application works well in a production environment. 
 • Submit your final project with: • GitHub repository link • Live demo link • Final documentation (including README, API docs, user guide).
 