// app/(tabs)/index.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  View, ScrollView, StyleSheet, Dimensions, ActivityIndicator, Text,
} from "react-native";
import * as Location from "expo-location";                     // 👈 NEW
import { useLocalSearchParams } from "expo-router";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnUI } from "react-native-reanimated";
import CardList from "../components/CardList";
import CategoryFilters from "../components/CategoryFilters";
import SearchBar from "../components/SearchBar";
import Constants from "expo-constants";

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;
const screenWidth = Dimensions.get("window").width;

type CardProps = {
  id: string;
  title: string;
  address: string;
  time: string;
  image: { uri: string };
  rating?: number;
  ratingCount?: number;
  distanceKm?: number;                                        // 👈 display this
};

type CategoryKey = "grocery" | "fast food" | "pastry" | null;

const UI_TO_API: Record<Exclude<CategoryKey, null>, string> = {
  grocery: "groceries",
  "fast food": "meals",
  pastry: "pastries",
};

export default function HomeScreen({ skipAnimation }: { skipAnimation?: boolean }) {
  const translateX = useSharedValue(0);
  const { fromNav } = useLocalSearchParams();

  const [cards, setCards] = useState<CardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>(null);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null); // 👈 NEW
  const [locDenied, setLocDenied] = useState(false);                                // 👈 NEW

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Enter animation
  useEffect(() => {
    if (skipAnimation) return;
    if (fromNav === "true") {
      runOnUI(() => {
        translateX.value = -screenWidth;
        translateX.value = withTiming(0, { duration: 250 });
      })();
    }
  }, [fromNav, skipAnimation, translateX]);

  // Ask for location once
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocDenied(true);                                 // 👈 fallback to non‑geo sort
          return;
        }
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      } catch {
        setLocDenied(true);
      }
    })();
  }, []);

  const fetchCards = useCallback(async (category: CategoryKey, q: string) => {
    setLoading(true);
    setErrorMessage("");
    try {
      const params = new URLSearchParams();
      if (category) params.append("category", UI_TO_API[category]);
      if (q) params.append("q", q);
      if (coords) {                                            // 👈 send lat/lng when available
        params.append("lat", String(coords.lat));
        params.append("lng", String(coords.lng));
        // optional: params.append("max_distance_km", "25");
      }

      const qs = params.toString() ? `?${params.toString()}` : "";
      const res = await fetch(`${API_BASE_URL}/fooditems/${qs}`);
      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error("❌ JSON parse error:", err);
        setErrorMessage("Failed to parse response.");
        return;
      }

      if (!Array.isArray(data)) {
        console.error("❌ Expected an array but got:", data);
        setErrorMessage("Unexpected response format.");
        return;
      }

      const formatted: CardProps[] = data.map((item: any) => ({
        id: item.item_id,
        title: item.title,
        address: item.address,
        time: `${item.pickup_start.slice(0, 5)} - ${item.pickup_end.slice(0, 5)}`,
        image: { uri: item.image },
        rating: item.rating,
        ratingCount: item.rating_count,
        distanceKm: item.distance_km ?? undefined,             // 👈 map server value
      }));

      setCards(formatted);
    } catch (err) {
      console.error("❌ Error loading food items:", err);
      setErrorMessage("Network error or server unavailable.");
    } finally {
      setLoading(false);
    }
  }, [coords]);

  // initial + on filter/search/coords change
  useEffect(() => {
    fetchCards(selectedCategory, debounced);
  }, [fetchCards, selectedCategory, debounced]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[animatedStyle, { flex: 1 }]}>
        <ScrollView style={{ flex: 1 }}>
          {/* Search + Category pills */}
          <SearchBar
            value={search}
            onChangeText={setSearch}
            onClear={() => setSearch("")}
            onSubmitEditing={() => setDebounced(search.trim())}
          />
          <CategoryFilters selected={selectedCategory} onSelect={setSelectedCategory} />

          {locDenied && (
            <Text style={{ marginLeft: 16, color: "#777", marginBottom: 6 }}>
              Location permission denied — showing newest items.
            </Text>
          )}

          {loading ? (
            <ActivityIndicator style={{ marginTop: 40 }} size="large" />
          ) : errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : (
            <>
              <CardList sectionTitle="Deals for You" cards={cards} />
              <CardList sectionTitle="Hot Takes 🔥" cards={cards} />
              <CardList sectionTitle="Nearby Picks" cards={cards} />
            </>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingBottom: 0 },
  errorText: { marginTop: 100, textAlign: "center", color: "red", fontSize: 16 },
});
