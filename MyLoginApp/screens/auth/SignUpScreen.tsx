import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router"; // or useNavigation if not using Expo Router


WebBrowser.maybeCompleteAuthSession();

export default function SignUpScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  // Google OAuth setup
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: "9816983038-gs6t478e6vo67af9p4askcdsf4qctomv.apps.googleusercontent.com",
  });

  const handleGoogleSignUp = async () => {
    if (response?.type === "success") {
      const { authentication } = response;
      const token = authentication?.accessToken;

      if (!token) {
        Alert.alert("Error", "Google token not provided.");
        return;
      }

      try {
        setLoading(true);

        // Send the Google token to the backend
        const backendResponse = await fetch("http://127.0.0.1:8000/api/google-auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await backendResponse.json();

        if (backendResponse.ok && data.token) {
          await AsyncStorage.setItem("accessToken", data.token);
          Alert.alert("Success", "Account created successfully!");
          router.replace("/"); // Navigate to home or app root
        } else {
          Alert.alert("Error", data.message || "Google sign-up failed. Please try again.");
        }
      } catch (error) {
        Alert.alert("Error", "An error occurred. Please try again later123.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      // Backend API endpoint for manual sign-up
      const response = await fetch("http://127.0.0.1:8000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        await AsyncStorage.setItem("accessToken", data.token);
        Alert.alert("Success", "Account created successfully!");
        router.replace("/"); // Or navigate to AppStack
      }
       else {
        Alert.alert("Error", data.message || "Sign up failed. Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred. Please try again laterrrrr.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Signing up..." : "Sign Up"}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#DB4437", marginTop: 10 }]}
        onPress={() => promptAsync()}
        disabled={!request || loading}
      >
        <Text style={styles.buttonText}>{loading ? "Signing up..." : "Sign Up with Google"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});