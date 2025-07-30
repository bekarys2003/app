import React, { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  runOnUI,
} from "react-native-reanimated";
import { useLocalSearchParams } from "expo-router";


const screenWidth = Dimensions.get("window").width;

type Props = {
  skipAnimation?: boolean;
};

export default function BrowseScreen({ skipAnimation }: Props) {
  const translateX = useSharedValue(0);
  const { fromNav } = useLocalSearchParams();

  useEffect(() => {
    if (skipAnimation) return;

    if (fromNav === "true") {
      runOnUI(() => {
        translateX.value = screenWidth; // Start off-screen right
        translateX.value = withTiming(0, { duration: 250 }); // Slide in to center
      })();
    }
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (

      <Animated.View style={[animatedStyle, styles.content]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.browseTitle}>Browse</Text>

          <TouchableOpacity activeOpacity={0.8} style={styles.cardWrapper}>
            <Image
              source={require("../assets/images/pexels-athena-2180877.jpg")}
              style={styles.browseImage}
            />
            <Text style={styles.browseLabel}>Bakery & Pastries</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.8} style={styles.cardWrapper}>
            <Image
              source={require("../assets/images/pexels-ikeen-james-1194926-2274787.jpg")}
              style={styles.browseImage}
            />
            <Text style={styles.browseLabel}>Fast Food</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingBottom: 70,
  },
  content: {
    flex: 1,
  },
  browseTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 16,
    marginBottom: 16,
  },
  cardWrapper: {
    marginBottom: 24,
    marginHorizontal: 16,
  },
  browseImage: {
    width: "100%",
    height: 180,
    borderRadius: 16,
  },
  browseLabel: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "bold",
  },
});
