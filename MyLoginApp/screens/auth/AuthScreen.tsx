import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as AuthSession from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();
const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

export default function AuthScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const redirectUri = AuthSession.makeRedirectUri({ useProxy: true } as any);

  const iosClientId = Constants.expoConfig?.extra?.GOOGLE_IOS_CLIENT_ID;
  const webClientId = Constants.expoConfig?.extra?.GOOGLE_WEB_CLIENT_ID;

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId,
    webClientId,
    redirectUri,
  });



  useEffect(() => {
    const handleGoogleLogin = async () => {
      if (response?.type === "success") {
        const token = response.authentication?.accessToken;

        if (!token) {
          Alert.alert("Error", "No access token from Google.");
          return;
        }

        try {
          setLoading(true);
          const res = await fetch(`${API_BASE_URL}/google-auth`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
          });

          const data = await res.json();
          if (res.ok && data.token) {
            await AsyncStorage.setItem("accessToken", data.token);
            router.replace("/(tabs)");
          } else {
            Alert.alert("Error", data.message || "Google login failed.");
          }
        } catch {
          Alert.alert("Error", "Google login error occurred.");
        } finally {
          setLoading(false);
        }
      }
    };

    handleGoogleLogin();
  }, [response]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome 👋</Text>
      <Text style={styles.subtitle}>Choose an option to continue</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace("/(tabs)/auth-tabs/signup")}
      >
        <Text style={styles.buttonText}>Sign Up with Email</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.googleButton]}
        onPress={() => promptAsync()}
        disabled={!request || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Continue with Google</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fdfdfd",
      padding: 24,

    },
    title: {
      fontSize: 32,
      fontWeight: "600",
      marginBottom: 8,
      color: "#222",
    },
    subtitle: {
      fontSize: 16,
      color: "#666",
      marginBottom: 40,

    },
    button: {
      backgroundColor: "#F56060",
      paddingVertical: 14,
      paddingHorizontal: 40,
      borderRadius: 12,
      alignItems: "center",
      marginVertical: 10,
      width: "100%",
    },
    signUpButton: {
      backgroundColor: "#007AFF",
    },
    googleButton: {
      backgroundColor: "#DB4437",
    },
    buttonText: {
      color: "#fff",
      fontSize: 17,
      fontWeight: "600",
    },
  });
