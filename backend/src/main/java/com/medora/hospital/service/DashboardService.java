package com.medora.hospital.service;

import com.medora.hospital.dto.DashboardSummaryDto;
import com.medora.hospital.dto.TrendPointDto;
import com.medora.hospital.model.Appointment;
import com.medora.hospital.model.AppointmentStatus;
import com.medora.hospital.repository.AppointmentRepository;
import com.medora.hospital.repository.DoctorRepository;
import com.medora.hospital.repository.PatientRepository;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardService {

    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;

    public DashboardService(DoctorRepository doctorRepository,
                            PatientRepository patientRepository,
                            AppointmentRepository appointmentRepository) {
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
    }

    @Transactional(readOnly = true)
    public DashboardSummaryDto getSummary() {
        long totalDoctors = doctorRepository.count();
        long totalPatients = patientRepository.count();
        LocalDate today = LocalDate.now();
        long todayAppointments = appointmentRepository.countByAppointmentDateAndStatus(today, AppointmentStatus.BOOKED);
        long cancelledAppointments = appointmentRepository.countByStatus(AppointmentStatus.CANCELLED);

        return new DashboardSummaryDto(totalDoctors, totalPatients, todayAppointments, cancelledAppointments);
    }

    @Transactional(readOnly = true)
    public List<TrendPointDto> getWeeklyTrends() {
        List<TrendPointDto> trends = new ArrayList<>();
        LocalDate today = LocalDate.now();
        // Generate a 7-day window centered around today: 3 days prior, today, 3 days ahead
        LocalDate startDate = today.minusDays(3);

        for (int i = 0; i < 7; i++) {
            LocalDate d = startDate.plusDays(i);
            List<Appointment> dayAppointments = appointmentRepository.findByAppointmentDateOrderByStartTimeAsc(d);
            long booked = dayAppointments.stream().filter(a -> a.getStatus() == AppointmentStatus.BOOKED).count();
            long cancelled = dayAppointments.stream().filter(a -> a.getStatus() == AppointmentStatus.CANCELLED).count();

            String dayName = d.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            trends.add(new TrendPointDto(d.toString(), dayName, booked, cancelled));
        }

        return trends;
    }
}
