import React from "react";
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from "react-native";

import { useRouter } from "expo-router";
type CardProps = {
  title: string;
  address: string;
  time: string;
  image: any; // require(...)
};

type CardListProps = {
  sectionTitle: string;
  cards: CardProps[];
};

const router = useRouter();

export default function CardList({ sectionTitle, cards }: CardListProps) {
  return (
    <View>
      <Text style={styles.sectionTitle}>{sectionTitle}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 16 }}>
        {cards.map((card, index) => (
          <TouchableOpacity key={index} style={styles.card} onPress={() => router.push("/modal/itemDetail")}>
            <Image source={card.image} style={styles.cardImage} />
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardSubtitle}>{card.address}</Text>
            <Text style={styles.cardSubtitle}>{card.time}</Text>
        </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 22,
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
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8,
  },
  cardSubtitle: {
    fontSize: 13,
    color: "gray",
  },
});
