// components/SearchBar.tsx
import React from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SearchBar({
  value,
  onChangeText,
  onSubmitEditing,
  onClear,
}: {
  value: string;
  onChangeText: (t: string) => void;
  onSubmitEditing?: () => void;
  onClear?: () => void;
}) {
  return (
    <View style={styles.searchBar}>
      <Ionicons name="search" size={20} color="gray" style={{ marginLeft: 10 }} />
      <TextInput
        placeholder="Search"
        placeholderTextColor="#aaa"
        style={styles.searchInput}
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
        onSubmitEditing={onSubmitEditing}
      />
      {!!value && (
        <TouchableOpacity onPress={onClear} style={{ paddingHorizontal: 6 }}>
          <Ionicons name="close-circle" size={18} color="#9a9a9a" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
    marginTop: 10,
    marginLeft: 16,
    marginRight: 16,
  },
  searchInput: {
    marginLeft: 10,
    fontSize: 16,
    flex: 1,
  },
});
