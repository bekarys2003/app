import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Text,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnUI,
} from "react-native-reanimated";
import CardList from "../components/CardList";
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
  distanceKm?: number;
};

export default function HomeScreen({ skipAnimation }: { skipAnimation?: boolean }) {
  const translateX = useSharedValue(0);
  const { fromNav } = useLocalSearchParams();

  const [cards, setCards] = useState<CardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (skipAnimation) return;
    if (fromNav === "true") {
      runOnUI(() => {
        translateX.value = -screenWidth;
        translateX.value = withTiming(0, { duration: 250 });
      })();
    }
  }, [fromNav, skipAnimation, translateX]);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/fooditems/`);
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
          distanceKm: 2,
        }));

        setCards(formatted);
      } catch (err) {
        console.error("❌ Error loading food items:", err);
        setErrorMessage("Network error or server unavailable.");
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[animatedStyle, { flex: 1 }]}>
        <ScrollView style={{ flex: 1 }}>
          {loading ? (
            <ActivityIndicator style={{ marginTop: 100 }} size="large" />
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
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingBottom: 0,
  },
  errorText: {
    marginTop: 100,
    textAlign: "center",
    color: "red",
    fontSize: 16,
  },
});
