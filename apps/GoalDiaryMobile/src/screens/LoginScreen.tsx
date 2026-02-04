import React, { useState, useEffect } from "react";
import {
    View,
    TextInput,
    TouchableOpacity,
    Text,
    StyleSheet,
    Alert,
    ActivityIndicator,
    ScrollView,
    Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";
import apiClient from "../api/client";
import { RootStackParamList } from "../types/navigation";

// WebBrowser 완료 후 세션 정리
WebBrowser.maybeCompleteAuthSession();

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// 개발 환경: 로컬 백엔드 사용
// 프로덕션: Render 서버 사용
// Google OAuth는 IP 주소를 허용하지 않으므로 Google 로그인만 Render 서버 사용
const API_BASE_URL = __DEV__
    ? "http://172.30.1.55:3001" // 로컬 네트워크 IP
    : "https://tododndback.onrender.com";

// Google OAuth는 IP 주소를 허용하지 않으므로 항상 Render 서버 사용
const GOOGLE_OAUTH_BASE_URL = "https://tododndback.onrender.com";

export default function LoginScreen() {
    const navigation = useNavigation<NavigationProp>();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    // 딥링크 리스너 추가 (dismiss 타입 처리용)
    useEffect(() => {
        const handleDeepLink = async (url: string) => {
            if (url.startsWith("goaldiary://auth/callback")) {
                try {
                    const urlString = String(url);
                    console.log("Deep link callback URL:", urlString);

                    if (!urlString.includes("?")) {
                        console.error("URL does not contain query parameters:", urlString);
                        return;
                    }

                    const queryString = urlString.split("?")[1];
                    if (!queryString) {
                        console.error("Query string is empty");
                        return;
                    }

                    const params = new URLSearchParams(queryString);
                    const accessTokenParam = params.get("accessToken");
                    const refreshTokenParam = params.get("refreshToken");

                    const accessToken = accessTokenParam ? decodeURIComponent(accessTokenParam) : null;
                    const refreshToken = refreshTokenParam ? decodeURIComponent(refreshTokenParam) : null;

                    if (accessToken && refreshToken) {
                        await AsyncStorage.multiSet([
                            ["accessToken", accessToken],
                            ["refreshToken", refreshToken],
                        ]);
                        setIsGoogleLoading(false);
                        navigation.navigate("MainTabs");
                    }
                } catch (error: any) {
                    console.error("Deep link processing error:", error);
                    setIsGoogleLoading(false);
                }
            }
        };

        // 앱이 이미 열려있을 때 딥링크 처리
        const subscription = Linking.addEventListener("url", (event) => {
            handleDeepLink(event.url);
        });

        // 앱이 닫혔다가 딥링크로 열렸을 때 처리
        Linking.getInitialURL().then((url) => {
            if (url) {
                handleDeepLink(url);
            }
        });

        return () => {
            subscription.remove();
        };
    }, [navigation]);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("입력 오류", "사용자 ID와 비밀번호를 입력해주세요.");
            return;
        }

        setIsLoading(true);
        try {
            // 백엔드는 /auth/signin을 사용하고, userId와 password를 기대함
            const response = await apiClient.post("/auth/signin", { userId: email, password });

            // 백엔드가 토큰을 JSON으로 반환하는지 확인
            const accessToken = response.data?.accessToken || response.data?.access_token;
            const refreshToken = response.data?.refreshToken || response.data?.refresh_token;

            if (!accessToken || !refreshToken) {
                // 백엔드가 쿠키로만 토큰을 보내는 경우, 백엔드 수정 필요
                Alert.alert(
                    "로그인 실패",
                    "토큰을 받아올 수 없습니다. 백엔드가 JSON으로 토큰을 반환하도록 수정이 필요합니다."
                );
                console.error("Login response:", response.data);
                console.error("Response headers:", response.headers);
                return;
            }

            await AsyncStorage.multiSet([
                ["accessToken", accessToken],
                ["refreshToken", refreshToken],
            ]);

            navigation.navigate("MainTabs");
        } catch (error: any) {
            console.error("Login error:", error);
            console.error("Error response:", error.response?.data);
            const errorMessage = error.response?.data?.message || error.message || "로그인에 실패했습니다.";
            Alert.alert("로그인 실패", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsGoogleLoading(true);
        try {
            // 모바일 요청임을 표시하기 위해 쿼리 파라미터 추가
            // Google OAuth는 IP 주소를 허용하지 않으므로 Render 서버 사용
            const googleAuthUrl = `${GOOGLE_OAUTH_BASE_URL}/auth/google?mobile=true`;
            const redirectUrl = `goaldiary://auth/callback`;

            const result = await WebBrowser.openAuthSessionAsync(googleAuthUrl, redirectUrl);

            console.log("Google login result:", JSON.stringify(result, null, 2));

            if (result.type === "success") {
                // result.url이 null이거나 undefined일 수 있으므로 체크
                if (!result.url) {
                    console.error("Result URL is null or undefined");
                    Alert.alert("구글 로그인 실패", "리다이렉트 URL을 받을 수 없습니다.");
                    return;
                }

                // 백엔드가 리다이렉트 URL에 토큰을 쿼리 파라미터로 포함시킴
                try {
                    // 딥링크 URL (goaldiary://)을 파싱하기 위해 URLSearchParams 사용
                    const urlString = String(result.url);
                    console.log("Google login callback URL:", urlString);

                    // URL에서 쿼리 파라미터 추출
                    if (!urlString.includes("?")) {
                        console.error("URL does not contain query parameters:", urlString);
                        Alert.alert("구글 로그인 실패", "토큰이 포함된 URL을 받지 못했습니다.");
                        return;
                    }

                    const queryString = urlString.split("?")[1];
                    if (!queryString) {
                        console.error("Query string is empty");
                        Alert.alert("구글 로그인 실패", "토큰 정보를 찾을 수 없습니다.");
                        return;
                    }

                    const params = new URLSearchParams(queryString);

                    // URL 디코딩된 토큰 가져오기
                    const accessTokenParam = params.get("accessToken");
                    const refreshTokenParam = params.get("refreshToken");

                    const accessToken = accessTokenParam ? decodeURIComponent(accessTokenParam) : null;
                    const refreshToken = refreshTokenParam ? decodeURIComponent(refreshTokenParam) : null;

                    console.log("Extracted tokens:", {
                        hasAccessToken: !!accessToken,
                        hasRefreshToken: !!refreshToken,
                        accessTokenLength: accessToken?.length || 0,
                        refreshTokenLength: refreshToken?.length || 0,
                    });

                    if (accessToken && refreshToken) {
                        await AsyncStorage.multiSet([
                            ["accessToken", accessToken],
                            ["refreshToken", refreshToken],
                        ]);
                        navigation.navigate("MainTabs");
                    } else {
                        console.error("Missing tokens in URL:", {
                            url: urlString,
                            hasAccessToken: !!accessToken,
                            hasRefreshToken: !!refreshToken,
                        });
                        Alert.alert("구글 로그인 실패", "토큰을 받아올 수 없습니다.");
                    }
                } catch (urlError: any) {
                    console.error("URL parsing error:", urlError);
                    console.error("Error message:", urlError?.message);
                    console.error("Failed URL:", result.url);
                    Alert.alert(
                        "구글 로그인 실패",
                        `응답을 처리할 수 없습니다: ${urlError?.message || "알 수 없는 오류"}`
                    );
                }
            } else if (result.type === "cancel") {
                // 사용자가 취소 - 아무것도 하지 않음
                console.log("Google login cancelled by user");
            } else if (result.type === "dismiss") {
                // dismiss는 딥링크로 리다이렉트될 때 발생할 수 있음
                // 딥링크 리스너가 이미 처리했을 수 있으므로 조용히 처리
                console.log("Google login dismissed - deep link may have been handled");
                // 딥링크가 앱을 다시 열었을 수 있으므로 에러를 표시하지 않음
                // 실제로는 딥링크 리스너에서 처리되어야 함
            } else {
                console.error("Google login failed:", result);
                Alert.alert("구글 로그인 실패", `구글 로그인에 실패했습니다. (타입: ${result.type})`);
            }
        } catch (error: any) {
            console.error("Google login error:", error);
            Alert.alert("구글 로그인 실패", error.message || "구글 로그인 중 오류가 발생했습니다.");
        } finally {
            setIsGoogleLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <Text style={styles.title}>GoalDiary</Text>

                <TextInput
                    style={styles.input}
                    placeholder="사용자 ID"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    editable={!isLoading && !isGoogleLoading}
                />
                <TextInput
                    style={styles.input}
                    placeholder="비밀번호"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    editable={!isLoading && !isGoogleLoading}
                />

                <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading || isGoogleLoading}>
                    {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>로그인</Text>}
                </TouchableOpacity>

                <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>또는</Text>
                    <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity
                    style={styles.googleButton}
                    onPress={handleGoogleLogin}
                    disabled={isLoading || isGoogleLoading}
                >
                    {isGoogleLoading ? (
                        <ActivityIndicator color="#2563eb" />
                    ) : (
                        <>
                            <Text style={styles.googleIcon}>G</Text>
                            <Text style={styles.googleButtonText}>Google로 로그인</Text>
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.registerButton}
                    onPress={() => navigation.navigate("Register")}
                    disabled={isLoading || isGoogleLoading}
                >
                    <Text style={styles.registerButtonText}>회원가입</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 20,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#2563eb",
        textAlign: "center",
        marginBottom: 40,
    },
    input: {
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
        backgroundColor: "#fff",
    },
    button: {
        backgroundColor: "#2563eb",
        padding: 16,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 8,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    divider: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: "#e5e7eb",
    },
    dividerText: {
        marginHorizontal: 16,
        color: "#6b7280",
        fontSize: 14,
    },
    googleButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#d1d5db",
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
    },
    googleIcon: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#4285f4",
        marginRight: 8,
    },
    googleButtonText: {
        color: "#1f2937",
        fontSize: 16,
        fontWeight: "600",
    },
    registerButton: {
        backgroundColor: "#10b981",
        padding: 16,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 16,
    },
    registerButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    switchContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 8,
    },
    switchText: {
        color: "#6b7280",
        fontSize: 14,
    },
    switchLink: {
        color: "#2563eb",
        fontSize: 14,
        fontWeight: "600",
    },
});
