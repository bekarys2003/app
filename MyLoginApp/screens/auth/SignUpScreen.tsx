import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import { AuthContext } from "../../context/AuthContext";

WebBrowser.maybeCompleteAuthSession();
const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

export default function SignUpScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useContext(AuthContext);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: "9816983038-gs6t478e6vo67af9p4askcdsf4qctomv.apps.googleusercontent.com",
  });

  const isFormValid =
    firstName.trim() !== "" &&
    lastName.trim() !== "" &&
    email.trim() !== "" &&
    password.trim() !== "" &&
    confirmPassword.trim() !== "" &&
    password === confirmPassword;

  const handleSignUp = async () => {
    if (!isFormValid) {
      Alert.alert("Error", "Please complete all fields and ensure passwords match.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          password,
          password_confirm: confirmPassword,
        }),
      });

      const data = await response.json();
      if (response.ok && data.token) {
        console.log("Redirecting to main...");
        await login(data.token); // 👈 triggers the same effect as in LoginScreen
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
      <Text style={styles.subtitle}>Let`s get you started</Text>

      <TextInput
        style={styles.input}
        placeholder="First Name"
        placeholderTextColor="#999"
        value={firstName}
        onChangeText={setFirstName}
        autoCapitalize="words"
      />

      <TextInput
        style={styles.input}
        placeholder="Last Name"
        placeholderTextColor="#999"
        value={lastName}
        onChangeText={setLastName}
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

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="#999"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
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
