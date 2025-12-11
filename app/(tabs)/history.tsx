// app/(tabs)/history.tsx
import React, { useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { supabase } from "../../supabase";

type Transaction = {
  id: number;
  type: "credit" | "debit";
  amount: number;
  description?: string | null; // CORRECTED: Changed from purpose to description
  created_by?: string | null;
  created_at?: string | null;
};

export default function History() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.log("Error fetching transactions:", error);
        return;
      }
      setTransactions((data as Transaction[]) || []);
    } catch (err) {
      console.log("Exception:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.header}>Transaction History</Text>
      {transactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No transactions yet</Text>
        </View>
      ) : (
        transactions.map((t) => (
          <View key={t.id} style={styles.item}>
            <View style={styles.itemHeader}>
              <Text
                style={[
                  styles.type,
                  t.type === "credit" ? styles.credit : styles.debit,
                ]}
              >
                {t.type === "credit" ? "➕ CREDIT" : "➖ DEBIT"}
              </Text>
              <Text
                style={[
                  styles.amount,
                  t.type === "credit" ? styles.credit : styles.debit,
                ]}
              >
                {t.type === "credit" ? "+" : "-"} {t.amount} BDT
              </Text>
            </View>
            {/* CORRECTED: Changed from t.purpose to t.description */}
            {t.description && (
              <Text style={styles.description}>{t.description}</Text>
            )}
            <Text style={styles.date}>
              {t.created_at
                ? new Date(t.created_at).toLocaleString("en-BD", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
  item: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  type: {
    fontSize: 14,
    fontWeight: "600",
  },
  amount: {
    fontSize: 16,
    fontWeight: "700",
  },
  credit: {
    color: "#2e7d32",
  },
  debit: {
    color: "#c62828",
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: "#999",
  },
});
