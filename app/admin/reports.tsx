// app/admin/reports.tsx
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  ScrollView,
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
  description?: string | null; // CORRECTED: Changed from purpose to description
  created_by?: string | null;
  created_at?: string | null;
};

type Profile = {
  id: string;
  name: string;
  role: "admin" | "cashier";
};

export default function AdminReports() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  if (!user || user.role !== "admin") {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Access Denied</Text>
        <Button title="Go to Home" onPress={() => router.replace("/")} />
      </View>
    );
  }

  const fetchData = async () => {
    try {
      // Fetch transactions
      const { data: transData, error: transError } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (transError) {
        console.log("Transaction error:", transError);
        throw transError;
      }

      // Fetch profiles
      const { data: profData, error: profError } = await supabase
        .from("profiles")
        .select("id, name, role")
        .eq("role", "cashier");

      if (profError) {
        console.log("Profile error:", profError);
        throw profError;
      }

      setTransactions((transData as Transaction[]) || []);
      setProfiles((profData as Profile[]) || []);
    } catch (err) {
      console.log("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
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

    return {
      credits,
      debits,
      net: credits - debits,
      count: transactions.length,
    };
  };

  const getCashierStats = () => {
    const stats: {
      [key: string]: { name: string; credits: number; debits: number };
    } = {};

    profiles.forEach((p) => {
      stats[p.id] = { name: p.name, credits: 0, debits: 0 };
    });

    transactions.forEach((t) => {
      if (t.created_by && stats[t.created_by]) {
        if (t.type === "credit") {
          stats[t.created_by].credits += t.amount;
        } else {
          stats[t.created_by].debits += t.amount;
        }
      }
    });

    return Object.values(stats).filter((s) => s.credits > 0 || s.debits > 0);
  };

  const totals = calculateTotals();
  const cashierStats = getCashierStats();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1565c0" />
        <Text style={styles.loadingText}>Loading reports...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Financial Reports</Text>
        <Text style={styles.subtitle}>Overview and statistics</Text>
      </View>

      {/* Overall Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overall Summary</Text>

        <View style={styles.summaryGrid}>
          <View style={[styles.summaryCard, styles.balanceCard]}>
            <Text style={styles.summaryLabel}>Current Balance</Text>
            <Text style={styles.summaryAmount}>
              {totals.net.toFixed(2)} BDT
            </Text>
            <Text style={styles.summarySubtext}>
              {totals.net >= 0 ? "✓ Positive" : "✗ Negative"}
            </Text>
          </View>

          <View style={[styles.summaryCard, styles.transactionCard]}>
            <Text style={styles.summaryLabel}>Total Transactions</Text>
            <Text style={styles.summaryAmount}>{totals.count}</Text>
            <Text style={styles.summarySubtext}>Records</Text>
          </View>
        </View>

        <View style={styles.detailsGrid}>
          <View style={[styles.detailCard, styles.creditDetail]}>
            <Text style={styles.detailLabel}>Total Credit</Text>
            <Text style={styles.detailAmount}>
              {totals.credits.toFixed(2)} BDT
            </Text>
          </View>

          <View style={[styles.detailCard, styles.debitDetail]}>
            <Text style={styles.detailLabel}>Total Debit</Text>
            <Text style={styles.detailAmount}>
              {totals.debits.toFixed(2)} BDT
            </Text>
          </View>
        </View>
      </View>

      {/* Cashier Performance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cashier Performance</Text>

        {cashierStats.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No cashier activity yet</Text>
          </View>
        ) : (
          cashierStats.map((stat, index) => (
            <View key={index} style={styles.cashierCard}>
              <View style={styles.cashierHeader}>
                <Text style={styles.cashierName}>{stat.name}</Text>
              </View>
              <View style={styles.cashierStats}>
                <View style={styles.cashierStat}>
                  <Text style={styles.cashierStatLabel}>Credit</Text>
                  <Text style={styles.cashierStatValue}>
                    {stat.credits.toFixed(2)} BDT
                  </Text>
                </View>
                <View style={styles.cashierStat}>
                  <Text style={styles.cashierStatLabel}>Debit</Text>
                  <Text style={styles.cashierStatValue}>
                    {stat.debits.toFixed(2)} BDT
                  </Text>
                </View>
                <View style={styles.cashierStat}>
                  <Text style={styles.cashierStatLabel}>Net</Text>
                  <Text
                    style={[
                      styles.cashierStatValue,
                      stat.credits - stat.debits >= 0
                        ? styles.netPositive
                        : styles.netNegative,
                    ]}
                  >
                    {(stat.credits - stat.debits).toFixed(2)} BDT
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <Button
          title="View All Transactions"
          onPress={() => router.push("/admin/transactions")}
        />
        <View style={{ height: 10 }} />
        <Button title="Refresh" color="#666" onPress={fetchData} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 0,
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
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    justifyContent: "center",
  },
  balanceCard: {
    backgroundColor: "#c8e6c9",
  },
  transactionCard: {
    backgroundColor: "#bbdefb",
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
  },
  summarySubtext: {
    fontSize: 11,
    color: "#666",
    marginTop: 4,
  },
  detailsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  detailCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  creditDetail: {
    backgroundColor: "#e8f5e9",
  },
  debitDetail: {
    backgroundColor: "#ffebee",
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  detailAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
  },
  cashierCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  cashierHeader: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  cashierName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  cashierStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  cashierStat: {
    alignItems: "center",
  },
  cashierStatLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  cashierStatValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },
  netPositive: {
    color: "#2e7d32",
  },
  netNegative: {
    color: "#c62828",
  },
});
