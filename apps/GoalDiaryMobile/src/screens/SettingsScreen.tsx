import React, { useCallback, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    ScrollView,
    RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import { RootStackParamList } from "../types/navigation";
import { useCurrentUser } from "../hooks/useCurrentUser";
import apiClient from "../api/client";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SettingsScreen() {
    const navigation = useNavigation<NavigationProp>();
    const { data: user, isLoading, isRefetching, refetch } = useCurrentUser();
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await refetch();
        } finally {
            setRefreshing(false);
        }
    }, [refetch]);

    const handleLogout = async () => {
        Alert.alert("로그아웃", "정말 로그아웃하시겠습니까?", [
            { text: "취소", style: "cancel" },
            {
                text: "로그아웃",
                style: "destructive",
                onPress: async () => {
                    try {
                        // refreshToken을 읽어서 백엔드에 전송 (특정 기기만 로그아웃)
                        const refreshToken = await AsyncStorage.getItem("refreshToken");

                        if (!refreshToken) {
                            // refreshToken이 없으면 이미 로그아웃된 상태이거나 토큰이 손실된 상태
                            // 로컬 토큰만 삭제하고 로그인 화면으로 이동
                            await AsyncStorage.multiRemove(["accessToken", "refreshToken", "tokenSource"]);
                            navigation.navigate("Login");
                            return;
                        }

                        // refreshToken이 있으면 백엔드에 전송하여 특정 기기만 로그아웃
                        // 백엔드 호출이 실패해도 로컬 토큰은 삭제 (네트워크 오류 등 대비)
                        try {
                            await apiClient.post("/auth/signout", {
                                refreshToken: refreshToken,
                            });
                        } catch (error) {
                            // 백엔드 호출 실패해도 로컬 토큰은 삭제하고 로그인 화면으로 이동
                            // (백엔드에서 refreshToken이 없으면 아무것도 하지 않으므로 안전)
                            console.error("로그아웃 API 호출 실패:", error);
                        }

                        // 성공적으로 로그아웃되면 로컬 스토리지에서 토큰 삭제
                        await AsyncStorage.multiRemove(["accessToken", "refreshToken", "tokenSource"]);
                        navigation.navigate("Login");
                    } catch (error) {
                        console.error("로그아웃 중 오류:", error);
                        Alert.alert("로그아웃 실패", "로그아웃 중 오류가 발생했습니다.");
                    }
                },
            },
        ]);
    };

    const isProfileLoading = isLoading || isRefetching;

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            refreshControl={<RefreshControl refreshing={refreshing || isRefetching} onRefresh={handleRefresh} />}
        >
            <View style={styles.profileCard}>
                {isLoading ? (
                    <View style={styles.profileLoading}>
                        <ActivityIndicator size="small" color="#2563eb" />
                        <Text style={styles.profileLoadingText}>프로필 불러오는 중...</Text>
                    </View>
                ) : user ? (
                    <>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{user.username?.[0] ?? "유"}</Text>
                        </View>
                        <View style={styles.profileTextWrapper}>
                            <Text style={styles.profileName}>{user.username}</Text>
                            <Text style={styles.profileId}>ID: {user.userId}</Text>
                            {user.social && <Text style={styles.profileSocial}>소셜 로그인: {user.social}</Text>}
                        </View>
                    </>
                ) : (
                    <Text style={styles.profileFallback}>유저 정보를 불러올 수 없습니다.</Text>
                )}
            </View>

            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                <MaterialIcons name="logout" size={24} color="#ef4444" />
                <Text style={styles.menuText}>로그아웃</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
        padding: 16,
    },
    contentContainer: {
        flexGrow: 1,
    },
    profileCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    profileLoading: {
        flexDirection: "row",
        alignItems: "center",
    },
    profileLoadingText: {
        marginLeft: 8,
        fontSize: 14,
        color: "#6b7280",
    },
    profileFallback: {
        fontSize: 14,
        color: "#6b7280",
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#2563eb",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    avatarText: {
        color: "white",
        fontSize: 20,
        fontWeight: "700",
    },
    profileTextWrapper: {
        flex: 1,
    },
    profileName: {
        fontSize: 18,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 2,
    },
    profileId: {
        fontSize: 14,
        color: "#6b7280",
    },
    profileSocial: {
        marginTop: 2,
        fontSize: 13,
        color: "#6b7280",
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        padding: 16,
        borderRadius: 8,
        marginBottom: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    menuText: {
        fontSize: 16,
        color: "#ef4444",
        marginLeft: 12,
        fontWeight: "500",
    },
});
