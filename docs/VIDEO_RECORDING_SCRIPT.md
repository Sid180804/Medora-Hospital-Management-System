# MEDORA — Complete Video Recording Script & Page-by-Page Walkthrough

**Use this document as your teleprompter while recording your project video.**

---

## 🎬 Video Overview & Recording Settings
- **Suggested Video Duration:** 6 to 8 minutes
- **Recording Software:** OBS Studio, Windows Game Bar (`Win + G`), Loom, or Zoom (Screen Share)
- **Resolution:** 1080p (1920x1080) or full screen
- **Pre-requisite:** Both backend (`http://localhost:8080`) and frontend (`http://localhost:5173`) must be running.

---

## ⏱️ Video Timeline at a Glance
| Segment | Time | Topic / Page |
|---|:---:|---|
| **Scene 1** | `0:00 - 0:45` | Title, Introduction & Architecture Overview |
| **Scene 2** | `0:45 - 1:45` | Page 1: Dashboard Overview (`/`) |
| **Scene 3** | `1:45 - 2:30` | Page 2: Doctors Directory (`/doctors`) + Registration Modal |
| **Scene 4** | `2:30 - 3:15` | Page 3: Patient Directory (`/patients`) + Registration Modal |
| **Scene 5** | `3:15 - 4:15` | Page 5: Book Appointment Wizard (`/book`) + Auto End-Time Calculation |
| **Scene 6** | `4:15 - 5:15` | Rule A & Rule B Rejection Live Demos (409 Conflict) |
| **Scene 7** | `5:15 - 6:00` | Page 4: Appointments Table (`/appointments`) + Cancellation & Slot Release |
| **Scene 8** | `6:00 - 6:40` | Page 6: Schedule View (`/schedule`) |
| **Scene 9** | `6:40 - 7:20` | Behind the Scenes: H2 Database Console (`/h2-console`) |
| **Scene 10**| `7:20 - 8:00` | Terminal: Running 12 JUnit 5 Tests & Conclusion |

---

# SCENE 1: Introduction & Architecture (0:00 – 0:45)
**Screen to Show:** Browser showing MEDORA Dashboard (`http://localhost:5173/`).

### 🗣️ Voiceover Script:
> *"Hello everyone and respected Professor. Today I am presenting **MEDORA — Smart Hospital Appointment Management System**, a full-stack healthcare scheduling application built with **Java 21, Spring Boot 3.3.5, Spring Data JPA, an in-memory H2 database, and a React 19 frontend**.*  
> 
> *The project strictly adheres to a **three-layer architecture**: REST Controllers at the web tier, a centralized Service layer enforcing our core scheduling business rules and thread-safe concurrency, and Spring Data JPA Repositories persisting directly to H2.*  
> 
> *Today, I will walk you through every page of the application, demonstrate our automated conflict prevention, show how slots are released upon cancellation, inspect the H2 database, and run our 12 automated JUnit 5 tests."*

---

# SCENE 2: Page 1 — The Executive Dashboard (0:45 – 1:45)
**Screen to Show:** `http://localhost:5173/`

### 🔍 What is on Screen:
- **Left Sidebar:** MEDORA logo with medical pulse icon, tagline *"Care, beautifully coordinated."*, navigation links with active indicators, and the H2 database status note.
- **Top Navbar:** Current calendar date, live connection badge (`● Spring Boot 3.x Online`), and quick "+ New Appointment" button.
- **4 Stat Cards:** Total Doctors, Total Patients, Today's Appointments, Cancelled Slots.
- **Recharts Bar Chart:** Weekly appointment volume showing Booked vs. Cancelled appointments across a 7-day rolling window.
- **Today's Consultations Table:** Time-ordered appointments for the current day with status pills (`BOOKED` / `CANCELLED`).
- **Quick Action Tiles:** Shortcuts to Book Appointment, Register Doctor, and Register Patient.

