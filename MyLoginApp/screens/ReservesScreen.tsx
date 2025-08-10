import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  RefreshControl,
  SectionList,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { authFetch } from "../fetch/authFetch";

const API_URL = Constants.expoConfig?.extra?.API_BASE_URL;

type Food = {
  id: number;
  item_id: string;
  title: string;
  address: string;
  pickup_start: string;
  pickup_end: string;
  image: string;
  rating: number;
  rating_count: number;
  available_quantity: number;
  price: string;
  price_before: string;
  store_name: string;
};

type Reservation = {
  id: number;
  food_item: number | string;
  food?: Food;
  food_item_title?: string;
  quantity: number;
  reserved_at: string;   // ISO
  is_collected: boolean;
  user_email: string;
};

function formatTime(t?: string) {
  if (!t) return "";
  return t.slice(0, 5);
}

export default function ReservesScreen() {
  const [orders, setOrders] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAllHistory, setShowAllHistory] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await authFetch(`/reservations/`, { method: "GET" });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Failed: ${res.status}`);
      }
      const data: Reservation[] = await res.json();
      setOrders(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load orders");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  const renderItem = ({ item }: { item: Reservation }) => {
    const f = item.food;
    const title = f?.title || item.food_item_title || "Reserved item";
    const address = f?.address || "";
    const pickup = f ? `${formatTime(f.pickup_start)} - ${formatTime(f.pickup_end)}` : "";
    const imgSrc =
      f?.image?.startsWith("http")
        ? { uri: f.image }
        : f?.image
        ? { uri: `${API_URL?.replace(/\/api$/, "")}${f.image}` }
        : undefined;

    return (
      <View style={styles.reserveCard} renderToHardwareTextureAndroid shouldRasterizeIOS>
        <View style={styles.reserveHeader}>
          {imgSrc ? (
            <Image source={imgSrc} style={styles.logoIcon} resizeMode="cover" />
          ) : (
            <View style={[styles.logoIcon, styles.logoPlaceholder]} />
          )}
          <Text style={styles.reserveTitle} numberOfLines={2}>
            {title}
          </Text>
          <View style={styles.qtyBadge}>
            <Text style={styles.qtyText}>x{item.quantity}</Text>
          </View>
        </View>

        {!!f?.store_name && (
          <View style={styles.infoRow}>
            <Ionicons name="storefront-outline" size={18} color="#000" />
            <Text style={styles.infoText}>{f.store_name}</Text>
          </View>
        )}

        {!!address && (
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color="#000" />
            <Text style={styles.infoText}>{address}</Text>
          </View>
        )}

        {!!pickup && (
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={18} color="#000" />
            <Text style={styles.infoText}>Collect: {pickup}</Text>
          </View>
        )}

        <View style={styles.footerRow}>
          <Text style={styles.priceText}>${f?.price ?? "-"}</Text>
          {item.is_collected ? (
            <View style={[styles.statusPill, { backgroundColor: "#E7F7EA" }]}>
              <Text style={[styles.statusText, { color: "#27834E" }]}>Collected</Text>
            </View>
          ) : (
            <View style={[styles.statusPill, { backgroundColor: "#FFF3D9" }]}>
              <Text style={[styles.statusText, { color: "#8A5A00" }]}>Reserved</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  // sort newest first for both groups
  const reserved = orders
    .filter(o => !o.is_collected)
    .sort((a, b) => (a.reserved_at < b.reserved_at ? 1 : -1));

  const collectedAll = orders
    .filter(o => o.is_collected)
    .sort((a, b) => (a.reserved_at < b.reserved_at ? 1 : -1));

  const collectedVisible = showAllHistory ? collectedAll : collectedAll.slice(0, 2);

  const sections = [
    { key: "reserved", title: "Reserved", data: reserved },
    { key: "history", title: "History", data: collectedVisible },
  ];

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Loading your orders…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ marginBottom: 8 }}>Couldn’t load orders.</Text>
        <Text style={{ color: "gray" }}>{error}</Text>
      </View>
    );
  }

  const renderSectionHeader = ({ section }: any) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      {section.key === "history" && collectedAll.length > 2 && (
        <TouchableOpacity onPress={() => setShowAllHistory(v => !v)}>
          <Text style={styles.link}>
            {showAllHistory ? "Show less" : `Show all (${collectedAll.length})`}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderSectionFooter = ({ section }: any) => {
    if (section.key === "reserved" && reserved.length === 0) {
      return <Text style={styles.emptyNote}>No active reservations.</Text>;
    }
    if (section.key === "history" && collectedAll.length === 0) {
      return <Text style={styles.emptyNote}>No past orders yet.</Text>;
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item: Reservation) => String(item.id)}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        renderSectionFooter={renderSectionFooter}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ paddingVertical: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text>You don’t have any orders yet.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: { fontSize: 20, fontWeight: "700" },
  link: { color: "#0A84FF", fontWeight: "600" },
  emptyNote: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    color: "gray",
  },

  reserveCard: {
    backgroundColor: "#fef8e8",
    borderRadius: 12,
    marginHorizontal: 16,
    padding: 16,
    marginBottom: 12,
  },
  reserveHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  logoIcon: { width: 36, height: 36, borderRadius: 18 },
  logoPlaceholder: { backgroundColor: "#eee" },
  reserveTitle: { fontWeight: "600", fontSize: 16, flex: 1 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  infoText: { fontSize: 14 },
  footerRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  qtyBadge: {
    backgroundColor: "#000",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  qtyText: { color: "#fff", fontWeight: "600" },
  statusPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  statusText: { fontSize: 12, fontWeight: "600" },
  priceText: { fontSize: 16, fontWeight: "700" },
});
