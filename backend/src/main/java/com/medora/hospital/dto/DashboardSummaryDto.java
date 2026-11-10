package com.medora.hospital.dto;

public class DashboardSummaryDto {

    private long totalDoctors;
    private long totalPatients;
    private long todayAppointments;
    private long cancelledAppointments;

    public DashboardSummaryDto() {
    }

    public DashboardSummaryDto(long totalDoctors, long totalPatients, long todayAppointments, long cancelledAppointments) {
        this.totalDoctors = totalDoctors;
        this.totalPatients = totalPatients;
        this.todayAppointments = todayAppointments;
        this.cancelledAppointments = cancelledAppointments;
    }

    public long getTotalDoctors() {
        return totalDoctors;
    }

    public void setTotalDoctors(long totalDoctors) {
        this.totalDoctors = totalDoctors;
    }

    public long getTotalPatients() {
        return totalPatients;
    }

    public void setTotalPatients(long totalPatients) {
        this.totalPatients = totalPatients;
    }

    public long getTodayAppointments() {
        return todayAppointments;
    }

    public void setTodayAppointments(long todayAppointments) {
        this.todayAppointments = todayAppointments;
    }

    public long getCancelledAppointments() {
        return cancelledAppointments;
    }

    public void setCancelledAppointments(long cancelledAppointments) {
        this.cancelledAppointments = cancelledAppointments;
    }
}
