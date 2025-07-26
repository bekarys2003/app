import React from "react";
import { ScrollView, TouchableOpacity, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const categories = [
  { name: "grocery", icon: "shopping-basket" },
  { name: "fast food", icon: "fastfood" },
  { name: "pastry", icon: "bakery-dining" },
];

export default function CategoryFilters() {
  return (
    <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{ paddingLeft: 16 }}
    style={styles.scrollContainer} // ✅ add this
    >
    {categories.map((item, i) => (
        <TouchableOpacity key={i} style={styles.categoryButton}>
        <MaterialIcons name={item.icon} size={20} color="#000" />
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
