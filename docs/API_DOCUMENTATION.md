# MEDORA — REST API Specification & Endpoint Documentation

The MEDORA backend exposes a RESTful web service adhering to standard HTTP methods, semantic status codes, and JSON request/response bodies.

**Base URL:** `http://localhost:8080/api`  
**Content-Type:** `application/json`

---

## Summary of REST Endpoints

| Method | Endpoint | Description | Success Code |
|---|---|---|:---:|
| `POST` | `/api/doctors` | Register a new doctor | `201 Created` |
| `GET` | `/api/doctors` | Retrieve all registered doctors | `200 OK` |
| `GET` | `/api/doctors/{id}` | Retrieve doctor details by ID | `200 OK` |
| `POST` | `/api/patients` | Register a new patient | `201 Created` |
| `GET` | `/api/patients` | Retrieve all registered patients | `200 OK` |
| `GET` | `/api/patients/{id}` | Retrieve patient details by ID | `200 OK` |
| `POST` | `/api/appointments` | Book a new appointment | `201 Created` |
| `GET` | `/api/appointments` | Retrieve appointments (supports filters) | `200 OK` |
| `GET` | `/api/appointments/{id}` | Retrieve appointment details by ID | `200 OK` |
| `PATCH` | `/api/appointments/{id}/cancel` | Cancel appointment and free slot | `200 OK` |
| `GET` | `/api/dashboard/summary` | Retrieve aggregate counts for dashboard | `200 OK` |
| `GET` | `/api/dashboard/trends` | Retrieve 7-day appointment trend analysis | `200 OK` |

---

## 1. Doctors Endpoints

### 1.1 Register Doctor
- **Endpoint:** `POST /api/doctors`
- **Description:** Registers a new medical practitioner. Ensures email uniqueness and positive duration.

**Request Payload:**
```json
{
  "name": "Dr. Christopher Lee",
  "specialization": "Radiology",
  "email": "chris.lee@medora.health",
  "phone": "+1 (555) 777-9999",
  "consultationDuration": 30
}
```

**Response (`201 Created`):**
```json
{
  "id": 8,
  "name": "Dr. Christopher Lee",
  "specialization": "Radiology",
  "email": "chris.lee@medora.health",
  "phone": "+1 (555) 777-9999",
  "consultationDuration": 30
}
```

---

### 1.2 List Doctors
- **Endpoint:** `GET /api/doctors`
- **Response (`200 OK`):**
```json
[
  {
    "id": 1,
    "name": "Dr. Elena Vance",
    "specialization": "Cardiology",
    "email": "elena.vance@medora.health",
    "phone": "+1 (555) 234-5678",
    "consultationDuration": 30
  },
  {
    "id": 2,
    "name": "Dr. Marcus Brody",
    "specialization": "Orthopedics",
    "email": "marcus.brody@medora.health",
    "phone": "+1 (555) 345-6789",
    "consultationDuration": 45
  }
]
```

---

## 2. Patients Endpoints

### 2.1 Register Patient
- **Endpoint:** `POST /api/patients`
- **Description:** Registers a new patient. Ensures email uniqueness and valid age range.

**Request Payload:**
```json
{
  "name": "Maya Lin",
  "email": "maya.lin@example.com",
  "phone": "+1 (555) 888-4444",
  "age": 32
}
```

**Response (`201 Created`):**
```json
{
  "id": 11,
  "name": "Maya Lin",
  "email": "maya.lin@example.com",
  "phone": "+1 (555) 888-4444",
  "age": 32
}
```

---

### 2.2 List Patients
- **Endpoint:** `GET /api/patients`
- **Response (`200 OK`):**
```json
[
  {
    "id": 1,
    "name": "Alex Morgan",
    "email": "alex.morgan@example.com",
    "phone": "+1 (555) 111-2233",
    "age": 29
  },
  {
    "id": 2,
    "name": "Beatrice Gomez",
    "email": "beatrice.g@example.com",
    "phone": "+1 (555) 222-3344",
    "age": 42
  }
]
```

---

## 3. Appointments Endpoints

### 3.1 Book Appointment
- **Endpoint:** `POST /api/appointments`
- **Description:** Books an appointment. Automatically calculates `endTime` from the doctor's consultation duration. Enforces Rule A (Doctor Overlap Prevention) and Rule B (Patient 2-per-day Quota).

**Request Payload:**
```json
{
  "doctorId": 8,
  "patientId": 11,
  "appointmentDate": "2026-10-15",
  "startTime": "10:00",
  "reason": "Initial Radiology Scan"
}
```

