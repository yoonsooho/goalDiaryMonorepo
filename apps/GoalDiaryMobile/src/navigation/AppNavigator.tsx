import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Platform } from "react-native";

import TabNavigator from "./TabNavigator";
import ScheduleDetailScreen from "../screens/ScheduleDetailScreen";
import CreateScheduleScreen from "../screens/CreateScheduleScreen";
import CreateRoutineScreen from "../screens/CreateRoutineScreen";
import DiaryDetailScreen from "../screens/DiaryDetailScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Android에서 NavigationContainer 초기화 지연
        if (Platform.OS === "android") {
            setTimeout(() => setIsReady(true), 100);
        } else {
            setIsReady(true);
        }
    }, []);

    if (!isReady) {
        return null;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: Boolean(true),
                    gestureEnabled: Boolean(true),
                    animation: "default" as const,
                }}
            >
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{
                        headerShown: Boolean(false),
                        gestureEnabled: Boolean(false),
                    }}
                />
                <Stack.Screen
                    name="Register"
                    component={RegisterScreen}
                    options={{
                        title: "회원가입",
                        headerShown: Boolean(true),
                        gestureEnabled: Boolean(true),
                    }}
                />
                <Stack.Screen
                    name="MainTabs"
                    component={TabNavigator}
                    options={{
                        headerShown: Boolean(false),
                        gestureEnabled: Boolean(false),
                    }}
                />
                <Stack.Screen
                    name="ScheduleDetail"
                    component={ScheduleDetailScreen}
                    options={{
                        title: "일정 상세",
                        headerShown: Boolean(true),
                        gestureEnabled: Boolean(true),
                    }}
                />
                <Stack.Screen
                    name="CreateSchedule"
                    component={CreateScheduleScreen}
                    options={{
                        title: "일정 만들기",
                        headerShown: Boolean(true),
                        gestureEnabled: Boolean(true),
                    }}
                />
                <Stack.Screen
                    name="CreateRoutine"
                    component={CreateRoutineScreen}
                    options={{
                        title: "루틴 만들기",
                        headerShown: Boolean(true),
                        gestureEnabled: Boolean(true),
                    }}
                />
                <Stack.Screen
                    name="DiaryDetail"
                    component={DiaryDetailScreen}
                    options={{
                        title: "일기 상세",
                        headerShown: Boolean(true),
                        gestureEnabled: Boolean(true),
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
