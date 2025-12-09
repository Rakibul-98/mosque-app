// app/admin/index.tsx
import { useRouter } from "expo-router";
import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { useUser } from "../../contexts/UserContext";

export default function AdminIndex() {
  const { user, signOut } = useUser();
  const router = useRouter();

  if (!user) {
    return (
      <View style={styles.center}>
        <Text>Please login first</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>
        Welcome, {user.name} ({user.role})
      </Text>
      <Button
        title="Transactions"
        onPress={() => router.push("/admin/transactions")}
      />
      <View style={{ height: 10 }} />
      <Button
        title="Manage Committee"
        onPress={() => router.push("/admin/committee_manage")}
      />
      <View style={{ height: 10 }} />
      <Button
        title="Logout"
        onPress={() => {
          signOut();
          router.push("/home");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  welcome: { fontSize: 18, marginBottom: 20, textAlign: "center" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
