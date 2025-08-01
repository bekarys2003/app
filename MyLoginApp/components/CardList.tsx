import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons"; // Import the icon library

type CardProps = {
  title: string;
  address: string;
  time: string;
  image: any; // local require(...)
};

type CardListProps = {
  sectionTitle: string;
  cards: CardProps[];
};

export default function CardList({ sectionTitle, cards }: CardListProps) {
  const router = useRouter();

  const handleCardPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/modal/itemDetail");
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>{sectionTitle}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 16 }}
      >
        {cards.map((card, index) => (
          <TouchableOpacity key={index} style={styles.card} onPress={handleCardPress}>
          <Image source={card.image} style={styles.cardImage} />
          <Text style={styles.cardTitle}>{card.title}</Text>
          <Text style={styles.cardSubtitle}>{card.time}</Text>
          <View style={styles.cardSubtitleContainer}>
            {/* Wrap all text strings in <Text> */}
            <Text style={styles.cardSubtitle}>4.1</Text>
            <MaterialIcons name="star" size={16} color="gray" />
            <Text style={styles.cardSubtitle}>(200+)</Text>
            <Text style={styles.cardSubtitle}> | 2 km</Text>
          </View>
        </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    marginLeft: 16,
  },
  card: {
    width: 250,
    marginRight: 16,
    marginBottom: 20,
  },
  cardImage: {
    width: "100%",
    height: 150,
    borderRadius: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginTop: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#555",
  },
  cardSubtitleContainer: {
    flexDirection: "row", // Align icon and text horizontally
    alignItems: "center", // Vertically center the icon and text
  },

});
