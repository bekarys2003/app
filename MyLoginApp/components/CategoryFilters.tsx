// components/CategoryFilters.tsx
import React from "react";
import { ScrollView, TouchableOpacity, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type CategoryKey = "grocery" | "fast food" | "pastry" | null;

const categories = [
  { key: "grocery" as const, name: "grocery", icon: "basket-outline" },
  { key: "fast food" as const, name: "fast food", icon: "food-outline" },
  { key: "pastry" as const, name: "pastry", icon: "cookie-outline" },
];

export default function CategoryFilters({
  selected,
  onSelect,
}: {
  selected: CategoryKey;
  onSelect: (key: CategoryKey) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingLeft: 16 }}
      style={styles.scrollContainer}
    >
      {categories.map((item) => {
        const isActive = selected === item.key;
        return (
          <TouchableOpacity
            key={item.key}
            style={[styles.categoryButton, isActive && styles.categoryButtonActive]}
            onPress={() => onSelect(isActive ? null : item.key)} // toggle off
          >
            <MaterialCommunityIcons
              name={item.icon as any}
              size={20}
              color={isActive ? "#fff" : "#000"}
            />
            <Text style={[styles.categoryText, { color: isActive ? "#fff" : "#000" }]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    maxHeight: 34,
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
  categoryButtonActive: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  categoryText: {
    marginLeft: 6,
    fontSize: 14,
  },
});
