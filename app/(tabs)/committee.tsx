// app/committee.tsx
import React, { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { supabase } from "../../supabase";

// 1️⃣ Define the type manually
export type CommitteeMember = {
  id: number;
  name: string;
  position: string;
  phone?: string;
  photo_url?: string | null;
  created_at?: string | null;
};

export default function Committee() {
  // 2️⃣ Type the state properly
  const [members, setMembers] = useState<CommitteeMember[]>([]);

  useEffect(() => {
    fetchCommittee();
  }, []);

  const fetchCommittee = async () => {
    const { data, error } = await supabase
      .from("committee") // ❌ no generics here
      .select("*");

    if (error) {
      console.log(error);
      return;
    }

    // 3️⃣ Cast data safely
    setMembers((data as CommitteeMember[]) || []);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {members.map((member) => (
        <View key={member.id} style={styles.card}>
          {member.photo_url && (
            <Image source={{ uri: member.photo_url }} style={styles.image} />
          )}

          <Text style={styles.name}>{member.name}</Text>
          <Text>Position: {member.position}</Text>
          <Text>Phone: {member.phone}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  card: {
    marginBottom: 20,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  image: { width: 100, height: 100, marginBottom: 10 },
  name: { fontSize: 18, fontWeight: "bold" },
});
