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

  useEffect(() => {
    fetchCommittee();
  }, []);

  const fetchCommittee = async () => {
    const { data, error } = await supabase.from("committee").select("*");
    if (error) {
      console.log(error);
      return;
    }
    setMembers((data as CommitteeMember[]) || []);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {members.map((m) => (
        <View key={m.id} style={styles.card}>
          {m.photo_url ? (
            <Image source={{ uri: m.photo_url }} style={styles.image} />
          ) : null}
          <Text style={styles.name}>{m.name}</Text>
          <Text>Position: {m.position}</Text>
          <Text>Phone: {m.phone}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  card: { marginBottom: 20, borderWidth: 1, borderRadius: 8, padding: 10 },
  image: { width: 100, height: 100, marginBottom: 10 },
  name: { fontSize: 18, fontWeight: "bold" },
});
