import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams, usePathname, useRouter } from "expo-router";
import TransitionWrapper from "../../components/TransitionWrapper";
import HomeScreen from "./index"; // Home tab screen
import BrowseScreen from "./browse"; // Browse tab screen
import ReservesScreen from "./reserves"; // Cart tab screen

type Tab = "home" | "browse" | "reserves";

type Params = {
  target: Tab;
  from?: Tab;
};

export default function TransitionScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const { target, from } = useLocalSearchParams<Params>();

  const [current] = useState<Tab>(() => {
    if (from === "browse" || from === "home" || from === "reserves") return from;
    if (pathname.includes("browse")) return "browse";
    if (pathname.includes("reserves")) return "reserves";
    return "home";
  });

  const pages: Tab[] = ["home", "browse", "reserves"];
  const direction: "left" | "right" =
    pages.indexOf(target) > pages.indexOf(current) ? "left" : "right";

  useEffect(() => {
    const timer = setTimeout(() => {
      const path = target === "home" ? "/(tabs)" : "/(tabs)/" + target;
      router.replace(path);
    }, 300);
    return () => clearTimeout(timer);
  }, [target]);

  return (
    <View style={{ flex: 1 }}>
      {/* Exit current screen */}
      <TransitionWrapper direction={direction} isEntering={false}>
        {current === "home" ? (
          <HomeScreen skipAnimation />
        ) : current === "browse" ? (
          <BrowseScreen skipAnimation />
        ) : (
          <ReservesScreen skipAnimation />
        )}
      </TransitionWrapper>

      {/* Enter new screen */}
      <TransitionWrapper direction={direction} isEntering>
        {target === "home" ? (
          <HomeScreen skipAnimation />
        ) : target === "browse" ? (
          <BrowseScreen skipAnimation />
        ) : (
          <ReservesScreen skipAnimation />
        )}
      </TransitionWrapper>
    </View>
  );
}
