import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Slot, usePathname, useLocalSearchParams } from "expo-router";
import SearchBar from "../../components/SearchBar";
import CategoryFilters from "../../components/CategoryFilters";
import BottomNav from "../../components/BottomNav";
import { MaterialIcons } from "@expo/vector-icons"; // Import the icon library
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

export default function TabsLayout() {
  const pathname = usePathname();
  const params = useLocalSearchParams<{ target?: string; from?: string }>();

  let showHeader = false;
  if (pathname === "/" || pathname === "/browse") {
    showHeader = true;
  } else if (pathname === "/transition-screen") {
    const { target, from } = params;
    showHeader =
      (target === "home" || target === "browse") &&
      (from === "home" || from === "browse");
  }

  const showNav = !pathname.includes("modal");

  // Determine the header title dynamically
  const headerTitle =
    pathname === "/reserves" || pathname === "/cart"
      ? "Cart"
      : pathname === "/browse" || params.target === "browse"
      ? "Browse"
      : pathname === "/" || params.target === "home" ? (
        <View style={styles.homeTitleContainer}>
          <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} style={styles.homeTitleContainer}>
              <MaterialIcons name="location-on" size={18} color="black" />
              <Text style={[styles.browseTitle, styles.homeTitle, styles.noMargin]}>
                178 Pier Pl
              </Text>
          </Animated.View>
        </View>
      )
      : pathname === "/accaunts" || params.target === "accaunts"
      ? "Accounts" // Add this condition for the "accaunts" page
      : null;
  const hideSearchAndCategory = pathname === "/reserves" || pathname === "/cart" || pathname === "/accaunts" || pathname === "/accaunts";

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", paddingTop: 50, zIndex: 1 }}>
      {headerTitle ? (
      <Text style={styles.browseTitle}>{headerTitle}</Text>
    ) : null}
      {showHeader && (
        <View>
          {!hideSearchAndCategory && (
            <>
              <SearchBar />
              <CategoryFilters />
            </>
          )}
        </View>
      )}
      <Slot />
      {showNav && <BottomNav />}
    </View>
  );
}

const styles = StyleSheet.create({
  browseTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 16,
    marginBottom: 0,
  },
  homeTitleContainer: {
    flexDirection: "row", // Align icon and text horizontally
    alignItems: "center", // Vertically center the icon and text
  },
  homeTitle: {
    fontSize: 18, // Smaller font size for the home page
  },
  noMargin: {
    marginLeft: 4, // Add a small margin to the text to bring it closer to the icon
  },
});