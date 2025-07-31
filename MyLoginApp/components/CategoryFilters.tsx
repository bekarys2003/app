import React from "react";
import { ScrollView, TouchableOpacity, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons"; // switched

const categories = [
  { name: "grocery", icon: "basket-outline" },
  { name: "fast food", icon: "food-outline" },
  { name: "pastry", icon: "cookie-outline" },// no outline version, best available
];

export default function CategoryFilters() {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingLeft: 16 }}
      style={styles.scrollContainer}
    >
      {categories.map((item, i) => (
        <TouchableOpacity key={i} style={styles.categoryButton}>
          <MaterialCommunityIcons name={item.icon} size={20} color="#000" />
          <Text style={styles.categoryText}>{item.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    maxHeight: 40,
    marginBottom: 20,
  },

  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 10,
    backgroundColor: "#fff",
  },
  categoryText: {
    marginLeft: 6,
    fontSize: 14,
  },
});
