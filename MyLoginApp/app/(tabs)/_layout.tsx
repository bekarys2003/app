import React from "react";
import { View } from "react-native";
import { Slot, usePathname, useLocalSearchParams } from "expo-router";
import SearchBar from "../components/SearchBar";
import CategoryFilters from "../components/CategoryFilters";
import BottomNav from "../components/BottomNav";

export default function TabsLayout() {
  const pathname = usePathname();
  const params = useLocalSearchParams<{ target?: string; from?: string }>();

  let showHeader = false;
  if (pathname === "/" || pathname === "/browse") {
    showHeader = true;
  } else if (pathname === "/transition-screen") {
    const { target, from } = params;
    showHeader = (target === "home" || target === "browse") &&
                 (from === "home" || from === "browse");
  }

  const showNav = !pathname.includes("modal");

  return (
    <View style={{ flex: 1 }}>
      {showHeader && (
        <View style={{ paddingTop: 50 }}>
          <SearchBar />
          <CategoryFilters />
        </View>
      )}
      <Slot />
      {showNav && <BottomNav />}
    </View>
  );
}
