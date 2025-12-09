// app/admin/transactions.tsx
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useUser } from "../../contexts/UserContext";
import { supabase } from "../../supabase";

export type Transaction = {
  id: number;
  type: "credit" | "debit";
  amount: number;
  purpose?: string | null;
  created_by?: string | null; // profile id (uuid) or null
  created_at?: string | null;
};

export default function AdminTransactions() {
  const [type, setType] = useState<"credit" | "debit">("credit");
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { user } = useUser();

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

  const addTransaction = async () => {
    if (!amount) return Alert.alert("Enter amount");
    const payload = {
      type,
      amount: parseFloat(amount),
      purpose: purpose || null,
      created_by: user?.id || null,
    };
    const { error } = await supabase.from("transactions").insert([payload]);
    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
    setAmount("");
    setPurpose("");
    fetchTransactions();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add Transaction</Text>
      <View style={{ flexDirection: "row", marginVertical: 8 }}>
        <Button title="Credit" onPress={() => setType("credit")} />
        <View style={{ width: 10 }} />
        <Button title="Debit" onPress={() => setType("debit")} />
      </View>
      <TextInput
        placeholder="Amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        style={styles.input}
      />
      <TextInput
        placeholder="Purpose"
        value={purpose}
        onChangeText={setPurpose}
        style={styles.input}
      />
      <Button title="Add" onPress={addTransaction} />

      <Text style={{ marginTop: 20, fontSize: 18 }}>Recent</Text>
      {transactions.map((t) => (
        <View key={t.id} style={styles.item}>
          <Text style={{ fontWeight: "600" }}>
            {t.type.toUpperCase()} - {t.amount} BDT
          </Text>
          <Text>{t.purpose}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 10 },
  input: { borderWidth: 1, borderRadius: 6, padding: 10, marginVertical: 8 },
  item: { padding: 10, borderWidth: 1, borderRadius: 6, marginVertical: 6 },
});
