import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";

export default function SkeletonScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Section Title */}
        <View style={styles.sectionTitle} />
        {/* Horizontal card list */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList}>
          {[...Array(3)].map((_, i) => (
            <View key={i} style={styles.card} />
          ))}
        </ScrollView>

        {/* Another Section */}
        <View style={styles.sectionTitle} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList}>
          {[...Array(3)].map((_, i) => (
            <View key={i} style={styles.card} />
          ))}
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingBottom: 70,
  },
  scroll: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    height: 24,
    width: 140,
    backgroundColor: "#e0e0e0",
    borderRadius: 6,
    marginLeft: 16,
    marginBottom: 12,
  },
  horizontalList: {
    paddingLeft: 16,
    marginBottom: 28,
  },
  card: {
    width: 160,
    height: 180,
    backgroundColor: "#e0e0e0",
    borderRadius: 12,
    marginRight: 12,
  },
});
