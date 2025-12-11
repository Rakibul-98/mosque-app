// app/admin/transactions.tsx
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useUser } from "../../contexts/UserContext";
import { supabase } from "../../supabase";

export type Transaction = {
  id: number;
  type: "credit" | "debit";
  amount: number;
  description?: string | null; // CORRECTED: Changed from purpose to description
  created_by?: string | null;
  created_at?: string | null;
};

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    fetchTransactions();
  }, []);

  if (!user || user.role !== "admin") {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Access Denied</Text>
        <Button title="Go to Home" onPress={() => router.replace("/")} />
      </View>
    );
  }

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
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
  };

  const calculateTotals = () => {
    let credits = 0;
    let debits = 0;

    transactions.forEach((t) => {
      if (t.type === "credit") {
        credits += t.amount;
      } else {
        debits += t.amount;
      }
    });

    return { credits, debits, net: credits - debits };
  };

  const totals = calculateTotals();

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isCredit = item.type === "credit";
    const date = item.created_at
      ? new Date(item.created_at).toLocaleDateString("en-BD", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

    return (
      <View style={styles.transactionCard}>
        <View style={styles.transactionHeader}>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionType}>
              {isCredit ? "➕ Credit" : "➖ Debit"}
            </Text>
            <Text style={styles.transactionDate}>{date}</Text>
          </View>
          <Text
            style={[
              styles.transactionAmount,
              isCredit ? styles.creditAmount : styles.debitAmount,
            ]}
          >
            {isCredit ? "+" : "-"} {item.amount.toFixed(2)} BDT
          </Text>
        </View>
        {/* CORRECTED: Changed from item.purpose to item.description */}
        {item.description && (
          <Text style={styles.transactionDescription}>{item.description}</Text>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1565c0" />
        <Text style={styles.loadingText}>Loading transactions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>All Transactions</Text>
        <Text style={styles.subtitle}>Complete transaction history</Text>
      </View>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, styles.netCard]}>
          <Text style={styles.summaryLabel}>Current Balance</Text>
          <Text style={styles.summaryAmount}>{totals.net.toFixed(2)} BDT</Text>
        </View>
        <View style={[styles.summaryCard, styles.creditCard]}>
          <Text style={styles.summaryLabel}>Total Credit</Text>
          <Text style={styles.summaryAmount}>
            {totals.credits.toFixed(2)} BDT
          </Text>
        </View>
        <View style={[styles.summaryCard, styles.debitCard]}>
          <Text style={styles.summaryLabel}>Total Debit</Text>
          <Text style={styles.summaryAmount}>
            {totals.debits.toFixed(2)} BDT
          </Text>
        </View>
      </View>

      {/* Transactions List */}
      {transactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No transactions recorded</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Button title="Refresh" onPress={handleRefresh} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#d32f2f",
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  header: {
    backgroundColor: "#1565c0",
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  subtitle: {
    fontSize: 14,
    color: "#fff",
    marginTop: 4,
    opacity: 0.9,
  },
  summaryContainer: {
    flexDirection: "row",
    padding: 12,
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  netCard: {
    backgroundColor: "#c8e6c9",
  },
  creditCard: {
    backgroundColor: "#c8e6c9",
  },
  debitCard: {
    backgroundColor: "#ffcdd2",
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },
  listContent: {
    padding: 12,
  },
  transactionCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#ddd",
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  transactionDate: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: "700",
  },
  creditAmount: {
    color: "#2e7d32",
  },
  debitAmount: {
    color: "#c62828",
  },
  transactionDescription: {
    fontSize: 12,
    color: "#666",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
  footer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
});
