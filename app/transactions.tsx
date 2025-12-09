import React, { useEffect, useState } from "react";
import {
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { supabase } from "../supabase";

type Transaction = {
  id: number;
  amount: number;
  type: "credit" | "debit";
  purpose: string;
  created_at: string;
};

export default function Transactions() {
  const [type, setType] = useState<"credit" | "debit">("credit");
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
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
      console.error(error);
      return;
    }

    setTransactions(data as Transaction[]);
  };

  const addTransaction = async () => {
    const { error } = await supabase
      .from("transactions")
      .insert([{ type, amount: parseFloat(amount), purpose }]);
    if (error) alert(error.message);
    else {
      alert("Transaction added");
      setAmount("");
      setPurpose("");
      fetchTransactions();
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add Transaction</Text>
      <Text>Type</Text>
      <View style={{ flexDirection: "row", marginBottom: 10 }}>
        <Button title="Credit" onPress={() => setType("credit")} />
        <View style={{ width: 10 }} />
        <Button title="Debit" onPress={() => setType("debit")} />
      </View>
      <TextInput
        placeholder="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        placeholder="Purpose"
        value={purpose}
        onChangeText={setPurpose}
        style={styles.input}
      />
      <Button title="Add Transaction" onPress={addTransaction} />

      <Text style={{ marginTop: 20, fontSize: 20 }}>Transactions History</Text>
      {transactions.map((t) => (
        <View key={t.id} style={styles.transaction}>
          <Text>
            {t.type.toUpperCase()}: {t.amount} BDT
          </Text>
          <Text>Purpose: {t.purpose}</Text>
          <Text>Date: {new Date(t.created_at).toLocaleDateString()}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, marginBottom: 10 },
  input: { borderWidth: 1, borderRadius: 5, padding: 10, marginBottom: 10 },
  transaction: {
    marginBottom: 15,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
  },
});
