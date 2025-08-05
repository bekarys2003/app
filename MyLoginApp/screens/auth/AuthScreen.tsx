import React, { useState, useEffect, useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as AuthSession from "expo-auth-session";
import * as AppleAuthentication from "expo-apple-authentication";
import * as AppleAuthenticationTypes from "expo-apple-authentication";
import { AuthContext } from "../../context/AuthContext";

WebBrowser.maybeCompleteAuthSession();
const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

export default function AuthScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isAppleAvailable, setIsAppleAvailable] = useState(false);
  const redirectUri = AuthSession.makeRedirectUri({ useProxy: true } as any);
  const { login } = useContext(AuthContext);

  const iosClientId = Constants.expoConfig?.extra?.GOOGLE_IOS_CLIENT_ID;
  const webClientId = Constants.expoConfig?.extra?.GOOGLE_WEB_CLIENT_ID;

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId,
    webClientId,
    redirectUri,
  });

  useEffect(() => {
    const checkAppleAvailability = async () => {
      const available = await AppleAuthentication.isAvailableAsync();
      setIsAppleAvailable(available);
    };
    checkAppleAvailability();
  }, []);

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
            await login(data.token); // <-- triggers isAuthenticated = true
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
      {isAppleAvailable && (
        <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={12}
            style={{ width: "100%", height: 50, marginVertical: 10 }}
            onPress={async () => {
            try {
                setLoading(true);

                const credential: AppleAuthenticationTypes.AppleAuthenticationCredential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
                });

                const identityToken = credential.identityToken;

                if (!identityToken) {
                Alert.alert("Apple Sign-In Failed", "No identity token received.");
                return;
                }

                const res = await fetch(`${API_BASE_URL}/apple-auth`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token: identityToken }),
                });

                const data = await res.json();

                if (res.ok && data.token) {
                    await login(data.token); // <-- triggers isAuthenticated = true
                    router.replace("/(tabs)");
                } else {
                Alert.alert("Error", data.message || "Apple login failed.");
                }
            } catch (e: any) {
                if (e.code !== "ERR_CANCELED") {
                console.error("Apple Login Error:", e);
                Alert.alert("Error", "Something went wrong with Apple Sign-In.");
                }
            } finally {
                setLoading(false);
            }
            }}
        />
        )}

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
