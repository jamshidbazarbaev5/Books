import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class BaseApi {
  protected api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: 'https://xaliq-danaligi.uz:8000/api/mobile',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for script parameter
    this.api.interceptors.request.use(async config => {
      try {
        // Get script from AsyncStorage
        const script = await AsyncStorage.getItem('@books:script') || 'lat';
        
        // Add script parameter to all requests
        config.params = {
          ...config.params,
          script
        };
        
        return config;
      } catch (error) {
        console.error('Error getting script from storage:', error);
        return config;
      }
    });

    // Add request interceptor for script parameter
    this.api.interceptors.request.use(async config => {
      try {
        // Get script from AsyncStorage
        const script = await AsyncStorage.getItem('selectedScript') || 'lat';
        
        // Add script parameter to all requests
        if (config.params) {
          config.params.script = script;
        } else {
          config.params = { script };
        }
        
        console.log('Making request to:', `${config.baseURL || ''}${config.url || ''}`, 'with params:', config.params);
        return config;
      } catch (error) {
        console.error('Error getting script from storage:', error);
        return config;
      }
    });

    // Add response interceptor
    this.api.interceptors.response.use(
      response => {
        console.log('Response received:', response.status);
        return response;
      },
      error => {
        console.error('API Error:', error.response?.status, error.message);
        return Promise.reject(error);
      }
    );
  }
}
