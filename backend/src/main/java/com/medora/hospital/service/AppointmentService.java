package com.medora.hospital.service;

import com.medora.hospital.dto.AppointmentRequestDto;
import com.medora.hospital.dto.AppointmentResponseDto;
import com.medora.hospital.exception.ResourceNotFoundException;
import com.medora.hospital.model.Appointment;
import com.medora.hospital.model.AppointmentStatus;
import com.medora.hospital.repository.AppointmentRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service orchestrating appointment business workflows.
 *
 * Concurrency Design:
 * Uses synchronized methods to coordinate concurrent booking and cancellation requests.
 * By delegating to the Spring-managed {@link BookingTransactionService}, the transactional
 * proxy is executed and committed BEFORE the synchronized method releases its monitor.
 * This guarantees atomic conflict verification and zero race-condition double bookings.
 */
@Service
public class AppointmentService {

    private final BookingTransactionService bookingTransactionService;
    private final AppointmentRepository appointmentRepository;

    public AppointmentService(BookingTransactionService bookingTransactionService,
                              AppointmentRepository appointmentRepository) {
        this.bookingTransactionService = bookingTransactionService;
        this.appointmentRepository = appointmentRepository;
    }

    /**
     * Synchronized booking entry point.
     * Guarantees that only one thread can evaluate conflict checks and commit to the database at a time.
     */
    public synchronized AppointmentResponseDto bookAppointment(AppointmentRequestDto requestDto) {
        return bookingTransactionService.executeBooking(requestDto);
    }

    /**
     * Synchronized cancellation entry point.
     * Prevents race conditions between concurrent cancellations and new bookings.
     */
    public synchronized AppointmentResponseDto cancelAppointment(Long appointmentId) {
        return bookingTransactionService.executeCancellation(appointmentId);
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponseDto> getAllAppointments(Long doctorId, Long patientId,
                                                           LocalDate date, AppointmentStatus status) {
        List<Appointment> list;

        if (doctorId != null && date != null) {
            list = appointmentRepository.findByDoctorIdAndAppointmentDateOrderByStartTimeAsc(doctorId, date);
        } else if (doctorId != null) {
            list = appointmentRepository.findByDoctorIdOrderByAppointmentDateAscStartTimeAsc(doctorId);
        } else if (patientId != null) {
            list = appointmentRepository.findByPatientIdOrderByAppointmentDateAscStartTimeAsc(patientId);
        } else if (date != null) {
            list = appointmentRepository.findByAppointmentDateOrderByStartTimeAsc(date);
        } else if (status != null) {
            list = appointmentRepository.findByStatusOrderByAppointmentDateDescStartTimeDesc(status);
        } else {
            list = appointmentRepository.findAllByOrderByAppointmentDateDescStartTimeDesc();
        }

        if (status != null && (doctorId != null || patientId != null || date != null)) {
            list = list.stream().filter(a -> a.getStatus() == status).collect(Collectors.toList());
        }

        return list.stream()
                .map(AppointmentResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AppointmentResponseDto getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + id));
        return AppointmentResponseDto.fromEntity(appointment);
    }
}
