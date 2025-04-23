import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './src/screens/HomeScreen';
import type { RootStackParamList } from './src/screens/HomeScreen'; 

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#18181b',
          },
          headerTintColor: '#f4f4f5',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerBackTitle: "",
        }}
      >
        <Stack.Screen
          name="Home" 
          component={HomeScreen} 
          options={{ title: '' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}