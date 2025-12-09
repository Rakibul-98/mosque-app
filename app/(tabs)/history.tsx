// app/(tabs)/history.tsx
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { supabase } from "../../supabase";
import { Transaction } from "../admin/transactions";

export default function History() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.log(error);
      return;
    }
    setTransactions((data as Transaction[]) || []);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {transactions.map((t) => (
        <View key={t.id} style={styles.item}>
          <Text style={{ fontWeight: "600" }}>
            {t.type.toUpperCase()}: {t.amount} BDT
          </Text>
          <Text>{t.purpose}</Text>
          <Text style={{ color: "#666" }}>
            {t.created_at ? new Date(t.created_at).toLocaleString() : ""}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  item: { padding: 10, borderWidth: 1, borderRadius: 6, marginBottom: 10 },
});
