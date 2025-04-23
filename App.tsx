import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import HomeScreen from './src/screens/HomeScreen';
import type { RootStackParamList } from './src/screens/HomeScreen';
import NewDayScreen from './src/screens/NewDayScreen';
import DailyReflectionScreen from './src/screens/DailyReflectionScreen';
import ScoreScreen from './src/screens/ScoreScreen';
import TotalScoreScreen from './src/screens/TotalScoreScreen';
import LogsScreen from './src/screens/LogsScreen';
import LogDetailScreen from './src/screens/LogDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
          <Stack.Screen
            name="NewDay"
            component={NewDayScreen}
            options={{ title: '' }}
          />
          <Stack.Screen
            name="Reflect"
            component={DailyReflectionScreen}
            options={{ title: "Daily Reflection" }}
          />
          <Stack.Screen name="Score" component={ScoreScreen} options={{ title: "Rate Your Day" }} />
          <Stack.Screen name="TotalScore" component={TotalScoreScreen} options={{ title: "Day Score" }} />
          <Stack.Screen
            name="Logs"
            component={LogsScreen}
            options={{ title: "Daily Logs" }}
          />
          <Stack.Screen
            name="LogDetail"
            component={LogDetailScreen}
            options={{ title: "Log Detail" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}