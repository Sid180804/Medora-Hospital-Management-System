package com.medora.hospital;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * ============================================================================
 * MEDORA — Smart Hospital Appointment Management System
 * ============================================================================
 *
 * Spring Boot Auto-Configuration Demonstration:
 * ---------------------------------------------
 * The {@code @SpringBootApplication} annotation is a meta-annotation encapsulating:
 *
 * 1. {@code @Configuration}: Tags the class as a source of bean definitions for
 *    the Spring application context.
 * 2. {@code @EnableAutoConfiguration}: Tells Spring Boot to automatically configure
 *    the application based on dependencies found in pom.xml (e.g., automatically
 *    setting up embedded Tomcat, Jackson JSON mapping, Hibernate/JPA, and H2 DB).
 * 3. {@code @ComponentScan}: Instructs Spring to scan this package and all
 *    subpackages (controller, service, repository, config) for Spring components.
 *
 * Key Automatic Behaviors:
 * - Embedded Tomcat starts on port 8080 automatically.
 * - Spring Data JPA automatically provides CRUD implementations for Repositories.
 * - Hibernate creates schema tables for Doctor, Patient, and Appointment.
 * - H2 Console is enabled at http://localhost:8080/h2-console.
 */
@SpringBootApplication
public class MedoraApplication {

    public static void main(String[] args) {
        SpringApplication.run(MedoraApplication.class, args);
    }
}
