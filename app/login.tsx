// app/login.tsx
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
  const { signIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, role, pin")
      .in("role", ["admin", "cashier"]);
    if (error) {
      console.log(error);
      return;
    }
    setProfiles((data as ProfileRow[]) || []);
  };

  const handleLogin = () => {
    if (!selectedId) return Alert.alert("Choose a user");
    const profile = profiles.find((p) => p.id === selectedId);
    if (!profile) return Alert.alert("Profile not found");
    if (profile.pin !== pin) return Alert.alert("Incorrect PIN");
    // success
    signIn({
      id: profile.id,
      name: profile.name,
      role: profile.role,
      pin: profile.pin,
    });
    setPin("");
    router.push("/admin");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Staff Login (PIN)</Text>

      <Text style={{ marginTop: 8 }}>Select User</Text>
      <FlatList
        style={{ maxHeight: 180, marginVertical: 8 }}
        data={profiles}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedId(item.id)}
            style={[
              styles.userRow,
              selectedId === item.id && { backgroundColor: "#e6f0ff" },
            ]}
          >
            <Text>
              {item.name} — {item.role}
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
        style={styles.input}
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  userRow: { padding: 10, borderWidth: 1, borderRadius: 6, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 6, padding: 10, marginVertical: 10 },
});
