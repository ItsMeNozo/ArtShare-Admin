import axios, { AxiosError } from 'axios';
import { toCamelCase } from '../utils/caseConverter';

const api = axios.create({
  baseURL: import.meta.env.VITE_BE_URL || 'http://localhost:3000/',
});

api.defaults.headers.common['Content-Type'] = 'application/json';

api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    if (response.data) {
      response.data = toCamelCase(response.data);
    }
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.error(
        'Unauthorized access - redirecting to login from baseApi.ts',
      );
    }
    return Promise.reject(error);
  },
);

export default api;
