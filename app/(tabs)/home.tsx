// app/(tabs)/home.tsx
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { supabase } from "../../supabase";

export default function Home() {
  const [total, setTotal] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    fetchTotal();
  }, []);

  const fetchTotal = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("type, amount");
    if (error) {
      console.log(error);
      return;
    }
    const rows = data as any[];
    let sum = 0;
    rows.forEach((t: any) => {
      if (t.type === "credit") sum += parseFloat(t.amount);
      else sum -= parseFloat(t.amount);
    });
    setTotal(sum);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Total Funds</Text>
      <Text style={styles.amount}>{total} BDT</Text>
      <Button
        title="View Committee"
        onPress={() => router.push("/committee")}
      />
      <View style={{ height: 10 }} />
      <Button title="Staff Login" onPress={() => router.push("/login")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "600", marginBottom: 8 },
  amount: { fontSize: 28, fontWeight: "700", marginBottom: 20 },
});
