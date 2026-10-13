import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosError,
} from 'axios';
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { API_BASE_URL } from '@env';
import { storage } from '../helper/helper';
import { STORAGE_KEYS } from '../helper/storageKeys';
import {
  getToken,
  getRefreshToken,
  saveToken,
  clearTokens,
} from '../helper/keychainHelper';
import { logoutUser } from '../helper/AppAction';

const TIMEOUT = 10000;

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token as string);
    }
  });
  failedQueue = [];
};

const httpProvider: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

httpProvider.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const language = storage.getString(STORAGE_KEYS.LANGUAGE) ?? 'en';

    config.headers['Accept-Language'] = language;
    config.headers['X-Platform'] = Platform.OS;
    config.headers['X-Device-Id'] = DeviceInfo.getDeviceId();
    config.headers['X-Build-Number'] = DeviceInfo.getBuildNumber();

    const token = await getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  error => Promise.reject(error),
);

httpProvider.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };


    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return httpProvider(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          { refreshToken },
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000, 
          },
        );

        const newAccessToken: string = data.data.accessToken;
        await saveToken(newAccessToken);

        processQueue(null, newAccessToken);
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return httpProvider(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await clearTokens();
        logoutUser();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        status: 408,
        message: 'Request timed out. Please try again.',
        data: null,
      });
    }

    if (!error.response) {
      return Promise.reject({
        status: 0,
        message: 'No internet connection.',
        data: null,
      });
    }

    return Promise.reject(error);
  },
);

export default httpProvider;