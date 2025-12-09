// app/admin/committee_manage.tsx
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { CommitteeMember } from "../(tabs)/committee";
import { supabase } from "../../supabase";

export default function CommitteeManage() {
  const [members, setMembers] = useState<CommitteeMember[]>([]);
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [phone, setPhone] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from("committee")
      .select("*")
      .order("id", { ascending: false });
    if (error) {
      console.log(error);
      return;
    }
    setMembers((data as CommitteeMember[]) || []);
  };

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert("Permission required");
    const r = await ImagePicker.launchImageLibraryAsync({
      quality: 0.6,
      base64: false,
    });
    if (r.canceled) return;
    setPhotoUri(r.assets?.[0]?.uri || null);
  };

  const uploadPhoto = async (uri: string) => {
    try {
      const fileExt = uri.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const response = await fetch(uri);
      const blob = await response.blob();
      const { data, error } = await supabase.storage
        .from("committee_photos")
        .upload(fileName, blob, { contentType: blob.type });
      if (error) throw error;
      const publicUrl = supabase.storage
        .from("committee_photos")
        .getPublicUrl(data.path).data.publicUrl;
      return publicUrl;
    } catch (err: any) {
      console.log(err);
      return null;
    }
  };

  const addMember = async () => {
    let photo_url = null;
    if (photoUri) photo_url = await uploadPhoto(photoUri);
    const { error } = await supabase
      .from("committee")
      .insert([{ name, position, phone, photo_url }]);
    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
    setName("");
    setPosition("");
    setPhone("");
    setPhotoUri(null);
    fetchMembers();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add Committee Member</Text>
      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Position"
        value={position}
        onChangeText={setPosition}
        style={styles.input}
      />
      <TextInput
        placeholder="Phone"
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
      />
      <Button title="Pick Photo" onPress={pickImage} />
      {photoUri ? (
        <Image
          source={{ uri: photoUri }}
          style={{ width: 100, height: 100, marginTop: 10 }}
        />
      ) : null}
      <View style={{ height: 10 }} />
      <Button title="Add Member" onPress={addMember} />

      <Text style={{ marginTop: 20, fontSize: 18 }}>Existing Members</Text>
      {members.map((m) => (
        <View key={m.id} style={styles.member}>
          {m.photo_url ? (
            <Image
              source={{ uri: m.photo_url } as any}
              style={{ width: 80, height: 80 }}
            />
          ) : null}
          <View style={{ marginLeft: 10 }}>
            <Text style={{ fontWeight: "600" }}>{m.name}</Text>
            <Text>{m.position}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 10 },
  input: { borderWidth: 1, borderRadius: 6, padding: 10, marginVertical: 8 },
  member: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderWidth: 1,
    borderRadius: 6,
    marginVertical: 6,
  },
});
