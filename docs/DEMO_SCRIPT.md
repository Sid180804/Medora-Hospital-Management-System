# MEDORA — 5–7 Minute Professor Live Demonstration Script

Follow this step-by-step presentation script to demonstrate **MEDORA** to your professor. Every action, click, and explanation is timed for maximum clarity and academic impact.

---

## Preparation (Before the Professor Arrives)
1. Open Terminal 1 (Backend):
   ```powershell
   cd backend
   .\mvnw.cmd spring-boot:run
   ```
2. Open Terminal 2 (Frontend):
   ```powershell
   cd frontend
   npm run dev
   ```
3. Open your browser to `http://localhost:5173/`.

---

## Step 1: Introduction & Dashboard Overview (1 Minute)
- **Action:** Point to the screen at `http://localhost:5173/`.
- **What to Say:**  
  *"Good morning Professor. This is MEDORA — Smart Hospital Appointment Management System. The application is built with a decoupled architecture: Java 21, Spring Boot 3.3.5, and Spring Data JPA on the backend, with an embedded in-memory H2 database, and a React 19 frontend with Tailwind CSS and Recharts.*  
  *On the dashboard, we immediately see real-time statistics populated from our Spring Boot backend: 7 doctors, 10 patients, today's active appointments, and cancelled slots. The bar chart shows weekly consultation trends, and the table lists today's scheduled consultations with live status badges."*

---

## Step 2: Three-Layer Backend Architecture (30 Seconds)
- **Action:** Open `docs/ARCHITECTURE.md` or briefly mention package structure:
  - `controller/`: REST API endpoints and validation
  - `service/`: Centralized business rules and concurrency coordinator
  - `repository/`: Spring Data JPA repositories with H2 database queries
- **What to Say:**  
  *"We have adhered strictly to the three-layer architectural standard: Controller handles HTTP dispatch and validation, Service enforces domain business rules and thread-safe booking coordination, and Repository communicates with H2 via JPA."*

---

## Step 3: Register a New Doctor (30 Seconds)
- **Action:**
  1. Click **"Doctors"** in the sidebar.
  2. Click **"+ Register Doctor"**.
  3. Enter:
     - Name: `Dr. Robert Langdon`
     - Specialization: `Endocrinology`
     - Email: `robert.langdon@medora.health`
     - Phone: `+1 (555) 789-9988`
     - Duration: `30 Minutes`
  4. Click **"Save Doctor"**.
- **What to Say:**  
  *"Let's register a new specialist. Notice the instant toast notification and the newly rendered card with initials avatar, duration badge, and contact info. The backend persisted this doctor to the H2 database with auto-generated ID."*

---

## Step 4: Register a New Patient (30 Seconds)
- **Action:**
  1. Click **"Patients"** in the sidebar.
  2. Click **"+ Register Patient"**.
  3. Enter:
     - Name: `Sophia Martinez`
     - Email: `sophia.m@example.com`
     - Phone: `+1 (555) 444-2211`
     - Age: `27`
  4. Click **"Save Patient"**.
- **What to Say:**  
  *"Now we register a patient, Sophia Martinez. The record is persisted and appears in the table immediately."*

---

## Step 5: Successful Appointment Booking (45 Seconds)
- **Action:**
  1. Click **"Book Appointment"** in the sidebar.
  2. Select:
     - Patient: `Sophia Martinez`
     - Doctor: `Dr. Robert Langdon (Endocrinology)`
     - Date: Tomorrow's date
     - Start Time: `10:00 AM`
     - Reason: `Thyroid screening`
  3. Highlight the **Live Booking Summary Card** on the right side: show that **End Time (10:30 AM)** was automatically calculated based on the doctor's 30-minute duration!
  4. Click **"Confirm and Book Appointment"**.
- **What to Say:**  
  *"When booking, MEDORA automatically calculates the consultation end time from the doctor's duration — in this case 10:00 to 10:30 AM. Clicking confirm executes the transaction. We receive HTTP 201 Created and an appointment confirmation."*

---

## Step 6: Demonstrate Rule A — Overlap Rejection (45 Seconds)
- **Action:**
  1. On the same Booking page:
     - Keep Doctor: `Dr. Robert Langdon`
     - Keep Date: Tomorrow's date
     - Select a different patient: `Alex Morgan`
     - Select Start Time: `10:15 AM` (which overlaps with 10:00–10:30!)
  2. Click **"Confirm and Book Appointment"**.
  3. Show the **Red Rejection Banner**!
- **What to Say:**  
  *"Here is our mandatory Rule A in action. Dr. Langdon is already booked from 10:00 to 10:30. When Alex Morgan attempts to book at 10:15, the service layer evaluates our overlap formula: existing start < requested end AND existing end > requested start. The backend rejects the request with HTTP 409 Conflict, and the UI displays the exact conflict message returned by the server."*

---

## Step 7: Demonstrate Rule B — Patient Daily Limit (45 Seconds)
- **Action:**
  1. Now show that Sophia Martinez already has 1 appointment tomorrow (10:00).
  2. Book a **2nd appointment** for Sophia tomorrow with another doctor (e.g., `Dr. Elena Vance` at `14:00`). (This succeeds).
  3. Now attempt a **3rd appointment** for Sophia tomorrow with any doctor at `16:00`.
  4. Click **"Confirm and Book Appointment"**.
  5. Show the **Red Rejection Banner**: *"Patient Sophia Martinez has reached the maximum of 2 active appointments for this day."*
- **What to Say:**  
  *"Now we demonstrate Rule B. To prevent queue hoarding, a patient cannot book more than two active appointments on the same calendar day hospital-wide. Sophia now has two active visits; when we attempt a third booking, the backend rejects it with HTTP 409 Conflict."*

---

## Step 8: Demonstrate Rule C — Cancellation & Slot Rebooking (45 Seconds)
- **Action:**
  1. Click **"Appointments"** in the sidebar.
  2. Locate Sophia's 10:00 AM appointment with Dr. Langdon.
  3. Click **"Cancel"**.
  4. The confirmation modal appears explaining that the slot will be released. Click **"Confirm Cancellation"**.
  5. The status updates to **CANCELLED** with a red pill.
  6. Now navigate back to **"Book Appointment"** and book `10:00 AM` with Dr. Langdon for `Alex Morgan`.
  7. Click **Confirm** — it succeeds!
- **What to Say:**  
  *"Rule C is now proven: cancelling updates the status to CANCELLED for audit history, but immediately releases the slot. We just re-booked Dr. Langdon's 10:00 AM slot for Alex Morgan without conflict."*

---

## Step 9: Show Live REST API Endpoints (30 Seconds)
- **Action:** Open your browser to:
  - `http://localhost:8080/api/dashboard/summary`
  - `http://localhost:8080/api/doctors`
  - `http://localhost:8080/h2-console`
- **What to Say:**  
  *"The backend is a pure REST service. Here is `/api/dashboard/summary` returning JSON counts, and here is the embedded H2 console."*

---

## Step 10: Execute Automated JUnit Tests (45 Seconds)
- **Action:** In a terminal, run:
  ```powershell
  cd backend
  .\mvnw.cmd test
  ```
- **What to Say:**  
  *"Finally, let's run our automated JUnit 5 test suite. All 12 test cases execute against the H2 in-memory test database, validating all business rules, 404 handling, and our concurrent multi-threaded race condition test using CountDownLatch. As you can see: 12 tests run, 0 failures, 0 errors, Build Success."*
