import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import Constants from "expo-constants";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  Easing,
  useAnimatedScrollHandler
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";
import { authFetch } from "../fetch/authFetch";

const HEADER_HEIGHT = 220;
const screenHeight = Dimensions.get("window").height;
const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

export default function ItemDetail() {
  const translateY = useSharedValue(screenHeight);
  const scrollOffset = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollOffset.value = event.contentOffset.y;
    },
  });
  const hasNavigated = useRef(false);
  const { id } = useLocalSearchParams();

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/fooditems/${id}/`);
        const data = await res.json();
        setItem(data);
      } catch (err) {
        console.error("Error fetching item:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();

    translateY.value = withTiming(0, {
      duration: 400,
      easing: Easing.out(Easing.exp),
    });
    scrollOffset.value = 0;
  }, [id, scrollOffset, translateY]);

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

  const handleReserve = async () => {
    if (!item) return;
    setReserving(true);

    try {
      const res = await authFetch(`/reservations/`, {
        method: "POST",
        body: JSON.stringify({
          food_item: item.id,
          quantity: 1,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Reserved by:", data.user_email);
        Toast.show({ type: "success", text1: "Reservation successful!" });
      } else {
        const data = await res.json();
        console.error("Reservation error detail:", data);
        Toast.show({ type: "error", text1: "Reservation failed", text2: data.detail || "Try again later." });
      }
    } catch (err) {
      console.error("Reservation error:", err);
      Toast.show({ type: "error", text1: "Something went wrong" });
    } finally {
      setReserving(false);
    }
  };


  if (loading || !item) {
    return (
      <View style={[styles.fullscreen, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Animated.View style={[styles.fullscreen, slideInStyle]}>
      <TouchableOpacity style={styles.closeButton} onPress={goBackAnimated}>
        <Ionicons name="close" size={24} color="#000" />
      </TouchableOpacity>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <Animated.Image
          source={{ uri: item.image }}
          style={[styles.image, imageAnimatedStyle]}
        />

        <View style={styles.content}>
          <Text style={styles.title}>{item.title}</Text>

          <View style={styles.ratingRow}>
            <View style={styles.stars}>
              {[...Array(5)].map((_, index) => (
                <Ionicons key={index} name="star" size={18} color="#FFD700" style={styles.starIcon} />
              ))}
            </View>
            <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
            <Text style={styles.ratingSubText}> ({item.rating_count} ratings)</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color="#555" />
            <Text style={styles.infoText}>{item.address}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={18} color="#555" />
            <Text style={styles.infoText}>
              Collect: {item.pickup_start.slice(0, 5)} - {item.pickup_end.slice(0, 5)}
            </Text>
          </View>

          <Text style={styles.heading}>What You Can Get</Text>
          <Text style={styles.text}>{item.description}</Text>
        </View>
      </Animated.ScrollView>

      <TouchableOpacity
        style={[styles.reserveButton, reserving && { opacity: 0.5 }]}
        onPress={handleReserve}
        disabled={reserving}
      >
        <Text style={styles.reserveText}>{reserving ? "Reserving..." : "Reserve"}</Text>
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
