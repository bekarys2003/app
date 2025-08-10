// components/TransitionWrapper.tsx
import React, { useEffect, ReactNode } from "react";
import { Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
} from "react-native-reanimated";

const { width: screenWidth } = Dimensions.get("window");

type Props = {
  children: ReactNode;
  direction?: "left" | "right";
  isEntering?: boolean;
};

export default function TransitionWrapper({
  children,
  direction = "left",
  isEntering = true,
}: Props) {
  const translateX = useSharedValue(
    isEntering ? (direction === "left" ? screenWidth : -screenWidth) : 0
  );

  useEffect(() => {
    translateX.value = withTiming(
      isEntering ? 0 : direction === "left" ? -screenWidth : screenWidth,
      { duration: 300 }
    );
  }, [direction, isEntering, translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}
