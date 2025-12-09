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

    // Success - sign in and route based on role
    setLoading(true);
    signIn({
      id: profile.id,
      name: profile.name,
      role: profile.role,
      pin: profile.pin,
    });
    setPin("");

    // Route based on role
    if (profile.role === "admin") {
      router.replace("/admin");
    } else if (profile.role === "cashier") {
      router.replace("/cashier");
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Staff Login</Text>
      <Text style={styles.subtitle}>
        Enter your PIN to access staff features
      </Text>

      <Text style={styles.label}>Select User</Text>
      <FlatList
        style={styles.userList}
        data={profiles}
        keyExtractor={(i) => i.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedId(item.id)}
            style={[
              styles.userRow,
              selectedId === item.id && styles.userRowSelected,
            ]}
          >
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userRole}>
              {item.role === "admin" ? "👨‍💼 Administrator" : "💰 Cashier"}
            </Text>
          </TouchableOpacity>
        )}
      />

      <TextInput
        placeholder="Enter 4-digit PIN"
        value={pin}
        onChangeText={setPin}
        keyboardType="numeric"
        secureTextEntry
        maxLength={4}
        editable={!!selectedId}
        style={[styles.input, !selectedId && styles.inputDisabled]}
      />

      <Button
        title={loading ? "Logging in..." : "Login"}
        onPress={handleLogin}
        disabled={loading || !selectedId || pin.length !== 4}
      />

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  userList: {
    maxHeight: 220,
    marginBottom: 20,
  },
  userRow: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  userRowSelected: {
    backgroundColor: "#e3f2fd",
    borderColor: "#1976d2",
    borderWidth: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  userRole: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginVertical: 16,
    fontSize: 18,
    letterSpacing: 2,
    textAlign: "center",
    backgroundColor: "#fff",
  },
  inputDisabled: {
    backgroundColor: "#f0f0f0",
    color: "#999",
  },
  backButton: {
    marginTop: 20,
    padding: 10,
  },
  backButtonText: {
    color: "#1976d2",
    textAlign: "center",
    fontSize: 14,
  },
});
