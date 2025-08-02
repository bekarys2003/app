import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { useLocalSearchParams, usePathname, useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

import TransitionWrapper from "../../components/TransitionWrapper";
import HomeScreen from "./index";
import BrowseScreen from "./browse";
import ReservesScreen from "./reserves";
import SearchBar from "../../components/SearchBar";
import CategoryFilters from "../../components/CategoryFilters";
import SkeletonScreen from "../../components/SkeletonScreen";
type Tab = "home" | "browse" | "reserves" | "accaunts";

type Params = {
  target: Tab;
  from?: Tab;
};

export default function TransitionScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const { target, from } = useLocalSearchParams<Params>();

  const [current] = useState<Tab>(() => {
    if (from === "browse" || from === "home" || from === "reserves" || from === "accaunts") return from;
    if (pathname.includes("browse")) return "browse";
    if (pathname.includes("reserves")) return "reserves";
    if (pathname.includes("accaunts")) return "accaunts";
    return "home";
  });

  const [showSkeleton, setShowSkeleton] = useState(true);
  const [delayedReservesRender, setDelayedReservesRender] = useState(false);

  const pages: Tab[] = ["home", "browse", "reserves", "accaunts"];
  const direction: "left" | "right" =
    pages.indexOf(target) > pages.indexOf(current) ? "left" : "right";

  // Shared animation values
  const headerOpacity = useSharedValue(1);
  const headerTranslateY = useSharedValue(0);

  useEffect(() => {
    if (target === current) {
      const path = target === "home" ? "/(tabs)" : `/(tabs)/${target}`;
      router.replace(path as "/(tabs)" | "/(tabs)/reserves" | "/(tabs)/accaunts");
      return;
    }

    setShowSkeleton(true);
    setDelayedReservesRender(false); // reset

    const isTargetReservesOrAccaunts = target === "reserves" || target === "accaunts";
    const isFromReservesOrAccaunts = from === "reserves" || from === "accaunts";
    const isTargetHeader = target === "home" || target === "browse";

    if (isTargetReservesOrAccaunts) {
      headerOpacity.value = withTiming(0, { duration: 250 });
      headerTranslateY.value = withTiming(-50, { duration: 250 });

      setTimeout(() => {
        setDelayedReservesRender(true);
        setShowSkeleton(false);
        router.replace(`/(tabs)/${target}`);
      }, 300);
    } else if (isFromReservesOrAccaunts && isTargetHeader) {
      headerOpacity.value = withTiming(1, { duration: 250 });
      headerTranslateY.value = withTiming(0, { duration: 250 });

      setTimeout(() => {
        setShowSkeleton(false);
        router.replace(target === "home" ? "/(tabs)" : `/(tabs)/${target}`);
      }, 300);
    } else {
      setTimeout(() => {
        if ((target as Tab) === "reserves" || (target as Tab) === "accaunts") setDelayedReservesRender(true);
        setShowSkeleton(false);
        router.replace(target === "home" ? "/(tabs)" : `/(tabs)/${target}`);
      }, 300);
    }
  }, [target, from]);

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const renderScreen = (tab: Tab) => {
    if (tab === "reserves" && !delayedReservesRender) return <SkeletonScreen />;
    if (tab === "accaunts" && !delayedReservesRender) return <SkeletonScreen />;
    if (tab === "home") return <HomeScreen skipAnimation />;
    if (tab === "browse") return <BrowseScreen skipAnimation />;
    return <ReservesScreen />;
  };

  const headerTitle =
    target === "reserves" || pathname === "/(tabs)/reserves"
      ? "Cart"
      : target === "accaunts" || pathname === "/(tabs)/accaunts"
      ? "Accounts"
      : target === "browse" || pathname.includes("browse")
      ? "Browse"
      : "Home";

  return (
    <View style={styles.container}>
      {/* Always-visible header title */}
      <Text style={styles.browseTitle}>{headerTitle}</Text>

      {/* Animated header components (except title) */}
      <Animated.View style={[styles.header, animatedHeaderStyle]}>
        <SearchBar />
        <CategoryFilters />
      </Animated.View>

      <View style={{ flex: 1 }}>
        {target !== current ? (
          <>
            <TransitionWrapper direction={direction} isEntering={false}>
              {renderScreen(current)}
            </TransitionWrapper>

            <TransitionWrapper direction={direction} isEntering>
              {showSkeleton ? <SkeletonScreen /> : renderScreen(target)}
            </TransitionWrapper>
          </>
        ) : (
          renderScreen(current)
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#fff",
    zIndex: 10,
  },
  browseTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 16,
    marginBottom: 0,
    paddingTop: 0,
    backgroundColor: "#fff",
  },
});
