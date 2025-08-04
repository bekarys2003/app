import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function AuthScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome 👋</Text>
      <Text style={styles.subtitle}>Choose an option to continue</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace("/(tabs)/auth-tabs/login")}
      >
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.signUpButton]}
        onPress={() => router.replace("/(tabs)/auth-tabs/signup")}
      >
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fdfdfd",
      padding: 24,
      justifyContent: "center",
      alignItems: "center",
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
      textAlign: "center",
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
    buttonText: {
      color: "#fff",
      fontSize: 17,
      fontWeight: "600",
    },
  });
