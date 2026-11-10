# MEDORA — Screenshot & Submission Evidence Checklist

This checklist provides the exact list of screenshots to capture for your college assignment submission document, laboratory notebook, and slide deck.

**Target Folder:** `docs/screenshots/`  
**Application URL:** `http://localhost:5173/`  
**Backend Port:** `http://localhost:8080/`

---

## Required Screenshots Table

| # | Filename | Page / View | Action to Perform Before Capturing | Key Visual Elements to Include |
|:---:|---|---|---|---|
| **01** | `01_dashboard.png` | **Dashboard (`/`)** | Open dashboard after backend starts | 4 statistics cards, weekly trend chart (Recharts), today's scheduled consultations table, sidebar logo, and "Spring Boot 3.x Online" badge. |
| **02** | `02_doctors_directory.png` | **Doctors (`/doctors`)** | Navigate to Doctors tab | Grid of doctor cards with initials avatars, specialization pills, duration badges (30 min / 45 min), and "Book Slot" buttons. |
| **03** | `03_register_doctor_modal.png` | **Doctors (`/doctors`)** | Click "+ Register Doctor" | Animated registration modal showing Name, Specialization, Email, Phone, and Duration dropdown. |
| **04** | `04_patients_directory.png` | **Patients (`/patients`)** | Navigate to Patients tab | Patient table with age badges, contact details, initials avatars, and "Book" action buttons. |
| **05** | `05_register_patient_modal.png` | **Patients (`/patients`)** | Click "+ Register Patient" | Modal dialog showing fields: Name, Email, Phone, and Age. |
| **06** | `06_appointments_table.png` | **Appointments (`/appointments`)** | Navigate to Appointments tab | Filter pills (`ALL`, `BOOKED`, `CANCELLED`), search bar, status badges (Green BOOKED, Red CANCELLED), and Cancel buttons. |
| **07** | `07_cancel_appointment_modal.png` | **Appointments (`/appointments`)** | Click "Cancel" on an active appointment | Confirmation modal with amber warning banner explaining that the time slot will be released for rebooking. |
| **08** | `08_booking_wizard.png` | **Book Appointment (`/book`)** | Navigate to Book Appointment tab | Patient select, Doctor select, Date, Start time, and the **Live Booking Summary Card** showing auto-calculated End Time. |
| **09** | `09_booking_confirmed.png` | **Book Appointment (`/book`)** | Submit a valid booking | Green confirmation banner: *"Appointment Confirmed! (ID: #...)"* with direct link to appointments table. |
| **10** | `10_rule_a_overlap_error.png` | **Book Appointment (`/book`)** | Attempt overlapping booking (e.g. 10:15–10:45 when 10:00–10:30 is booked) | Red conflict alert: *"Doctor ... already has an active appointment at this time (10:00 - 10:30). Please choose a different slot."* |
| **11** | `11_rule_b_patient_limit_error.png` | **Book Appointment (`/book`)** | Attempt 3rd appointment for same patient on same date | Red conflict alert: *"Patient ... has reached the maximum of 2 active appointments for this day."* |
| **12** | `12_daily_schedule.png` | **Schedule (`/schedule`)** | Navigate to Schedule tab | Date picker, Doctor selector, and time-ordered cards showing scheduled and cancelled consultation blocks. |
| **13** | `13_maven_test_results.png` | **Terminal Output** | Run `.\mvnw.cmd test` in `backend` | Terminal showing: `Tests run: 12, Failures: 0, Errors: 0, Skipped: 0` and `BUILD SUCCESS`. |
| **14** | `14_h2_console.png` | **Browser (`/h2-console`)** | Open `http://localhost:8080/h2-console` | H2 Web Console login page and SQL query view showing `APPOINTMENTS`, `DOCTORS`, and `PATIENTS` tables. |

---

## Recommended Screenshot Resolution
- Desktop window width: 1280px to 1440px.
- Use Windows Snipping Tool (`Win + Shift + S`) or browser built-in screenshot tool (`Ctrl + Shift + I` > `Ctrl + Shift + P` > "Capture full size screenshot").
- Save all images as PNG format in `docs/screenshots/` with the exact filenames listed above.
