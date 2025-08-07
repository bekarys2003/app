import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

export const authFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = await AsyncStorage.getItem("accessToken");

  const baseHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  };

  let response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: baseHeaders,
    credentials: "include",
  });

  if (response.status === 403) {
    console.log("🔄 triggering refresh token flow...");

    const storedRefreshToken = await AsyncStorage.getItem("refreshToken");

    const refreshRes = await fetch(`${API_BASE_URL}/refresh`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            refresh_token: storedRefreshToken,
        }),
    });


    const contentType = refreshRes.headers.get("content-type");

    if (!refreshRes.ok) {
      const errorText = await refreshRes.text();
      console.error("❌ Refresh failed:", refreshRes.status, errorText);
      await AsyncStorage.removeItem("accessToken");
      throw new Error("Session expired. Please log in again.");
    }

    if (contentType && contentType.includes("application/json")) {
      const data = await refreshRes.json();
      const newToken = data.token;

      await AsyncStorage.setItem("accessToken", newToken);

      const retryHeaders: HeadersInit = {
        ...(options.headers || {}),
        "Content-Type": "application/json",
        Authorization: `Bearer ${newToken}`,
      };

      response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: retryHeaders,
        credentials: "include",
      });
    } else {
      const html = await refreshRes.text();
      console.error("❌ Expected JSON but got HTML:", html);
      throw new Error("Invalid refresh token response");
    }
  }

  return response;
};
