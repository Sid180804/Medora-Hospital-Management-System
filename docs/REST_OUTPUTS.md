# MEDORA — Real Locally Executed REST API Outputs

This document records the exact, live HTTP responses captured from the locally executing Spring Boot 3.3.5 backend (`http://localhost:8080/api`) during system verification.

---

## 1. Dashboard Summary (`GET /api/dashboard/summary`)
**Command:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/dashboard/summary" -Method Get | ConvertTo-Json -Depth 5
```
**Actual HTTP Status:** `200 OK`  
**Actual Live Output:**
```json
{
  "totalDoctors": 7,
  "totalPatients": 10,
  "todayAppointments": 5,
  "cancelledAppointments": 3
}
```

---

## 2. Weekly Consultation Trends (`GET /api/dashboard/trends`)
**Command:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/dashboard/trends" -Method Get | ConvertTo-Json -Depth 5
```
**Actual HTTP Status:** `200 OK`  
**Actual Live Output:**
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

---

## 3. Register New Doctor (`POST /api/doctors`)
**Command:**
```powershell
$body = @{
    name = "Dr. Christopher Lee"
    specialization = "Radiology"
    email = "chris.lee@medora.health"
    phone = "+1 (555) 777-9999"
    consultationDuration = 30
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/api/doctors" -Method Post -Body $body -ContentType "application/json" | ConvertTo-Json -Depth 5
```
**Actual HTTP Status:** `201 Created`  
**Actual Live Output:**
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

## 4. Register New Patient (`POST /api/patients`)
**Command:**
```powershell
$body = @{
    name = "Maya Lin"
    email = "maya.lin@example.com"
    phone = "+1 (555) 888-4444"
    age = 32
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/api/patients" -Method Post -Body $body -ContentType "application/json" | ConvertTo-Json -Depth 5
```
**Actual HTTP Status:** `201 Created`  
**Actual Live Output:**
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

## 5. Successful Appointment Booking (`POST /api/appointments`)
**Command:**
```powershell
$body = @{
    doctorId = 8
    patientId = 11
    appointmentDate = "2026-10-15"
    startTime = "10:00"
    reason = "Initial Radiology Scan"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/api/appointments" -Method Post -Body $body -ContentType "application/json" | ConvertTo-Json -Depth 5
```
**Actual HTTP Status:** `201 Created`  
**Actual Live Output:**
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

## 6. Doctor Overlap Conflict Rejection (`POST /api/appointments`)
**Command:**
```powershell
# Attempting to book 10:15–10:45 with Dr. Lee when 10:00–10:30 is already BOOKED
$body = @{
    doctorId = 8
    patientId = 1
    appointmentDate = "2026-10-15"
    startTime = "10:15"
    reason = "Overlapping consultation attempt"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/api/appointments" -Method Post -Body $body -ContentType "application/json"
```
**Actual HTTP Status:** `409 Conflict`  
**Actual Live Output:**
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

## 7. Appointment Cancellation (`PATCH /api/appointments/{id}/cancel`)
**Command:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/appointments/16/cancel" -Method Patch | ConvertTo-Json -Depth 5
```
**Actual HTTP Status:** `200 OK`  
**Actual Live Output:**
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

## 8. Rebooking Cancelled Slot for Another Patient (`POST /api/appointments`)
**Command:**
```powershell
# Now booking 10:00–10:30 with Dr. Lee for Alex Morgan (Patient #1)
$body = @{
    doctorId = 8
    patientId = 1
    appointmentDate = "2026-10-15"
    startTime = "10:00"
    reason = "Rebooking freed slot"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/api/appointments" -Method Post -Body $body -ContentType "application/json" | ConvertTo-Json -Depth 5
```
**Actual HTTP Status:** `201 Created`  
**Actual Live Output:**
```json
{
  "id": 17,
  "doctorId": 8,
  "doctorName": "Dr. Christopher Lee",
  "doctorSpecialization": "Radiology",
  "patientId": 1,
  "patientName": "Alex Morgan",
  "appointmentDate": "2026-10-15",
  "startTime": "10:00",
  "endTime": "10:30",
  "status": "BOOKED",
  "reason": "Rebooking freed slot"
}
```

---

## 9. Patient Daily Limit Rejection (`POST /api/appointments`)
**Command:**
```powershell
# Patient Alex Morgan already has 2 active appointments on 2026-10-15 (Appt #17 & #18)
# Attempting a 3rd appointment on the same date:
$body = @{
    doctorId = 4
    patientId = 1
    appointmentDate = "2026-10-15"
    startTime = "16:00"
    reason = "Third visit attempt (must fail)"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/api/appointments" -Method Post -Body $body -ContentType "application/json"
```
**Actual HTTP Status:** `409 Conflict`  
**Actual Live Output:**
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

## 10. Non-Existent Entity Not Found (`POST /api/appointments`)
**Command:**
```powershell
$body = @{
    doctorId = 999999
    patientId = 1
    appointmentDate = "2026-10-15"
    startTime = "10:00"
    reason = "Bad Doctor"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/api/appointments" -Method Post -Body $body -ContentType "application/json"
```
**Actual HTTP Status:** `404 Not Found`  
**Actual Live Output:**
```json
{
  "timestamp": "2026-10-14T13:16:11.900000",
  "status": 404,
  "error": "Not Found",
  "message": "Doctor not found with ID: 999999",
  "path": "/api/appointments"
}
```
