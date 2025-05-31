import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  Image,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { API_URL } from "@env";

export default function Profile({ token }) {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(null);

  const DEFAULT_AVATAR_URL =
    "https://i1.sndcdn.com/avatars-000543806595-ivit9r-t240x240.jpg";

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(API_URL + "/api/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    if (token) fetchProfile();
  }, [token]);

  const startEditing = () => {
    setEditedProfile(profile);
    setIsEditing(true);
  };

  const saveChanges = async () => {
    try {
      const res = await fetch(API_URL + "/api/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedProfile),
      });

      if (!res.ok) throw new Error("Failed to update profile");
      const updated = await res.json();
      setProfile(updated);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  if (!profile) return <Text>Loading...</Text>;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.backArrow}>←</Text>

          <View style={styles.imageContainer}>
            {isEditing ? (
              <TextInput
                value={editedProfile.full_name || ""}
                onChangeText={(text) =>
                  setEditedProfile({ ...editedProfile, full_name: text })
                }
                style={styles.input}
                placeholder="Full Name"
              />
            ) : (
              <Text style={styles.nameText}>{profile.full_name}</Text>
            )}
            <Image
              source={{
                uri: profile.avatar_url || DEFAULT_AVATAR_URL,
              }}
              style={styles.profileImage}
            />
          </View>

          <View style={styles.infoSection}>
            <View style={styles.nameBox}>
              {isEditing ? (
                <>
                  <TextInput
                    value={editedProfile.first_name || ""}
                    onChangeText={(text) =>
                      setEditedProfile({ ...editedProfile, first_name: text })
                    }
                    style={styles.input}
                    placeholder="First Name"
                  />
                  <TextInput
                    value={editedProfile.last_name || ""}
                    onChangeText={(text) =>
                      setEditedProfile({ ...editedProfile, last_name: text })
                    }
                    style={styles.input}
                    placeholder="Last Name"
                  />
                </>
              ) : (
                <>
                  <Text style={styles.userName}>{profile.first_name}</Text>
                  <Text style={styles.userName}>{profile.last_name}</Text>
                </>
              )}
            </View>

            <View style={styles.row}>
              {isEditing ? (
                <TextInput
                  keyboardType="numeric"
                  value={editedProfile.age ? String(editedProfile.age) : ""}
                  onChangeText={(text) =>
                    setEditedProfile({
                      ...editedProfile,
                      age: text ? Number(text) : null,
                    })
                  }
                  style={[styles.input, { width: 80 }]}
                  placeholder="Age"
                />
              ) : (
                <Text style={styles.age}>{profile.age} jaar</Text>
              )}

              {isEditing ? (
                <TextInput
                  value={editedProfile.study_program || ""}
                  onChangeText={(text) =>
                    setEditedProfile({ ...editedProfile, study_program: text })
                  }
                  style={[styles.input, { flex: 1, marginLeft: 10 }]}
                  placeholder="Study Program"
                />
              ) : (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{profile.study_program}</Text>
                </View>
              )}
            </View>

            {isEditing ? (
              <TextInput
                value={editedProfile.location || ""}
                onChangeText={(text) =>
                  setEditedProfile({ ...editedProfile, location: text })
                }
                style={styles.input}
                placeholder="Location"
              />
            ) : (
              <Text style={styles.location}>{profile.location}</Text>
            )}

            <View style={styles.reviewContainer}>
              <Text style={styles.stars}>★ ★ ★ ★ ☆</Text>
              <Text style={styles.reviews}>
                {profile.review_count || 110} Reviews
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Details</Text>
          {isEditing ? (
            <TextInput
              value={editedProfile.bio || ""}
              onChangeText={(text) =>
                setEditedProfile({ ...editedProfile, bio: text })
              }
              style={[styles.input, { height: 80, textAlignVertical: "top" }]}
              multiline
              placeholder="Bio"
            />
          ) : (
            <Text style={styles.description}>
              {profile.bio || "Geen bio beschikbaar."}
            </Text>
          )}

          

          {/* Keep your existing accordion and buttons here */}

          <TouchableOpacity style={styles.accordion}>
            <Text style={styles.accordionText}>Overige Details</Text>
            <Text style={styles.chevron}>⌄</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.accordion}>
            <Text style={styles.accordionText}>Interesses</Text>
            <Text style={styles.chevron}>⌄</Text>
          </TouchableOpacity>
<View style={styles.buttonGroup}>
          {isEditing ? (
            <>
              <TouchableOpacity style={styles.dotButton} onPress={saveChanges}>
                <Text style={styles.dotButtonText}>💾</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.contactButton} onPress={() => setIsEditing(false)}>
                <Text style={styles.contactButtonText}>✖</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.dotButton} onPress={startEditing}>
                <Text style={styles.dotButtonText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.contactButton}>
                <Text style={styles.contactButtonText}>Contact</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#efefef",
  },
  container: {
    alignItems: "center",
    paddingVertical: 30,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
    width: 360,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  backArrow: {
    fontSize: 24,
    color: "#555",
    marginBottom: 10,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 8,
  },
  userName: {
    fontWeight: "bold",
    fontSize: 16,
  },
  infoSection: {
    alignItems: "flex-start",
  },
  nameBox: {
    marginVertical: 10,
  },
  nameText: {
    fontSize: 14,
    color: "#333",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 6,
  },
  age: {
    color: "#1d3b84",
    fontSize: 14,
    marginRight: 10,
  },
  tag: {
    backgroundColor: "#1d3b84",
    borderRadius: 14,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  tagText: {
    color: "#fff",
    fontSize: 12,
  },
  location: {
    color: "#888",
    fontSize: 13,
    marginBottom: 6,
  },
  reviewContainer: {
    marginBottom: 12,
  },
  stars: {
    color: "#ffcc00",
    fontSize: 18,
  },
  reviews: {
    fontSize: 13,
    color: "#888",
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 10,
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
    marginBottom: 10,
  },
  accordion: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingVertical: 12,
  },
  accordionText: {
    fontSize: 15,
    color: "#555",
  },
  chevron: {
    fontSize: 16,
    color: "#888",
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  dotButton: {
    borderWidth: 2,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  dotButtonText: {
    fontSize: 16,
  },
  contactButton: {
    backgroundColor: "#fdb924",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 28,
  },
  contactButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
    fontSize: 14,
    width: "100%",
  },
});
