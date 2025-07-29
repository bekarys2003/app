import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import * as Haptics from "expo-haptics";

const ACTIVE_COLOR = "#F56060";
const INACTIVE_COLOR = "#000";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const currentTab: "home" | "browse" | "reserves" = pathname.includes("browse")
    ? "browse"
    : pathname.includes("reserves")
    ? "reserves"
    : "home";

  const tabs = [
    { name: "Home", icon: "home", target: "home", path: "/(tabs)" },
    { name: "Browse", icon: "search", target: "browse", path: "/(tabs)/browse" },
    { name: "Cart", icon: "cart", target: "reserves", path: "/(tabs)/reserves" },
    { name: "Profile", icon: "person", target: "profile", path: "/(tabs)/profile" },
  ];

  return (
    <View style={styles.bottomNav}>
      {tabs.map((tab, index) => {
        const isActive = pathname === tab.path;

        return (
          <TouchableOpacity
            key={index}
            style={styles.iconButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push({
                pathname: "/transition-screen",
                params: { target: tab.target, from: currentTab },
              });
            }}
          >
            <View style={styles.iconWrapper}>
              <Ionicons
                name={tab.icon}
                size={24}
                color={isActive ? ACTIVE_COLOR : INACTIVE_COLOR}
              />
              <Text style={[styles.label, { color: isActive ? ACTIVE_COLOR : INACTIVE_COLOR }]}>
                {tab.name}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
    marginBottom: 20,
  },
  iconButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  iconWrapper: {
    alignItems: "center",
  },
  label: {
    fontSize: 12,
    marginTop: 2,
  },
});
