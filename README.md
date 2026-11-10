# MEDORA — Smart Hospital Appointment Management System
> **Care, beautifully coordinated.**  
> A complete, modern college assignment project built with Java Spring Boot, React, and an in-memory H2 database.

---

## 📋 Table of Contents
- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Mandatory Business Rules](#-mandatory-business-rules)
- [Quick Start Guide (Windows)](#-quick-start-guide-windows)
- [Running Automated Tests](#-running-automated-tests)
- [REST API Endpoints](#-rest-api-endpoints)
- [In-Memory Database & Demo Data](#-in-memory-database--demo-data)
- [Project Structure](#-project-structure)
- [College Submission Documentation](#-college-submission-documentation)

---

## 🏥 Project Overview

**MEDORA** is an end-to-end hospital appointment management dashboard designed to resolve scheduling bottlenecks, patient queue hoarding, and booking concurrency hazards. Built specifically for an academic evaluation, it pairs an enterprise-grade **Three-Layer Spring Boot Backend** with a **React 19 Frontend**.

Data persistence is managed via an embedded **H2 in-memory database**, requiring zero installation or cloud database setup.

---

## ✨ Key Features

- **Executive Dashboard:** Live statistics cards (Total Doctors, Total Patients, Today's Consultations, Cancelled Slots) with weekly trend bar charts powered by Recharts.
- **Doctor Directory:** Browse physicians, specialization badges, contact info, and consultation duration profiles (30, 45, 60 minutes) with initials avatars.
- **Patient Management:** Track registered patients, age profiles, and contact details with daily booking quota tracking.
- **Intelligent Booking Wizard:** Automatically calculates consultation end-time based on the doctor's custom duration. Displays a live summary card before submission.
- **Rule-Enforced Scheduling:** Instant rejection with HTTP `409 Conflict` if a doctor is double-booked or a patient exceeds 2 daily visits.
- **Slot Release upon Cancellation:** Cancelling an appointment updates its status to `CANCELLED` and immediately frees the time slot for rebooking.
- **Thread-Safe Concurrency:** Coordinated application locking guarantees zero duplicate appointments during simultaneous race conditions.

---

## 🛠 Architecture & Tech Stack

### Backend
- **Java:** 21 (compatible with Java SE 24 runtime)
- **Framework:** Spring Boot 3.3.5
- **ORM & Data Access:** Spring Data JPA / Hibernate 6.5
- **Database:** In-memory H2 Relational Database (`jdbc:h2:mem:medoradb`)
- **Validation:** Jakarta Bean Validation (`spring-boot-starter-validation`)
- **Testing:** JUnit 5, AssertJ, Spring Boot Test, MockMvc
- **Build Tool:** Apache Maven 3.9 / Maven Wrapper (`mvnw.cmd`)

### Frontend
- **Framework:** React 19 / Modern Hooks
- **Build Tool:** Vite 8.3
- **Styling:** Vanilla CSS & Tailwind CSS (v4)
- **Icons:** Lucide React
- **Data Visualization:** Recharts
- **Routing:** React Router DOM (v7)

### Three-Layer Request Flow
$$\text{React UI} \xrightarrow{\text{HTTP JSON}} \text{REST Controller} \xrightarrow{\text{DTO / Method Call}} \text{Service Tier} \xrightarrow{\text{Domain Rules}} \text{Repository (JPA)} \xrightarrow{\text{SQL}} \text{H2 In-Memory DB}$$

---

## ⚖️ Mandatory Business Rules

1. **Rule A (Doctor Non-Overlap):** A doctor cannot have overlapping active consultations on the same date:
   $$\text{existing.startTime} < \text{requested.endTime} \land \text{existing.endTime} > \text{requested.startTime}$$
   Adjacent consultations (e.g., 10:00–10:30 and 10:30–11:00) are explicitly permitted.
2. **Rule B (Patient Daily Quota):** A patient can book a maximum of **TWO** active (`BOOKED`) appointments per calendar date across all hospital doctors. The 3rd attempt is rejected with HTTP 409.
3. **Rule C (Cancellation Frees Slot):** Cancelling changes status to `CANCELLED`. The slot is freed for instant rebooking, and the patient's daily quota is restored.

---

## 🚀 Quick Start Guide (Windows)

### Prerequisites
- **Java:** JDK 17, 21, or 24 installed (`java -version`).
- **Node.js:** v18+ or v24+ installed (`node -v` and `npm -v`).

### Step 1: Start the Spring Boot Backend
Open a PowerShell terminal:
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```
*Wait until you see: `Tomcat started on port 8080` and `Data seeding complete`.*

### Step 2: Start the React Frontend
Open a second PowerShell terminal:
```powershell
cd frontend
npm install
npm run dev
```
*The development server will start at:* **`http://localhost:5173/`**

### Step 3: Open in Browser
Visit **`http://localhost:5173/`** to interact with the full MEDORA dashboard.

---

## 🧪 Running Automated Tests

Run the complete 12-test automated suite (validating all business rules, concurrency race conditions, and MockMvc REST APIs):

```powershell
cd backend
.\mvnw.cmd test
```

### Verified Test Results
```
[INFO] Tests run: 12, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

---

## 🌐 REST API Endpoints

The backend runs on `http://localhost:8080/api`:

| Method | Endpoint | Description | Status Code |
|---|---|---|:---:|
| `GET` | `/api/dashboard/summary` | Real-time counts (Doctors, Patients, Appts) | `200 OK` |
| `GET` | `/api/dashboard/trends` | 7-day consultation trends for charts | `200 OK` |
| `GET` | `/api/doctors` | List all registered doctors | `200 OK` |
| `POST` | `/api/doctors` | Register new doctor | `201 Created` |
| `GET` | `/api/patients` | List all registered patients | `200 OK` |
| `POST` | `/api/patients` | Register new patient | `201 Created` |
| `GET` | `/api/appointments` | List appointments (supports `?date=`, `?status=`) | `200 OK` |
| `POST` | `/api/appointments` | Book appointment (auto-calculates end time) | `201 Created` |
| `PATCH` | `/api/appointments/{id}/cancel` | Cancel appointment & free slot | `200 OK` |

**H2 Database Console:**  
- URL: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:medoradb`
- Username: `sa`
- Password: *(blank)*

---

## 🗄 In-Memory Database & Demo Data

MEDORA seeds a deterministic demo dataset automatically on startup via `CommandLineRunner`:
- **7 Doctors:** Across Cardiology, Orthopedics, Pediatrics, Neurology, Dermatology, General Medicine, Ophthalmology.
- **10 Patients:** Varied demographics and contact details.
- **15 Appointments:** Spanning past, today, and upcoming dates with active and cancelled slots for trend analytics.

*Note: The H2 database runs completely in memory and resets cleanly whenever the backend restarts.*

---

## 📁 Project Structure

```
Hospital/
├── backend/
│   ├── pom.xml                                    # Maven configuration & dependencies
│   ├── mvnw / mvnw.cmd                            # Self-contained Maven wrapper
│   └── src/
│       ├── main/
│       │   ├── java/com/medora/hospital/
│       │   │   ├── MedoraApplication.java         # @SpringBootApplication entry point
│       │   │   ├── config/                        # CorsConfig, DataSeeder
│       │   │   ├── controller/                    # Doctor, Patient, Appointment, Dashboard Controllers
│       │   │   ├── dto/                           # Request & Response Data Transfer Objects
│       │   │   ├── exception/                     # GlobalExceptionHandler, ConflictExceptions
│       │   │   ├── model/                         # Doctor, Patient, Appointment, AppointmentStatus
│       │   │   ├── repository/                    # Doctor, Patient, Appointment JPA Repositories
│       │   │   └── service/                       # AppointmentService, BookingTransactionService, DoctorService...
│       │   └── resources/
│       │       └── application.properties         # Server & H2 configuration
│       └── test/java/com/medora/hospital/
│           ├── MedoraBusinessRulesTest.java       # JUnit 5 Tests 1-10 (Rules A, B, C, & Concurrency)
│           └── MedoraApiIntegrationTest.java      # JUnit 5 Tests 11-12 (MockMvc & REST verification)
├── frontend/
│   ├── package.json                               # React 19, Tailwind, Recharts, Lucide
│   ├── vite.config.js                             # Vite configuration with Tailwind plugin
│   ├── index.html                                 # HTML5 entry with Inter font & SEO meta
│   └── src/
│       ├── App.jsx                                # React Router layout & routes
│       ├── main.jsx                               # DOM root initialization
│       ├── index.css                              # Design tokens, variables & animations
│       ├── components/                            # Sidebar, Navbar, Modal, Toast, InitialsAvatar
│       ├── pages/                                 # Dashboard, Doctors, Patients, Appointments, Book, Schedule
│       └── services/api.js                        # Centralized HTTP client
├── docs/
│   ├── PROJECT_REPORT.md                          # Comprehensive academic report
│   ├── ARCHITECTURE.md                            # Architecture diagrams, ERD, and flowcharts
│   ├── API_DOCUMENTATION.md                       # Complete REST API specification
│   ├── TEST_RESULTS.md                            # Detailed test matrix & JUnit execution log
│   ├── VIVA_GUIDE.md                              # 15 questions & answers for oral defense
│   ├── DEMO_SCRIPT.md                             # 5–7 minute live professor presentation script
│   ├── SCREENSHOT_CHECKLIST.md                    # Evidence checklist for project submission
│   ├── REST_OUTPUTS.md                            # Real locally executed HTTP responses
│   └── screenshots/                               # Submission screenshots directory
└── README.md                                      # This file
```

---

## 📚 College Submission Documentation

All required academic documentation is located in the **`docs/`** directory:
- [Academic Project Report (`docs/PROJECT_REPORT.md`)](file:///c:/Users/tomar/OneDrive/Desktop/Hospital/docs/PROJECT_REPORT.md)
- [Architecture & Diagrams (`docs/ARCHITECTURE.md`)](file:///c:/Users/tomar/OneDrive/Desktop/Hospital/docs/ARCHITECTURE.md)
- [API Documentation (`docs/API_DOCUMENTATION.md`)](file:///c:/Users/tomar/OneDrive/Desktop/Hospital/docs/API_DOCUMENTATION.md)
- [Test Results Matrix (`docs/TEST_RESULTS.md`)](file:///c:/Users/tomar/OneDrive/Desktop/Hospital/docs/TEST_RESULTS.md)
- [Viva Voce Defense Guide (`docs/VIVA_GUIDE.md`)](file:///c:/Users/tomar/OneDrive/Desktop/Hospital/docs/VIVA_GUIDE.md)
- [Professor Live Demo Script (`docs/DEMO_SCRIPT.md`)](file:///c:/Users/tomar/OneDrive/Desktop/Hospital/docs/DEMO_SCRIPT.md)
- [Screenshot Checklist (`docs/SCREENSHOT_CHECKLIST.md`)](file:///c:/Users/tomar/OneDrive/Desktop/Hospital/docs/SCREENSHOT_CHECKLIST.md)
- [Real REST Outputs (`docs/REST_OUTPUTS.md`)](file:///c:/Users/tomar/OneDrive/Desktop/Hospital/docs/REST_OUTPUTS.md)
