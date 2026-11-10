# MEDORA — Smart Hospital Appointment Management System
## Academic Project Report & Technical Specification

**Course:** Advanced Software Engineering / Web Application Development  
**Academic Year:** 2026–2027  
**Project Name:** MEDORA — Smart Hospital Appointment Management System  
**Tagline:** *Care, beautifully coordinated.*  
**System Architecture:** Three-Layer Spring Boot Backend with React Frontend & In-Memory H2 Database  

---

## 1. Abstract

Hospital outpatient departments frequently encounter scheduling bottlenecks, double-booked medical practitioners, and patient queue congestion due to disjointed or uncoordinated reservation systems. **MEDORA** is an integrated, full-stack hospital appointment management application designed to resolve these critical operational challenges. 

Built using a decoupled modern software engineering paradigm, MEDORA employs **Java 21**, **Spring Boot 3.3.5**, and **Spring Data JPA** on the backend, complemented by a reactive, modern frontend built with **React**, **Vite**, and **Tailwind CSS**. Data persistence is maintained in an embedded, non-destructive **H2 in-memory relational database**. The system strictly enforces mandatory scheduling business rules:
1. Preventing overlapping active appointments for medical specialists;
2. Enforcing a strict daily quota of maximum two active appointments per patient;
3. Safely freeing cancelled time slots for instant rebooking without data loss;
4. Eliminating race conditions during simultaneous booking attempts through a synchronized transaction coordinator.

Comprehensive automated testing via **JUnit 5** and **Spring Boot Test / MockMvc** demonstrates 100% test pass rates across all 12 mandatory academic test scenarios.

---

## 2. Problem Statement

Traditional hospital booking procedures and rudimentary appointment software face three pervasive issues:
- **Scheduling Conflicts & Overlaps:** Doctors often experience conflicting bookings when multiple patients or receptionists schedule consultations for identical or overlapping time windows.
- **Queue Hoarding & Over-booking:** Without quota limits, individual patients can hoard outpatient slots across multiple departments on a single calendar day, denying access to urgent patients.
- **Concurrency Hazards:** Under concurrent user access (e.g., two patients or staff attempting to claim the final available 10:00 AM slot at the exact same instant), uncoordinated systems produce double-bookings due to race conditions between database reads and writes.

---

## 3. Project Objectives

The primary objectives of the MEDORA project are:
1. To engineer a clean, maintainable **Three-Layer Architecture** (Controller, Service, Repository) adhering to industry best practices and academic standards.
2. To demonstrate how **Spring Boot Auto-Configuration** dramatically minimizes boilerplate configuration for embedded servers (Tomcat), object-relational mapping (Hibernate), database connection pooling (HikariCP), and REST endpoints.
3. To design and implement the three canonical domain entities: `Doctor`, `Patient`, and `Appointment`.
4. To establish strict, verifiable validation rules preventing double-booking and quota violations with appropriate HTTP status codes (`201 Created`, `200 OK`, `400 Bad Request`, `404 Not Found`, and `409 Conflict`).
5. To develop an aesthetically outstanding, professional healthcare dashboard providing live data visualization, doctor/patient directories, appointment tables, and interactive booking wizards.
6. To implement an academically transparent concurrency control mechanism guaranteeing thread safety and atomic database commitments.
7. To provide 100% verifiable test coverage using JUnit 5.

---

## 4. Technologies Used

### Backend Stack
- **Language:** Java 21 (Java SE 24 compatible runtime)
- **Framework:** Spring Boot 3.3.5
- **Build & Dependency Management:** Apache Maven 3.9 / Maven Wrapper (`mvnw.cmd`)
- **Web Layer:** Spring Web MVC (`@RestController`, `@RequestMapping`, JSON serialization via Jackson)
- **Data Access Layer:** Spring Data JPA with Hibernate 6.5
- **Validation:** Jakarta Bean Validation (`spring-boot-starter-validation`)
- **Database:** H2 In-Memory Relational Database (`jdbc:h2:mem:medoradb`)
- **Testing:** JUnit 5, AssertJ, Spring Boot Test, MockMvc

### Frontend Stack
- **Library:** React 19 / Modern Functional Components with Hooks
- **Bundler & Build Tool:** Vite 8.3
- **Styling:** Vanilla CSS & Tailwind CSS (v4)
- **Icons:** Lucide React
- **Charting & Data Visualization:** Recharts
- **Routing:** React Router DOM (v7)

---

## 5. System Architecture & Request Flow

MEDORA adopts a classic, decoupled three-tier architectural pattern:

