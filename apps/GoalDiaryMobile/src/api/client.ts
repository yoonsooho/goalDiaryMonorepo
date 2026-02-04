import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "https://tododndback.onrender.com";

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

                const response = await axios.get(`${API_BASE_URL}/auth/refresh`, {
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
