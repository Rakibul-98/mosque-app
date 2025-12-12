// app/(tabs)/home.tsx - Example
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { supabase } from "../../supabase";

export default function Home() {
  const [balance, setBalance] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  useEffect(() => {
    loadPublicData();
  }, []);

  const loadPublicData = async () => {
    try {
      // Get total balance
      const { data: transactions } = await supabase
        .from("transactions")
        .select("type, amount")
        .order("created_at", { ascending: false });

      let total = 0;
      transactions?.forEach((t) => {
        if (t.type === "income") total += t.amount;
        else total -= t.amount;
      });
      setBalance(total);

      // Get recent transactions
      const { data: recent } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      setRecentTransactions(recent || []);
    } catch (err) {
      console.log("Error loading public data:", err);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🕌 Mosque Funds</Text>
        <Text style={styles.balance}>
          Current Balance: ৳{balance.toFixed(2)}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {recentTransactions.map((tx) => (
          <View key={tx.id} style={styles.transactionItem}>
            <Text style={styles.transactionDesc}>{tx.description}</Text>
            <Text style={tx.type === "income" ? styles.credit : styles.debit}>
              {tx.type === "income" ? "+" : "-"}৳{tx.amount}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.note}>
        <Text style={styles.noteText}>
          💡 Only authorized staff can add/modify transactions
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: { backgroundColor: "#1565c0", padding: 20 },
  title: { fontSize: 24, color: "white", fontWeight: "bold" },
  balance: { fontSize: 28, color: "white", marginTop: 10, fontWeight: "bold" },
  section: {
    backgroundColor: "white",
    margin: 15,
    padding: 15,
    borderRadius: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  transactionDesc: { fontSize: 14, color: "#333" },
  credit: { color: "#2e7d32", fontWeight: "bold" },
  debit: { color: "#c62828", fontWeight: "bold" },
  note: {
    margin: 15,
    padding: 10,
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
  },
  noteText: { color: "#1565c0", textAlign: "center" },
});
