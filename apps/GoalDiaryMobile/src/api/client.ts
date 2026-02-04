import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 개발 환경: 로컬 백엔드 사용 (로컬 네트워크 IP)
// 프로덕션: Render 서버 사용
// Google OAuth는 IP 주소를 허용하지 않으므로 Google 로그인만 Render 서버 사용
const API_BASE_URL = __DEV__
    ? "http://172.30.1.55:3001" // 로컬 네트워크 IP (실제 디바이스에서 접근 가능)
    : "https://tododndback.onrender.com";

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = await AsyncStorage.getItem("refreshToken");
                const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
                    refreshToken,
                });

                const { accessToken } = response.data;
                await AsyncStorage.setItem("accessToken", accessToken);

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                await AsyncStorage.multiRemove(["accessToken", "refreshToken"]);
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
