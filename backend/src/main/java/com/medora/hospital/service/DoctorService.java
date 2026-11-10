package com.medora.hospital.service;

import com.medora.hospital.dto.DoctorRequestDto;
import com.medora.hospital.dto.DoctorResponseDto;
import com.medora.hospital.exception.AppointmentConflictException;
import com.medora.hospital.exception.ResourceNotFoundException;
import com.medora.hospital.model.Doctor;
import com.medora.hospital.repository.DoctorRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;

    public DoctorService(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    @Transactional
    public DoctorResponseDto registerDoctor(DoctorRequestDto requestDto) {
        if (doctorRepository.existsByEmail(requestDto.getEmail())) {
            throw new AppointmentConflictException("Doctor with email '" + requestDto.getEmail() + "' already exists");
        }

        Doctor doctor = new Doctor(
                requestDto.getName().trim(),
                requestDto.getSpecialization().trim(),
                requestDto.getEmail().trim().toLowerCase(),
                requestDto.getPhone().trim(),
                requestDto.getConsultationDuration()
        );

        Doctor saved = doctorRepository.save(doctor);
        return DoctorResponseDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<DoctorResponseDto> getAllDoctors() {
        return doctorRepository.findAll().stream()
                .map(DoctorResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DoctorResponseDto getDoctorById(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + id));
        return DoctorResponseDto.fromEntity(doctor);
    }

    @Transactional(readOnly = true)
    public Doctor getDoctorEntity(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + id));
    }
}
