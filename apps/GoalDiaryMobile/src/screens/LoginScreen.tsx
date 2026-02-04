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

// 개발/프로덕션 모두 Render 서버 사용
const API_BASE_URL = "https://tododndback.onrender.com";
const GOOGLE_OAUTH_BASE_URL = "https://tododndback.onrender.com";

export default function LoginScreen() {
    const navigation = useNavigation<NavigationProp>();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [showWebView, setShowWebView] = useState(false);
    const [webViewUrl, setWebViewUrl] = useState("");

    // 딥링크 리스너 추가 (dismiss 타입 처리용)
    useEffect(() => {
        const handleDeepLink = async (url: string | null) => {
            if (!url) return;

            console.log("Deep link received:", url);

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
                        // 개발/프로덕션 모두 Render 서버 사용
                        await AsyncStorage.multiSet([
                            ["accessToken", accessToken],
                            ["refreshToken", refreshToken],
                            ["tokenSource", "render"], // 토큰 소스 저장
                        ]);
                        setIsGoogleLoading(false);
                        navigation.replace("MainTabs");
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

            // 개발/프로덕션 모두 Render 서버 사용
            await AsyncStorage.multiSet([
                ["accessToken", accessToken],
                ["refreshToken", refreshToken],
                ["tokenSource", "render"], // 토큰 소스 저장
            ]);

            navigation.replace("MainTabs");
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
            // state 파라미터도 추가하여 OAuth 플로우에서 모바일 정보 유지
            const googleAuthUrl = `${GOOGLE_OAUTH_BASE_URL}/auth/google?mobile=true&state=mobile`;

            console.log("Opening Google login in WebView:", googleAuthUrl);

            // WebView 모달을 열어서 Google OAuth 플로우 처리
            setWebViewUrl(googleAuthUrl);
            setShowWebView(true);
        } catch (error: any) {
            console.error("Google login error:", error);
            Alert.alert("구글 로그인 실패", error.message || "구글 로그인 중 오류가 발생했습니다.");
            setIsGoogleLoading(false);
        }
    };

    // 토큰 추출 및 저장 함수
    const extractAndSaveTokens = (accessToken: string, refreshToken: string) => {
        if (!accessToken || !refreshToken) {
            console.error("Tokens are missing");
            Alert.alert("구글 로그인 실패", "토큰을 받아올 수 없습니다.");
            setShowWebView(false);
            setIsGoogleLoading(false);
            return;
        }

        // Google 로그인은 Render 서버 사용
        AsyncStorage.multiSet([
            ["accessToken", accessToken],
            ["refreshToken", refreshToken],
            ["tokenSource", "render"], // 토큰 소스 저장
        ])
            .then(() => {
                console.log("Tokens saved successfully");
                setShowWebView(false);
                setIsGoogleLoading(false);
                navigation.replace("MainTabs");
            })
            .catch((error) => {
                console.error("Error saving tokens:", error);
                Alert.alert("구글 로그인 실패", "토큰 저장 중 오류가 발생했습니다.");
                setShowWebView(false);
                setIsGoogleLoading(false);
            });
    };

    // WebView에서 URL 변경 감지하여 토큰 추출
    const handleWebViewNavigationStateChange = (navState: any) => {
        const { url } = navState;
        console.log("WebView URL changed:", url);

        // 딥링크로 리다이렉트된 경우 토큰 추출
        if (url && url.startsWith("goaldiary://auth/callback")) {
            console.log("Deep link detected in onNavigationStateChange");
            try {
                const urlString = String(url);
                console.log("Deep link callback URL in WebView:", urlString);

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

                extractAndSaveTokens(accessToken || "", refreshToken || "");
            } catch (error: any) {
                console.error("Error processing deep link in WebView:", error);
                Alert.alert("구글 로그인 실패", error.message || "딥링크 처리 중 오류가 발생했습니다.");
                setShowWebView(false);
                setIsGoogleLoading(false);
            }
        }
    };

    // WebView 닫기
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

            {/* Google 로그인 WebView 모달 */}
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
                        // Google OAuth가 WebView를 차단하지 않도록 User-Agent를 일반 브라우저로 설정
                        userAgent={
                            Platform.OS === "ios"
                                ? "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
                                : "Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"
                        }
                        // 딥링크를 감지하기 위해 shouldStartLoadWithRequest 사용
                        onShouldStartLoadWithRequest={(request) => {
                            const { url } = request;
                            console.log("WebView should start load:", url);

                            // 백엔드 콜백 URL에서 리다이렉트 URL 추출 시도
                            if (url && url.includes("/auth/google/callback")) {
                                console.log("Backend callback URL detected in onShouldStartLoadWithRequest");
                                // 백엔드가 리다이렉트하는 딥링크를 기다리기 위해 잠시 대기
                                // 실제로는 백엔드가 Location 헤더로 리다이렉트하므로
                                // onNavigationStateChange에서 감지됨
                            }

                            // 딥링크로 리다이렉트된 경우 처리
                            if (url && url.startsWith("goaldiary://auth/callback")) {
                                console.log("Deep link detected in onShouldStartLoadWithRequest");
                                handleWebViewNavigationStateChange({ url });
                                return false; // 딥링크는 WebView에서 로드하지 않음
                            }

                            return true; // 일반 URL은 WebView에서 로드
                        }}
                        // 에러 처리
                        onError={(syntheticEvent) => {
                            const { nativeEvent } = syntheticEvent;
                            console.error("WebView error:", nativeEvent);
                            Alert.alert("오류", "페이지를 불러오는 중 오류가 발생했습니다.");
                            setShowWebView(false);
                            setIsGoogleLoading(false);
                        }}
                        // 로딩 완료 시 URL 확인 (추가 안전장치)
                        onLoadEnd={(syntheticEvent) => {
                            const { nativeEvent } = syntheticEvent;
                            const url = nativeEvent.url;
                            console.log("WebView load ended:", url);

                            // 백엔드 콜백 URL에서 HTML을 파싱하여 리다이렉트 URL 추출
                            if (url && url.includes("/auth/google/callback")) {
                                console.log("Backend callback page loaded, injecting script to detect redirect");
                                // WebView에서 JavaScript를 실행하여 리다이렉트 URL 추출
                                // 백엔드가 Location 헤더로 리다이렉트하면 자동으로 감지됨
                            }

                            // 딥링크가 로드 완료 시점에 감지되지 않았을 경우 재확인
                            if (url && url.startsWith("goaldiary://auth/callback")) {
                                console.log("Deep link detected in onLoadEnd");
                                handleWebViewNavigationStateChange({ url });
                            }
                        }}
                        // JavaScript에서 메시지 수신 (백엔드 HTML에서 전송)
                        onMessage={(event) => {
                            try {
                                const data = JSON.parse(event.nativeEvent.data);
                                console.log("Message received from WebView:", data);

                                if (data.type === "GOOGLE_LOGIN_SUCCESS") {
                                    console.log("Google login success message received");
                                    extractAndSaveTokens(data.accessToken, data.refreshToken);
                                } else if (
                                    data.type === "REDIRECT" &&
                                    data.url &&
                                    data.url.startsWith("goaldiary://auth/callback")
                                ) {
                                    console.log("Redirect URL detected from injected JavaScript:", data.url);
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
