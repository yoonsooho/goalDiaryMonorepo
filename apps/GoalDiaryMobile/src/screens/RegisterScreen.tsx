import React, { useState } from "react";
import {
    View,
    TextInput,
    TouchableOpacity,
    Text,
    StyleSheet,
    Alert,
    ActivityIndicator,
    ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../api/client";
import { RootStackParamList } from "../types/navigation";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function RegisterScreen() {
    const navigation = useNavigation<NavigationProp>();
    const [userId, setUserId] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = (): boolean => {
        if (!userId || userId.length < 2) {
            Alert.alert("입력 오류", "사용자 ID는 최소 2글자 이상이어야 합니다.");
            return false;
        }
        if (!username || username.length < 2) {
            Alert.alert("입력 오류", "사용자명은 최소 2글자 이상이어야 합니다.");
            return false;
        }
        if (!password || password.length < 6) {
            Alert.alert("입력 오류", "비밀번호는 최소 6글자 이상이어야 합니다.");
            return false;
        }
        if (password !== confirmPassword) {
            Alert.alert("입력 오류", "비밀번호가 일치하지 않습니다.");
            return false;
        }
        return true;
    };

    const handleRegister = async () => {
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await apiClient.post("/auth/signup", {
                userId,
                username,
                password,
            });

            const accessToken = response.data?.accessToken || response.data?.access_token;
            const refreshToken = response.data?.refreshToken || response.data?.refresh_token;

            if (accessToken && refreshToken) {
                await AsyncStorage.multiSet([
                    ["accessToken", accessToken],
                    ["refreshToken", refreshToken],
                ]);

                Alert.alert("회원가입 성공", "회원가입이 완료되었습니다.", [
                    {
                        text: "확인",
                        onPress: () => navigation.navigate("MainTabs"),
                    },
                ]);
            } else {
                // 회원가입은 성공했지만 토큰이 없는 경우 (백엔드가 자동 로그인하지 않는 경우)
                Alert.alert("회원가입 성공", "회원가입이 완료되었습니다. 로그인해주세요.", [
                    {
                        text: "확인",
                        onPress: () => navigation.goBack(),
                    },
                ]);
            }
        } catch (error: any) {
            console.error("Register error:", error);
            const errorMessage = error.response?.data?.message || error.message || "회원가입에 실패했습니다.";
            Alert.alert("회원가입 실패", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <Text style={styles.title}>회원가입</Text>
                <Text style={styles.subtitle}>새 계정을 만드세요</Text>

                <TextInput
                    style={styles.input}
                    placeholder="사용자 ID"
                    value={userId}
                    onChangeText={setUserId}
                    autoCapitalize="none"
                    editable={!isLoading}
                />

                <TextInput
                    style={styles.input}
                    placeholder="사용자명"
                    value={username}
                    onChangeText={setUsername}
                    editable={!isLoading}
                />

                <TextInput
                    style={styles.input}
                    placeholder="비밀번호 (최소 6자)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    editable={!isLoading}
                />

                <TextInput
                    style={styles.input}
                    placeholder="비밀번호 확인"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    editable={!isLoading}
                />

                <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={isLoading}>
                    {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>회원가입</Text>}
                </TouchableOpacity>

                <View style={styles.switchContainer}>
                    <Text style={styles.switchText}>이미 계정이 있으신가요? </Text>
                    <TouchableOpacity onPress={() => navigation.goBack()} disabled={isLoading}>
                        <Text style={styles.switchLink}>로그인</Text>
                    </TouchableOpacity>
                </View>
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
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "#6b7280",
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
    switchContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 24,
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
