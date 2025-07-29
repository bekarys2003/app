import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams, usePathname, useRouter } from "expo-router";
import TransitionWrapper from "../../components/TransitionWrapper";
import HomeScreen from "./index"; // Home tab screen
import BrowseScreen from "./browse"; // Browse tab screen

type Params = {
  target: "home" | "browse";
};

export default function TransitionScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const { target } = useLocalSearchParams<Params>();

  const [current] = useState<"home" | "browse">(() => {
    if (pathname.includes("browse")) return "browse";
    return "home";
  });

  const direction: "left" | "right" =
    current === "home" && target === "browse"
      ? "left"
      : current === "browse" && target === "home"
      ? "right"
      : "left";

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/(tabs)/" + target);
    }, 300);
    return () => clearTimeout(timer);
  }, [target]);

  return (
    <View style={{ flex: 1 }}>
      {/* Exit current screen */}
      <TransitionWrapper direction={direction} isEntering={false}>
        {current === "home" ? (
          <HomeScreen skipAnimation />
        ) : (
          <BrowseScreen skipAnimation />
        )}
      </TransitionWrapper>

      {/* Enter new screen */}
      <TransitionWrapper direction={direction} isEntering>
        {target === "home" ? (
          <HomeScreen skipAnimation />
        ) : (
          <BrowseScreen skipAnimation />
        )}
      </TransitionWrapper>
    </View>
  );
}
