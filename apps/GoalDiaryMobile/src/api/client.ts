import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 개발/프로덕션 모두 Render 서버 사용
const API_BASE_URL = "https://tododndback.onrender.com";

const RENDER_API_URL = "https://tododndback.onrender.com";

// 토큰 재발급은 항상 Render 서버 사용
const getTokenRefreshUrl = async (): Promise<string> => {
    return RENDER_API_URL;
};

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
                if (!refreshToken) {
                    await AsyncStorage.multiRemove(["accessToken", "refreshToken", "tokenSource"]);
                    return Promise.reject(new Error("No refresh token"));
                }

                // 토큰이 어디서 발급되었는지 확인하여 같은 서버로 재발급 요청
                const refreshUrl = await getTokenRefreshUrl();
                const response = await axios.get(`${refreshUrl}/auth/refresh`, {
                    headers: {
                        Authorization: `Bearer ${refreshToken}`,
                    },
                });

                const { accessToken, refreshToken: newRefreshToken } = response.data;
                if (accessToken) {
                    await AsyncStorage.setItem("accessToken", accessToken);
                    if (newRefreshToken) {
                        await AsyncStorage.setItem("refreshToken", newRefreshToken);
                    }
                }

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                await AsyncStorage.multiRemove(["accessToken", "refreshToken", "tokenSource"]);
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
