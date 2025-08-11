// app/(tabs)/_layout.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Slot, usePathname, useLocalSearchParams, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import BottomNav from "../../components/BottomNav"; // Adjust the path as needed
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import * as Location from "expo-location"; // 👈 add

export default function TabsLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useLocalSearchParams<{ target?: string; from?: string }>();

  const isHome = pathname === "/" || params.target === "home";
  const isBrowse = pathname === "/browse" || params.target === "browse";
  const isCart = pathname === "/reserves" || pathname === "/cart";
  const isAccounts = pathname === "/accaunts" || params.target === "accaunts";
  const showHeader = isHome || isBrowse;

  const isAuthPage =
    pathname.includes("/login") || pathname.includes("/signup") || pathname.includes("/auth");

  const showNav = !pathname.includes("modal") && !isAuthPage;
  const hideSearchAndCategory = isCart || isAccounts || isAuthPage;

  const [displayAddress, setDisplayAddress] = useState<string>("location");

  const handleChooseCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Location permission was denied.");
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      setDisplayAddress("Current location"); // or keep coords if you prefer

      // Jump through your transition so Home refetches with coords
      router.push({
        pathname: "/transition-screen",
        params: { target: "home", from: isBrowse ? "browse" : isCart ? "reserves" : isAccounts ? "accaunts" : "home" },
      });

      // Then replace to Home with query so HomeScreen can pick up coords
      setTimeout(() => {
        router.replace({
          pathname: "/(tabs)",
          params: { fromNav: "true", lat: String(lat), lng: String(lng) },
        });
      }, 10);
    } catch (e) {
      Alert.alert("Error", "Could not get your location.");
    }
  };

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
        style={[styles.homeTitleContainer, { marginLeft: 16 }]}
      >
        <MaterialIcons name="location-on" size={18} color="black" />
        <TouchableOpacity onPress={handleChooseCurrentLocation} activeOpacity={0.7}>
          <Text style={[styles.browseTitle, styles.homeTitle, styles.noMargin]}>
            {displayAddress}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  } else if (isAccounts) {
    headerComponent = <Text style={styles.browseTitle}>Accounts</Text>;
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", paddingTop: 50 }}>
      {!isAuthPage && headerComponent}
      {showHeader && !hideSearchAndCategory && <></>}
      <Slot />
      {showNav && <BottomNav />}
    </View>
  );
}

const styles = StyleSheet.create({
  browseTitle: { fontSize: 18, fontWeight: "bold", marginLeft: 16, marginBottom: 0 },
  homeTitleContainer: { flexDirection: "row", alignItems: "center" },
  homeTitle: { fontSize: 18 },
  noMargin: { marginLeft: 4 },
});
