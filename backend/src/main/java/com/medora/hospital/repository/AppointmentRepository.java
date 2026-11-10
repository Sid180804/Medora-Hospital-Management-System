package com.medora.hospital.repository;

import com.medora.hospital.model.Appointment;
import com.medora.hospital.model.AppointmentStatus;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    /**
     * Finds overlapping active (BOOKED) appointments for a specific doctor on a given date.
     * Overlap condition: existing.startTime < requested.endTime AND existing.endTime > requested.startTime
     */
    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId " +
           "AND a.appointmentDate = :appointmentDate " +
           "AND a.status = :status " +
           "AND a.startTime < :endTime " +
           "AND a.endTime > :startTime")
    List<Appointment> findOverlappingAppointments(
            @Param("doctorId") Long doctorId,
            @Param("appointmentDate") LocalDate appointmentDate,
            @Param("status") AppointmentStatus status,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime
    );

    /**
     * Counts active (BOOKED) appointments for a patient on a specific date across all doctors.
     */
    long countByPatientIdAndAppointmentDateAndStatus(
            Long patientId,
            LocalDate appointmentDate,
            AppointmentStatus status
    );

    List<Appointment> findByAppointmentDateOrderByStartTimeAsc(LocalDate appointmentDate);

    List<Appointment> findByDoctorIdAndAppointmentDateOrderByStartTimeAsc(Long doctorId, LocalDate appointmentDate);

    List<Appointment> findByDoctorIdOrderByAppointmentDateAscStartTimeAsc(Long doctorId);

    List<Appointment> findByPatientIdOrderByAppointmentDateAscStartTimeAsc(Long patientId);

    List<Appointment> findByStatusOrderByAppointmentDateDescStartTimeDesc(AppointmentStatus status);

    List<Appointment> findAllByOrderByAppointmentDateDescStartTimeDesc();

    long countByAppointmentDateAndStatus(LocalDate appointmentDate, AppointmentStatus status);

    long countByStatus(AppointmentStatus status);
}
