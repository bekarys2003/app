// screens/BrowseScreen.tsx
import React from "react";
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from "react-native";
import SearchBar from "../components/SearchBar";
import CategoryFilters from "../components/CategoryFilters";
import BottomNav from "../components/BottomNav";

export default function BrowseScreen() {
  return (
    <View style={styles.container}>
      <SearchBar />
      <CategoryFilters />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
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
