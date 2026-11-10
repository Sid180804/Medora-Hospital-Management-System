const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Utility helper for making API requests with clean error handling.
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : null;

    if (!response.ok) {
      const errorMessage = data?.message || `HTTP Error ${response.status}: ${response.statusText}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    // If backend is not running or network failed
    if (!err.status) {
      const networkError = new Error('Unable to connect to MEDORA Spring Boot backend (http://localhost:8080). Please ensure the backend is running.');
      networkError.status = 0;
      throw networkError;
    }
    throw err;
  }
}

// ----------------- Dashboard Endpoints -----------------
export const getDashboardSummary = () => request('/dashboard/summary');
export const getDashboardTrends = () => request('/dashboard/trends');

// ----------------- Doctor Endpoints -----------------
export const getDoctors = () => request('/doctors');
export const getDoctorById = (id) => request(`/doctors/${id}`);
export const createDoctor = (doctorData) =>
  request('/doctors', {
    method: 'POST',
    body: JSON.stringify(doctorData),
  });

// ----------------- Patient Endpoints -----------------
export const getPatients = () => request('/patients');
export const getPatientById = (id) => request(`/patients/${id}`);
export const createPatient = (patientData) =>
  request('/patients', {
    method: 'POST',
    body: JSON.stringify(patientData),
  });

// ----------------- Appointment Endpoints -----------------
export const getAppointments = (params = {}) => {
  const query = new URLSearchParams();
  if (params.doctorId) query.append('doctorId', params.doctorId);
  if (params.patientId) query.append('patientId', params.patientId);
  if (params.date) query.append('date', params.date);
  if (params.status) query.append('status', params.status);

  const queryString = query.toString();
  return request(`/appointments${queryString ? `?${queryString}` : ''}`);
};

export const getAppointmentById = (id) => request(`/appointments/${id}`);

export const createAppointment = (appointmentData) =>
  request('/appointments', {
    method: 'POST',
    body: JSON.stringify(appointmentData),
  });

export const cancelAppointment = (id) =>
  request(`/appointments/${id}/cancel`, {
    method: 'PATCH',
  });
