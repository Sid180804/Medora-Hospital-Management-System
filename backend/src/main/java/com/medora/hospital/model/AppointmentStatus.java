package com.medora.hospital.model;

/**
 * Status of an appointment within MEDORA.
 * BOOKED: Active appointment occupying a slot and counting towards daily limits.
 * CANCELLED: Inactive appointment; retained for audit history, releases doctor slot and patient limit.
 */
public enum AppointmentStatus {
    BOOKED,
    CANCELLED
}
