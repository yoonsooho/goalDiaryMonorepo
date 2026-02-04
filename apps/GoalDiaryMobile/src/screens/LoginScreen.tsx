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
    Platform,
    Modal,
} from "react-native";
import { WebView } from "react-native-webview";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../api/client";
import { RootStackParamList } from "../types/navigation";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const API_BASE_URL = "https://tododndback.onrender.com";

export default function LoginScreen() {
    const navigation = useNavigation<NavigationProp>();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [showWebView, setShowWebView] = useState(false);
    const [webViewUrl, setWebViewUrl] = useState("");

    useEffect(() => {
        const handleDeepLink = async (url: string | null) => {
            if (!url?.startsWith("goaldiary://auth/callback")) return;

            try {
                const queryString = url.split("?")[1];
                if (!queryString) return;

                const params = new URLSearchParams(queryString);
                const accessToken = params.get("accessToken");
                const refreshToken = params.get("refreshToken");

                if (accessToken && refreshToken) {
                    await AsyncStorage.multiSet([
                        ["accessToken", decodeURIComponent(accessToken)],
                        ["refreshToken", decodeURIComponent(refreshToken)],
                        ["tokenSource", "render"],
                    ]);
                    setIsGoogleLoading(false);
                    navigation.replace("MainTabs");
                }
            } catch (error) {
                console.error("Deep link processing error:", error);
                setIsGoogleLoading(false);
            }
        };

        const subscription = Linking.addEventListener("url", (event) => {
            handleDeepLink(event.url);
        });

        Linking.getInitialURL().then((url) => {
            if (url) handleDeepLink(url);
        });

        return () => subscription.remove();
    }, [navigation]);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("입력 오류", "사용자 ID와 비밀번호를 입력해주세요.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await apiClient.post("/auth/signin", { userId: email, password });
            const accessToken = response.data?.accessToken || response.data?.access_token;
            const refreshToken = response.data?.refreshToken || response.data?.refresh_token;

            if (!accessToken || !refreshToken) {
                Alert.alert("로그인 실패", "토큰을 받아올 수 없습니다.");
                return;
            }

            await AsyncStorage.multiSet([
                ["accessToken", accessToken],
                ["refreshToken", refreshToken],
                ["tokenSource", "render"],
            ]);

            navigation.replace("MainTabs");
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || "로그인에 실패했습니다.";
            Alert.alert("로그인 실패", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        setIsGoogleLoading(true);
        setWebViewUrl(`${API_BASE_URL}/auth/google?mobile=true&state=mobile`);
        setShowWebView(true);
    };

    const extractAndSaveTokens = async (accessToken: string, refreshToken: string) => {
        if (!accessToken || !refreshToken) {
            Alert.alert("구글 로그인 실패", "토큰을 받아올 수 없습니다.");
            setShowWebView(false);
            setIsGoogleLoading(false);
            return;
        }

        try {
            await AsyncStorage.multiSet([
                ["accessToken", accessToken],
                ["refreshToken", refreshToken],
                ["tokenSource", "render"],
            ]);
            setShowWebView(false);
            setIsGoogleLoading(false);
            navigation.replace("MainTabs");
        } catch (error) {
            console.error("Error saving tokens:", error);
            Alert.alert("구글 로그인 실패", "토큰 저장 중 오류가 발생했습니다.");
            setShowWebView(false);
            setIsGoogleLoading(false);
        }
    };

    const handleWebViewNavigationStateChange = (navState: any) => {
        const { url } = navState;
        if (!url?.startsWith("goaldiary://auth/callback")) return;

        try {
            const queryString = url.split("?")[1];
            if (!queryString) return;

            const params = new URLSearchParams(queryString);
            const accessToken = params.get("accessToken");
            const refreshToken = params.get("refreshToken");

            if (accessToken && refreshToken) {
                extractAndSaveTokens(decodeURIComponent(accessToken), decodeURIComponent(refreshToken));
            }
        } catch (error: any) {
            console.error("Error processing deep link:", error);
            Alert.alert("구글 로그인 실패", error.message || "딥링크 처리 중 오류가 발생했습니다.");
            setShowWebView(false);
            setIsGoogleLoading(false);
        }
    };

    const handleCloseWebView = () => {
        setShowWebView(false);
        setIsGoogleLoading(false);
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

            <Modal visible={showWebView} animationType="slide" transparent={false} onRequestClose={handleCloseWebView}>
                <View style={styles.webViewContainer}>
                    <View style={styles.webViewHeader}>
                        <TouchableOpacity onPress={handleCloseWebView} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                        <Text style={styles.webViewTitle}>Google 로그인</Text>
                        <View style={styles.closeButtonPlaceholder} />
                    </View>
                    <WebView
                        source={{ uri: webViewUrl }}
                        onNavigationStateChange={handleWebViewNavigationStateChange}
                        startInLoadingState={true}
                        renderLoading={() => (
                            <View style={styles.webViewLoading}>
                                <ActivityIndicator size="large" color="#2563eb" />
                            </View>
                        )}
                        userAgent={
                            Platform.OS === "ios"
                                ? "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
                                : "Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"
                        }
                        onShouldStartLoadWithRequest={(request) => {
                            if (request.url?.startsWith("goaldiary://auth/callback")) {
                                handleWebViewNavigationStateChange({ url: request.url });
                                return false;
                            }
                            return true;
                        }}
                        onError={() => {
                            Alert.alert("오류", "페이지를 불러오는 중 오류가 발생했습니다.");
                            setShowWebView(false);
                            setIsGoogleLoading(false);
                        }}
                        onLoadEnd={(syntheticEvent) => {
                            const url = syntheticEvent.nativeEvent.url;
                            if (url?.startsWith("goaldiary://auth/callback")) {
                                handleWebViewNavigationStateChange({ url });
                            }
                        }}
                        onMessage={(event) => {
                            try {
                                const data = JSON.parse(event.nativeEvent.data);
                                if (data.type === "GOOGLE_LOGIN_SUCCESS") {
                                    extractAndSaveTokens(data.accessToken, data.refreshToken);
                                } else if (
                                    data.type === "REDIRECT" &&
                                    data.url?.startsWith("goaldiary://auth/callback")
                                ) {
                                    handleWebViewNavigationStateChange({ url: data.url });
                                }
                            } catch (error) {
                                console.error("Error parsing message from WebView:", error);
                            }
                        }}
                    />
                </View>
            </Modal>
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
    webViewContainer: {
        flex: 1,
        backgroundColor: "#fff",
    },
    webViewHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
        backgroundColor: "#fff",
    },
    closeButton: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    closeButtonText: {
        fontSize: 24,
        color: "#6b7280",
        fontWeight: "bold",
    },
    webViewTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1f2937",
    },
    closeButtonPlaceholder: {
        width: 40,
    },
    webViewLoading: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
});
