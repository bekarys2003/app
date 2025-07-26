import React from "react";
import { View, Text, ScrollView, StyleSheet, Image } from "react-native";

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

export default function CardList({ sectionTitle, cards }: CardListProps) {
  return (
    <View>
      <Text style={styles.sectionTitle}>{sectionTitle}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 16 }}>
        {cards.map((card, index) => (
          <View key={index} style={styles.card}>
            <Image source={card.image} style={styles.cardImage} />
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardSubtitle}>{card.address}</Text>
            <Text style={styles.cardSubtitle}>{card.time}</Text>
          </View>
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
