import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { MaterialIcons } from "@expo/vector-icons";

type CardProps = {
  id: string;
  title: string;
  address: string;
  time: string; // e.g., "10:00 - 17:00"
  image: { uri: string }; // remote image URL
  rating?: number;
  ratingCount?: number;
  distanceKm?: number;
};

type CardListProps = {
  sectionTitle: string;
  cards: CardProps[];
};

export default function CardList({ sectionTitle, cards }: CardListProps) {
  const router = useRouter();

  const handleCardPress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/modal/itemDetail",
      params: { id },
    });
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
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => handleCardPress(card.id)}
          >
            <Image source={card.image} style={styles.cardImage} resizeMode="cover" />
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardSubtitle}>{card.time}</Text>
            <View style={styles.cardSubtitleContainer}>
              <Text style={styles.cardSubtitle}>
                {card.rating?.toFixed(1) || "4.0"}
              </Text>
              <MaterialIcons name="star" size={16} color="gray" style={styles.starIcon} />
              <Text style={styles.cardSubtitle}>
                ({card.ratingCount || 100}+)
              </Text>
              {typeof card.distanceKm === "number" && (
                <Text style={{ color: "#666", marginTop: 4 }}>
                  {card.distanceKm.toFixed(1)} km away
                </Text>
              )}
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
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  starIcon: {
    marginLeft: 2,
    marginRight: 2,
  },
});
