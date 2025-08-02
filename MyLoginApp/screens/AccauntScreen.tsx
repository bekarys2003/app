import React, { useState, useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { AuthContext } from "../context/AuthContext";

export default function AccountScreen() {
  const [loading, setLoading] = useState(false);
  const { logout } = useContext(AuthContext); // ✅ use logout

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout(); // ✅ centralizes logic
      Alert.alert("Logged out", "You have been logged out.");
    } catch {
      Alert.alert("Error", "Failed to log out.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account</Text>
      <TouchableOpacity style={styles.button} onPress={handleLogout} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Logging out..." : "Log Out"}</Text>
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
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});