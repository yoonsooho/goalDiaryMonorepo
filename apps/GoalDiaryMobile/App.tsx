import React, { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import axios from "axios";
import AppNavigator from "./src/navigation/AppNavigator";

// 개발/프로덕션 모두 Render 서버 사용
const RENDER_API_URL = "https://tododndback.onrender.com";

// 토큰 재발급은 항상 Render 서버 사용
const getTokenRefreshUrl = async (): Promise<string> => {
    return RENDER_API_URL;
};

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
        // 앱 시작 시 로그인 상태 확인 및 토큰 재발급
        const checkAuthStatus = async () => {
            try {
                const refreshToken = await AsyncStorage.getItem("refreshToken");
                const accessToken = await AsyncStorage.getItem("accessToken");
                console.log("refreshToken:", refreshToken);
                console.log("accessToken:", accessToken);

                // refreshToken이 없으면 로그인 화면으로
                if (!refreshToken) {
                    console.log("No refresh token found, redirecting to login");
                    setIsAuthenticated(false);
                    return;
                }

                // refreshToken이 있으면 토큰 재발급 시도
                console.log("Refresh token found, attempting to refresh tokens...");
                try {
                    // 로컬 개발 시에는 항상 로컬 백엔드 사용 (Render 서버 사용 안 함)
                    const refreshUrl = await getTokenRefreshUrl();
                    console.log("Refreshing tokens from:", refreshUrl);
                    const response = await axios.get(`${refreshUrl}/auth/refresh`, {
                        headers: {
                            Authorization: `Bearer ${refreshToken}`,
                        },
                    });

                    console.log("Refresh response:", JSON.stringify(response.data, null, 2));

                    // 새 토큰 저장
                    if (response.data?.accessToken && response.data?.refreshToken) {
                        await AsyncStorage.multiSet([
                            ["accessToken", response.data.accessToken],
                            ["refreshToken", response.data.refreshToken],
                        ]);
                        console.log("Tokens refreshed successfully");
                        setIsAuthenticated(true);
                    } else {
                        console.log("Token refresh failed: no tokens in response", {
                            hasAccessToken: !!response.data?.accessToken,
                            hasRefreshToken: !!response.data?.refreshToken,
                            responseData: response.data,
                        });
                        await AsyncStorage.multiRemove(["accessToken", "refreshToken", "tokenSource"]);
                        setIsAuthenticated(false);
                    }
                } catch (refreshError: any) {
                    console.log("Token refresh failed:", {
                        status: refreshError.response?.status,
                        message: refreshError.message,
                        responseData: refreshError.response?.data,
                        responseHeaders: refreshError.response?.headers,
                    });
                    // refresh 실패 시 토큰 삭제하고 로그인 화면으로
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
