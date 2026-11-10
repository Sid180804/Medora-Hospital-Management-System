package com.medora.hospital.config;

import com.medora.hospital.model.Appointment;
import com.medora.hospital.model.AppointmentStatus;
import com.medora.hospital.model.Doctor;
import com.medora.hospital.model.Patient;
import com.medora.hospital.repository.AppointmentRepository;
import com.medora.hospital.repository.DoctorRepository;
import com.medora.hospital.repository.PatientRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Seeds deterministic, clean demo data on application startup.
 * The H2 database runs completely in-memory and will cleanly reset upon restart.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;

    public DataSeeder(DoctorRepository doctorRepository,
                      PatientRepository patientRepository,
                      AppointmentRepository appointmentRepository) {
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
    }

    @Override
    public void run(String... args) {
        if (doctorRepository.count() > 0) {
            return;
        }

        log.info("==> [MEDORA] Seeding initial demonstration data into in-memory H2 database...");

        // 1. Seed 7 Doctors
        Doctor d1 = new Doctor("Dr. Elena Vance", "Cardiology", "elena.vance@medora.health", "+1 (555) 234-5678", 30);
        Doctor d2 = new Doctor("Dr. Marcus Brody", "Orthopedics", "marcus.brody@medora.health", "+1 (555) 345-6789", 45);
        Doctor d3 = new Doctor("Dr. Sarah Jenkins", "Pediatrics", "sarah.jenkins@medora.health", "+1 (555) 456-7890", 30);
        Doctor d4 = new Doctor("Dr. David Kim", "Neurology", "david.kim@medora.health", "+1 (555) 567-8901", 60);
        Doctor d5 = new Doctor("Dr. Priya Sharma", "Dermatology", "priya.sharma@medora.health", "+1 (555) 678-9012", 30);
        Doctor d6 = new Doctor("Dr. Thomas Wright", "General Medicine", "thomas.wright@medora.health", "+1 (555) 789-0123", 30);
        Doctor d7 = new Doctor("Dr. Olivia Bennett", "Ophthalmology", "olivia.bennett@medora.health", "+1 (555) 890-1234", 45);

        List<Doctor> doctors = doctorRepository.saveAll(Arrays.asList(d1, d2, d3, d4, d5, d6, d7));

        // 2. Seed 10 Patients
        Patient p1 = new Patient("Alex Morgan", "alex.morgan@example.com", "+1 (555) 111-2233", 29);
        Patient p2 = new Patient("Beatrice Gomez", "beatrice.g@example.com", "+1 (555) 222-3344", 42);
        Patient p3 = new Patient("Charles Sterling", "charles.s@example.com", "+1 (555) 333-4455", 65);
        Patient p4 = new Patient("Diana Prince", "diana.prince@example.com", "+1 (555) 444-5566", 34);
        Patient p5 = new Patient("Ethan Hunt", "ethan.hunt@example.com", "+1 (555) 555-6677", 38);
        Patient p6 = new Patient("Fiona Gallagher", "fiona.g@example.com", "+1 (555) 666-7788", 24);
        Patient p7 = new Patient("George Clark", "george.clark@example.com", "+1 (555) 777-8899", 51);
        Patient p8 = new Patient("Hannah Abbott", "hannah.a@example.com", "+1 (555) 888-9900", 31);
        Patient p9 = new Patient("Ian Malcolm", "ian.malcolm@example.com", "+1 (555) 999-0011", 47);
        Patient p10 = new Patient("Julia Roberts", "julia.r@example.com", "+1 (555) 123-4567", 56);

        List<Patient> patients = patientRepository.saveAll(Arrays.asList(p1, p2, p3, p4, p5, p6, p7, p8, p9, p10));

        // 3. Seed Appointments (Today, upcoming days, and past days for trend analysis)
        LocalDate today = LocalDate.now();

        // Past appointments for trend charts
        Appointment aPast1 = new Appointment(doctors.get(0), patients.get(0), today.minusDays(2),
                LocalTime.of(9, 0), LocalTime.of(9, 30), AppointmentStatus.BOOKED, "Initial cardiac consultation");
        Appointment aPast2 = new Appointment(doctors.get(1), patients.get(1), today.minusDays(2),
                LocalTime.of(10, 0), LocalTime.of(10, 45), AppointmentStatus.BOOKED, "Sprain check");
        Appointment aPast3 = new Appointment(doctors.get(2), patients.get(2), today.minusDays(1),
                LocalTime.of(11, 0), LocalTime.of(11, 30), AppointmentStatus.BOOKED, "Child routine check");
        Appointment aPast4 = new Appointment(doctors.get(4), patients.get(3), today.minusDays(1),
                LocalTime.of(14, 0), LocalTime.of(14, 30), AppointmentStatus.CANCELLED, "Patient conflict (Cancelled)");

        // Today's appointments (Active and Cancelled)
        Appointment aToday1 = new Appointment(doctors.get(0), patients.get(0), today,
                LocalTime.of(9, 0), LocalTime.of(9, 30), AppointmentStatus.BOOKED, "Routine cardiac follow-up");
        Appointment aToday2 = new Appointment(doctors.get(0), patients.get(1), today,
                LocalTime.of(10, 0), LocalTime.of(10, 30), AppointmentStatus.BOOKED, "Hypertension review");
        Appointment aToday3 = new Appointment(doctors.get(2), patients.get(3), today,
                LocalTime.of(9, 30), LocalTime.of(10, 0), AppointmentStatus.BOOKED, "Child wellness visit");
        Appointment aToday4 = new Appointment(doctors.get(4), patients.get(4), today,
                LocalTime.of(11, 0), LocalTime.of(11, 30), AppointmentStatus.BOOKED, "Dermatology assessment");
        Appointment aToday5 = new Appointment(doctors.get(5), patients.get(5), today,
                LocalTime.of(14, 0), LocalTime.of(14, 30), AppointmentStatus.BOOKED, "Seasonal allergies");
        Appointment aToday6 = new Appointment(doctors.get(1), patients.get(6), today,
                LocalTime.of(10, 0), LocalTime.of(10, 45), AppointmentStatus.CANCELLED, "Knee soreness (Cancelled)");

        // Upcoming appointments (Tomorrow and day after)
        Appointment aFuture1 = new Appointment(doctors.get(1), patients.get(2), today.plusDays(1),
                LocalTime.of(10, 0), LocalTime.of(10, 45), AppointmentStatus.BOOKED, "Post-op orthopedic evaluation");
        Appointment aFuture2 = new Appointment(doctors.get(3), patients.get(7), today.plusDays(1),
                LocalTime.of(11, 0), LocalTime.of(12, 0), AppointmentStatus.BOOKED, "Chronic migraine consult");
        Appointment aFuture3 = new Appointment(doctors.get(6), patients.get(8), today.plusDays(1),
                LocalTime.of(14, 0), LocalTime.of(14, 45), AppointmentStatus.BOOKED, "Glaucoma examination");
        Appointment aFuture4 = new Appointment(doctors.get(0), patients.get(9), today.plusDays(2),
                LocalTime.of(11, 0), LocalTime.of(11, 30), AppointmentStatus.BOOKED, "ECG interpretation");
        Appointment aFuture5 = new Appointment(doctors.get(5), patients.get(0), today.plusDays(2),
                LocalTime.of(15, 0), LocalTime.of(15, 30), AppointmentStatus.CANCELLED, "Rescheduled to next week");

        appointmentRepository.saveAll(Arrays.asList(
                aPast1, aPast2, aPast3, aPast4,
                aToday1, aToday2, aToday3, aToday4, aToday5, aToday6,
                aFuture1, aFuture2, aFuture3, aFuture4, aFuture5
        ));

        log.info("==> [MEDORA] Data seeding complete: 7 Doctors, 10 Patients, 15 Appointments.");
    }
}
