package com.medora.hospital;

import com.medora.hospital.dto.AppointmentRequestDto;
import com.medora.hospital.dto.AppointmentResponseDto;
import com.medora.hospital.dto.DoctorRequestDto;
import com.medora.hospital.dto.DoctorResponseDto;
import com.medora.hospital.dto.PatientRequestDto;
import com.medora.hospital.dto.PatientResponseDto;
import com.medora.hospital.exception.AppointmentConflictException;
import com.medora.hospital.model.AppointmentStatus;
import com.medora.hospital.repository.AppointmentRepository;
import com.medora.hospital.repository.DoctorRepository;
import com.medora.hospital.repository.PatientRepository;
import com.medora.hospital.service.AppointmentService;
import com.medora.hospital.service.DoctorService;
import com.medora.hospital.service.PatientService;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class MedoraBusinessRulesTest {

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private PatientService patientService;

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    private Long testDoctorId;
    private Long secondDoctorId;
    private Long testPatientId;
    private Long secondPatientId;
    private final LocalDate testDate = LocalDate.now().plusDays(10);

    @BeforeEach
    void setUp() {
        // Clean appointments first due to FK constraints
        appointmentRepository.deleteAll();
        doctorRepository.deleteAll();
        patientRepository.deleteAll();

        DoctorResponseDto doc1 = doctorService.registerDoctor(
                new DoctorRequestDto("Dr. Test Cardiologist", "Cardiology", "cardio.test@medora.health", "+1555111111", 30)
        );
        testDoctorId = doc1.getId();

        DoctorResponseDto doc2 = doctorService.registerDoctor(
                new DoctorRequestDto("Dr. Test Neurologist", "Neurology", "neuro.test@medora.health", "+1555222222", 30)
        );
        secondDoctorId = doc2.getId();

        PatientResponseDto pat1 = patientService.registerPatient(
                new PatientRequestDto("John Doe", "john.doe@test.com", "+1555333333", 35)
        );
        testPatientId = pat1.getId();

        PatientResponseDto pat2 = patientService.registerPatient(
                new PatientRequestDto("Jane Smith", "jane.smith@test.com", "+1555444444", 28)
        );
        secondPatientId = pat2.getId();
    }

    /**
     * TEST 1: Doctor Registration
     * Expected: Doctor entity successfully saved with generated ID and correct fields.
     */
    @Test
    @DisplayName("Test 1: Doctor Registration succeeds with valid details")
    void test1_DoctorRegistration() {
        DoctorRequestDto dto = new DoctorRequestDto(
                "Dr. New Specialist", "Dermatology", "new.spec@medora.health", "+1555999999", 45
        );
        DoctorResponseDto saved = doctorService.registerDoctor(dto);

        assertNotNull(saved.getId(), "Generated ID should not be null");
        assertEquals("Dr. New Specialist", saved.getName());
        assertEquals("Dermatology", saved.getSpecialization());
        assertEquals(45, saved.getConsultationDuration());
    }

    /**
     * TEST 2: Patient Registration
     * Expected: Patient entity successfully saved with generated ID and correct fields.
     */
    @Test
    @DisplayName("Test 2: Patient Registration succeeds with valid details")
    void test2_PatientRegistration() {
        PatientRequestDto dto = new PatientRequestDto("Alice Walker", "alice.w@test.com", "+1555888888", 29);
        PatientResponseDto saved = patientService.registerPatient(dto);

        assertNotNull(saved.getId(), "Generated ID should not be null");
        assertEquals("Alice Walker", saved.getName());
        assertEquals(29, saved.getAge());
    }

    /**
     * TEST 3: Successful Booking
     * Expected: New appointment created with BOOKED status and auto-calculated end time.
     */
    @Test
    @DisplayName("Test 3: Successful appointment booking with auto end-time")
    void test3_SuccessfulBooking() {
        AppointmentRequestDto request = new AppointmentRequestDto(
                testDoctorId, testPatientId, testDate, LocalTime.of(10, 0), "Routine Examination"
        );

        AppointmentResponseDto response = appointmentService.bookAppointment(request);

        assertNotNull(response.getId());
        assertEquals(AppointmentStatus.BOOKED, response.getStatus());
        assertEquals(LocalTime.of(10, 0), response.getStartTime());
        // Doctor consultation duration is 30 mins, so endTime should be 10:30
        assertEquals(LocalTime.of(10, 30), response.getEndTime());
    }

    /**
     * TEST 4: Doctor Overlap Rejection
     * Existing 10:00–10:30.
     * Attempt 10:15–10:45.
     * Expected: Throws AppointmentConflictException (HTTP 409).
     */
    @Test
    @DisplayName("Test 4: Doctor overlap booking is rejected (Rule A)")
    void test4_DoctorOverlapRejection() {
        // Book initial slot: 10:00 - 10:30
        appointmentService.bookAppointment(
                new AppointmentRequestDto(testDoctorId, testPatientId, testDate, LocalTime.of(10, 0), "First Slot")
        );

        // Attempt overlapping slot: 10:15 - 10:45
        AppointmentRequestDto overlappingRequest = new AppointmentRequestDto(
                testDoctorId, secondPatientId, testDate, LocalTime.of(10, 15), "Conflicting Slot"
        );

        AppointmentConflictException ex = assertThrows(
                AppointmentConflictException.class,
                () -> appointmentService.bookAppointment(overlappingRequest),
                "Overlapping booking must throw AppointmentConflictException"
        );

        assertTrue(ex.getMessage().contains("already has an active appointment"));
    }

    /**
     * TEST 5: Adjacent Appointment Allowed
     * Existing 10:00–10:30.
     * Attempt 10:30–11:00.
     * Expected: Successful booking (boundary condition).
     */
    @Test
    @DisplayName("Test 5: Adjacent appointment starting exactly when previous ends is allowed")
    void test5_AdjacentAppointmentAllowed() {
        // Book 10:00 - 10:30
        appointmentService.bookAppointment(
                new AppointmentRequestDto(testDoctorId, testPatientId, testDate, LocalTime.of(10, 0), "First Slot")
        );

        // Book 10:30 - 11:00 (Starts exactly at end time of previous slot)
        AppointmentRequestDto adjacentRequest = new AppointmentRequestDto(
                testDoctorId, secondPatientId, testDate, LocalTime.of(10, 30), "Adjacent Slot"
        );

        AppointmentResponseDto response = appointmentService.bookAppointment(adjacentRequest);

        assertNotNull(response.getId());
        assertEquals(AppointmentStatus.BOOKED, response.getStatus());
        assertEquals(LocalTime.of(10, 30), response.getStartTime());
        assertEquals(LocalTime.of(11, 0), response.getEndTime());
    }

    /**
     * TEST 6: Patient Daily Limit (Rule B)
     * Patient already has two BOOKED appointments on a date.
     * Attempt third appointment with another doctor on the same date.
     * Expected: Rejected with conflict exception.
     */
    @Test
    @DisplayName("Test 6: Patient cannot exceed 2 booked appointments on the same date (Rule B)")
    void test6_PatientDailyLimit() {
        // 1st booking on testDate (with Doctor 1 at 09:00)
        appointmentService.bookAppointment(
                new AppointmentRequestDto(testDoctorId, testPatientId, testDate, LocalTime.of(9, 0), "1st Visit")
        );

        // 2nd booking on testDate (with Doctor 2 at 11:00)
        appointmentService.bookAppointment(
                new AppointmentRequestDto(secondDoctorId, testPatientId, testDate, LocalTime.of(11, 0), "2nd Visit")
        );

        // Attempt 3rd booking on testDate (with Doctor 1 at 14:00)
        AppointmentRequestDto thirdBooking = new AppointmentRequestDto(
                testDoctorId, testPatientId, testDate, LocalTime.of(14, 0), "3rd Visit (Must Fail)"
        );

        AppointmentConflictException ex = assertThrows(
                AppointmentConflictException.class,
                () -> appointmentService.bookAppointment(thirdBooking),
                "3rd booking on the same date must be rejected"
        );

        assertTrue(ex.getMessage().contains("maximum of 2 active appointments"));
    }

    /**
     * TEST 7: Cancellation (Rule C)
     * Cancel a booked appointment.
     * Expected: Status changes to CANCELLED.
     */
    @Test
    @DisplayName("Test 7: Cancelling an appointment updates status to CANCELLED")
    void test7_Cancellation() {
        AppointmentResponseDto booked = appointmentService.bookAppointment(
                new AppointmentRequestDto(testDoctorId, testPatientId, testDate, LocalTime.of(10, 0), "Checkup")
        );

        AppointmentResponseDto cancelled = appointmentService.cancelAppointment(booked.getId());

        assertEquals(AppointmentStatus.CANCELLED, cancelled.getStatus());
        assertEquals(booked.getId(), cancelled.getId());
    }

    /**
     * TEST 8: Rebooking Cancelled Slot (Rule C)
     * Cancel 10:00–10:30.
     * Book another patient with same doctor at 10:00.
     * Expected: Successful booking since cancelled appointment no longer blocks the slot.
     */
    @Test
    @DisplayName("Test 8: Rebooking a cancelled time slot succeeds (Rule C)")
    void test8_RebookingCancelledSlot() {
        // Patient 1 books 10:00
        AppointmentResponseDto appt1 = appointmentService.bookAppointment(
                new AppointmentRequestDto(testDoctorId, testPatientId, testDate, LocalTime.of(10, 0), "Initial")
        );

        // Cancel Patient 1's appointment
        appointmentService.cancelAppointment(appt1.getId());

        // Patient 2 now books the exact same slot: 10:00 - 10:30
        AppointmentRequestDto rebookRequest = new AppointmentRequestDto(
                testDoctorId, secondPatientId, testDate, LocalTime.of(10, 0), "Rebook Freed Slot"
        );

        AppointmentResponseDto rebooked = appointmentService.bookAppointment(rebookRequest);

        assertNotNull(rebooked.getId());
        assertEquals(AppointmentStatus.BOOKED, rebooked.getStatus());
        assertEquals(secondPatientId, rebooked.getPatientId());
    }

    /**
     * TEST 9: Cancelled Appointment Excluded from Patient Daily Count
     * Patient has two appointments and cancels one.
     * Attempt another appointment on the same date.
     * Expected: Successful booking.
     */
    @Test
    @DisplayName("Test 9: Cancelled appointment does not count toward patient daily quota")
    void test9_CancelledAppointmentExcludedFromPatientCount() {
        // Patient books slot 1
        AppointmentResponseDto appt1 = appointmentService.bookAppointment(
                new AppointmentRequestDto(testDoctorId, testPatientId, testDate, LocalTime.of(9, 0), "Slot 1")
        );

        // Patient books slot 2
        appointmentService.bookAppointment(
                new AppointmentRequestDto(secondDoctorId, testPatientId, testDate, LocalTime.of(11, 0), "Slot 2")
        );

        // Cancel slot 1
        appointmentService.cancelAppointment(appt1.getId());

        // Attempt 3rd booking overall, but active count is now 1 (limit is 2)
        AppointmentRequestDto replacementRequest = new AppointmentRequestDto(
                testDoctorId, testPatientId, testDate, LocalTime.of(15, 0), "Replacement Booking"
        );

        AppointmentResponseDto response = appointmentService.bookAppointment(replacementRequest);

        assertNotNull(response.getId());
        assertEquals(AppointmentStatus.BOOKED, response.getStatus());
    }

    /**
     * TEST 10: Simultaneous Conflicting Bookings
     * Launch two concurrent threads attempting to book the exact same slot simultaneously
     * using CountDownLatch to maximize race conditions.
     * Expected: Exactly one succeeds with BOOKED, and exactly one fails with AppointmentConflictException.
     */
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
                    // Wait for all threads to be ready
                    startGate.await();
                    appointmentService.bookAppointment(
                            new AppointmentRequestDto(testDoctorId, patientId, testDate, contestedTime, "Concurrent Booking Attempt")
                    );
                    successCount.incrementAndGet();
                } catch (AppointmentConflictException e) {
                    conflictCount.incrementAndGet();
                } catch (Exception e) {
                    // unexpected exception
                } finally {
                    endGate.countDown();
                }
            });
        }

        // Fire both threads at the exact same moment
        startGate.countDown();
        boolean completed = endGate.await(5, TimeUnit.SECONDS);
        executor.shutdown();

        assertTrue(completed, "Concurrent booking threads must complete within timeout");
        assertEquals(1, successCount.get(), "Exactly ONE simultaneous booking request must succeed");
        assertEquals(1, conflictCount.get(), "Exactly ONE simultaneous booking request must be rejected with 409 Conflict");
    }
}
