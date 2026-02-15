import axios from 'axios';

const baseURL =
  import.meta.env.VITE_API_URL !== undefined
    ? import.meta.env.VITE_API_URL
    : import.meta.env.DEV
      ? ''
      : 'http://localhost:5001';

export const API = axios.create({
  baseURL,
  timeout: 15000,
});

export function getApiErrorMessage(err) {
  if (!err) return 'Something went wrong.';
  const msg = err.response?.data?.error;
  if (typeof msg === 'string') return msg;
  if (err.code === 'ECONNABORTED') return 'Request timed out. Is the backend running?';
  if (err.code === 'ERR_NETWORK') return 'Cannot reach the server. Start the backend with: cd backend && npm start';
  return err.message || 'Something went wrong.';
}
