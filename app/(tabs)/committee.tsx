// app/(tabs)/committee.tsx
import React, { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { supabase } from "../../supabase";

export type CommitteeMember = {
  id: number;
  name: string;
  position?: string | null;
  phone?: string | null;
  photo_url?: string | null;
  created_at?: string | null;
};

export default function Committee() {
  const [members, setMembers] = useState<CommitteeMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommittee();
  }, []);

  const fetchCommittee = async () => {
    try {
      // CORRECTED: Changed from "committee" to "committee_members"
      const { data, error } = await supabase
        .from("committee_members")
        .select("*")
        .order("id", { ascending: false });

      if (error) {
        console.log("Error fetching committee:", error);
        return;
      }
      setMembers((data as CommitteeMember[]) || []);
    } catch (err) {
      console.log("Exception:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading committee members...</Text>
      </View>
    );
  }

  if (members.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No committee members yet</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Committee Members</Text>
      {members.map((m) => (
        <View key={m.id} style={styles.card}>
          {m.photo_url ? (
            <Image source={{ uri: m.photo_url }} style={styles.image} />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>No Photo</Text>
            </View>
          )}
          <Text style={styles.name}>{m.name}</Text>
          <Text style={styles.detail}>Position: {m.position || "N/A"}</Text>
          <Text style={styles.detail}>Phone: {m.phone || "N/A"}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  card: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    backgroundColor: "#fff",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    alignSelf: "center",
  },
  placeholderImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    alignSelf: "center",
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 12,
    color: "#999",
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  detail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
    textAlign: "center",
  },
});
