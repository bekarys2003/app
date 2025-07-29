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
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

const HEADER_HEIGHT = 220;
const screenHeight = Dimensions.get("window").height;

export default function ItemDetail() {
  const translateY = useSharedValue(screenHeight);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const hasNavigated = useRef(false);

  useEffect(() => {
    translateY.value = withTiming(0, {
      duration: 400,
      easing: Easing.out(Easing.exp),
    });
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
    runOnJS(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium))();

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
    opacity: interpolate(translateY.value, [screenHeight, 0], [0, 1], "clamp"),
  }));

  const imageAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0], [1.9, 1], "clamp");
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

          <View style={styles.ratingRow}>
            <View style={styles.stars}>
              {[...Array(5)].map((_, index) => (
                <Ionicons key={index} name="star" size={18} color="#FFD700" style={styles.starIcon} />
              ))}
            </View>
            <Text style={styles.ratingText}>4.9</Text>
            <Text style={styles.ratingSubText}> (450 ratings)</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color="#555" />
            <Text style={styles.infoText}>13398 104 Ave, Surrey, BC</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={18} color="#555" />
            <Text style={styles.infoText}>Collect: 10:00 - 17:00</Text>
          </View>

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
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
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
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
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
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#444",
    marginLeft: 6,
  },
  heading: {
    fontSize: 17,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 6,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    color: "#333",
  },
  stars: {
    flexDirection: "row",
    marginRight: 8,
  },
  starIcon: {
    marginRight: 2,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  ratingSubText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
});
