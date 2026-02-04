import React, { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import axios from "axios";
import AppNavigator from "./src/navigation/AppNavigator";

const API_BASE_URL = "https://tododndback.onrender.com";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const refreshToken = await AsyncStorage.getItem("refreshToken");
                if (!refreshToken) {
                    setIsAuthenticated(false);
                    return;
                }

                try {
                    const response = await axios.get(`${API_BASE_URL}/auth/refresh`, {
                        headers: {
                            Authorization: `Bearer ${refreshToken}`,
                        },
                    });

                    if (response.data?.accessToken && response.data?.refreshToken) {
                        await AsyncStorage.multiSet([
                            ["accessToken", response.data.accessToken],
                            ["refreshToken", response.data.refreshToken],
                        ]);
                        setIsAuthenticated(true);
                    } else {
                        await AsyncStorage.multiRemove(["accessToken", "refreshToken", "tokenSource"]);
                        setIsAuthenticated(false);
                    }
                } catch (refreshError) {
                    await AsyncStorage.multiRemove(["accessToken", "refreshToken", "tokenSource"]);
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error("Error checking auth status:", error);
                setIsAuthenticated(false);
            }
        };

        checkAuthStatus();
    }, []);

    // 로그인 상태 확인 중
    if (isAuthenticated === null) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <QueryClientProvider client={queryClient}>
                <AppNavigator initialRouteName={isAuthenticated ? "MainTabs" : "Login"} />
            </QueryClientProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
});
