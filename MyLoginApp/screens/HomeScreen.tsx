import React, { useEffect } from "react";
import { View, ScrollView, StyleSheet, Dimensions } from "react-native";
import SearchBar from "../components/SearchBar";
import CategoryFilters from "../components/CategoryFilters";
import BottomNav from "../components/BottomNav";
import CardList from "../components/CardList";
import { useLocalSearchParams } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnUI,
} from "react-native-reanimated";

const screenWidth = Dimensions.get("window").width;

type Props = {
  skipAnimation?: boolean;
  hideHeader?: boolean;
  hideNav?: boolean;
};


export default function HomeScreen({ skipAnimation, hideHeader, hideNav }: Props) {

  const translateX = useSharedValue(0);
  const { fromNav } = useLocalSearchParams();

  useEffect(() => {
    if (skipAnimation) return;

    if (fromNav === "true") {
      runOnUI(() => {
        translateX.value = -screenWidth;
        translateX.value = withTiming(0, { duration: 250 });
      })();
    }
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const deals = [
    {
      title: "Brecka Bakery",
      address: "1335 Sumas Way, Surrey, BC",
      time: "Today 8:00 - 23.59",
      image: require("../assets/images/pexels-athena-2180877.jpg"),
    },
    {
      title: "Cactus Burger",
      address: "13398 University Dr, BC",
      time: "Today 8:00 - 23.59",
      image: require("../assets/images/pexels-ikeen-james-1194926-2274787.jpg"),
    },
  ];

  const hotTakes = [
    {
      title: "Freshslice Pizza",
      address: "1335 Sumas Way, Surrey, BC",
      time: "Today 8:00 - 23.59",
      image: require("../assets/images/pexels-pixabay-263070.jpg"),
    },
    {
      title: "Freshslice Pizza",
      address: "1335 Sumas Way, Surrey, BC",
      time: "Today 8:00 - 23.59",
      image: require("../assets/images/pexels-valeriya-1639557.jpg"),
    },
  ];


  return (
    <View
      style={[
        styles.container,
        hideHeader && { paddingTop: 0 },
        hideNav && { paddingBottom: 0 },
      ]}
    >
      {!hideHeader && (
        <>
          <SearchBar />
          <CategoryFilters />
        </>
      )}
      <Animated.View style={[animatedStyle, { flex: 1 }]}>
        <ScrollView style={{ flex: 1 }}>
        <CardList sectionTitle="Deals for You" cards={deals} />
        <CardList sectionTitle="Hot Takes 🔥" cards={hotTakes} />
        </ScrollView>
      </Animated.View>
      {!hideNav && <BottomNav />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingBottom: 70,
  },
});
