import React, { useEffect, useRef } from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedRef,
  useScrollViewOffset,
  withTiming,
  interpolate,
  runOnJS,
  useAnimatedReaction,
} from "react-native-reanimated";

const HEADER_HEIGHT = 220;
const screenHeight = Dimensions.get("window").height;

export default function ItemDetail() {
  const translateY = useSharedValue(screenHeight);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const hasNavigated = useRef(false);

  useEffect(() => {
    translateY.value = withTiming(0, { duration: 30 });
    scrollOffset.value = 0;
  }, []);

  const navigateBack = () => {
    try {
      router.back();
    } catch {
      router.replace("/");
    }
  };

  const goBackAnimated = () => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;

    translateY.value = withTiming(screenHeight, { duration: 200 }, (finished) => {
      if (finished) {
        runOnJS(navigateBack)();
      }
    });
  };

  useAnimatedReaction(
    () => scrollOffset.value,
    (current, prev) => {
      if (current < -160 && prev !== null && current < prev) {
        runOnJS(goBackAnimated)();
      }
    },
    []
  );

  const slideInStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const imageAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0], [1.5, 1], "clamp");
    const translateY = interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0], [-HEADER_HEIGHT / 2, 0], "clamp");
    return {
      transform: [{ scale }, { translateY }],
    };
  });

  return (
    <Animated.View style={[styles.fullscreen, slideInStyle]}>
      <TouchableOpacity style={styles.closeButton} onPress={goBackAnimated}>
        <Ionicons name="close" size={24} color="#000" />
      </TouchableOpacity>

      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <Animated.Image
          source={require("../assets/images/pexels-ikeen-james-1194926-2274787.jpg")}
          style={[styles.image, imageAnimatedStyle]}
        />

        <View style={styles.content}>
          <Text style={styles.title}>Freshslice Pizza - 610 6th Street</Text>
          <Text style={styles.rating}>⭐️⭐️⭐️⭐️⭐️ (450 Ratings)</Text>
          <Text style={styles.address}>📍 13398 104 Ave, Surrey, BC</Text>
          <Text style={styles.time}>🕒 Collect: 10:00 - 17:00</Text>
          <Text style={styles.heading}>What You Can Get</Text>
          <Text style={styles.text}>
            Your bag may contain a variety of delicious pizza slices the store has left over from the day to enjoy.
          </Text>
        </View>
      </Animated.ScrollView>

      <TouchableOpacity style={styles.reserveButton}>
        <Text style={styles.reserveText}>Reserve</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}


const styles = StyleSheet.create({
  fullscreen: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: "100%",
    backgroundColor: "#fff",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  image: {
    width: "100%",
    height: HEADER_HEIGHT,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  rating: {
    marginTop: 8,
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    marginTop: 10,
  },
  time: {
    fontSize: 14,
    marginBottom: 15,
  },
  heading: {
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 10,
  },
  text: {
    fontSize: 14,
    marginTop: 6,
  },
  reserveButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#F56060",
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: "center",
  },
  reserveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
