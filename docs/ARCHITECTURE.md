# MEDORA — Architecture & Technical Design Document

This document provides a comprehensive technical overview of the software architecture, entity relationships, request flow, and concurrency design of the **MEDORA Hospital Appointment Management System**.

---

## 1. High-Level Three-Layer Architecture

MEDORA follows the classic **Three-Layer Architectural Pattern**, ensuring strict separation of concerns, high maintainability, and clean testability.

```mermaid
graph TD
    subgraph Client["Presentation Tier (Frontend)"]
        UI["React 19 Dashboard (Vite)"]
        Components["Sidebar / Navbar / Modals / Tables"]
        Router["React Router v7"]
        Chart["Recharts Analytics"]
    end

    subgraph ControllerLayer["1. Controller Tier (REST API)"]
        DC["DoctorController"]
        PC["PatientController"]
        AC["AppointmentController"]
        DBC["DashboardController"]
        GEH["GlobalExceptionHandler"]
    end

    subgraph ServiceLayer["2. Service Tier (Business Logic & Concurrency)"]
        DS["DoctorService"]
        PS["PatientService"]
        AS["AppointmentService (Synchronized Coordinator)"]
        BTS["BookingTransactionService (@Transactional)"]
        DBService["DashboardService"]
    end

    subgraph RepositoryLayer["3. Repository Tier (Data Access)"]
        DR["DoctorRepository"]
        PR["PatientRepository"]
        AR["AppointmentRepository"]
    end

    subgraph DatabaseTier["Data Persistence Tier"]
        H2[("In-Memory H2 Relational Database<br/>jdbc:h2:mem:medoradb")]
    end

    UI -->|"HTTP JSON (Fetch API)"| ControllerLayer
    ControllerLayer -->|"DTO Transfer & Validation"| ServiceLayer
    ServiceLayer -->|"Domain Entities"| RepositoryLayer
    RepositoryLayer -->|"Spring Data JPA / Hibernate"| DatabaseTier
```

---

## 2. Layer Responsibilities

### 1. Presentation Tier (React Frontend)
- **Role:** Handles user interaction, form inputs, dynamic client-side validation, and data visualization.
- **Key Modules:**
  - `DashboardPage`: Overview metrics, weekly volume charts, today's appointments table.
  - `DoctorsPage`: Doctor directory, specialist tags, and modal registration.
  - `PatientsPage`: Patient directory, age profiles, and modal registration.
  - `AppointmentsPage`: Filterable tabular view with modal cancellation.
  - `BookAppointmentPage`: Interactive booking wizard with live summary calculation.
  - `SchedulePage`: Chronological daily timeline schedule.

### 2. Controller Tier (Spring Web REST Controllers)
- **Role:** Exposes RESTful endpoints, handles HTTP routing, unpacks JSON into DTOs, and invokes validation.
- **Key Characteristics:**
  - Controllers **never** interact directly with repositories; all requests are delegated to the Service tier.
  - Intercepts validation errors via `@Valid` and returns standard HTTP `400 Bad Request`.
  - Maps exceptions uniformly via `GlobalExceptionHandler` (`404 Not Found`, `409 Conflict`, `500 Internal Error`).

### 3. Service Tier (Business Rules & Transaction Boundary)
- **Role:** Encapsulates the core business rules of the hospital.
- **Enforced Rules:**
  - **Rule A (Doctor Overlap):** `existing.startTime < requested.endTime && existing.endTime > requested.startTime`.
  - **Rule B (Patient Limit):** Maximum 2 active `BOOKED` appointments per patient on the same calendar date.
  - **Rule C (Cancellation):** Marks status as `CANCELLED`, freeing the slot and restoring quota.
  - **Concurrency Coordinator:** Employs synchronized coordination around the transactional boundary.

### 4. Repository Tier (Spring Data JPA)
- **Role:** Provides high-performance database abstractions over H2 SQL tables.
- **Key Characteristics:**
  - Extends `JpaRepository<T, ID>` for out-of-the-box CRUD.
  - Implements custom JPQL queries for overlap detection and active count calculations.

---

## 3. Detailed Appointment Booking Flow

The sequence diagram below illustrates the complete booking lifecycle, including the rejection branches for Rule A and Rule B.

