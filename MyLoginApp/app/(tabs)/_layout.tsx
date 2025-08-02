// /Users/beka/Desktop/proj/startup/MyLoginApp/app/(tabs)/_layout.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Slot, usePathname, useLocalSearchParams } from "expo-router";
import SearchBar from "../../components/SearchBar";
import CategoryFilters from "../../components/CategoryFilters";
import BottomNav from "../../components/BottomNav";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

export default function TabsLayout() {
  const pathname = usePathname();
  const params = useLocalSearchParams<{ target?: string; from?: string }>();

  const isHome = pathname === "/" || params.target === "home";
  const isBrowse = pathname === "/browse" || params.target === "browse";
  const isCart = pathname === "/reserves" || pathname === "/cart";
  const isAccounts = pathname === "/accaunts" || params.target === "accaunts";

  const showHeader = isHome || isBrowse;
  const showNav = !pathname.includes("modal");
  const hideSearchAndCategory = isCart || isAccounts;

  // Dynamically set the header content
  let headerComponent: React.ReactNode = null;

  if (isCart) {
    headerComponent = <Text style={styles.browseTitle}>Cart</Text>;
  } else if (isBrowse) {
    headerComponent = <Text style={styles.browseTitle}>Browse</Text>;
  } else if (isHome) {
    headerComponent = (
      <Animated.View
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(200)}
        style={[styles.homeTitleContainer, { marginLeft: 16, marginBottom: 8 }]}
      >
        <MaterialIcons name="location-on" size={18} color="black" />
        <Text style={[styles.browseTitle, styles.homeTitle, styles.noMargin]}>
          178 Pier Pl
        </Text>
      </Animated.View>
    );
  } else if (isAccounts) {
    headerComponent = <Text style={styles.browseTitle}>Accounts</Text>;
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", paddingTop: 50 }}>
      {headerComponent}

      {showHeader && !hideSearchAndCategory && (
        <>
          <SearchBar />
          <CategoryFilters />
        </>
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
    flexDirection: "row",
    alignItems: "center",
  },
  homeTitle: {
    fontSize: 18,
  },
  noMargin: {
    marginLeft: 4,
  },
});
