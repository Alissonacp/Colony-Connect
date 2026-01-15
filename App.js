// App.js
import { ThemeProvider } from './src/theme/ThemeContext';
import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import StackRoutes from './src/routes/stackRoutes';

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
        <StackRoutes />
      </NavigationContainer>
    </ThemeProvider>
  );
}