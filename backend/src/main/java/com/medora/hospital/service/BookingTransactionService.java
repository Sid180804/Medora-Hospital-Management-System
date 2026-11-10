package com.medora.hospital.service;

import com.medora.hospital.dto.AppointmentRequestDto;
import com.medora.hospital.dto.AppointmentResponseDto;
import com.medora.hospital.exception.AppointmentConflictException;
import com.medora.hospital.exception.PatientLimitExceededException;
import com.medora.hospital.exception.ResourceNotFoundException;
import com.medora.hospital.model.Appointment;
import com.medora.hospital.model.AppointmentStatus;
import com.medora.hospital.model.Doctor;
import com.medora.hospital.model.Patient;
import com.medora.hospital.repository.AppointmentRepository;
import com.medora.hospital.repository.DoctorRepository;
import com.medora.hospital.repository.PatientRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Transactional boundary for appointment operations.
 *
 * This service is deliberately invoked from an outer synchronized coordinator
 * in AppointmentService. By separating the transactional proxy from the synchronized
 * method, we guarantee that the database transaction (including commit) completes
 * entirely BEFORE the application lock monitor is released.
 */
@Service
public class BookingTransactionService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;

    public BookingTransactionService(AppointmentRepository appointmentRepository,
                                     DoctorRepository doctorRepository,
                                     PatientRepository patientRepository) {
        this.appointmentRepository = appointmentRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
    }

    /**
     * Executes the appointment booking within an isolated transaction.
     * Enforces Rule A (Doctor Overlap Prevention) and Rule B (Patient 2-per-day Limit).
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW, isolation = Isolation.READ_COMMITTED)
    public AppointmentResponseDto executeBooking(AppointmentRequestDto requestDto) {
        // 1. Verify Doctor existence
        Doctor doctor = doctorRepository.findById(requestDto.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + requestDto.getDoctorId()));

        // 2. Verify Patient existence
        Patient patient = patientRepository.findById(requestDto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + requestDto.getPatientId()));

        LocalDate date = requestDto.getAppointmentDate();
        LocalTime startTime = requestDto.getStartTime();
        // End time is automatically calculated from doctor's consultation duration
        LocalTime endTime = startTime.plusMinutes(doctor.getConsultationDuration());

        // 3. RULE A: Check for overlapping BOOKED appointments for this doctor on this date
        // Overlap formula: existing.startTime < requested.endTime && existing.endTime > requested.startTime
        List<Appointment> conflicts = appointmentRepository.findOverlappingAppointments(
                doctor.getId(), date, AppointmentStatus.BOOKED, startTime, endTime
        );

        if (!conflicts.isEmpty()) {
            Appointment conflict = conflicts.get(0);
            throw new AppointmentConflictException(
                    "Doctor " + doctor.getName() + " already has an active appointment at this time (" +
                    conflict.getStartTime() + " - " + conflict.getEndTime() + "). Please choose a different slot."
            );
        }

        // 4. RULE B: Check patient daily limit across all doctors (Max 2 active BOOKED appointments per day)
        long patientActiveCount = appointmentRepository.countByPatientIdAndAppointmentDateAndStatus(
                patient.getId(), date, AppointmentStatus.BOOKED
        );

        if (patientActiveCount >= 2) {
            throw new PatientLimitExceededException(
                    "Patient " + patient.getName() + " has reached the maximum of 2 active appointments for this day (" + date + ")."
            );
        }

        // 5. Persist the new appointment
        Appointment appointment = new Appointment(
                doctor,
                patient,
                date,
                startTime,
                endTime,
                AppointmentStatus.BOOKED,
                requestDto.getReason() != null ? requestDto.getReason().trim() : "General Consultation"
        );

        Appointment saved = appointmentRepository.save(appointment);
        return AppointmentResponseDto.fromEntity(saved);
    }

    /**
     * Executes appointment cancellation.
     * RULE C: Status becomes CANCELLED.
     * The slot is released for re-booking and patient daily count is reduced.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW, isolation = Isolation.READ_COMMITTED)
    public AppointmentResponseDto executeCancellation(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + appointmentId));

        if (appointment.getStatus() != AppointmentStatus.CANCELLED) {
            appointment.setStatus(AppointmentStatus.CANCELLED);
            appointment = appointmentRepository.save(appointment);
        }

        return AppointmentResponseDto.fromEntity(appointment);
    }
}
