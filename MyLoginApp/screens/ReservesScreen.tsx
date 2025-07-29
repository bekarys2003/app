// screens/ReservesScreen.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomNav from "../components/BottomNav";

type Props = {
    skipAnimation?: boolean;
  };

export default function ReservesScreen({ skipAnimation }: Props) {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Reserves</Text>

        <View style={styles.reserveCard}>
          <View style={styles.reserveHeader}>
            <Image
              source={require("../assets/images/pexels-ikeen-james-1194926-2274787.jpg")}
              style={styles.logoIcon}
            />
            <Text style={styles.reserveTitle}>Freshslice Pizza - 610 6th Street</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color="#000" />
            <Text style={styles.infoText}>13398 104 Ave, Surrey, BC</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={18} color="#000" />
            <Text style={styles.infoText}>Collect: Today 10:00 - 17:00</Text>
          </View>
        </View>

        <View style={styles.reserveCard}>
          <View style={styles.reserveHeader}>
            <Image
              source={require("../assets/images/pexels-ikeen-james-1194926-2274787.jpg")}
              style={styles.logoIcon}
            />
            <Text style={styles.reserveTitle}>Cactus Club - 1244 Street</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color="#000" />
            <Text style={styles.infoText}>1244 4th Ave, Burnaby, BC</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={18} color="#000" />
            <Text style={styles.infoText}>Collect: Tomorrow 10:00 - 17:00</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>More Deals</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 16, paddingRight: 16 }}>
          {[1, 2, 3].map((item, i) => (
            <View key={i} style={styles.dealCard}>
              <Image
                source={require("../assets/images/pexels-athena-2180877.jpg")}
                style={styles.dealImage}
              />
              <Text style={styles.dealTitle}>Freshslice Pizza - 123 Street</Text>
              <Text style={styles.dealTime}>Tomorrow 10:00 - 17:00</Text>
            </View>
          ))}
        </ScrollView>
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
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    marginLeft: 16,
  },
  reserveCard: {
    backgroundColor: "#fef8e8",
    borderRadius: 12,
    marginHorizontal: 16,
    padding: 16,
    marginBottom: 16,
  },
  reserveHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  logoIcon: {
    width: 28,
    height: 28,
    borderRadius: 16,
  },
  reserveTitle: {
    fontWeight: "bold",
    fontSize: 16,
    flex: 1,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  infoText: {
    fontSize: 14,
  },
  dealCard: {
    width: 160,
    marginRight: 12,
    backgroundColor: "#fef8e8",
    borderRadius: 12,
    padding: 8,
  },
  dealImage: {
    width: "100%",
    height: 100,
    borderRadius: 10,
  },
  dealTitle: {
    fontWeight: "bold",
    fontSize: 14,
    marginTop: 8,
  },
  dealTime: {
    fontSize: 13,
    color: "gray",
  },
});
