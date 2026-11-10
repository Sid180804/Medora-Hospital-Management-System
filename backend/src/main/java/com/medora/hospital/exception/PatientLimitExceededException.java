package com.medora.hospital.exception;

public class PatientLimitExceededException extends AppointmentConflictException {
    public PatientLimitExceededException(String message) {
        super(message);
    }
}
