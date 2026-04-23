# Fogarty Onsite Generator Service Website
<img src="https://github.com/Cris4110/FogartyGeneratorServices/blob/main/public/Fogarty%20Generator%20Service%20Logo%20Design.png" width="400" />
Definition: Fogarty Onsite Generator Service Website is a portal that replaces the clients call and text business, giving the customers the opportunity to schedule appointments, request quotes, make purchase requests, and much more.<br><br>

Purpose: Fogarty Onsite Generator Service primarily runs through a text and call model which leads to many issues. Customers cannot reliably get help with their generator needs through these promotions, which leads to overbooked schedules and potentially missed clients. This is a solution that provides resources to customers and helps reduce reliance on this primary source of contact. By creating this website, customers can view his services, book appointments, read reviews, view available items, and strengthen his independent online presence.


## Built Tools
- **Frontend:** React, TypeScript, MUI Library, Node.js
- **Backend:** MongoDB
- **Version Control:** GitHub

## Table of Contents
- [Installation](#installation)
- [Current Features](#current-features)
- [Upcoming Features](#upcoming-features)
- [Security](#security)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Developer Instructions](#developer-instructions)

## Installation

To set up this project, follow the steps below:

1. Installing Nodejs:
    - Download and install Node.js from [here](https://nodejs.org/en/)
    - Once installed, open your command prompt and confirm the installation by running the commands below. Both of which should print the currently installed version number
    ```bash
    node -v
    npm -v
    ```
2. Clone the repository from GitHub:
    ```bash
    git clone https://github.com/Cris4110/FogartyGeneratorServices.git
    ```
3. Move terminal into FogartyGeneratorServices folder
   ```bash
    cd FogartyGeneratorServices
    ```
4. Install project dependencies
   Note that this may take a few minutes. Type the command below and the installation of all dependecies will begin.
    ```bash
    npm install
    ```

5. Running the project
 Simply type the command below, and a link will be given.
    ```bash
    npm run dev
    ```
6. Opening the project

When ```npm run dev``` begins, a local host link will be given. You can open the link by holding ```Ctrl``` and then clicking the link. This will open the link in your default web browser. 
You can also simply copy and paste the link in any browser you want.

**Important notes**:
You must keep the command prompt window open in order for the website to function correctly. Some assets and features may not load or work properly if closed. 
Keep in mind website does not connect to the server for security purposes. See the **Security** section below for more details.

## Current features 
Our platform includes a full set of features designed to give users an easy way to explore services, request quotes, manage their accounts, and purchase products. The system ensures a smooth experience even for visitors who are not logged in, while still offering more advanced options for registered users.

**General Access**
- FAQ Page – Users can browse frequently asked questions for quick help.
- Contact Page – Users can reach out directly for inquiries or support.

**Profile & Account**
- User Registration – Create an account using a simple signup process.
- User Login – Secure login system to access personalized features.

**Profile & Account**
- Request Services (Logged-in Users) – Users can request maintenance, repair, or other services.

Alongside the user facing functionality, we provide a powerful admin dashboard that allows the business to manage inventory, monitor service requests, and maintain the platform efficiently. Both sides work together to support real time operations and ensure accuracy.

**Inventory Management**
- Add new parts or generators.
- Edit existing product details.
- Remove outdated or unavailable inventory.

**Service Request Management**
- Accept service requests.
- Hold requests for review or follow-up.
- Decline requests when needed.

**Platform Control**
- Keep track of user activity and incoming quote request.
- Manage system data and keep product availability up to date.

## Upcoming Features
During the timeline of late January 2026 to early April 2026, our team plans to implement the following features:

**Authentication**
- Currently, customers and admins can create an account and log in, but we do not yet have a full authentication system to verify their accounts. We plan to integrate Firebase Authentication as our authentication API to securely handle account verification and login.

**Notification**
- We plan to implement APIs to send email and SMS notifications for appointment requests and appointment reminders.

**Settings**
- For admins, we plan to provide the ability to modify website content to post updates. We also plan to add general settings for both admins and customers, including notification preferences.

**Reviews**
- We plan to create a review system that is used only within the website. Reviews will be triggered by completed appointments and will be visible to all users.

**Quotes**
- An account-free system for customers to submit quote requests describing their general needs. These requests will be reviewed by admins to provide a rough cost estimate.

**Wave Integration**
- An account-free system for customers to submit quote requests describing their general needs. These requests will be reviewed by admins to provide a rough cost estimate.

**Domain & Hosting**
- During development, the application is running on `localhost` for both the frontend and backend. Before the client begins using the platform in production, we will utilize a custom domain name.

## Security
Passwords are hashed and never stored in plaintext. Authentication is handled by our backend, and multi-factor authentication (MFA) provides an additional security layer during login.

**Authentication and Authorization**
- Secure registration and login using server-side validation and hashed passwords 
- Multi-factor authorization (MFA) will also be implemented for logging in and account recovery (Future Development)
- Login tokens expire after 12 hours
- API keys are used for backend services
- .env files contain confidential information, so do not commit .env files or anything that compromises security

**Role-Based Access Control**
- There is a separate login page specifically for admins
- Only admins have access to change/manage appointments, inventory, and users
- Standard users can request appointments/quotes and purchase parts/generators

## API Documentation

All API responses follow:
```
{
  "success": true,
  "message": "Description",
  "data": {}
}
```
Generator Equipment API response example:
```
{
"_id": "69141edd7a5dc4d8798112fb",
"genID": "GEN-0001",
"name": "Generac Guardian 22kW",
"type": "Standby (Residential, NG/LP)"
}
```


👤 User API
|Method |Endpoint|  Description|    Auth|
|-------|--------|-------------|:-----------:|
|GET    |/api/users |Get all users| Admin|
|GET    |/api/users/:id|    Get single| User|  
|PUT    |/api/users/:id|    Update user|User    |
|DELETE |/api/users/:id|    Delete user|    Admin|


📅 Appointment API
|Method |Endpoint|  Description|    Auth|
|-------|--------|-------------|:-----------:|
|POST   |/api/appointments  |Create appointment request|    User
|GET    |/api/appointments  |Get all pending appointments (old requests older than the configured retention will be deleted automatically)|  Admin
|PUT    |/api/appointments/:id/approve| Approve appointment|    Admin
|PUT    |/api/appointments/:id/deny|    Deny/delete appointment|    Admin
|DELETE |/api/appointments/:id|Remove appointment   |Admin|

**Configuration:**
- Retention period for quotes and appointments is stored in the `pagecontent` collection under the names `quoteRetentionDays` and `appointmentRetentionDays`. Values must be integer days between 30 and 365; the admin interface under "Edit Page Content" lets you update them.


🛠️ Generator API
|Method |Endpoint|  Description|    Auth|
|-------|--------|-------------|:-----------:|
|GET    |/api/generators|   List generator models| User |
|POST   |/api/generators    |Add a generator model| Admin|
|PUT    |/api/generators/:id|   Update generator|   Admin|
|DELETE |/api/generators/:id|   Delete generator|   Admin|


📦 Parts / Inventory API
|Method |Endpoint|  Description|    Auth|
|-------|--------|-------------|:-----------:|
|GET    |/api/parts |Get all parts  |Admin|
|POST   |/api/parts|    Create a new part entry |Admin|
|PUT    |/api/parts/:id|    Update part information |Admin|
|DELETE |/api/parts/:id|    Delete a part|  Admin|


🗄️ Database Schema (MongoDB)


Fogarty Onsite Generator Services uses MongoDB in JSON Format.


👤 Users Collection
```
{
  "_id": "ObjectId",
  "userID": "string",
  "name": "string",
  "email": "string",
  "password": "hashed string",
  "phoneNumber": "string",
  "address": {
    "street": "string",
    "city": "string",
    "state": "string",
    "zipcode": "string"
  },
  "role": "user | admin",
  "createdAt": "Date"
}
```


📅 Appointments Collection
```
{
  "_id": "ObjectId",
  "userID": "string",
  "appointmentTime": "Date",
  "description": "string",
  "generatorModel": "string",
  "serialNumber": "string",
  "status": "pending | approved | denied",
  "address": "string",
  "createdAt": "Date"
}
```


🛠️ Generators Collection
```
{
  "_id": "ObjectId",
  "manufacturer": "string",
  "model": "string",
  "serialRange": "string",
  "fuelType": "string",
  "powerRating": "string",
  "notes": "string"
}
```


📦 Parts Collection
```
{
  "_id": "ObjectId",
  "partName": "string",
  "partNumber": "string",
  "quantity": "number",
  "location": "string",
  "compatibleModels": ["string"]
}
```


🧩 ERD — Entity Relationship Diagram
![This is an alt text.](/src/assets/ERD_for_README.png "Current ERD")

🧪 API Testing

Test endpoints using:



Insomnia
![This is an alt text.](/src/assets/Insomnia_For_ReadME.png "Insomnia Testing Example")

## Testing
- TBA

## Deployment
- TBA
  
## Developer Instructions
- TBA



