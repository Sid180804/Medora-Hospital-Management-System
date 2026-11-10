# MEDORA — Viva Voce Examination & Oral Defense Guide

This guide contains concise, clear, and academically precise answers to the 15 standard viva questions professors ask during project evaluations.

---

### Q1: What is Spring Boot?
**Answer:**  
Spring Boot is an opinionated, production-ready framework built on top of the Spring Framework. It simplifies Java development by providing pre-configured starters, an embedded web server (Tomcat), and automatic configuration, eliminating the need for complex XML or manual boilerplate setup.

---

### Q2: Why did you use Maven?
**Answer:**  
Apache Maven is a build automation and dependency management tool. It manages third-party libraries via `pom.xml`, downloads required JARs transitively from the Maven Central repository, standardizes the directory layout, and automates compilation, testing, and packaging via plugins.

---

### Q3: What is Spring Boot auto-configuration?
**Answer:**  
Auto-configuration is a feature where Spring Boot automatically configures beans in the Spring ApplicationContext based on the dependencies present on the classpath. For example, adding `spring-boot-starter-web` automatically configures embedded Tomcat and DispatcherServlet, while adding `h2` automatically sets up an in-memory DataSource and connection pool.

---

### Q4: What does `@SpringBootApplication` do?
**Answer:**  
It is a convenience annotation combining three core annotations:
1. `@SpringBootConfiguration`: Declares the class as a configuration bean source.
2. `@EnableAutoConfiguration`: Enables Spring Boot's automatic configuration mechanism.
3. `@ComponentScan`: Tells Spring to automatically scan the current package and sub-packages for `@Component`, `@Service`, `@Repository`, and `@RestController` classes.

---

### Q5: Why did you choose a three-layer architecture?
**Answer:**  
Three-layer architecture separates the system into:
1. **Controller Layer:** Handles HTTP requests, validation, and JSON conversion.
2. **Service Layer:** Centralizes and enforces business rules (overlap prevention, quotas, transactions).
3. **Repository Layer:** Manages database queries and persistence.  
This separation of concerns ensures that business logic is completely isolated from HTTP details and database mechanics, making the codebase maintainable, modular, and easy to unit test.

---

### Q6: What is a REST API?
**Answer:**  
A REST (Representational State Transfer) API is an architectural style for network communication. It uses standard HTTP methods (`GET` for reading, `POST` for creating, `PATCH`/`PUT` for updating, `DELETE` for removing) to operate on URI-identified resources, returning standardized formats such as JSON along with meaningful status codes (`200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, `409 Conflict`).

---

### Q7: What is a JPA Repository?
**Answer:**  
In Spring Data JPA, `JpaRepository` is an interface providing standard CRUD operations, pagination, and sorting for entity classes without writing raw SQL. Spring dynamically generates the proxy implementation at runtime based on method signatures (e.g., `countByPatientIdAndAppointmentDateAndStatus`).

---

### Q8: Why did you use an H2 database instead of MySQL or PostgreSQL?
**Answer:**  
H2 is a fast, lightweight, in-memory relational database. For this college assignment, H2 requires zero external database installation, runs entirely in RAM, safely resets upon restart, and supports standard SQL. It allows any evaluator or professor to run the application immediately using `mvnw` without database configuration headaches.

---

### Q9: How does the appointment booking flow work from frontend to database?
**Answer:**  
1. The user selects a Patient, Doctor, Date, and Start Time on the React UI.
2. React sends an HTTP `POST /api/appointments` request to `AppointmentController`.
3. The controller validates input and calls `AppointmentService.bookAppointment()`.
4. The service invokes `BookingTransactionService` inside an isolated transaction.
5. The service validates doctor non-overlap and patient daily quota ($< 2$).
6. If valid, `AppointmentRepository` saves the entity to H2, returns HTTP `201 Created`, and updates the dashboard.

---

### Q10: How do you prevent overlapping doctor appointments (Rule A)?
**Answer:**  
When booking an appointment, we query existing `BOOKED` appointments for that doctor on that date using the standard overlap formula:  
`existing.startTime < requested.endTime && existing.endTime > requested.startTime`  
If any matching appointment exists, we throw an `AppointmentConflictException`, which our `GlobalExceptionHandler` converts into an HTTP `409 Conflict` response with an explanatory message. Adjacent appointments (e.g. 10:00–10:30 and 10:30–11:00) are explicitly allowed because $10:30 < 10:30$ evaluates to `false`.

---

### Q11: Why can a patient book only two appointments per calendar date (Rule B)?
**Answer:**  
Rule B prevents outpatient queue hoarding. Before saving, the system queries:  
`countByPatientIdAndAppointmentDateAndStatus(patientId, date, BOOKED)`  
If the active count is $\ge 2$, the request is rejected with HTTP `409 Conflict`. Cancelled appointments are filtered out and do not consume the quota.

---

### Q12: Why do cancelled appointments not block slots (Rule C)?
**Answer:**  
Cancelling an appointment updates its status to `CANCELLED` instead of physically deleting it. This preserves the medical record for audit and history. However, all availability and quota checks query specifically for status `BOOKED`. Therefore, a cancelled appointment neither blocks the doctor's time slot nor counts towards the patient's daily quota.

---

### Q13: What does `@Transactional` do in Spring?
**Answer:**  
`@Transactional` wraps a method execution in a database transaction. If the method completes successfully, Spring commits the transaction. If an unchecked exception (like `RuntimeException` or `AppointmentConflictException`) is thrown, Spring automatically rolls back the transaction, ensuring atomicity and data consistency.

---

### Q14: What happens if two users book the same slot simultaneously? How is race condition prevented?
**Answer:**  
In MEDORA, we implemented a coordinated outer lock pattern. `AppointmentService.bookAppointment()` is a `synchronized` entry method that delegates to `BookingTransactionService.executeBooking()`.  
Because the Java monitor is acquired before the Spring transaction opens and is only released **after** the transaction has committed to H2, Thread 2 cannot enter the critical section until Thread 1 has fully committed. When Thread 2 runs its conflict check, it immediately detects Thread 1's committed appointment and is rejected with HTTP 409 Conflict. This was verified empirically in our concurrent JUnit test (`TC-10`) using `CountDownLatch` and `ExecutorService`.

---

### Q15: How do your JUnit tests validate the system?
**Answer:**  
We created 12 comprehensive automated test cases covering:
- Entity registration (`Doctor`, `Patient`)
- Successful booking with auto end-time calculation
- Rule A overlap rejection and adjacent slot boundary testing
- Rule B patient quota enforcement
- Rule C cancellation, slot rebooking, and quota restoration
- Multi-threaded simultaneous booking with `CountDownLatch`
- HTTP 404 handling for non-existent entities
- MockMvc REST API integration verifying HTTP status codes and JSON structures.  
All 12 tests execute and pass cleanly via `.\mvnw.cmd test`.
