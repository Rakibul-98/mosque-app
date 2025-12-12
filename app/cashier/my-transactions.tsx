// app/cashier/my-transactions.tsx
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
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

type Transaction = {
  id: number;
  type: "credit" | "debit";
  amount: number;
  description?: string | null;
  created_by?: string | null;
  created_at?: string | null;
};

export default function MyTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  // FIXED: All hooks are called UNCONDITIONALLY at the top level
  // Define fetchTransactions using useCallback BEFORE checking user role
  const fetchTransactions = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("created_by", user.id)
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
  }, [user?.id]);

  // useEffect is called unconditionally
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

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
          <View style={styles.transactionTypeContainer}>
            <Text style={styles.transactionTypeIcon}>
              {isCredit ? "➕" : "➖"}
            </Text>
            <View>
              <Text style={styles.transactionType}>
                {isCredit ? "Credit" : "Debit"}
              </Text>
              <Text style={styles.transactionDate}>{date}</Text>
            </View>
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
        {item.description && (
          <Text style={styles.transactionDescription}>{item.description}</Text>
        )}
      </View>
    );
  };

  // NOW we can check user role and return early (after all hooks are called)
  if (!user || user.role !== "cashier") {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Access Denied</Text>
        <Button title="Go to Home" onPress={() => router.replace("/")} />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.loadingText}>Loading transactions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Transactions</Text>
        <Text style={styles.subtitle}>Your transaction history</Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, styles.creditCard]}>
          <Text style={styles.summaryCardLabel}>Total Credit</Text>
          <Text style={styles.summaryCardAmount}>
            {totals.credits.toFixed(2)} BDT
          </Text>
        </View>
        <View style={[styles.summaryCard, styles.debitCard]}>
          <Text style={styles.summaryCardLabel}>Total Debit</Text>
          <Text style={styles.summaryCardAmount}>
            {totals.debits.toFixed(2)} BDT
          </Text>
        </View>
      </View>

      {/* Transactions List */}
      {transactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No transactions yet</Text>
          <Text style={styles.emptySubtext}>
            Start by adding your first transaction
          </Text>
          <Button
            title="Add Transaction"
            onPress={() => router.push("/cashier/add-transaction")}
          />
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

      {/* Action Button */}
      <View style={styles.footer}>
        <Button
          title="Add New Transaction"
          onPress={() => router.push("/cashier/add-transaction")}
        />
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
    backgroundColor: "#1976d2",
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
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  creditCard: {
    backgroundColor: "#c8e6c9",
  },
  debitCard: {
    backgroundColor: "#ffcdd2",
  },
  summaryCardLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  summaryCardAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  listContent: {
    padding: 16,
  },
  transactionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  transactionTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  transactionTypeIcon: {
    fontSize: 24,
    marginRight: 12,
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
    fontSize: 16,
    fontWeight: "700",
  },
  creditAmount: {
    color: "#2e7d32",
  },
  debitAmount: {
    color: "#c62828",
  },
  transactionDescription: {
    fontSize: 13,
    color: "#666",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginBottom: 20,
    textAlign: "center",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
});
