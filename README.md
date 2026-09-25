# 🚗 Luxury Automobile Showroom

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v5.1-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-v19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-v8.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%20v8-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-Authentication-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Swagger](https://img.shields.io/badge/Swagger-OpenAPI%203.0-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](http://localhost:5000/api-docs)
[![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)](#-license)

> **Apex Luxury Automobile Showroom** is a full-stack, enterprise-grade digital showroom platform engineered for high-end automotive dealerships. Designed with an ultra-premium dark obsidian and metallic gold aesthetic, the platform combines a high-performance public vehicle portal with a feature-rich, dynamic CMS Admin Dashboard.

---

## 📋 Table of Contents

- [🚗 Project Overview](#-project-overview)
- [✨ Key Highlights](#-key-highlights)
- [👤 User Features](#-user-features)
- [🔐 Admin Dashboard \& CMS](#-admin-dashboard--cms)
- [🔄 Automation \& Integrations](#-automation--integrations)
- [🛠️ Technology Stack](#️-technology-stack)
- [🏗️ System Architecture](#️-system-architecture)
- [🗄️ Database Architecture](#️-database-architecture)
- [📡 API Reference](#-api-reference)
- [🛡️ Security Architecture](#️-security-architecture)
- [📁 File Upload System](#-file-upload-system)
- [📂 Project Structure](#-project-structure)
- [🔑 Environment Variables](#-environment-variables)
- [🚀 Installation \& Setup](#-installation--setup)
- [💻 Development Workflow](#-development-workflow)
- [📦 Production Deployment](#-production-deployment)
- [⚠️ Error Handling \& Validation](#️-error-handling--validation)
- [🎨 Responsive UI \& UX Design](#-responsive-ui--ux-design)
- [📊 Feature Matrix](#-feature-matrix)
- [🔮 Future Roadmap](#-future-roadmap)
- [🔧 Troubleshooting](#-troubleshooting)
- [🔒 Git Security Notes](#-git-security-notes)
- [👤 Author](#-author)
- [📄 License](#-license)

---

## 🚗 Project Overview

The **Luxury Automobile Showroom** platform is designed to provide luxury vehicle dealerships with a digital presence that matches the elegance, precision, and exclusivity of exotic automobiles (Ferrari, Lamborghini, Rolls-Royce, Porsche, McLaren, Bentley, Aston Martin, etc.).

### The Problem It Solves
Traditional vehicle listing templates are often generic, bloated, and lack real-time synchronization with dealership inventory systems. Dealership management frequently struggles with manual inventory updates, fragmented customer enquiry tracking, and static web content that requires developer intervention to modify.

### The Solution
This platform delivers:
1. **Immersive Client Experience**: A sleek, animation-rich client portal built with React 19 and Framer Motion, enabling clients to explore high-resolution vehicle specs, videos, and request test drives.
2. **Dynamic CMS Admin Suite**: A complete back-office administration panel empowering dealership owners to customize homepage hero banners, brand showcases, contact details, footer links, company history, and FAQs without touching code.
3. **Automated Inventory Synchronization**: Bi-directional, MD5 hash-based real-time and scheduled synchronization between MongoDB and Google Sheets using the official Google Sheets API v4.
4. **Targeted Marketing & Campaign Management**: Built-in newsletter subscriber management with open/click analytics, rich HTML campaign building, CSV exports, test email sending, and single-click broadcast execution via SMTP Nodemailer.

---

## ✨ Key Highlights

- **Exotic Vehicle Showcase**: Detailed spec breakdown (engine, transmission, fuel type, mileage, condition, pricing options including *Price on Call*), multi-image gallery, video support, and similar vehicle recommendations.
- **Bi-Directional Google Sheets Sync**: Automated inventory syncing with MD5 hash normalization, conflict resolution (Admin UI priority), real-time instant write-back, and accidental deletion safeguards.
- **Complete Dynamic CMS**: Real-time management of Hero Banners, About Us narrative, Brand Showcase, Contact details, FAQs, and Footer links.
- **Newsletter Campaign Suite**: Automated tracking pixel injection for email open rates, link rewriting for click-through rate analysis, subscriber CSV exports, and tokenized single-click unsubscriptions.
- **Lead & Test Drive Scheduling**: Complete customer funnel management covering general enquiries, vehicle-specific inquiries, test-drive scheduling, and car valuation requests (*Sell Your Car*).
- **Hardened Security**: JWT authentication, bcryptjs password hashing, 15-minute expiring password reset tokens, Helmet headers, CORS policies, and IP-based rate limiting.
- **Interactive OpenAPI Documentation**: Built-in Swagger UI accessible at `/api-docs`.

---

## 👤 User Features

### 1. 🏎️ Vehicle Discovery & Filtering
- **Inventory Page**: Filter vehicles by Brand, Condition (*New* vs *Used*), Transmission (*Automatic* vs *Manual*), and Fuel Type (*Petrol*, *Diesel*, *Hybrid*, *Electric*).
- **Search & Sort**: Real-time name/model search and featured priority sorting (`featuredPriority`).
- **Vehicle Details View**: Comprehensive specs table, multi-image lightbox gallery, embedded video player, and "Price on Call" status badge.
- **Similar Recommendations**: Dynamic retrieval of related vehicles matching the current brand or category.

### 2. 📅 Test Drive Booking
- Clients can schedule a personalized test drive by specifying their target vehicle, preferred date, time, contact information, and special notes.
- Submissions are automatically routed to the Admin Dashboard for approval and status updating.

### 3. 💼 Customer Enquiries & Car Valuation
- **General & Vehicle Inquiries**: Contact forms allowing clients to request customized financing quotes or ask specific questions.
- **Sell Your Car**: Client portal to submit vehicle details and upload media files for professional dealership appraisal.

### 4. 📬 Newsletter & Interactive Features
- **Instant Subscription**: Rate-limited newsletter subscription widget in the footer.
- **Self-Service Unsubscribe**: Tokenized single-click unsubscribe link provided in all broadcast emails.
- **Interactive Chatbot**: Floating assistant (`Chatbot.jsx`) offering instant answers and navigation assistance.
- **Interactive Wheel & Hover Cards**: Custom UI elements (`FloatingWheel.jsx`, `HoverTrackerCard.jsx`) delivering an engaging user experience.

---

## 🔐 Admin Dashboard & CMS

The Admin Panel (`/admin`) is accessible via protected JWT routes and offers centralized operational control.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       ADMIN DASHBOARD & CMS                             │
├──────────────────┬──────────────────────┬───────────────────────────────┤
│ Core Operations  │ Content Management   │ Marketing & Automation        │
├──────────────────┼──────────────────────┼───────────────────────────────┤
│ • Overview Stats │ • Hero Banner Config │ • Subscriber Management       │
│ • Car Management │ • About Us Narrative │ • Campaign Builder            │
│ • Brand Database │ • Brand Showcase     │ • Open / Click Analytics      │
│ • Lead Tracking  │ • Contact & Map Info │ • Google Sheets Sync Control  │
│ • Booking Desk   │ • Footer Links       │ • SMTP Email Testing          │
│ • Sell Requests  │ • FAQ Management     │ • Profile & Security Settings │
└──────────────────┴──────────────────────┴───────────────────────────────┘
```

### 1. 📊 Analytics & Profile Management
- **Dashboard Stats**: Real-time counter cards for Total Cars, Active Brands, Customer Leads, Bookings, Newsletter Subscribers, and Active Campaigns.
- **Admin Profile**: Secure interface to update Admin display name, email address, and change passwords with current-password verification.

### 2. 🚗 Vehicle & Brand Management
- **Car Management**: Full CRUD operations for showroom vehicles, including image/video file uploads, featured toggle, priority ranking (1–9999), and inventory status (*Available* vs *Sold*).
- **Brand Management**: Full CRUD operations for automotive brands (name, slug, country of origin, logo, description, active status).

### 3. 📋 Lead & Booking Workflow
- **Leads Manager**: Review general enquiries, car inquiries, and valuation requests with status progression (`New` → `Contacted` → `In Progress` → `Completed` → `Cancelled`).
- **Test Drives Desk**: Manage date/time requests with status updates and customer contact actions.
- **Sell Requests**: Review valuation requests and uploaded vehicle inspection photos submitted by prospective sellers.

### 4. 🖼️ Dynamic CMS Modules
- **Hero Settings**: Modify hero section title, subtitle, background image/video URLs, badge text, and call-to-action buttons.
- **About Settings**: Edit dealership story, mission, vision, statistics counters, core values, or reset to factory defaults.
- **Brand Showcase Settings**: Control heading text, subheadings, and layout visibility for featured brands.
- **Contact Settings**: Update showroom physical address, sales email, phone numbers, working hours, and Google Maps embed URL.
- **Footer Settings**: Configure company description, social media handles, quick links, and copyright notices.
- **FAQ Manager**: Create, edit, and reorder public frequency asked questions.

### 5. 📧 Newsletter & Campaign Manager
- **Subscriber Lists**: Filter subscribers by status (`Subscribed`, `Unsubscribed`), perform bulk status updates or deletions, and export subscriber lists directly to CSV.
- **Campaign Builder**: Draft rich HTML email newsletters, send instant test emails to specific addresses, and trigger broadcast deliveries.
- **Campaign Analytics**: Track total sent count, open rates (via transparent tracking pixel), and click rates (via link redirect tracking).

### 6. 🔄 Google Sheets Sync Controls
- Configure Google Spreadsheet ID, Sheet Name, automatic sync toggle, and sync interval (e.g., 5 minutes).
- Execute on-demand manual synchronization with real-time log feedback.

---

## 🔄 Automation & Integrations

```
┌─────────────────┐       HTTP REST       ┌─────────────────┐
│  React Frontend ├──────────────────────►│  Express API    │
└─────────────────┘                       └────────┬────────┘
                                                   │
                ┌──────────────────────────────────┼──────────────────────────────────┐
                │                                  │                                  │
                ▼                                  ▼                                  ▼
      ┌──────────────────┐               ┌──────────────────┐               ┌──────────────────┐
      │ MongoDB Database │               │ Nodemailer SMTP  │               │ Google Sheets v4 │
      │  (Mongoose ORM)  │               │ (Mail Delivery)  │               │  (JWT Auth Sync) │
      └──────────────────┘               └──────────────────┘               └──────────────────┘
```

### 1. 🟢 Google Sheets Inventory Sync Service (`syncService.js`)
- **Technology**: `googleapis` (v4 API) with JWT Service Account authentication (`GOOGLE_SERVICE_ACCOUNT_JSON`).
- **Two-Way Sync**: 
  - Changes in Google Sheets update MongoDB vehicles.
  - Changes in Admin UI instantly update Google Sheets cells.
- **Conflict Resolution**: MD5 hash-based difference detection (`calculateVehicleHash`). In the event of simultaneous modifications, the Admin UI / MongoDB state takes precedence.
- **Safeguard against Accidental Deletion**: If a row is deleted from Google Sheets, the system preserves the MongoDB record to prevent loss of data.
- **Background Scheduler**: Node.js interval timer (`startSyncScheduler`) executing periodic background updates based on dealership settings.

### 2. 📧 SMTP Email Service (`mailService.js`)
- **Password Reset**: Generates 15-minute secure JWT reset tokens and sends custom HTML emails formatted in dealership branding.
- **Development Fallback**: If SMTP variables are unconfigured during local development, reset links are logged to `logs/email-debug.log`.
- **Newsletter Engine**: Handles broadcast delivery with automated open-tracking pixel injection (`/api/newsletter/track/open/:token`) and click-tracking link rewriting (`/api/newsletter/track/click/:token`).

---

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **React** | `v19.2.8` | Component-based User Interface library |
| **Vite** | `v8.2.0` | Ultra-fast frontend build tool and dev server |
| **React Router DOM** | `v7.18.2` | Declarative client-side routing with protected routes |
| **Framer Motion** | `v12.43.0` | Smooth page transitions and fluid micro-animations |
| **Swiper** | `v14.0.7` | Touch-enabled carousels for vehicle galleries |
| **AOS** | `v2.3.4` | Animate-On-Scroll visual library |
| **Axios** | `v1.19.0` | HTTP client with automatic JWT request/response interceptors |
| **React Hot Toast** | `v2.6.0` | Responsive toast notifications |
| **React Icons** | `v5.7.0` | Feather, FontAwesome, and Material design icons |

### Backend
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Node.js** | `v18+` | JavaScript runtime environment |
| **Express** | `v5.1.0` | Fast, unopinionated web framework for Node |
| **Mongoose** | `v8.24.2` | MongoDB object modeling and schema validation |
| **JSONWebToken** | `v9.0.3` | Secure stateless authentication for Admin routes |
| **BcryptJS** | `v3.0.3` | One-way password hashing algorithm |
| **Multer** | `v2.2.0` | Multipart/form-data handling for file uploads |
| **Nodemailer** | `v9.0.3` | SMTP email transport engine |
| **GoogleAPIs** | `v174.0.1` | Official Google Sheets API v4 integration |
| **Helmet** | `v8.3.0` | Security headers middleware |
| **Express Rate Limit**| `v8.6.1` | IP-based request rate limiting |
| **Express Validator** | `v7.3.2` | Request body and parameters validation |
| **Swagger UI Express**| `v5.0.1` | Interactive API documentation viewer |

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Client ["Client Layer"]
        User["👤 Public Visitor"]
        Admin["🔐 Dealership Administrator"]
    end

    subgraph FrontendApp ["React 19 Frontend (Vite)"]
        PublicRoutes["Public Pages\n(Home, Cars, About, Contact, Test Drive)"]
        AdminPages["Admin Dashboard & CMS\n(Cars, Brands, Leads, Settings, Campaigns)"]
        AxiosClient["Axios HTTP Service\n(JWT Interceptor)"]
    end

    subgraph BackendAPI ["Express 5 REST Backend"]
        SecurityMiddleware["Security Layer\n(Helmet, CORS, Rate Limiters)"]
        AuthGuard["Auth Guard\n(JWT Verification)"]
        APIRoutes["Express Controllers & Validators"]
        UploadEngine["Multer File Upload Storage\n(/uploads Directory)"]
        MailEngine["Nodemailer Email Service"]
        SyncEngine["Google Sheets Sync Service"]
    end

    subgraph ExternalServices ["Data & External Layer"]
        MongoDB[("MongoDB Database\n(15 Mongoose Schemas)")]
        GoogleSheets["📊 Google Sheets API v4\n(Inventory Sync)"]
        SMTPServer["📧 SMTP Mail Server\n(Transactional & Campaigns)"]
    end

    User --> PublicRoutes
    Admin --> AdminPages
    PublicRoutes --> AxiosClient
    AdminPages --> AxiosClient
    AxiosClient --> SecurityMiddleware
    SecurityMiddleware --> AuthGuard
    AuthGuard --> APIRoutes
    APIRoutes --> UploadEngine
    APIRoutes --> MongoDB
    APIRoutes --> MailEngine
    APIRoutes --> SyncEngine
    MailEngine --> SMTPServer
    SyncEngine <--> GoogleSheets
```

---

## 🗄️ Database Architecture

The application utilizes **MongoDB** with **Mongoose ORM**. Data schemas are organized into 15 models:

```
                                  ┌──────────────┐
                                  │    Brand     │
                                  └──────┬───────┘
                                         │ 1
                                         │
                                         │ N
┌──────────────┐                  ┌──────┴───────┐
│     Lead     │                  │     Car      │
└──────────────┘                  └──────────────┘
┌──────────────┐                  ┌──────────────┐
│  TestDrive   │                  │   SellCar    │
└──────────────┘                  └──────────────┘
┌──────────────┐                  ┌──────────────┐
│    Admin     │                  │   Settings   │
└──────────────┘                  └──────────────┘
┌───────────────────────┐         ┌───────────────────────┐
│ NewsletterSubscriber  │◄───────►│  NewsletterCampaign   │
└───────────────────────┘         └───────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ CMS Models: HeroSettings, AboutSettings, ContactSettings│
│             FooterSettings, BrandShowcaseSettings, FAQ  │
└─────────────────────────────────────────────────────────┘
```

| Model | Collection | Primary Purpose | Key Fields |
| :--- | :--- | :--- | :--- |
| **`Car`** | `cars` | Showroom vehicle records | `name`, `brandId` (Ref: Brand), `model`, `year`, `price`, `priceOnCall`, `condition`, `status`, `images`, `featured`, `featuredPriority`, `lastSyncedHash` |
| **`Brand`** | `brands` | Automotive brand metadata | `name`, `slug`, `logo`, `country`, `description`, `isActive` |
| **`Lead`** | `leads` | Customer inquiries | `type` (*General*, *Car Inquiry*), `carId` (Ref: Car), `name`, `email`, `phone`, `message`, `status` |
| **`TestDrive`** | `testdrives` | Test-drive bookings | `carId` (Ref: Car), `name`, `email`, `phone`, `preferredDate`, `preferredTime`, `status`, `notes` |
| **`SellCar`** | `sellcars` | Valuation requests | `name`, `email`, `phone`, `brand`, `model`, `year`, `mileage`, `expectedPrice`, `images`, `status` |
| **`Admin`** | `admins` | Showroom administrators | `name`, `email`, `password` (bcrypt), `resetPasswordToken`, `resetPasswordExpires` |
| **`Settings`** | `settings` | System & Sync config | `googleSpreadsheetId`, `googleSheetName`, `syncEnabled`, `syncIntervalMinutes`, `lastSyncTime`, `syncErrors` |
| **`HeroSettings`** | `herosettings` | Homepage hero CMS | `title`, `subtitle`, `badgeText`, `bgImage`, `bgVideo`, `primaryCtaText`, `secondaryCtaText` |
| **`AboutSettings`** | `aboutsettings` | About Us page CMS | `title`, `subtitle`, `story`, `mission`, `vision`, `stats`, `values` |
| **`BrandShowcaseSettings`** | `brandshowcasesettings` | Brand section CMS | `heading`, `subheading`, `displayCount`, `autoPlay` |
| **`ContactSettings`** | `contactsettings` | Showroom contact CMS | `address`, `email`, `phone`, `workingHours`, `mapEmbedUrl` |
| **`FooterSettings`** | `footersettings` | Website footer CMS | `aboutText`, `copyrightText`, `quickLinks`, `socialLinks` |
| **`FAQ`** | `faqs` | Frequently asked questions | `question`, `answer`, `order`, `isActive` |
| **`NewsletterSubscriber`** | `newslettersubscribers` | Email mailing list | `email`, `status`, `unsubscribeToken`, `subscribedAt`, `unsubscribedAt` |
| **`NewsletterCampaign`** | `newslettercampaigns` | Marketing email broadcasts | `subject`, `contentHtml`, `status`, `sentCount`, `openCount`, `clickCount`, `sentAt` |

> Note: Detailed schema specifications and collection requirements are documented in the [`/Database`](file:///c:/Users/HP/Downloads/Luxury-Automobile-Showroom/Database) directory.

---

## 📡 API Reference

Base Endpoint URL: `http://localhost:5000/api`  
Interactive Swagger Documentation: `http://localhost:5000/api-docs`

### 🔑 Authentication (`/api/admin`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/admin/login` | Public | Authenticate admin credentials and return JWT token |
| `GET` | `/api/admin/profile` | Bearer | Retrieve logged-in admin profile details |
| `PUT` | `/api/admin/profile` | Bearer | Update admin name |
| `PUT` | `/api/admin/profile/email` | Bearer | Update admin email address |
| `PUT` | `/api/admin/profile/password` | Bearer | Update admin password with current password verification |
| `POST` | `/api/admin/forgot-password` | Public | Generate reset token and send SMTP email |
| `GET` | `/api/admin/reset-password` | Public | Validate password reset token eligibility |
| `POST` | `/api/admin/reset-password` | Public | Execute password reset using valid token |

### 🏎️ Vehicles (`/api/cars`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/cars` | Public | List all vehicles with optional filters, search, and pagination |
| `GET` | `/api/cars/:id` | Public | Get single vehicle details by ID or slug |
| `GET` | `/api/cars/:id/similar` | Public | Get recommended similar vehicles |
| `POST` | `/api/cars` | Bearer | Create a new vehicle record |
| `PUT` | `/api/cars/:id` | Bearer | Update an existing vehicle record |
| `DELETE` | `/api/cars/:id` | Bearer | Delete a vehicle record |

### 🏷️ Brands (`/api/brands`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/brands` | Public | Get list of active automotive brands |
| `GET` | `/api/brands/:id` | Public | Get brand details by ID |
| `POST` | `/api/brands` | Bearer | Create a new automotive brand |
| `PUT` | `/api/brands/:id` | Bearer | Update brand information |
| `DELETE` | `/api/brands/:id` | Bearer | Delete brand |

### 📋 Leads, Test Drives & Valuation (`/api/...`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/leads` | Public | Submit customer enquiry |
| `GET` | `/api/leads` | Bearer | List all customer leads |
| `PUT` | `/api/leads/:id` | Bearer | Update lead status |
| `DELETE` | `/api/leads/:id` | Bearer | Delete lead record |
| `POST` | `/api/test-drives` | Public | Book a vehicle test drive |
| `GET` | `/api/test-drives` | Bearer | List test drive bookings |
| `PUT` | `/api/test-drives/:id` | Bearer | Update test drive booking status |
| `DELETE` | `/api/test-drives/:id` | Bearer | Delete test drive booking |
| `POST` | `/api/sell-cars` | Public | Submit car valuation request |
| `GET` | `/api/sell-cars` | Bearer | List car valuation requests |
| `PUT` | `/api/sell-cars/:id` | Bearer | Update sell car request status |
| `DELETE` | `/api/sell-cars/:id` | Bearer | Delete sell car request |

### 🖼️ CMS Settings (`/api/...`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/hero-settings` | Public | Fetch hero section configuration |
| `PUT` | `/api/hero-settings` | Bearer | Update hero section configuration |
| `GET` | `/api/about-settings` | Public | Fetch About Us configuration |
| `PUT` | `/api/about-settings` | Bearer | Update About Us configuration |
| `POST` | `/api/about-settings/reset` | Bearer | Reset About Us section to defaults |
| `GET` | `/api/contact-settings` | Public | Fetch Contact information configuration |
| `PUT` | `/api/contact-settings` | Bearer | Update Contact information |
| `POST` | `/api/contact-settings/reset`| Bearer | Reset Contact information to defaults |
| `GET` | `/api/footer-settings` | Public | Fetch Footer configuration |
| `PUT` | `/api/footer-settings` | Bearer | Update Footer configuration |
| `POST` | `/api/footer-settings/reset` | Bearer | Reset Footer configuration to defaults |
| `GET` | `/api/brand-showcase-settings`| Public | Fetch Brand Showcase settings |
| `PUT` | `/api/brand-showcase-settings`| Bearer | Update Brand Showcase settings |
| `GET` | `/api/faqs` | Public | List FAQs |
| `POST` | `/api/faqs` | Bearer | Create FAQ item |
| `PUT` | `/api/faqs/:id` | Bearer | Update FAQ item |
| `DELETE` | `/api/faqs/:id` | Bearer | Delete FAQ item |

### 📧 Newsletter & Marketing (`/api/newsletter`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/newsletter/subscribe` | Rate-Limited | Public newsletter subscription |
| `GET` | `/api/newsletter/unsubscribe` | Public | Tokenized unsubscribe execution |
| `GET` | `/api/newsletter/subscribers` | Bearer | List subscribers with pagination & search |
| `PATCH` | `/api/newsletter/subscribers/:id/status`| Bearer | Toggle individual subscriber status |
| `POST` | `/api/newsletter/subscribers/bulk-status`| Bearer | Bulk status update for subscribers |
| `DELETE` | `/api/newsletter/subscribers/:id` | Bearer | Delete subscriber record |
| `POST` | `/api/newsletter/subscribers/bulk-delete`| Bearer | Bulk delete subscribers |
| `GET` | `/api/newsletter/export` | Bearer | Export subscriber list as CSV file download |
| `GET` | `/api/newsletter/campaigns` | Bearer | List newsletter campaigns |
| `POST` | `/api/newsletter/campaigns` | Bearer | Create new email campaign draft |
| `PUT` | `/api/newsletter/campaigns/:id` | Bearer | Update email campaign draft |
| `DELETE` | `/api/newsletter/campaigns/:id` | Bearer | Delete email campaign |
| `POST` | `/api/newsletter/campaigns/:id/test-email`| Bearer | Send test campaign email to custom address |
| `POST` | `/api/newsletter/campaigns/:id/send` | Bearer | Trigger broadcast delivery of campaign |
| `GET` | `/api/newsletter/track/open/:token` | Public | 1x1 GIF tracking pixel endpoint |
| `GET` | `/api/newsletter/track/click/:token` | Public | Click tracking redirect endpoint |

### ⚙️ System, Uploads & Dashboard (`/api/...`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard` | Bearer | Get admin metrics and operational analytics |
| `POST` | `/api/upload` | Bearer | Upload multiple image/video files (Multer) |
| `POST` | `/api/upload/public-sell-car`| Public | Upload public vehicle valuation images |
| `GET` | `/api/settings` | Bearer | Get Google Sheets sync configuration |
| `PUT` | `/api/settings` | Bearer | Update Google Sheets sync configuration |
| `POST` | `/api/settings/sync` | Bearer | Trigger immediate manual inventory sync |

---

## 🛡️ Security Architecture

1. **Stateless JWT Authentication**: Admin endpoints require a valid `Bearer <token>` HTTP header verified by `authMiddleware.js`.
2. **Password Cryptography**: Admin passwords are encrypted using `bcryptjs` with standard salt rounds.
3. **HTTP Header Hardening**: `helmet` is configured to sanitize headers and enforce cross-origin resource policy.
4. **CORS Control**: Configured to restrict origin requests and block unauthorized cross-site scripting.
5. **Rate Limiting Protection**:
   - **Global Limiter**: Restricts IP requests to 2000 calls per 15-minute window.
   - **Newsletter Subscription Limiter**: Strict limit of 20 subscription attempts per IP per 15 minutes to prevent spam attacks.
6. **Payload Sanitization**: `express-validator` validates incoming request parameters, emails, and payload types before controller logic runs.
7. **Secure Password Reset**: Password reset links use 15-minute expiring tokens generated via cryptographic hashes.

---

## 📁 File Upload System

File uploads are managed via **Multer** (`uploadMiddleware.js`):
- **Storage Path**: `Backend/uploads/`
- **Supported File Types**: Images (`image/*`) and Videos (`video/*`)
- **File Size Limit**: `100 MB` per file
- **Filename Sanitization**: Uploaded files receive timestamped, randomized unique names (`Date.now()-random.ext`).
- **Public Serving**: Files are served statically via Express at `/uploads` with 1-day client-side caching (`maxAge: 1d`, `etag: true`).

> **Note**: Both `Backend/uploads/` and `.env` files are explicitly included in `.gitignore` to prevent sensitive credentials and temporary runtime assets from being committed to source control.

---

## 📂 Project Structure

```
Luxury-Automobile-Showroom/
├── Backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                        # MongoDB Mongoose connection handler
│   │   ├── controllers/                     # Express request handlers
│   │   │   ├── aboutSettingsController.js
│   │   │   ├── adminController.js
│   │   │   ├── brandController.js
│   │   │   ├── brandShowcaseSettingsController.js
│   │   │   ├── carController.js
│   │   │   ├── contactSettingsController.js
│   │   │   ├── dashboardController.js
│   │   │   ├── faqController.js
│   │   │   ├── footerSettingsController.js
│   │   │   ├── heroSettingsController.js
│   │   │   ├── leadController.js
│   │   │   ├── newsletterCampaignController.js
│   │   │   ├── newsletterController.js
│   │   │   ├── sellCarController.js
│   │   │   ├── settingsController.js
│   │   │   └── testDriveController.js
│   │   ├── docs/
│   │   │   └── swagger.js                   # Swagger/OpenAPI specification config
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js            # JWT verification guard
│   │   │   ├── errorMiddleware.js           # Centralized exception handler
│   │   │   ├── notFoundMiddleware.js        # 404 handler
│   │   │   ├── rateLimitMiddleware.js       # Express rate limiters
│   │   │   ├── uploadMiddleware.js          # Multer file storage & mime filters
│   │   │   └── validationMiddleware.js      # Express validator result checker
│   │   ├── models/                          # Mongoose schemas
│   │   │   ├── AboutSettings.js
│   │   │   ├── Admin.js
│   │   │   ├── Brand.js
│   │   │   ├── BrandShowcaseSettings.js
│   │   │   ├── Car.js
│   │   │   ├── ContactSettings.js
│   │   │   ├── FAQ.js
│   │   │   ├── FooterSettings.js
│   │   │   ├── HeroSettings.js
│   │   │   ├── Lead.js
│   │   │   ├── NewsletterCampaign.js
│   │   │   ├── NewsletterSubscriber.js
│   │   │   ├── SellCar.js
│   │   │   ├── Settings.js
│   │   │   └── TestDrive.js
│   │   ├── routes/                          # Express route definitions
│   │   │   ├── aboutSettingsRoutes.js
│   │   │   ├── adminRoutes.js
│   │   │   ├── brandRoutes.js
│   │   │   ├── brandShowcaseSettingsRoutes.js
│   │   │   ├── carRoutes.js
│   │   │   ├── contactSettingsRoutes.js
│   │   │   ├── dashboardRoutes.js
│   │   │   ├── faqRoutes.js
│   │   │   ├── footerSettingsRoutes.js
│   │   │   ├── heroSettingsRoutes.js
│   │   │   ├── leadRoutes.js
│   │   │   ├── newsletterCampaignRoutes.js
│   │   │   ├── newsletterRoutes.js
│   │   │   ├── sellCarRoutes.js
│   │   │   ├── settingsRoutes.js
│   │   │   ├── testDriveRoutes.js
│   │   │   └── uploadRoutes.js
│   │   ├── services/
│   │   │   ├── mailService.js               # Nodemailer SMTP engine
│   │   │   └── syncService.js               # Google Sheets API two-way sync
│   │   ├── utils/
│   │   │   ├── ApiError.js                  # Operational error class
│   │   │   └── apiResponse.js               # Standardized API response formatter
│   │   ├── validators/                      # Express validator definitions
│   │   │   ├── adminValidator.js
│   │   │   ├── brandValidator.js
│   │   │   ├── carValidator.js
│   │   │   ├── leadValidator.js
│   │   │   └── testDriveValidator.js
│   │   ├── app.js                           # Express application assembly
│   │   └── server.js                        # HTTP server entry point & migration
│   ├── .gitignore                           # Backend ignore rules
│   └── package.json                         # Backend dependencies & scripts
│
├── Frontend/
│   ├── src/
│   │   ├── components/                      # Reusable UI components
│   │   │   ├── Brands/
│   │   │   ├── Chatbot/
│   │   │   ├── FeaturedCars/
│   │   │   ├── FloatingWheel/
│   │   │   ├── Footer/
│   │   │   ├── Hero/
│   │   │   ├── Navbar/
│   │   │   └── ScrollToTop/
│   │   ├── layouts/
│   │   │   ├── AdminLayout.jsx              # Sidebar & topbar layout for Admin
│   │   │   └── UserLayout.jsx               # Navigation & footer layout for Client
│   │   ├── pages/                           # Application pages
│   │   │   ├── About/
│   │   │   ├── Admin/                       # Admin CMS & Management Pages
│   │   │   │   ├── AboutSettings.jsx
│   │   │   │   ├── Bookings.jsx
│   │   │   │   ├── Brands.jsx
│   │   │   │   ├── BrandShowcaseSettings.jsx
│   │   │   │   ├── Cars.jsx
│   │   │   │   ├── ContactSettings.jsx
│   │   │   │   ├── CreateCampaign.jsx
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── FAQs.jsx
│   │   │   │   ├── FooterSettings.jsx
│   │   │   │   ├── HeroSettings.jsx
│   │   │   │   ├── Leads.jsx
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── NewsletterCampaigns.jsx
│   │   │   │   ├── NewsletterSubscribers.jsx
│   │   │   │   ├── PremiumSelect.jsx
│   │   │   │   ├── ProfileSettings.jsx
│   │   │   │   ├── ResetPassword.jsx
│   │   │   │   └── SellRequests.jsx
│   │   │   ├── CarDetails/
│   │   │   ├── Cars/
│   │   │   ├── Contact/
│   │   │   ├── FAQ/
│   │   │   ├── Home/
│   │   │   ├── NotFound/
│   │   │   ├── SellYourCar/
│   │   │   ├── TestDrive/
│   │   │   └── Unsubscribe/
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx                # Client & Protected Admin routes
│   │   ├── services/
│   │   │   └── api.js                       # Axios API client modules
│   │   └── main.jsx                         # React 19 root entry point
│   ├── .gitignore                           # Frontend ignore rules
│   ├── index.html                           # HTML template
│   ├── package.json                         # Frontend dependencies & scripts
│   └── vite.config.js                       # Vite bundler configuration
│
├── Database/                                # Architecture & schema design docs
│   ├── 01_Requirement_Analysis.md
│   ├── 02_Collections.md
│   ├── 03_Relationships.md
│   ├── 04_Cars.md
│   └── Database_Notes.md
│
├── Documents/                               # Additional dealership documentation
└── README.md                                # Root project documentation
```

---

## 🔑 Environment Variables

### Backend Configuration (`Backend/.env`)
Create a file named `.env` in the `Backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
VITE_CLIENT_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000/api

# Database Configuration
MONGO_URI=mongodb://127.0.0.1:27017/luxury_showroom

# Security / Authentication
JWT_SECRET=your_super_secret_jwt_key_change_in_production

# Email / SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM="Apex Luxury Showroom" <your_email@gmail.com>

# Google Sheets API Integration (Service Account JSON Stringified)
GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"...","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n","client_email":"...","client_id":"..."}'
```

### Frontend Configuration (`Frontend/.env`)
Create a file named `.env` in the `Frontend` directory:

```env
# API Base Endpoint
VITE_API_URL=http://localhost:5000/api

# Static Image Base URL
VITE_IMAGE_BASE_URL=http://localhost:5000

# Contact Whatsapp Integration
VITE_WHATSAPP_NUMBER=+1234567890
```

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **MongoDB**: Local MongoDB instance running on port `27017` or MongoDB Atlas URI

### Step 1: Clone Repository
```bash
git clone https://github.com/Prathmesh-5/Luxury-Automobile-Showroom.git
cd Luxury-Automobile-Showroom
```

### Step 2: Backend Setup
```bash
cd Backend
npm install
```
Configure your `Backend/.env` file with the required environment variables.

### Step 3: Frontend Setup
```bash
cd ../Frontend
npm install
```
Configure your `Frontend/.env` file.

---

## 💻 Development Workflow

To run the application in development mode, open two separate terminal instances:

### Terminal 1: Backend Server
```bash
cd Backend
npm run dev
```
- **Backend Running At**: `http://localhost:5000`
- **Swagger Documentation**: `http://localhost:5000/api-docs`

### Terminal 2: Frontend Client
```bash
cd Frontend
npm run dev
```
- **Frontend App Running At**: `http://localhost:5173`
- **Admin Login Portal**: `http://localhost:5173/admin/login`

---

## 📦 Production Deployment

### Build Frontend
To create a production-ready static bundle of the React application:
```bash
cd Frontend
npm run build
```
The optimized production output will be generated in `Frontend/dist`.

### Run Backend in Production
```bash
cd Backend
npm start
```

---

## ⚠️ Error Handling & Validation

1. **Operational Errors (`ApiError.js`)**: Extends JavaScript's native `Error` class to encapsulate HTTP status codes and operational failure messages.
2. **Standardized Response (`apiResponse.js`)**: All controller responses follow a predictable JSON format:
   ```json
   {
     "success": true,
     "message": "Operation completed successfully",
     "data": {}
   }
   ```
3. **Payload Validation (`validationMiddleware.js`)**: Captures `express-validator` schema violations and returns formatted `400 Bad Request` responses.
4. **Global Error Catch (`errorMiddleware.js`)**: Intercepts unhandled errors, log tracebacks, and returns sanitized error messages to clients.

---

## 🎨 Responsive UI & UX Design

- **Luxury Theme**: Dark obsidian backgrounds (`#08080A`, `#121216`) paired with metallic gold accents (`#D4AF37`) and subtle glassmorphic overlays.
- **Micro-Animations**: Page transitions powered by Framer Motion's `AnimatePresence`.
- **Carousel Controls**: Smooth touch-enabled Swiper sliders for vehicle viewing.
- **Mobile First**: Layouts adjust seamlessly across desktop monitors, laptops, tablets, and smartphones.

---

## 📊 Feature Matrix

| Functional Feature | Client Portal | Admin Panel | Implementation Status |
| :--- | :---: | :---: | :---: |
| Vehicle Search & Filtering | ✅ | ✅ | **Fully Implemented** |
| Vehicle Details & Video Gallery | ✅ | ✅ | **Fully Implemented** |
| Similar Vehicle Recommendations | ✅ | ❌ | **Fully Implemented** |
| Test Drive Booking System | ✅ | ✅ | **Fully Implemented** |
| Car Valuation Requests (*Sell Your Car*) | ✅ | ✅ | **Fully Implemented** |
| General & Vehicle Inquiries | ✅ | ✅ | **Fully Implemented** |
| Hero Section CMS | ❌ (View Only) | ✅ (Full Edit) | **Fully Implemented** |
| About Us CMS | ❌ (View Only) | ✅ (Full Edit) | **Fully Implemented** |
| Brand Showcase CMS | ❌ (View Only) | ✅ (Full Edit) | **Fully Implemented** |
| Contact & Maps CMS | ❌ (View Only) | ✅ (Full Edit) | **Fully Implemented** |
| Footer CMS | ❌ (View Only) | ✅ (Full Edit) | **Fully Implemented** |
| FAQ Management | ✅ (View Only) | ✅ (Full Edit) | **Fully Implemented** |
| Newsletter Subscription & Unsubscribe | ✅ | ✅ | **Fully Implemented** |
| Campaign Builder & Open/Click Analytics | ❌ | ✅ | **Fully Implemented** |
| Google Sheets Two-Way Sync | ❌ | ✅ | **Fully Implemented** |
| Media File Uploads (Multer) | ✅ (Valuations) | ✅ (Vehicle/CMS) | **Fully Implemented** |
| Admin Authentication & Password Reset | ❌ | ✅ | **Fully Implemented** |

---

## 🔮 Future Roadmap

- [ ] **Customer Accounts & Wishlist**: Client login portal allowing users to save favorite vehicles and track test-drive booking statuses.
- [ ] **Vehicle Comparison Tool**: Side-by-side spec and price comparison table.
- [ ] **Online Reservation Deposits**: Integration with Stripe / Razorpay for holding deposit bookings.
- [ ] **Cloud Storage Integration**: AWS S3 or Cloudinary adapter for media file storage.
- [ ] **Automated CI/CD Pipeline**: GitHub Actions workflow for automated testing and deployment.

---

## 🔧 Troubleshooting

### 1. MongoDB Connection Issue
- **Symptom**: `MongoNetworkError` or connection timeout on startup.
- **Fix**: Ensure your local MongoDB server is running (`mongod` command) or verify that your IP is whitelisted in MongoDB Atlas.

### 2. Google Sheets Sync Error
- **Symptom**: `GOOGLE_SERVICE_ACCOUNT_JSON is not configured`.
- **Fix**: Verify that `GOOGLE_SERVICE_ACCOUNT_JSON` in `Backend/.env` contains a single-line stringified JSON object with valid service account credentials and sheet edit permissions.

### 3. Image Upload Issues
- **Symptom**: `400 Bad Request` or missing files.
- **Fix**: Confirm that the `Backend/uploads` directory exists and has write permissions.

### 4. CORS Errors
- **Symptom**: Browser blocks requests to `http://localhost:5000`.
- **Fix**: Verify `CLIENT_URL` in `Backend/.env` matches the exact port where Vite is running (`http://localhost:5173`).

---

## 🔒 Git Security Notes

The repository `.gitignore` configuration explicitly excludes sensitive files:
- `.env` and `.env.local`
- `node_modules/`
- `Backend/uploads/` (runtime uploaded images and videos)
- `logs/` and debug files (`*.log`)
- Private credentials (`*.private.json`, `google-credentials.json`)

---

## 👤 Author

**Prathmesh Chauhan**
- **GitHub**: [https://github.com/Prathmesh-5](https://github.com/Prathmesh-5)
- **LinkedIn**: [https://www.linkedin.com/in/prathmesh-chauhan088/](https://www.linkedin.com/in/prathmesh-chauhan088/)

---

## 📄 License

This project is licensed under the **ISC License** as specified in [`Backend/package.json`](file:///c:/Users/HP/Downloads/Luxury-Automobile-Showroom/Backend/package.json).