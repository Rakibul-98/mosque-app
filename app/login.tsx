// app/login.tsx - Simplified version
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useUser } from "../contexts/UserContext";
import { supabase } from "../supabase";

type ProfileRow = {
  id: string;
  name: string;
  role: "admin" | "cashier";
  pin?: string | null;
};

export default function Login() {
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, role, pin")
        .in("role", ["admin", "cashier"]);
      if (error) {
        console.log("Error loading profiles:", error);
        Alert.alert("Error", "Failed to load profiles");
        return;
      }
      setProfiles((data as ProfileRow[]) || []);
    } catch (err) {
      console.log("Exception:", err);
      Alert.alert("Error", "An unexpected error occurred");
    }
  };

  const handleLogin = async () => {
    if (!selectedId) {
      Alert.alert("Error", "Please select a user");
      return;
    }

    const profile = profiles.find((p) => p.id === selectedId);
    if (!profile) {
      Alert.alert("Error", "Profile not found");
      return;
    }

    if (profile.pin !== pin) {
      Alert.alert("Error", "Incorrect PIN");
      setPin("");
      return;
    }

    setLoading(true);

    try {
      // Sign in to app context (no Supabase Auth needed)
      signIn(profile);

      setPin("");
      setLoading(false);

      // Route based on role
      if (profile.role === "admin") {
        router.replace("/admin");
      } else if (profile.role === "cashier") {
        router.replace("/cashier");
      }
    } catch (err: any) {
      console.log("Login exception:", err);
      Alert.alert("Error", err.message || "Login failed");
      setLoading(false);
    }
  };

  const renderProfile = ({ item }: { item: ProfileRow }) => (
    <TouchableOpacity
      style={[
        styles.profileItem,
        selectedId === item.id && styles.profileItemSelected,
      ]}
      onPress={() => setSelectedId(item.id)}
    >
      <View style={styles.profileContent}>
        <Text style={styles.profileName}>{item.name}</Text>
        <Text style={styles.profileRole}>
          {item.role === "admin" ? "👨‍💼 Admin" : "💰 Cashier"}
        </Text>
      </View>
      {selectedId === item.id && <Text style={styles.checkmark}>✓</Text>}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🕌 Mosque Management</Text>
        <Text style={styles.subtitle}>Staff Login</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Select User</Text>
        <FlatList
          style={styles.userList}
          data={profiles}
          renderItem={renderProfile}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />

        <Text style={styles.label}>Enter PIN</Text>
        <TextInput
          placeholder="Enter your PIN"
          value={pin}
          onChangeText={setPin}
          keyboardType="number-pad"
          secureTextEntry
          style={styles.pinInput}
          editable={!loading && selectedId !== null}
        />

        <View style={styles.buttonContainer}>
          <Button
            title={loading ? "Logging in..." : "Login"}
            onPress={handleLogin}
            disabled={loading || !selectedId || !pin}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Back to Home"
            color="#999"
            onPress={() => router.replace("/")}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          For security, only authorized staff can log in
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Keep your existing styles
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    backgroundColor: "#1565c0",
    padding: 24,
    paddingTop: 60,
    paddingBottom: 32,
  },
  title: { fontSize: 28, fontWeight: "700", color: "#fff", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#fff", opacity: 0.9 },
  content: { flex: 1, padding: 20 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    marginTop: 16,
  },
  userList: { borderRadius: 8, backgroundColor: "#fff", marginBottom: 12 },
  profileItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  profileItemSelected: { backgroundColor: "#e3f2fd" },
  profileContent: { flex: 1 },
  profileName: { fontSize: 16, fontWeight: "600", color: "#333" },
  profileRole: { fontSize: 12, color: "#999", marginTop: 4 },
  checkmark: { fontSize: 20, color: "#1565c0", fontWeight: "bold" },
  pinInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
    fontSize: 18,
    letterSpacing: 2,
  },
  buttonContainer: { marginTop: 16, marginBottom: 8 },
  footer: { padding: 20, alignItems: "center" },
  footerText: { fontSize: 12, color: "#999", textAlign: "center" },
});
