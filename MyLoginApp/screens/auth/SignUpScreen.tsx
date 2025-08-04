import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import Constants from "expo-constants";


WebBrowser.maybeCompleteAuthSession();
const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

export default function SignUpScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: "9816983038-gs6t478e6vo67af9p4askcdsf4qctomv.apps.googleusercontent.com",
  });

  const isFormValid = name.trim() && email.trim() && password.trim();

  const handleGoogleSignUp = async () => {
    if (response?.type === "success") {
      const { authentication } = response;
      const token = authentication?.accessToken;

      if (!token) return Alert.alert("Error", "Google token not provided.");

      try {
        setLoading(true);
        const backendResponse = await fetch(`${API_BASE_URL}/google-auth`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await backendResponse.json();
        if (backendResponse.ok && data.token) {
          await AsyncStorage.setItem("accessToken", data.token);
          router.replace("/(tabs)");
        } else {
          Alert.alert("Error", data.message || "Google sign-up failed.");
        }
      } catch {
        Alert.alert("Error", "An error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSignUp = async () => {
    if (!isFormValid) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      if (response.ok && data.token) {
        await AsyncStorage.setItem("accessToken", data.token);
        router.replace("/(tabs)");
      } else {
        Alert.alert("Error", data.message || "Sign up failed.");
      }
    } catch {
      Alert.alert("Error", "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account 👋</Text>
      <Text style={styles.subtitle}>Lets get you started</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor="#999"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.button, !isFormValid && styles.buttonDisabled]}
        onPress={handleSignUp}
        disabled={!isFormValid || loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.googleButton]}
        onPress={() => promptAsync()}
        disabled={!request || loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Signing up..." : "Sign Up with Google"}
        </Text>
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
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 8,
    color: "#222",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
  },
  input: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#fafafa",
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
    color: "#333",
  },
  button: {
    backgroundColor: "#F56060",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: "#f3a5a5",
  },
  googleButton: {
    backgroundColor: "#DB4437",
    marginTop: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
});