```
[ React 19 Frontend Client (Port 5173) ]
             │
             │ HTTP REST Requests (JSON Payloads)
             ▼
[ Controller Layer: DoctorController, PatientController, AppointmentController, DashboardController ]
             │
             │ DTO Validation & Controller Dispatch
             ▼
[ Service Layer: AppointmentService (Synchronized Coordinator), BookingTransactionService, DoctorService, PatientService ]
             │
             │ Business Rules Enforcement (Rule A, Rule B, Rule C)
             ▼
[ Repository Layer: DoctorRepository, PatientRepository, AppointmentRepository ]
             │
             │ Spring Data JPA / Hibernate ORM Queries
             ▼
[ In-Memory H2 Relational Database (jdbc:h2:mem:medoradb) ]
```

### End-to-End Flow of an Appointment Booking Request:
1. **Client Action:** Staff selects Patient, Doctor, Date, and Start Time on the React UI.
2. **HTTP Dispatch:** Browser issues `POST /api/appointments` with JSON body.
3. **Controller Handling:** `AppointmentController` receives the request, validates field annotations (`@Valid`), and invokes `AppointmentService.bookAppointment()`.
4. **Concurrency Lock:** The synchronized `bookAppointment` coordinator acquires the application monitor.
5. **Transactional Proxy:** The coordinator calls `BookingTransactionService.executeBooking()`, starting a `@Transactional` boundary.
6. **Domain & Conflict Verification:**
   - Verifies existence of Doctor and Patient (throws 404 if missing).
   - Automatically computes consultation end time: `startTime + doctor.getConsultationDuration()`.
   - Executes Rule A query: checks for any active `BOOKED` appointment where `startTime < requestedEndTime && endTime > requestedStartTime`. If found, throws `AppointmentConflictException` (HTTP 409).
   - Executes Rule B query: counts active `BOOKED` appointments for the patient on the selected date. If count $\ge 2$, throws `PatientLimitExceededException` (HTTP 409).
7. **Entity Persistence:** The new `Appointment` entity is persisted to H2 via `AppointmentRepository.save()`.
8. **Transaction Commit & Lock Release:** Spring commits the database transaction. The coordinator releases the monitor.
9. **JSON Response:** `AppointmentResponseDto` is returned to the client with `201 Created`.
10. **UI Update:** The React frontend displays a success banner and refreshes the dashboard metrics.

---

## 6. Domain Entities & Database Schema

MEDORA models exactly the three required domain entities:

### 1. Doctor (`Doctor.java`)
Represents medical specialists employed at the hospital.
- `id` (Long, Primary Key, Auto-generated)
- `name` (String, Required): Full legal name of clinician
- `specialization` (String, Required): Medical branch (e.g., Cardiology, Neurology)
- `email` (String, Required, Unique): Professional email address
- `phone` (String, Required): Contact number
- `consultationDuration` (int, Required): Standard slot duration in minutes (e.g., 30, 45, 60)

### 2. Patient (`Patient.java`)
Represents individuals seeking medical consultations.
- `id` (Long, Primary Key, Auto-generated)
- `name` (String, Required): Patient name
- `email` (String, Required, Unique): Patient email
- `phone` (String, Required): Emergency or mobile contact
- `age` (int, Required): Patient age

### 3. Appointment (`Appointment.java`)
Models the temporal association between a Doctor and a Patient.
- `id` (Long, Primary Key, Auto-generated)
- `doctor` (`@ManyToOne`, Doctor, Required)
- `patient` (`@ManyToOne`, Patient, Required)
- `appointmentDate` (LocalDate, Required): Calendar date of the consultation
- `startTime` (LocalTime, Required): Beginning of consultation slot
- `endTime` (LocalTime, Required): Automatically calculated end time
- `status` (`@Enumerated(EnumType.STRING)`, AppointmentStatus): `BOOKED` or `CANCELLED`
- `reason` (String, Optional): Clinical purpose or symptoms

---

## 7. Business Rules Enforcement

### Rule A: Overlap Prevention for Doctors
- **Constraint:** A doctor cannot have overlapping active consultations on the same calendar date.
- **Mathematical Overlap Condition:**  
  $$\text{existing.startTime} < \text{requested.endTime} \quad \land \quad \text{existing.endTime} > \text{requested.startTime}$$
- **State Filter:** Only appointments with status `BOOKED` create conflicts. Cancelled appointments are strictly ignored.
- **Edge Case (Adjacent Slots):** If Doctor A has a slot 10:00–10:30, a new booking from 10:30–11:00 is **allowed** because $10:30 < 10:30$ evaluates to `false`.

