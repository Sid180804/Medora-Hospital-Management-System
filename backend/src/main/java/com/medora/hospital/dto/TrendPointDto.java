package com.medora.hospital.dto;

public class TrendPointDto {

    private String date;       // e.g. "2026-10-14"
    private String dayName;    // e.g. "Wed", "Thu"
    private long booked;
    private long cancelled;

    public TrendPointDto() {
    }

    public TrendPointDto(String date, String dayName, long booked, long cancelled) {
        this.date = date;
        this.dayName = dayName;
        this.booked = booked;
        this.cancelled = cancelled;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getDayName() {
        return dayName;
    }

    public void setDayName(String dayName) {
        this.dayName = dayName;
    }

    public long getBooked() {
        return booked;
    }

    public void setBooked(long booked) {
        this.booked = booked;
    }

    public long getCancelled() {
        return cancelled;
    }

    public void setCancelled(long cancelled) {
        this.cancelled = cancelled;
    }
}
