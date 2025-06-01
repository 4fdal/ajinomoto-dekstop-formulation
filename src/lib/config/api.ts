import { getAccessToken } from '../helpers';
import { Store } from 'tauri-plugin-store-api';
import { toast } from 'sonner';

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';

interface CustomAxiosInstance extends AxiosInstance {
  protectedProcedure<T = any, R = AxiosResponse<T>>(
    config: AxiosRequestConfig,
  ): Promise<R>;
  publicProcedure<T = any, R = AxiosResponse<T>>(
    config: AxiosRequestConfig,
  ): Promise<R>;
}

const { VITE_REACT_SERVER_URL, VITE_PORT } = import.meta
  .env;

const store = new Store('.settings.dat');
const API = axios.create() as CustomAxiosInstance;

API.interceptors.response.use(
  (response) => response, // Pass through successful responses
  async (error) => {
    if (error.response && error.response.status === 401) {
      toast.error(error?.response?.data?.message);
      return Promise.reject(error);
    }

    // Re-throw other errors for normal error handling
    return Promise.reject(error);
  },
);

API.protectedProcedure = async (config) => {
  const token = getAccessToken();
  const baseURL = (await store.get(
    'tauri_formulation_service_url',
  )) as { value: string }; // prettier-ignore

  config.baseURL = baseURL.value || `${VITE_REACT_SERVER_URL}${VITE_PORT}`; // prettier-ignore

  if (!token) {
    console.log('[TOKEN_REQUIRED]');
    throw new Error('Token not provided');
  }
  const headers = {
    ...config.headers,
    Authorization: `Bearer ${token}`,
  };
  return API({
    ...config,
    headers,
  });
};

API.publicProcedure = async (config) => {
  const baseURL = (await store.get(
    'tauri_formulation_service_url',
  )) as { value: string };
  config.baseURL = baseURL.value || `${VITE_REACT_SERVER_URL}${VITE_PORT}`; // prettier-ignore

  return API(config);
};

export default API;
