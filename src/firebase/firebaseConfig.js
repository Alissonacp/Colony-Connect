import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; 

import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  
  apiKey: "AIzaSyDs-kiy5zZW2ulJ8yFExNsE5hN6l8la2zw",
  authDomain: "piw-t01.firebaseapp.com",
  databaseURL: "https://piw-t01-default-rtdb.firebaseio.com",
  projectId: "piw-t01",
  storageBucket: "piw-t01.firebasestorage.app",
  messagingSenderId: "229501257899",
  appId: "1:229501257899:web:467f6ef1799161ecb38fee"
};

const app = initializeApp(firebaseConfig);

// Configuração especial para o Auth persistir (não deslogar ao fechar o app)
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export const db = getDatabase(app);