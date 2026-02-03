import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';

import SchedulesScreen from '../screens/SchedulesScreen';
import RoutinesScreen from '../screens/RoutinesScreen';
import QuotesScreen from '../screens/QuotesScreen';
import DiaryScreen from '../screens/DiaryScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: true,
                tabBarActiveTintColor: '#2563eb',
                tabBarInactiveTintColor: '#6b7280',
                tabBarShowLabel: true,
                tabBarHideOnKeyboard: false,
            }}
        >
            <Tab.Screen
                name="Schedules"
                component={SchedulesScreen}
                options={{
                    title: '일정',
                    tabBarIcon: ({ color, size }) => <MaterialIcons name="calendar-today" size={size} color={color} />,
                }}
            />
            <Tab.Screen
                name="Routines"
                component={RoutinesScreen}
                options={{
                    title: '루틴',
                    tabBarIcon: ({ color, size }) => <MaterialIcons name="repeat" size={size} color={color} />,
                }}
            />
            <Tab.Screen
                name="Quotes"
                component={QuotesScreen}
                options={{
                    title: '명언',
                    tabBarIcon: ({ color, size }) => <MaterialIcons name="format-quote" size={size} color={color} />,
                }}
            />
            <Tab.Screen
                name="Diary"
                component={DiaryScreen}
                options={{
                    title: '일기',
                    tabBarIcon: ({ color, size }) => <MaterialIcons name="book" size={size} color={color} />,
                }}
            />
            <Tab.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    title: '설정',
                    tabBarIcon: ({ color, size }) => <MaterialIcons name="settings" size={size} color={color} />,
                }}
            />
        </Tab.Navigator>
    );
}