```mermaid
sequenceDiagram
    autonumber
    actor Staff as User / Staff
    participant UI as React UI (Browser)
    participant AC as AppointmentController
    participant AS as AppointmentService (Lock Coordinator)
    participant BTS as BookingTransactionService (@Transactional)
    participant AR as AppointmentRepository
    participant DB as In-Memory H2 DB

    Staff->>UI: Selects Patient, Doctor, Date, and Start Time
    UI->>UI: Auto-calculates End Time (startTime + duration)
    UI->>AC: POST /api/appointments (JSON Body)
    AC->>AC: Validate DTO (@Valid)
    
    AC->>AS: bookAppointment(requestDto)
    Note over AS: Acquires Java monitor (synchronized lock)
    
    AS->>BTS: executeBooking(requestDto)
    Note over BTS: Spring starts Transaction (READ_COMMITTED)
    
    BTS->>AR: findById(doctorId) & findById(patientId)
    AR->>DB: SELECT Doctor & Patient
    DB-->>AR: Entities returned
    
    Note over BTS: RULE A: Overlap Check
    BTS->>AR: findOverlappingAppointments(doctorId, date, BOOKED, start, end)
    AR->>DB: SELECT ... WHERE a.status = 'BOOKED' AND a.startTime < end AND a.endTime > start
    DB-->>AR: Overlapping list
    
    alt Overlap Detected (List not empty)
        BTS-->>AC: Throws AppointmentConflictException (HTTP 409)
        AC-->>UI: 409 Conflict: "Doctor already has an active appointment at this time"
        UI-->>Staff: Displays Red Conflict Alert
    else No Overlap
        Note over BTS: RULE B: Patient Daily Quota Check
        BTS->>AR: countByPatientIdAndAppointmentDateAndStatus(patientId, date, BOOKED)
        AR->>DB: COUNT(*) WHERE patient_id = ? AND date = ? AND status = 'BOOKED'
        DB-->>AR: Active count
        
        alt Patient Count >= 2
            BTS-->>AC: Throws PatientLimitExceededException (HTTP 409)
            AC-->>UI: 409 Conflict: "Patient has reached maximum 2 appointments for this day"
            UI-->>Staff: Displays Quota Exceeded Alert
        else Patient Count < 2
            Note over BTS: Persist New Appointment
            BTS->>AR: save(new Appointment(doctor, patient, date, start, end, BOOKED))
            AR->>DB: INSERT INTO appointments ...
            DB-->>AR: Saved entity (with Generated ID)
            Note over BTS: Transaction commits to H2
            BTS-->>AS: Returns AppointmentResponseDto
            Note over AS: Releases synchronized lock
            AS-->>AC: Returns AppointmentResponseDto
            AC-->>UI: HTTP 201 Created (JSON Response)
            UI-->>Staff: Displays Green Success Banner & Refreshes Dashboard
        end
    end
```

---

## 4. Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    DOCTOR ||--o{ APPOINTMENT : "conducts"
    PATIENT ||--o{ APPOINTMENT : "attends"

    DOCTOR {
        Long id PK "Auto-generated ID"
        String name "Full legal name"
        String specialization "Department/Field"
        String email UK "Unique email address"
        String phone "Contact number"
        int consultationDuration "Duration in minutes (e.g. 30)"
    }

    PATIENT {
        Long id PK "Auto-generated ID"
        String name "Full name"
        String email UK "Unique email address"
        String phone "Contact number"
        int age "Patient age"
    }

    APPOINTMENT {
        Long id PK "Auto-generated ID"
        Long doctor_id FK "References DOCTOR(id)"
        Long patient_id FK "References PATIENT(id)"
        LocalDate appointmentDate "Calendar date"
        LocalTime startTime "Consultation start time"
        LocalTime endTime "Calculated end time"
        AppointmentStatus status "BOOKED or CANCELLED"
        String reason "Clinical notes / symptoms"
    }
```

---

## 5. Concurrency Architecture & Thread Safety

### Concurrency Vulnerability in Single-Layer Services
In Spring applications, combining `synchronized` and `@Transactional` on the same method is a well-known anti-pattern:
```java
// VULNERABLE PATTERN:
@Transactional
public synchronized AppointmentResponseDto bookAppointment(...) {
    // 1. Conflict check
    // 2. Save
    // 3. Method exit -> Java monitor released HERE!
    // 4. Spring Transaction Proxy commits AFTER monitor release!
}
```
If Thread 2 arrives between steps 3 and 4, it enters the method before Thread 1's changes are visible in the database, resulting in a race-condition duplicate booking.

### The MEDORA Two-Service Isolation Pattern
To solve this cleanly in a single application instance, MEDORA decouples the locking boundary from the transactional proxy:

```
[ Incoming Request (Thread 1) ]       [ Incoming Request (Thread 2) ]
              │                                      │
              ▼                                      ▼
┌───────────────────────────────────────────────────────────┐
│ AppointmentService.bookAppointment()                      │
│ ➔ Acquires Java Monitor (synchronized)                     │
│    (Thread 1 enters critical section)                     │
│    (Thread 2 is BLOCKED waiting on monitor)               │
│                                                           │
│    ┌─────────────────────────────────────────────────┐    │
│    │ BookingTransactionService.executeBooking()      │    │
│    │ 1. Transaction BEGIN (READ_COMMITTED)           │    │
│    │ 2. Read conflict state from H2                  │    │
│    │ 3. Save Appointment                             │    │
│    │ 4. Transaction COMMIT                           │    │
│    └─────────────────────────────────────────────────┘    │
│                                                           │
│ ➔ Thread 1 exits synchronized method (monitor released)   │
└───────────────────────────────────────────────────────────┘
              │
              ▼ (Monitor Released)
[ Thread 2 now enters critical section ]
➔ Calls BookingTransactionService.executeBooking()
➔ Query sees Thread 1's COMMITTED appointment!
➔ Conflict detected! Throws 409 Conflict.
```

This guarantees 100% thread safety without requiring distributed locks or heavyweight external brokers.
