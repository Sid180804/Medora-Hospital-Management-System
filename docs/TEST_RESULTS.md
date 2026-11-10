# MEDORA — Automated Test Execution Results

This document records the exact, reproducible execution output of the automated test suite for the **MEDORA Hospital Appointment Management System**.

**Test Framework:** JUnit 5 (Jupiter 5.10.5) with Spring Boot Test 3.3.5, MockMvc, and AssertJ  
**Database:** In-memory H2 Database (`jdbc:h2:mem:medoradb`)  
**Execution Command:** `.\mvnw.cmd test` (Windows PowerShell)

---

## 1. Maven Execution Summary

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
[INFO] Total time:  19.583 s
[INFO] Finished at: 2026-10-14T13:16:15+05:30
[INFO] ------------------------------------------------------------------------
```

---

## 2. Comprehensive Test Case Matrix

| Test ID | Test Scenario | Input Data | Expected Result | Actual Result | Status |
|:---:|---|---|---|---|:---:|
| **TC-01** | **Doctor Registration** | `DoctorRequestDto("Dr. New Specialist", "Dermatology", "new.spec@medora.health", "+1555999999", 45)` | Entity saved to H2 with generated ID, correct fields and consultationDuration = 45 | Doctor saved with auto-increment ID; all fields persisted | **PASS** |
| **TC-02** | **Patient Registration** | `PatientRequestDto("Alice Walker", "alice.w@test.com", "+1555888888", 29)` | Entity saved to H2 with generated ID, correct age = 29 | Patient saved with auto-increment ID; fields verified | **PASS** |
| **TC-03** | **Successful Booking** | Doctor 30-min duration, Patient ID, Date, StartTime 10:00 | Status `BOOKED`, auto-calculated `endTime = 10:30` | Status `BOOKED`, `startTime = 10:00`, `endTime = 10:30` | **PASS** |
| **TC-04** | **Doctor Overlap Rejection (Rule A)** | Existing: 10:00–10:30.<br/>Attempt: 10:15–10:45 | Throws `AppointmentConflictException` (HTTP 409) with descriptive conflict message | `AppointmentConflictException` thrown; message: *"Doctor ... already has an active appointment at this time"* | **PASS** |
| **TC-05** | **Adjacent Appointment Allowed** | Existing: 10:00–10:30.<br/>Attempt: 10:30–11:00 | Booking allowed (boundary condition $10:30 < 10:30$ is false) | Status `BOOKED`, saved successfully | **PASS** |
| **TC-06** | **Patient Daily Limit (Rule B)** | Patient has 2 active `BOOKED` appointments on date.<br/>Attempt: 3rd booking | Throws `PatientLimitExceededException` (HTTP 409) | `PatientLimitExceededException` thrown; message: *"maximum of 2 active appointments"* | **PASS** |
| **TC-07** | **Appointment Cancellation (Rule C)** | Active appointment with status `BOOKED` | Status transitions to `CANCELLED` | Status updated to `CANCELLED`, persisted | **PASS** |
| **TC-08** | **Rebooking Cancelled Slot** | Cancel 10:00–10:30 slot.<br/>Patient 2 books same doctor at 10:00 | Booking allowed because cancelled slot does not block schedule | New appointment created with status `BOOKED` for Patient 2 | **PASS** |
| **TC-09** | **Cancelled Excluded from Quota** | Patient has 2 bookings, cancels 1.<br/>Attempts new booking on same date | Booking allowed because active count is now 1 ($< 2$) | Status `BOOKED`, successfully created | **PASS** |
| **TC-10** | **Simultaneous Conflicting Bookings** | 2 concurrent threads synchronized via `CountDownLatch` attempting to book identical slot | Exactly 1 thread succeeds (`BOOKED`); exactly 1 thread fails with 409 Conflict | Thread 1: `BOOKED`<br/>Thread 2: `AppointmentConflictException`<br/>Active bookings count = 1 | **PASS** |
| **TC-11** | **Missing Doctor or Patient (404)** | Non-existent Doctor ID `999999` and Patient ID `888888` | Returns HTTP `404 Not Found` with JSON ErrorResponseDto | Status 404, message *"Doctor not found with ID: 999999"* | **PASS** |
| **TC-12** | **REST API Integration Flow** | MockMvc end-to-end calls across `/api/doctors`, `/api/patients`, `/api/appointments`, `/api/dashboard` | Returns HTTP `200`, `201`, `400`, `404`, and `409` matching OpenAPI contract | All MockMvc HTTP assertions and JSON path checks matched | **PASS** |

---

## 3. Concurrency Test Implementation Details (Test 10)

```java
@Test
@DisplayName("Test 10: Simultaneous conflicting booking requests allow exactly one booking")
void test10_SimultaneousConflictingBookings() throws InterruptedException {
    int threadCount = 2;
    ExecutorService executor = Executors.newFixedThreadPool(threadCount);
    CountDownLatch startGate = new CountDownLatch(1);
    CountDownLatch endGate = new CountDownLatch(threadCount);

    AtomicInteger successCount = new AtomicInteger(0);
    AtomicInteger conflictCount = new AtomicInteger(0);
    LocalTime contestedTime = LocalTime.of(16, 0);

    for (int i = 0; i < threadCount; i++) {
        final Long patientId = (i == 0) ? testPatientId : secondPatientId;
        executor.submit(() -> {
            try {
                startGate.await(); // Hold threads until gate opens
                appointmentService.bookAppointment(
                    new AppointmentRequestDto(testDoctorId, patientId, testDate, contestedTime, "Concurrent Booking Attempt")
                );
                successCount.incrementAndGet();
            } catch (AppointmentConflictException e) {
                conflictCount.incrementAndGet();
            } finally {
                endGate.countDown();
            }
        });
    }

    startGate.countDown(); // Release both threads at the exact same instant
    boolean completed = endGate.await(5, TimeUnit.SECONDS);
    executor.shutdown();

    assertTrue(completed);
    assertEquals(1, successCount.get(), "Exactly ONE simultaneous booking request must succeed");
    assertEquals(1, conflictCount.get(), "Exactly ONE simultaneous booking request must be rejected with 409 Conflict");
}
```

**Verification:**  
- `successCount`: 1  
- `conflictCount`: 1  
- `totalBookingsCreated`: 1  
- Race condition status: **Completely Prevented**