### ⚙️ Behind the Scenes (Technical):
- Powered by `GET /api/dashboard/summary` (calculates database aggregates).
- Powered by `GET /api/dashboard/trends` (computes 7-day booked vs cancelled statistics).
- Powered by `GET /api/appointments?date=YYYY-MM-DD` (fetches today's appointments).

### 🗣️ Voiceover Script:
> *"Here is the MEDORA Executive Dashboard. Notice the clean, modern design system using a soft off-white background, deep teal accents, and elevated cards.*  
> 
> *At the top right, our live badge confirms direct connectivity to our Spring Boot backend. These four cards fetch real-time data from the H2 database: we currently have 8 registered doctors, 11 patients, 5 active consultations today, and 4 cancelled slots.*  
> 
> *Below, this Recharts interactive bar chart plots our weekly appointment volume, comparing booked visits in teal with cancelled visits in red over a 7-day window. On the right, today's consultations table shows patient initials, doctor specialties, exact time slots, and current status."*

---

# SCENE 3: Page 2 — Doctors Directory (1:45 – 2:30)
**Screen to Show:** Click **"Doctors"** in the sidebar (`http://localhost:5173/doctors`).

### 🔍 What is on Screen:
- Grid of doctor cards.
- Each card shows: Name, Specialization badge (e.g. Cardiology, Orthopedics, Pediatrics), Email, Phone, and Consultation Duration badge (e.g. "30 min consultation slot").
- Live search bar at the top.
- "+ Register Doctor" button opening the animated modal.

### ⚙️ Behind the Scenes (Technical):
- Powered by `GET /api/doctors` and `POST /api/doctors`.
- Form validation enforces unique email, valid phone, and minimum duration.

### 🎬 Action to Perform in Video:
1. Type `"Cardio"` in the search bar to show instant client-side filtering. Clear search.
2. Click **"+ Register Doctor"**.
3. Fill in:
   - Full Name: `Dr. Robert Langdon`
   - Specialization: `Endocrinology`
   - Email: `robert.langdon@medora.health`
   - Phone: `+1 (555) 789-9988`
   - Duration: `30 Minutes`
4. Click **"Save Doctor"**. Notice the green toast notification and new doctor card appearing.

### 🗣️ Voiceover Script:
> *"Next is the Doctors Directory. Every doctor card displays an auto-generated initials avatar, medical specialization, contact details, and their individual consultation duration.*  
> 
> *We have a live search bar that instantly filters by name or department. Now let's register a new specialist: Dr. Robert Langdon in Endocrinology with a 30-minute consultation slot. Clicking 'Save Doctor' issues an HTTP POST to `/api/doctors`. The doctor is saved to H2, and appears in our directory instantly."*

---

# SCENE 4: Page 3 — Patient Directory (2:30 – 3:15)
**Screen to Show:** Click **"Patients"** in the sidebar (`http://localhost:5173/patients`).

### 🔍 What is on Screen:
- Full tabular directory of registered patients.
- Columns: Patient Name with initials avatar, Age badge, Email, Phone, and quick "Book" action button.
- "+ Register Patient" button opening the modal.

### ⚙️ Behind the Scenes (Technical):
- Powered by `GET /api/patients` and `POST /api/patients`.
- Validates email format and realistic age boundaries ($0 \le \text{age} \le 125$).

### 🎬 Action to Perform in Video:
1. Click **"+ Register Patient"**.
2. Fill in:
   - Full Name: `Sophia Martinez`
   - Email: `sophia.m@example.com`
   - Phone: `+1 (555) 444-2211`
   - Age: `27`
3. Click **"Save Patient"**.

### 🗣️ Voiceover Script:
> *"Moving to the Patients Directory, we have our patient registry. Here you can see each patient's demographic information, age badge, and contact channels.*  
> 
> *Let's register a new patient named Sophia Martinez, age 27. When I click 'Save Patient', Spring Boot validates the payload and persists Sophia to the database. Notice the clean toast confirmation and Sophia appearing in the table."*

---

# SCENE 5: Page 5 — Book Appointment Wizard (3:15 – 4:15)
**Screen to Show:** Click **"Book Appointment"** in the sidebar (`http://localhost:5173/book`).

### 🔍 What is on Screen:
- Left Panel: The booking form with Patient select, Doctor select, Datepicker, Start time dropdown, and Reason.
- Right Panel: **Live Booking Summary Card** showing the selected Patient, Doctor, Date, Consultation Purpose, and most importantly, the **Auto-calculated End Time** badge.

### ⚙️ Behind the Scenes (Technical):
- Automatically calculates end time: $\text{startTime} + \text{doctor.getConsultationDuration()}$.
- Submits payload to `POST /api/appointments`.

### 🎬 Action to Perform in Video:
1. Select Patient: `Sophia Martinez`.
2. Select Doctor: `Dr. Robert Langdon (Endocrinology, 30 min)`.
3. Select Date: Tomorrow's date.
4. Select Start Time: `10:00 AM`.
5. Point cursor to the **Live Booking Summary Card**: point out that **10:00 to 10:30 AM** was automatically calculated!
6. Click **"Confirm and Book Appointment"**. Show the green confirmation banner.

### 🗣️ Voiceover Script:
> *"Now let's examine the Book Appointment page. On the left is our booking form, and on the right is a dynamic Live Booking Summary card.*  
> 
> *Watch what happens when I select Dr. Robert Langdon: because his consultation duration is 30 minutes, when I pick 10:00 AM, the system automatically computes the end time as 10:30 AM without requiring manual calculation.*  
> 
> *I select Sophia Martinez, set tomorrow's date, and click 'Confirm and Book Appointment'. The Spring Boot backend executes the transaction, checks for conflicts, saves the appointment, and returns HTTP 201 Created with our confirmation banner."*

---

# SCENE 6: Live Demonstrations of Rule A & Rule B (4:15 – 5:15)
**Screen to Show:** Stay on `http://localhost:5173/book`.

### 🎬 Action 1: Demonstrate Rule A (Doctor Overlap Rejection)
1. Keep Doctor: `Dr. Robert Langdon` and Date: Tomorrow.
2. Select a different patient: `Alex Morgan`.
3. Set Start Time: `10:15 AM` *(which overlaps with Dr. Langdon's 10:00–10:30 booking!)*.
4. Click **"Confirm and Book Appointment"**.
5. **Show the Red Conflict Banner:**  
   *"Doctor Dr. Robert Langdon already has an active appointment at this time (10:00 - 10:30). Please choose a different slot."*

### 🗣️ Voiceover Script (Rule A):
> *"Now I will demonstrate our first mandatory business rule: **Rule A — Preventing Overlapping Doctor Appointments**.*  
> 
> *Dr. Langdon is already booked tomorrow from 10:00 to 10:30. If another patient, Alex Morgan, attempts to book at 10:15 AM, the backend evaluates our overlap formula: existing start less than requested end AND existing end greater than requested start.*  
> 
> *Because 10:15 overlaps, the backend rejects the transaction with HTTP 409 Conflict. Look at the red warning banner on screen — it clearly displays the conflict message returned from the server."*

### 🎬 Action 2: Demonstrate Rule B (Patient 2-per-day Quota)
1. Select Patient: `Sophia Martinez`.
2. Book a 2nd appointment for Sophia tomorrow with `Dr. Elena Vance` at `02:00 PM` $\rightarrow$ succeeds.
3. Now attempt a **3rd appointment** for Sophia tomorrow with any doctor at `04:00 PM`.
4. Click **"Confirm and Book Appointment"**.
5. **Show the Red Quota Exceeded Banner:**  
   *"Patient Sophia Martinez has reached the maximum of 2 active appointments for this day."*

### 🗣️ Voiceover Script (Rule B):
> *"Next is **Rule B — Patient Daily Limit**.*  
> 
> *To prevent queue hoarding, a patient can book a maximum of two active appointments on the same calendar day. Sophia already had one appointment, and I just booked her second with Dr. Vance.*  
> 
> *When I attempt to book a third appointment for Sophia on that same day, the service layer checks the patient's active booking count. Since it is already 2, it rejects the request with HTTP 409 Conflict: 'Patient has reached the maximum of 2 active appointments for this day'."*

---

# SCENE 7: Page 4 — Appointments Table & Rule C (5:15 – 6:00)
**Screen to Show:** Click **"Appointments"** in the sidebar (`http://localhost:5173/appointments`).

### 🔍 What is on Screen:
- Filter pills: `All Statuses`, `BOOKED`, `CANCELLED`.
- Full appointments table with Patient, Doctor, Date, Time Slot, Reason, Status badge, and Cancel button.

### 🎬 Action to Perform in Video:
1. Click the status tabs: `BOOKED`, then `CANCELLED`, then `All Statuses`.
2. Find Sophia's 10:00 AM appointment with Dr. Langdon.
3. Click **"Cancel"**.
4. The confirmation modal appears explaining that the slot will be freed.
5. Click **"Confirm Cancellation"**. Show that the status badge turns red (`CANCELLED`).
6. Navigate back to `/book` and rebook `10:00 AM` with Dr. Langdon for `Alex Morgan` $\rightarrow$ **succeeds immediately**!

### 🗣️ Voiceover Script:
> *"Now let's visit the Appointments page. Here we have a full management dashboard where we can filter appointments by status — All, Booked, or Cancelled.*  
> 
> *This brings us to **Rule C — Cancellation and Slot Release**.*  
> 
> *When I click 'Cancel' on Sophia's 10:00 AM appointment, our confirmation modal explains that the record is preserved for audit history, but the slot will be released. I confirm cancellation. The status changes to CANCELLED.*  
> 
> *Now, when I return to the booking page and book that exact same 10:00 AM slot for Alex Morgan, it succeeds immediately because cancelled appointments no longer block the schedule or count towards patient quotas."*

---

# SCENE 8: Page 6 — Daily Schedule View (6:00 – 6:40)
**Screen to Show:** Click **"Schedule"** in the sidebar (`http://localhost:5173/schedule`).

### 🔍 What is on Screen:
- Date picker and Doctor dropdown filter.
- Chronological timeline cards showing time blocks, doctor specialty, patient name, and status pills.

### 🎬 Action to Perform in Video:
1. Change the date to tomorrow.
2. Select a specific doctor from the dropdown, then select "All Doctors".
3. Point out how booked vs cancelled consultations are visually distinguished.

### 🗣️ Voiceover Script:
> *"Here on the Schedule page, hospital administrators have a chronological timeline view of every consultation scheduled for any selected date.*  
> 
> *We can easily filter by individual doctor or view all clinicians across the hospital. Notice how active booked slots are clearly distinguished from cancelled slots, giving hospital staff complete operational visibility."*

---

# SCENE 9: Behind the Scenes — H2 Database Console (6:40 – 7:20)
**Screen to Show:** Open new browser tab to `http://localhost:8080/h2-console`.

### 🎬 Action to Perform in Video:
1. Show H2 login screen (JDBC URL: `jdbc:h2:mem:medoradb`, user: `sa`). Click **Connect**.
2. Expand the left tree: show `APPOINTMENTS`, `DOCTORS`, and `PATIENTS` tables.
3. Run query: `SELECT * FROM APPOINTMENTS ORDER BY ID DESC;`
4. Show the records that were created and cancelled during your demo.

### 🗣️ Voiceover Script:
> *"Now let's take a quick look behind the scenes. Here is the embedded H2 database console running on port 8080.*  
> 
> *Because we configured Spring Boot with in-memory H2, zero database installation was required. If I query the APPOINTMENTS table, we can see the exact records created during this demonstration, complete with foreign keys referencing our doctors and patients, start and end times, and status flags."*

---

# SCENE 10: Terminal — 12 JUnit Tests & Conclusion (7:20 – 8:00)
**Screen to Show:** Terminal window in the `backend/` directory.

### 🎬 Action to Perform in Video:
1. Run:
   ```powershell
   .\mvnw.cmd test
   ```
2. Wait a few seconds for tests to complete.
3. Highlight the final output:
   `Tests run: 12, Failures: 0, Errors: 0, Skipped: 0`
   `BUILD SUCCESS`

### 🗣️ Voiceover Script:
> *"Finally, let's verify our automated test suite. In the backend directory, I execute `.\mvnw.cmd test`.*  
> 
> *This runs all 12 compulsory test cases: doctor registration, patient registration, booking validation, Rule A overlap rejection, Rule B patient quotas, Rule C slot release, REST MockMvc integration, and Test 10 — our multi-threaded concurrency test verifying that simultaneous conflicting requests never produce duplicate bookings.*  
> 
> *As you can see: 12 tests run, 0 failures, 0 errors, BUILD SUCCESS.*  
> 
> *MEDORA is fully operational, thoroughly tested, and completely documented. Thank you very much for your time."*
