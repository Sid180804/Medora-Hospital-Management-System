package com.medora.hospital;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medora.hospital.dto.AppointmentRequestDto;
import com.medora.hospital.dto.DoctorRequestDto;
import com.medora.hospital.dto.PatientRequestDto;
import com.medora.hospital.repository.AppointmentRepository;
import com.medora.hospital.repository.DoctorRepository;
import com.medora.hospital.repository.PatientRepository;
import com.medora.hospital.service.AppointmentService;
import com.medora.hospital.service.DoctorService;
import com.medora.hospital.service.PatientService;
import java.time.LocalDate;
import java.time.LocalTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class MedoraApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private PatientService patientService;

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PatientRepository patientRepository;

    private Long validDoctorId;
    private Long validPatientId;
    private final LocalDate testDate = LocalDate.now().plusDays(5);

    @BeforeEach
    void setUp() {
        appointmentRepository.deleteAll();
        doctorRepository.deleteAll();
        patientRepository.deleteAll();

        var doc = doctorService.registerDoctor(
                new DoctorRequestDto("Dr. Integration Expert", "Pediatrics", "doc.api@medora.health", "+1555123456", 30)
        );
        validDoctorId = doc.getId();

        var pat = patientService.registerPatient(
                new PatientRequestDto("Integration Patient", "patient.api@test.com", "+1555654321", 25)
        );
        validPatientId = pat.getId();
    }

    /**
     * TEST 11: Missing Doctor or Patient returns HTTP 404 Not Found
     */
    @Test
    @DisplayName("Test 11: Missing doctor or patient returns HTTP 404 Not Found")
    void test11_MissingDoctorOrPatientReturns404() throws Exception {
        // Attempt booking with non-existent Doctor ID 999999
        AppointmentRequestDto badDoctorDto = new AppointmentRequestDto(
                999999L, validPatientId, testDate, LocalTime.of(10, 0), "Bad Doctor"
        );

        mockMvc.perform(post("/api/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badDoctorDto)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message", containsString("Doctor not found")));

        // Attempt booking with non-existent Patient ID 888888
        AppointmentRequestDto badPatientDto = new AppointmentRequestDto(
                validDoctorId, 888888L, testDate, LocalTime.of(10, 0), "Bad Patient"
        );

        mockMvc.perform(post("/api/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badPatientDto)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message", containsString("Patient not found")));
    }

    /**
     * TEST 12: Comprehensive REST API Integration Testing
     * Validates HTTP endpoints, status codes (200, 201, 400, 404, 409), and JSON structures.
     */
    @Test
    @DisplayName("Test 12: End-to-end REST API integration flow with MockMvc")
    void test12_RestApiIntegrationFlow() throws Exception {
        // 1. GET /api/doctors -> 200 OK
        mockMvc.perform(get("/api/doctors"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].name").value("Dr. Integration Expert"));

        // 2. GET /api/patients -> 200 OK
        mockMvc.perform(get("/api/patients"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].name").value("Integration Patient"));

        // 3. POST /api/appointments -> 201 Created
        AppointmentRequestDto bookingDto = new AppointmentRequestDto(
                validDoctorId, validPatientId, testDate, LocalTime.of(14, 0), "Api Integration Check"
        );

        String responseContent = mockMvc.perform(post("/api/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bookingDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.status").value("BOOKED"))
                .andExpect(jsonPath("$.startTime").value("14:00"))
                .andExpect(jsonPath("$.endTime").value("14:30"))
                .andReturn().getResponse().getContentAsString();

        Long appointmentId = objectMapper.readTree(responseContent).get("id").asLong();

        // 4. POST /api/appointments (Conflicting slot) -> 409 Conflict
        mockMvc.perform(post("/api/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bookingDto)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message", containsString("already has an active appointment")));

        // 5. GET /api/appointments/{id} -> 200 OK
        mockMvc.perform(get("/api/appointments/" + appointmentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(appointmentId))
                .andExpect(jsonPath("$.doctorName").value("Dr. Integration Expert"));

        // 6. PATCH /api/appointments/{id}/cancel -> 200 OK
        mockMvc.perform(patch("/api/appointments/" + appointmentId + "/cancel"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(appointmentId))
                .andExpect(jsonPath("$.status").value("CANCELLED"));

        // 7. GET /api/dashboard/summary -> 200 OK
        mockMvc.perform(get("/api/dashboard/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalDoctors").isNumber())
                .andExpect(jsonPath("$.totalPatients").isNumber())
                .andExpect(jsonPath("$.cancelledAppointments").value(greaterThanOrEqualTo(1)));

        // 8. GET /api/dashboard/trends -> 200 OK
        mockMvc.perform(get("/api/dashboard/trends"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(7)));
    }
}
