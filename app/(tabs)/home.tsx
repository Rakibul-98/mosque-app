import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { supabase } from "../supabase";

export default function Home() {
  const [total, setTotal] = useState(0);
  const router = useRouter();

  useEffect(() => {
    fetchTotal();
  }, []);

  const fetchTotal = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("type, amount");

    if (error) console.log(error);
    else {
      let sum = 0;
      data.forEach((t) => {
        if (t.type === "credit") sum += parseFloat(t.amount);
        else sum -= parseFloat(t.amount);
      });
      setTotal(sum);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Total Funds: {total} BDT</Text>
      <Button
        title="View Committee"
        onPress={() => router.push("/committee")}
      />
      <Button title="Staff Login" onPress={() => router.push("/login")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 24, marginBottom: 20 },
});