### Rule B: Daily Appointment Quota per Patient
- **Constraint:** A patient can book a maximum of **TWO** active appointments on any single calendar date.
- **Scope:** The quota applies hospital-wide across all doctors and departments.
- **Rejection:** The 3rd booking attempt on that date throws `PatientLimitExceededException` resulting in HTTP `409 Conflict`.
- **State Filter:** Only `BOOKED` status appointments increment the quota. Cancelled visits do not count.

### Rule C: Cancellation Slot Release & Idempotency
- **Constraint:** When an appointment is cancelled, its status is updated to `CANCELLED`.
- **Slot Release:** The doctor's time slot is immediately released and becomes available for any other patient to book.
- **Quota Restoration:** The patient's daily quota on that date is decremented.
- **Audit Preservation:** The record remains stored in the database for history, audit, and trend tracking.

---

## 8. Concurrency Architecture & Simultaneous Bookings

A critical requirement of this project is demonstrating how simultaneous, race-condition booking requests are safely handled without data corruption or double-booking.

### The Problem in Naive Implementations
In a naive Spring Boot application, developers frequently place `synchronized` directly on an `@Transactional` service method:
```java
// INCORRECT NAIVE APPROACH:
@Transactional
public synchronized AppointmentResponseDto bookAppointment(...) { ... }
```
**Why this fails:** Spring's `@Transactional` annotation works via an AOP proxy. When a thread exits the `synchronized` method body, it releases the Java monitor **BEFORE** the transaction interceptor initiates the database commit. Consequently, a second concurrent thread can acquire the monitor, perform the conflict check while uncommitted data is invisible in the database, conclude there is no conflict, and save a duplicate appointment!

### The MEDORA Solution: Coordinated Outer Critical Section
MEDORA employs a two-tier concurrency structure:
1. **Outer Coordinator (`AppointmentService`):**
   ```java
   @Service
   public class AppointmentService {
       private final BookingTransactionService bookingTransactionService;
       
       public synchronized AppointmentResponseDto bookAppointment(AppointmentRequestDto dto) {
           // Java monitor is held BEFORE the transaction begins
           // and is NOT released until executeBooking() completely commits!
           return bookingTransactionService.executeBooking(dto);
       }
   }
   ```
2. **Inner Transactional Proxy (`BookingTransactionService`):**
   ```java
   @Service
   public class BookingTransactionService {
       @Transactional(propagation = Propagation.REQUIRES_NEW, isolation = Isolation.READ_COMMITTED)
       public AppointmentResponseDto executeBooking(AppointmentRequestDto dto) {
           // 1. Conflict Check
           // 2. Patient Limit Check
           // 3. Save Appointment
           // 4. Commits upon return
       }
   }
   ```
Because `bookingTransactionService` is an injected Spring Bean, calling it invokes Spring's transaction boundary. The database transaction opens, verifies conflicts against the current database state, inserts the record, commits, and returns to `AppointmentService` **prior** to the release of the synchronized monitor.

### Empirical Validation
This design is rigorously proven by **Test 10** in `MedoraBusinessRulesTest`:
- Two threads are launched concurrently via an `ExecutorService`.
- A `CountDownLatch` holds both threads at the starting gate until both are ready.
- The gate opens, and both threads attempt to book the exact same slot (16:00) for the same doctor.
- **Result:** Exactly 1 thread succeeds (status 201 Created), and exactly 1 thread is rejected with `AppointmentConflictException` (status 409 Conflict). Zero double-bookings occur.

---

## 9. Spring Boot Auto-Configuration Explained

Spring Boot Auto-Configuration is one of Spring's most powerful architectural features. In traditional Spring Framework applications, configuring embedded servers, database pools, and transaction managers required hundreds of lines of XML or verbose `@Configuration` classes.

In MEDORA, auto-configuration is enabled via the single meta-annotation on `MedoraApplication.java`:
```java
@SpringBootApplication
public class MedoraApplication {
    public static void main(String[] args) {
        SpringApplication.run(MedoraApplication.class, args);
    }
}
```

This annotation encapsulates three core primitives:
1. `@SpringBootConfiguration`: Declares the class as a configuration bean source.
2. `@EnableAutoConfiguration`: Instructs Spring Boot to inspect classpath dependencies (`pom.xml`) and dynamically configure beans that match application needs.
3. `@ComponentScan`: Automatically scans for `@Component`, `@Service`, `@Repository`, and `@RestController` classes in `com.medora.hospital` and all child packages.