**Response (`201 Created`):**
```json
{
  "id": 16,
  "doctorId": 8,
  "doctorName": "Dr. Christopher Lee",
  "doctorSpecialization": "Radiology",
  "patientId": 11,
  "patientName": "Maya Lin",
  "appointmentDate": "2026-10-15",
  "startTime": "10:00",
  "endTime": "10:30",
  "status": "BOOKED",
  "reason": "Initial Radiology Scan"
}
```

---

### 3.2 Doctor Overlap Conflict Response
- **Scenario:** Attempting to book an overlapping slot (e.g., 10:15–10:45 when 10:00–10:30 is active).
- **Response (`409 Conflict`):**
```json
{
  "timestamp": "2026-10-14T13:25:35.2690462",
  "status": 409,
  "error": "Conflict",
  "message": "Doctor Dr. Christopher Lee already has an active appointment at this time (10:00 - 10:30). Please choose a different slot.",
  "path": "/api/appointments"
}
```

---

### 3.3 Patient Daily Quota Exceeded Response
- **Scenario:** A patient attempting a 3rd active booking on the same calendar date.
- **Response (`409 Conflict`):**
```json
{
  "timestamp": "2026-10-14T13:26:19.8342072",
  "status": 409,
  "error": "Conflict",
  "message": "Patient Alex Morgan has reached the maximum of 2 active appointments for this day (2026-10-15).",
  "path": "/api/appointments"
}
```

---

### 3.4 Cancel Appointment
- **Endpoint:** `PATCH /api/appointments/{id}/cancel`
- **Description:** Updates appointment status to `CANCELLED`. Immediately releases the doctor's time slot for other patients and decrements the patient's daily quota.

**Response (`200 OK`):**
```json
{
  "id": 16,
  "doctorId": 8,
  "doctorName": "Dr. Christopher Lee",
  "doctorSpecialization": "Radiology",
  "patientId": 11,
  "patientName": "Maya Lin",
  "appointmentDate": "2026-10-15",
  "startTime": "10:00",
  "endTime": "10:30",
  "status": "CANCELLED",
  "reason": "Initial Radiology Scan"
}
```

---

### 3.5 List Appointments (With Optional Filters)
- **Endpoint:** `GET /api/appointments`
- **Query Parameters:**
  - `doctorId` (Long, optional)
  - `patientId` (Long, optional)
  - `date` (ISO LocalDate `YYYY-MM-DD`, optional)
  - `status` (`BOOKED` or `CANCELLED`, optional)

**Example Request:** `GET /api/appointments?date=2026-10-14`

**Response (`200 OK`):**
```json
[
  {
    "id": 5,
    "doctorId": 1,
    "doctorName": "Dr. Elena Vance",
    "doctorSpecialization": "Cardiology",
    "patientId": 1,
    "patientName": "Alex Morgan",
    "appointmentDate": "2026-10-14",
    "startTime": "09:00",
    "endTime": "09:30",
    "status": "BOOKED",
    "reason": "Routine cardiac follow-up"
  },
  {
    "id": 6,
    "doctorId": 1,
    "doctorName": "Dr. Elena Vance",
    "doctorSpecialization": "Cardiology",
    "patientId": 2,
    "patientName": "Beatrice Gomez",
    "appointmentDate": "2026-10-14",
    "startTime": "10:00",
    "endTime": "10:30",
    "status": "BOOKED",
    "reason": "Hypertension review"
  }
]
```

---

## 4. Dashboard Endpoints

### 4.1 Dashboard Summary Counts
- **Endpoint:** `GET /api/dashboard/summary`
- **Description:** Computes real-time totals across database entities.

**Response (`200 OK`):**
```json
{
  "totalDoctors": 7,
  "totalPatients": 10,
  "todayAppointments": 5,
  "cancelledAppointments": 3
}
```

---

### 4.2 Weekly Appointment Trends
- **Endpoint:** `GET /api/dashboard/trends`
- **Description:** Generates a 7-day rolling window of consultation volume for charting.

**Response (`200 OK`):**
```json
[
  {
    "date": "2026-10-11",
    "dayName": "Sun",
    "booked": 0,
    "cancelled": 0
  },
  {
    "date": "2026-10-12",
    "dayName": "Mon",
    "booked": 2,
    "cancelled": 0
  },
  {
    "date": "2026-10-13",
    "dayName": "Tue",
    "booked": 1,
    "cancelled": 1
  },
  {
    "date": "2026-10-14",
    "dayName": "Wed",
    "booked": 5,
    "cancelled": 1
  },
  {
    "date": "2026-10-15",
    "dayName": "Thu",
    "booked": 3,
    "cancelled": 0
  },
  {
    "date": "2026-10-16",
    "dayName": "Fri",
    "booked": 1,
    "cancelled": 1
  },
  {
    "date": "2026-10-17",
    "dayName": "Sat",
    "booked": 0,
    "cancelled": 0
  }
]
```
