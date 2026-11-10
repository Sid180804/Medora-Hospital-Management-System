package com.medora.hospital.service;

import com.medora.hospital.dto.PatientRequestDto;
import com.medora.hospital.dto.PatientResponseDto;
import com.medora.hospital.exception.AppointmentConflictException;
import com.medora.hospital.exception.ResourceNotFoundException;
import com.medora.hospital.model.Patient;
import com.medora.hospital.repository.PatientRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PatientService {

    private final PatientRepository patientRepository;

    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    @Transactional
    public PatientResponseDto registerPatient(PatientRequestDto requestDto) {
        if (patientRepository.existsByEmail(requestDto.getEmail())) {
            throw new AppointmentConflictException("Patient with email '" + requestDto.getEmail() + "' already exists");
        }

        Patient patient = new Patient(
                requestDto.getName().trim(),
                requestDto.getEmail().trim().toLowerCase(),
                requestDto.getPhone().trim(),
                requestDto.getAge()
        );

        Patient saved = patientRepository.save(patient);
        return PatientResponseDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<PatientResponseDto> getAllPatients() {
        return patientRepository.findAll().stream()
                .map(PatientResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PatientResponseDto getPatientById(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + id));
        return PatientResponseDto.fromEntity(patient);
    }

    @Transactional(readOnly = true)
    public Patient getPatientEntity(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + id));
    }
}
