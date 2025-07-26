import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function BottomNav() {
  const router = useRouter();

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity onPress={() => router.push("/")}>
        <Ionicons name="home" size={24} color="#000" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/browse")}>
        <Ionicons name="search" size={24} color="#000" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/reserves")}>
        <Ionicons name="cart" size={24} color="#000" />
      </TouchableOpacity>
      <Ionicons name="person" size={24} color="#000" />
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
    marginBottom: 25,
  },
});
