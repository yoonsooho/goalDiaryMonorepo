import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../api/client";
import { RootStackParamList } from "../types/navigation";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function LoginScreen() {
    const navigation = useNavigation<NavigationProp>();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("입력 오류", "이메일과 비밀번호를 입력해주세요.");
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

    return (
        <View style={styles.container}>
            <Text style={styles.title}>GoalDiary</Text>
            <TextInput
                style={styles.input}
                placeholder="이메일"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!isLoading}
            />
            <TextInput
                style={styles.input}
                placeholder="비밀번호"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!isLoading}
            />
            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>로그인</Text>}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
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
});
