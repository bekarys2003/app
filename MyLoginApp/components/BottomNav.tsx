import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import * as Haptics from "expo-haptics";

const ACTIVE_COLOR = "#F56060";
const INACTIVE_COLOR = "#000";

type Tab = "home" | "browse" | "reserves" | "accaunts";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  // ✅ include accaunts detection
  const currentTab: Tab =
    pathname.includes("/browse") ? "browse" :
    pathname.includes("/reserves") ? "reserves" :
    pathname.includes("/accaunts") ? "accaunts" :
    "home";

  const tabs: {
    name: string;
    icon: keyof typeof Ionicons.glyphMap;
    activeIcon: keyof typeof Ionicons.glyphMap;
    target: Tab;
    path: string;
  }[] = [
    { name: "Home",     icon: "home-outline",   activeIcon: "home",   target: "home",     path: "/(tabs)" },
    { name: "Browse",   icon: "search-outline", activeIcon: "search", target: "browse",   path: "/(tabs)/browse" },
    { name: "Cart",     icon: "cart-outline",   activeIcon: "cart",   target: "reserves", path: "/(tabs)/reserves" },
    { name: "Accaunts", icon: "person-outline", activeIcon: "person", target: "accaunts", path: "/(tabs)/accaunts" },
  ];

  const go = (target: Tab) => {
    if (target === currentTab) return; // ✅ no-op if already on tab
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/transition-screen",
      params: { target, from: currentTab },
    });
  };

  return (
    <View style={styles.bottomNav}>
      {tabs.map((tab) => {
        const isActive = currentTab === tab.target; // ✅ derived from URL
        const iconName = isActive ? tab.activeIcon : tab.icon;

        return (
          <TouchableOpacity
            key={tab.target}
            style={styles.iconButton}
            onPress={() => go(tab.target)}
          >
            <View style={styles.iconWrapper}>
              <Ionicons
                name={iconName}
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
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 25,
    borderTopWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  iconButton: { alignItems: "center", justifyContent: "center", paddingHorizontal: 10 },
  iconWrapper: { alignItems: "center" },
  label: { fontSize: 12, marginTop: 2 },
});