### Automatic Behaviors Demonstrated in MEDORA:
| Feature | Classpath Trigger | Automatic Action Configured by Spring Boot |
|---|---|---|
| **Embedded Web Server** | `spring-boot-starter-web` | Starts embedded Apache Tomcat on port 8080 without external server installation. |
| **REST Dispatcher** | `spring-webmvc` | Automatically configures `DispatcherServlet`, routing, and Jackson `ObjectMapper` for JSON serialization. |
| **Data Persistence** | `spring-boot-starter-data-jpa` | Instantiates `LocalContainerEntityManagerFactoryBean`, Hibernate 6.5 dialect, and repository proxies. |
| **In-Memory Database** | `com.h2database:h2` | Detects H2 driver, automatically creates `HikariDataSource` pool, and establishes connection. |
| **Database Console** | `spring.h2.console.enabled=true` | Automatically serves H2 web console at `/h2-console`. |
| **Bean Validation** | `spring-boot-starter-validation` | Configures Hibernate Validator to intercept `@Valid` DTO payloads and trigger 400 Bad Request on violations. |

---

## 10. Automated Testing Methodology & Results

MEDORA uses **JUnit 5**, **AssertJ**, and **Spring Boot Test (MockMvc)**. All tests execute against an isolated H2 in-memory test database with automatic fixture cleanup before each test execution (`@BeforeEach`).

### Test Execution Summary
```
[INFO] -------------------------------------------------------
[INFO]  T E S T S
[INFO] -------------------------------------------------------
[INFO] Running com.medora.hospital.MedoraApiIntegrationTest
[INFO] Tests run: 2, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 10.74 s -- in com.medora.hospital.MedoraApiIntegrationTest
[INFO] Running com.medora.hospital.MedoraBusinessRulesTest
[INFO] Tests run: 10, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 1.501 s -- in com.medora.hospital.MedoraBusinessRulesTest
[INFO] 
[INFO] Results:
[INFO] 
[INFO] Tests run: 12, Failures: 0, Errors: 0, Skipped: 0
[INFO] 
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
```

### Verified Test Matrix
| ID | Scenario | Input Conditions | Expected Result | Actual Result | Status |
|---|---|---|---|---|:---:|
| **T01** | Doctor Registration | Valid DoctorRequestDto | Generated ID, fields saved | ID created, all fields match | **PASS** |
| **T02** | Patient Registration | Valid PatientRequestDto | Generated ID, fields saved | ID created, all fields match | **PASS** |
| **T03** | Successful Booking | Valid slot (10:00) | Status BOOKED, auto endTime (10:30) | Status BOOKED, endTime 10:30 | **PASS** |
| **T04** | Doctor Overlap Rejection | Existing 10:00–10:30; Attempt 10:15–10:45 | Throws AppointmentConflictException (409) | Exception thrown, HTTP 409 | **PASS** |
| **T05** | Adjacent Appointment | Existing 10:00–10:30; Attempt 10:30–11:00 | Booking allowed | Status BOOKED, saved | **PASS** |
| **T06** | Patient Daily Limit | 2 active bookings on date; Attempt 3rd | Throws AppointmentConflictException (409) | Rejected with quota message | **PASS** |
| **T07** | Cancellation | Cancel active appointment | Status becomes CANCELLED | Status CANCELLED | **PASS** |
| **T08** | Rebook Cancelled Slot | Cancel 10:00–10:30; 2nd patient books 10:00 | Booking allowed | Status BOOKED for 2nd patient | **PASS** |
| **T09** | Cancelled Excluded from Quota | Patient has 2 appts, cancels 1, books new | Booking allowed (active count = 1) | Status BOOKED | **PASS** |
| **T10** | Simultaneous Race Condition | 2 concurrent threads book same slot | Exactly 1 success, exactly 1 conflict | 1 success, 1 conflict | **PASS** |
| **T11** | Missing Doctor or Patient | Non-existent Doctor ID (999999) | HTTP 404 Not Found | 404 Not Found | **PASS** |
| **T12** | REST API Integration | MockMvc full CRUD & validation | Exact HTTP codes & JSON contracts | All assertions passed | **PASS** |

---

## 11. Conclusion

The **MEDORA** Hospital Appointment Management System satisfies every functional, architectural, and presentation requirement set forth in the project specification. Through its rigorous three-layer backend, robust concurrency protection, and modern React dashboard, MEDORA illustrates how clean architectural abstractions lead to highly maintainable, error-resilient software systems. The project is completely self-contained, reproducible, and ready for viva examination and academic demonstration.
