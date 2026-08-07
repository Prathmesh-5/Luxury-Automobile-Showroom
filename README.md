# 🚗 Luxury Automobile Showroom

A full-stack MERN application for managing a luxury automobile showroom. The project allows users to explore premium cars, book test drives, send enquiries, while providing an admin dashboard to manage cars, brands, leads, uploads, and analytics.

---

## ✨ Features

### User Features

- Browse luxury cars
- Search and filter cars
- View car details
- Similar car recommendations
- Book test drives
- Send enquiries

### Admin Features

- Secure JWT Authentication
- Manage Cars (CRUD)
- Manage Brands (CRUD)
- Manage Leads
- Manage Test Drives
- Upload Car Images
- Dashboard Statistics
- Swagger API Documentation

---

## 🛠 Tech Stack

### Frontend

- React.js
- Axios
- React Router

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose

### Authentication

- JWT
- bcryptjs

### Validation

- express-validator

### Documentation

- Swagger UI
- swagger-jsdoc

### Security

- Helmet
- Morgan
- Express Rate Limit

---

## 📂 Project Structure

```text
Luxury-Automobile-Showroom/
│
├── Backend/
├── Frontend/
├── Database/
├── Documents/
└── README.md
```

## ⚙️ Installation

### 1. Clone Repository

```bash
git clone https://github.com/your-username/Luxury-Automobile-Showroom.git
```

### 2. Go to Backend

```bash
cd Luxury-Automobile-Showroom/Backend
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file inside the Backend folder.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### 5. Run Backend

```bash
npm run dev
```

Backend will start at:

```
http://localhost:5000
```

---

## 📘 API Documentation

After starting the backend, open:

```
http://localhost:5000/api-docs
```

Swagger UI will display all available REST APIs.


---

## 📸 Screenshots

### Home Page

_Add screenshot here_

### Admin Dashboard

_Add screenshot here_

### Swagger API Documentation

_Add screenshot here_

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint |
|--------|----------|
| POST | `/api/admin/register` |
| POST | `/api/admin/login` |
| GET | `/api/admin/profile` |

### Cars

| Method | Endpoint |
|--------|----------|
| GET | `/api/cars` |
| GET | `/api/cars/:id` |
| GET | `/api/cars/:id/similar` |
| POST | `/api/cars` |
| PUT | `/api/cars/:id` |
| DELETE | `/api/cars/:id` |

### Brands

| Method | Endpoint |
|--------|----------|
| GET | `/api/brands` |
| GET | `/api/brands/:id` |
| POST | `/api/brands` |
| PUT | `/api/brands/:id` |
| DELETE | `/api/brands/:id` |

### Leads

| Method | Endpoint |
|--------|----------|
| POST | `/api/leads` |
| GET | `/api/leads` |
| PUT | `/api/leads/:id` |

### Test Drives

| Method | Endpoint |
|--------|----------|
| POST | `/api/test-drives` |
| GET | `/api/test-drives` |
| PUT | `/api/test-drives/:id` |

### Dashboard

| Method | Endpoint |
|--------|----------|
| GET | `/api/dashboard` |

### Upload

| Method | Endpoint |
|--------|----------|
| POST | `/api/upload` |

---

## 🚀 Future Improvements

- User Authentication
- Wishlist Feature
- Car Comparison
- Online Payment Integration
- Email Notifications
- Cloud Image Storage (Cloudinary)
- Docker Support
- CI/CD Pipeline
- Unit & Integration Testing
- Production Deployment

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a new branch
3. Commit your changes
4. Push the branch
5. Create a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Prathmesh Chauhan**

- GitHub: https://github.com/prathmesh-5
- LinkedIn: https://www.linkedin.com/in/prathmesh-chauhan088/

---

⭐ If you like this project, don't forget to give it a star on GitHub!


```
Luxury-Automobile-Showroom
├─ Backend
│  ├─ .env
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ src
│  │  ├─ app.js
│  │  ├─ config
│  │  │  └─ db.js
│  │  ├─ controllers
│  │  │  ├─ adminController.js
│  │  │  ├─ brandController.js
│  │  │  ├─ carController.js
│  │  │  ├─ dashboardController.js
│  │  │  ├─ leadController.js
│  │  │  └─ testDriveController.js
│  │  ├─ middleware
│  │  │  ├─ asyncHandler.js
│  │  │  ├─ authMiddleware.js
│  │  │  ├─ errorMiddleware.js
│  │  │  ├─ notFoundMiddleware.js
│  │  │  ├─ rateLimitMiddleware.js
│  │  │  ├─ uploadMiddleware.js
│  │  │  └─ validationMiddleware.js
│  │  ├─ models
│  │  │  ├─ Admin.js
│  │  │  ├─ Brand.js
│  │  │  ├─ Car.js
│  │  │  ├─ Lead.js
│  │  │  └─ TestDrive.js
│  │  ├─ routes
│  │  │  ├─ adminRoutes.js
│  │  │  ├─ brandRoutes.js
│  │  │  ├─ carRoutes.js
│  │  │  ├─ dashboardRoutes.js
│  │  │  ├─ leadRoutes.js
│  │  │  ├─ testDriveRoutes.js
│  │  │  └─ uploadRoutes.js
│  │  ├─ server.js
│  │  ├─ utils
│  │  │  ├─ ApiError.js
│  │  │  └─ apiResponse.js
│  │  └─ validators
│  │     ├─ adminValidator.js
│  │     ├─ brandValidator.js
│  │     ├─ carValidator.js
│  │     ├─ leadValidator.js
│  │     └─ testDriveValidator.js
│  └─ uploads
│     ├─ 1785405761697-548624658.jpg
│     ├─ 1785408491970-192253914.jpg
│     ├─ 1785408491976-376621150.jpg
│     └─ 1785408492000-261039505.jpg
├─ Database
│  ├─ 01_Requirement_Analysis.md
│  ├─ 02_Collections.md
│  ├─ 03_Relationships.md
│  ├─ 04_Cars.md
│  ├─ 05_Brands.md
│  ├─ 06_Leads.md
│  ├─ 07_Bookings.md
│  ├─ 08_SellCars.md
│  ├─ 09_FAQs.md
│  ├─ 10_Admins.md
│  ├─ Database_Notes.md
│  └─ ER_Diagram.drawio
├─ Documents
├─ Frontend
└─ README.md

```