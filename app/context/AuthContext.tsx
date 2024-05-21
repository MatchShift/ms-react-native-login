import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

interface AuthProps {
  authState?: {token: string | null; authenticated: boolean | null };
  onRegister?: (email: string, password: string) => Promise<any>;
  onLogin?: (email: string, password: string) => Promise<any>
  onLogout?: () => Promise<any>;
}

const TOKEN_KEY = 'my-jwt';
export const API_URL = 'http://213.65.195.52:8180/login'; // to be replaced with the API from BE
const AuthContext = createContext<AuthProps>({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({children}: any) => {
  const [authState, setAuthState] = useState<{
    token: string | null;
    authenticated: boolean | null;
  }>({
    token: null,
    authenticated: null
  });

  useEffect(() => {
    const loadToken = async () => {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      console.log("stored", token);
      
      if(token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        setAuthState({
          token: token,
          authenticated: true,
        });
      }
    };
    loadToken();
  }, [])

  const register = async (email: string, password: string) => {
    try {
      const result = await axios.post(`${API_URL}/users`, { email, password });
      console.log("Registration successful:", result.data);
      return result.data;
    } catch (e: any) {
      let errorMsg = 'An error occurred';
      if (e.response) {
        if (e.response.status === 409) {
          errorMsg = 'User already exists';
        } else if (e.response.data && e.response.data.msg) {
          errorMsg = e.response.data.msg;
        }
      }
      console.error("Registration error:", errorMsg, e);
      return { error: true, msg: errorMsg };
    }
  };
  

  const login = async (email: string, password: string) => {
    try {
      const basicAuth = 'Basic bG9jYWxtYW5hZ2VyMUB0ZXN0dHQuY29tOnRlc3QxMjM=';
      const result = await axios.get(`${API_URL}`, {
        headers: {
          'Authorization': basicAuth
        }
      });
      if (result.data){
      console.log("file: AuthContext.tsx:41 ~ login ~ result:", result)

      setAuthState({
        token: result.data.token,
        authenticated: true,
      });

      axios.defaults.headers.common['Authorization'] = `Bearer ${result.data.token}`;

      await SecureStore.setItemAsync(TOKEN_KEY, result.data.token);

      return result;
      } else {
        return { error: true, msg: 'Invalid response from server'};
      }

    } catch (e) {
      console.error('Login error', e);
      return { error: true, msg: (e as any).response?.data?.msg || 'An error occured' };
    }
  };

  const logout = async () => {
    //delete token from storage
    await SecureStore.deleteItemAsync(TOKEN_KEY);

    //update HTTP Headers
    axios.defaults.headers.common['Authorization'] = '';

    //Reset auth state
    setAuthState({
      token: null,
      authenticated: false
    });
  }  

  const value = {
    onRegister: register,
    onLogin: login,
    onLogout: logout,
    authState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}