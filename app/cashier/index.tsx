import { useRouter } from "expo-router";
import React from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useUser } from "../../contexts/UserContext";

export default function CashierIndex() {
  const { user, signOut } = useUser();
  const router = useRouter();

  if (!user || user.role !== "cashier") {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Access Denied</Text>
        <Text style={styles.errorSubtext}>
          Only cashiers can access this page
        </Text>
        <Button title="Go to Home" onPress={() => router.replace("/")} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Welcome, {user.name}</Text>
        <Text style={styles.role}>💰 Cashier</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Transaction Management</Text>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => router.push("/cashier/add-transaction")}
        >
          <Text style={styles.menuButtonIcon}>➕</Text>
          <View style={styles.menuButtonContent}>
            <Text style={styles.menuButtonTitle}>Add Transaction</Text>
            <Text style={styles.menuButtonSubtitle}>
              Record credit or debit
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => router.push("/cashier/my-transactions")}
        >
          <Text style={styles.menuButtonIcon}>📋</Text>
          <View style={styles.menuButtonContent}>
            <Text style={styles.menuButtonTitle}>My Transactions</Text>
            <Text style={styles.menuButtonSubtitle}>
              View your transaction history
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Button
          title="Logout"
          color="#d32f2f"
          onPress={() => {
            signOut();
            router.replace("/");
          }}
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
    padding: 20,
  },
  errorText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#d32f2f",
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  header: {
    backgroundColor: "#1976d2",
    padding: 20,
    paddingTop: 40,
  },
  welcome: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  role: {
    fontSize: 14,
    color: "#fff",
    marginTop: 4,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
  },
  menuButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  menuButtonIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  menuButtonContent: {
    flex: 1,
  },
  menuButtonTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  menuButtonSubtitle: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
});
