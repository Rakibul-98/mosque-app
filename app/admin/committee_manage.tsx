import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useUser } from "../../contexts/UserContext";
import { supabase } from "../../supabase";

export type CommitteeMember = {
  id: number;
  name: string;
  position?: string | null;
  phone?: string | null;
  photo_url?: string | null;
  created_at?: string | null;
};

export default function CommitteeManage() {
  const [members, setMembers] = useState<CommitteeMember[]>([]);
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [phone, setPhone] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    fetchMembers();
  }, []);

  if (!user || user.role !== "admin") {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Access Denied</Text>
        <Button title="Go to Home" onPress={() => router.replace("/")} />
      </View>
    );
  }

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("committee")
        .select("*")
        .order("id", { ascending: false });

      if (error) {
        console.log("Error fetching members:", error);
        return;
      }

      setMembers((data as CommitteeMember[]) || []);
    } catch (err) {
      console.log("Exception:", err);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          "Permission Denied",
          "We need access to your photo library"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.6,
        base64: false,
      });

      if (!result.canceled) {
        setPhotoUri(result.assets?.[0]?.uri || null);
      }
    } catch (err) {
      console.log("Error picking image:", err);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const uploadPhoto = async (uri: string): Promise<string | null> => {
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
      console.log("Error uploading photo:", err);
      Alert.alert("Error", "Failed to upload photo");
      return null;
    }
  };

  const handleAddMember = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert("Error", "Please enter member name");
      return;
    }

    if (!position?.trim()) {
      Alert.alert("Error", "Please enter position");
      return;
    }

    setSubmitting(true);

    try {
      let photo_url = null;

      if (photoUri) {
        photo_url = await uploadPhoto(photoUri);
        if (!photo_url) {
          setSubmitting(false);
          return;
        }
      }

      const { error } = await supabase.from("committee").insert([
        {
          name: name.trim(),
          position: position.trim(),
          phone: phone.trim() || null,
          photo_url,
        },
      ]);

      if (error) {
        Alert.alert("Error", error.message);
        setSubmitting(false);
        return;
      }

      // Success
      Alert.alert("Success", "Committee member added successfully");
      setName("");
      setPosition("");
      setPhone("");
      setPhotoUri(null);
      setSubmitting(false);
      fetchMembers();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to add member");
      setSubmitting(false);
    }
  };

  const handleDeleteMember = async (id: number) => {
    Alert.alert(
      "Delete Member",
      "Are you sure you want to delete this member?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("committee")
                .delete()
                .eq("id", id);

              if (error) {
                Alert.alert("Error", error.message);
                return;
              }

              Alert.alert("Success", "Member deleted successfully");
              fetchMembers();
            } catch (err: any) {
              Alert.alert("Error", err.message || "Failed to delete member");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1565c0" />
        <Text style={styles.loadingText}>Loading members...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Manage Committee</Text>
        <Text style={styles.subtitle}>Add or edit committee members</Text>
      </View>

      {/* Add Member Form */}
      <View style={styles.formSection}>
        <Text style={styles.formTitle}>Add New Member</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            placeholder="Enter member name"
            value={name}
            onChangeText={setName}
            style={styles.input}
            editable={!submitting}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Position *</Text>
          <TextInput
            placeholder="e.g., President, Secretary, Treasurer"
            value={position}
            onChangeText={setPosition}
            style={styles.input}
            editable={!submitting}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            placeholder="e.g., +880123456789"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={styles.input}
            editable={!submitting}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Photo</Text>
          <TouchableOpacity
            style={styles.photoButton}
            onPress={pickImage}
            disabled={submitting}
          >
            <Text style={styles.photoButtonText}>📷 Pick Photo</Text>
          </TouchableOpacity>
          {photoUri && (
            <View style={styles.photoPreview}>
              <Image source={{ uri: photoUri }} style={styles.photoImage} />
              <TouchableOpacity
                onPress={() => setPhotoUri(null)}
                disabled={submitting}
              >
                <Text style={styles.removePhotoText}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Button
          title={submitting ? "Adding..." : "Add Member"}
          onPress={handleAddMember}
          disabled={submitting || !name || !position}
        />
      </View>

      {/* Existing Members */}
      <View style={styles.membersSection}>
        <Text style={styles.membersTitle}>
          Committee Members ({members.length})
        </Text>

        {members.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No committee members yet</Text>
          </View>
        ) : (
          members.map((member) => (
            <View key={member.id} style={styles.memberCard}>
              <View style={styles.memberContent}>
                {member.photo_url && (
                  <Image
                    source={{ uri: member.photo_url }}
                    style={styles.memberPhoto}
                  />
                )}
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberPosition}>{member.position}</Text>
                  {member.phone && (
                    <Text style={styles.memberPhone}>{member.phone}</Text>
                  )}
                </View>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteMember(member.id)}
              >
                <Text style={styles.deleteButtonText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 0,
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
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  header: {
    backgroundColor: "#1565c0",
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  subtitle: {
    fontSize: 14,
    color: "#fff",
    marginTop: 4,
    opacity: 0.9,
  },
  formSection: {
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
    fontSize: 14,
  },
  photoButton: {
    borderWidth: 2,
    borderColor: "#1565c0",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    backgroundColor: "#e3f2fd",
  },
  photoButtonText: {
    color: "#1565c0",
    fontWeight: "600",
    fontSize: 14,
  },
  photoPreview: {
    marginTop: 12,
    alignItems: "center",
  },
  photoImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  removePhotoText: {
    color: "#d32f2f",
    fontSize: 12,
    fontWeight: "600",
  },
  membersSection: {
    padding: 16,
  },
  membersTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
  },
  memberCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  memberContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  memberPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  memberPosition: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  memberPhone: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 18,
  },
});
