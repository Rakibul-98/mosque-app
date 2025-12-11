// app/cashier/add-transaction.tsx
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useUser } from "../../contexts/UserContext";
import { supabase } from "../../supabase";

export default function AddTransaction() {
  const [type, setType] = useState<"credit" | "debit">("credit");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  if (!user || user.role !== "cashier") {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Access Denied</Text>
        <Button title="Go to Home" onPress={() => router.replace("/")} />
      </View>
    );
  }

  const handleAddTransaction = async () => {
    // Validation
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    if (!description.trim()) {
      Alert.alert("Error", "Please enter a description");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        type,
        amount: parseFloat(amount),
        description: description.trim(),
        created_by: user.id,
      };

      console.log("Inserting transaction:", payload);

      const { error } = await supabase.from("transactions").insert([payload]);

      if (error) {
        console.log("Insert error:", error);
        Alert.alert("Error", error.message || "Failed to add transaction");
        setLoading(false);
        return;
      }

      // Success
      Alert.alert(
        "Success",
        `${type.toUpperCase()} transaction added successfully`
      );
      setAmount("");
      setDescription("");
      setType("credit");
      setLoading(false);

      // Navigate back
      router.back();
    } catch (err: any) {
      console.log("Exception:", err);
      Alert.alert("Error", err.message || "Failed to add transaction");
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Add Transaction</Text>
        <Text style={styles.subtitle}>Record a new transaction</Text>
      </View>

      {/* Transaction Type Selection */}
      <View style={styles.section}>
        <Text style={styles.label}>Transaction Type</Text>
        <View style={styles.typeButtonsContainer}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === "credit" && styles.typeButtonActive,
            ]}
            onPress={() => setType("credit")}
          >
            <Text
              style={[
                styles.typeButtonText,
                type === "credit" && styles.typeButtonTextActive,
              ]}
            >
              ➕ Credit (Income)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeButton,
              type === "debit" && styles.typeButtonActive,
            ]}
            onPress={() => setType("debit")}
          >
            <Text
              style={[
                styles.typeButtonText,
                type === "debit" && styles.typeButtonTextActive,
              ]}
            >
              ➖ Debit (Expense)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Amount Input */}
      <View style={styles.section}>
        <Text style={styles.label}>Amount (BDT)</Text>
        <TextInput
          placeholder="Enter amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          style={styles.input}
          editable={!loading}
        />
      </View>

      {/* Description Input */}
      <View style={styles.section}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          placeholder="e.g., Donation, Maintenance, Utility Bills"
          value={description}
          onChangeText={setDescription}
          style={[styles.input, styles.textArea]}
          multiline
          numberOfLines={4}
          editable={!loading}
        />
      </View>

      {/* Summary */}
      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryKey}>Type:</Text>
          <Text style={styles.summaryValue}>
            {type === "credit" ? "Credit (Income)" : "Debit (Expense)"}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryKey}>Amount:</Text>
          <Text
            style={[
              styles.summaryValue,
              type === "credit" ? styles.creditText : styles.debitText,
            ]}
          >
            {amount ? `${amount} BDT` : "—"}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryKey}>Description:</Text>
          <Text style={styles.summaryValue}>{description || "—"}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          title={loading ? "Adding..." : "Add Transaction"}
          onPress={handleAddTransaction}
          disabled={loading || !amount || !description}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Cancel"
          color="#999"
          onPress={() => router.back()}
          disabled={loading}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
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
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  typeButtonsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  typeButtonActive: {
    borderColor: "#1976d2",
    backgroundColor: "#e3f2fd",
  },
  typeButtonText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  typeButtonTextActive: {
    color: "#1976d2",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  textArea: {
    textAlignVertical: "top",
    minHeight: 100,
  },
  summary: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryKey: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 13,
    color: "#333",
    fontWeight: "600",
  },
  creditText: {
    color: "#2e7d32",
  },
  debitText: {
    color: "#c62828",
  },
  buttonContainer: {
    marginBottom: 12,
  },
});
