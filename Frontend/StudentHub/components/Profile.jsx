import React, { use, useEffect, useState } from "react";
import {
  Text,
  View,
  Image,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { API_URL } from "@env";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

export default function Profile({ token, navigation, route, user }) {
  const [userProfile, setUserProfile] = useState(null);
  const product = route.params?.product || null;
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(null);
  const [profileMissing, setProfileMissing] = useState(false);
  const [Interesses, setInteresses] = useState(false);

  const DEFAULT_AVATAR_URL = "https://www.gravatar.com/avatar/?d=mp&s=120";

  const fetchProfile = async (targetUserId) => {
    try {
      const res = await fetch(API_URL + `/api/users/getbyid?id=${targetUserId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 404) {
        setProfileMissing(true);
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await res.json();
      setProfile(data);
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };  
  
  useFocusEffect(
    useCallback(() => {
      setProfile(null);
      let targetUserId;
      console.log("Route params:", route.params);
      if (product && product.product_user_id) {
        // Coming from a product - load the product owner's profile
        targetUserId = product.product_user_id;
      } else if (route.params && route.params.userToChat) {
        targetUserId = route.params.userToChat;
      } else {
        targetUserId = user.id; // Default to current user's profile
      }

      // Set the userProfile state to track which profile we're viewing
      setUserProfile(targetUserId);

      if (token && targetUserId) {
        fetchProfile(targetUserId);
      }

      // Clear route params to prevent issues when navigating between different profiles
      // Do this after fetching to avoid clearing params before they're used
      return () => {
        if (route.params) {
          navigation.setParams({ product: null, userToChat: null });
        }
      };
    }, [token, product, route.params?.userToChat, user.id, navigation])
  );

  const startEditing = () => {
    if (profile) {
      setEditedProfile({
        ...profile,
        first_name: profile.full_name ? profile.full_name.split(' ')[0] : '',
        last_name: profile.full_name ? profile.full_name.split(' ').slice(1).join(' ') : ''
      });
      setIsEditing(true);
    }
  };
  const cancelEditing = () => {
    Alert.alert("Wijzigingen annuleren?", "Je wijzigingen worden niet opgeslagen.", [
      { text: "Nee", style: "cancel" },
      { text: "Ja", onPress: () => setIsEditing(false) },
    ]);
  };
  
  const saveChanges = async () => {
    if (profile === editedProfile) {
      setIsEditing(false);
      return;
    }
    try {
      // Send editedProfile directly with full_name constructed from first_name and last_name
      const body = {
        ...editedProfile,
        full_name: `${editedProfile.first_name} ${editedProfile.last_name}`
      };

      const res = await fetch(API_URL + "/api/users/update", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to update profile");
      
      // Refetch the profile to get the latest data
      await fetchProfile();
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  const createProfile = async () => {
    try {
      const res = await fetch(API_URL + "/api/profile", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedProfile),
      });

      if (!res.ok) throw new Error("Failed to create profile");

      const newProfile = await res.json();
      setProfile(newProfile);
      setProfileMissing(false);
      setIsEditing(false);
    } catch (err) {
      console.error("Error creating profile:", err);
    }
  };
  const age = profile && profile.date_of_birth ? new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear() : null;

  if (profileMissing) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ marginBottom: 10 }}>Geen profiel gevonden.</Text>
        {!isEditing ? (
          <TouchableOpacity
            onPress={() => {
              setEditedProfile({
                first_name: "",
                last_name: "",
                full_name: "",
                date_of_birth: "",
                study_program: "",
                location: "",
                bio: "",
              });
              setIsEditing(true);
            }}
            style={styles.dotButton}
          >
            <Text style={styles.dotButtonText}>Profiel aanmaken</Text>
          </TouchableOpacity>
        ) : (
          <>
            <Text style={{ marginBottom: 10 }}>Nieuw profiel</Text>
            <TextInput
              value={editedProfile.first_name || ""}
              onChangeText={(text) =>
                setEditedProfile({ ...editedProfile, first_name: text })
              }
              style={styles.input}
              placeholder="Voornaam"
              placeholderTextColor="#888"
            />
            <TextInput
              value={editedProfile.last_name || ""}
              onChangeText={(text) =>
                setEditedProfile({ ...editedProfile, last_name: text })
              }
              style={styles.input}
              placeholder="Achternaam"
              placeholderTextColor="#888"
            />
            <TextInput
              value={editedProfile.date_of_birth || ""}
              onChangeText={(text) =>
                setEditedProfile({ ...editedProfile, date_of_birth: text })
              }
              style={styles.input}
              placeholder="Geboortedatum (YYYY-MM-DD)"
              placeholderTextColor="#888"
            />
            <TextInput
              value={editedProfile.study_program || ""}
              onChangeText={(text) =>
                setEditedProfile({ ...editedProfile, study_program: text })
              }
              style={styles.input}
              placeholder="Studierichting"
              placeholderTextColor="#888"
            />
            <TextInput
              value={editedProfile.location?.name || ""}
              onChangeText={(text) =>
                setEditedProfile({ ...editedProfile, location: text })
              }
              style={styles.input}
              placeholder="Locatie"
              placeholderTextColor="#888"
            />
            <TextInput
              value={editedProfile.bio || ""}
              onChangeText={(text) =>
                setEditedProfile({ ...editedProfile, bio: text })
              }
              style={[styles.input, { height: 80 }]}
              multiline
              placeholder="Bio"
              placeholderTextColor="#888"
            />
            <TouchableOpacity
              style={styles.contactButton}
              onPress={createProfile}
            >
              <Text style={styles.contactButtonText}>Opslaan</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1d3b84" />
        <Text style={{ color: "#555", marginTop: 10 }}>Loading Profile...</Text>
      </View>
    );
  }
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <TouchableOpacity
            accessible
            accessibilityLabel="Ga terug"
            style={{ marginBottom: 10 }}
            onPress={() => { navigation.goBack(); }}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>

          <View style={styles.imageContainer}>
            <Image
              source={{
                uri: API_URL+profile.avatar_url || DEFAULT_AVATAR_URL,
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
                    placeholder="Voornaam"
                    placeholderTextColor="#888"
                  />
                  <TextInput
                    value={editedProfile.last_name || ""}
                    onChangeText={(text) =>
                      setEditedProfile({ ...editedProfile, last_name: text })
                    }
                    style={styles.input}
                    placeholder="Achternaam"
                    placeholderTextColor="#888"
                  />
                </>
                ) : (
                <Text style={styles.userName}>{profile.full_name || null}</Text>
              )}
            </View>

            <View style={styles.row}>
              {isEditing ? (
                <>
                  <TextInput
                    value={editedProfile.date_of_birth || ""}
                    onChangeText={(text) =>
                      setEditedProfile({ ...editedProfile, date_of_birth: text })
                    }
                    style={[styles.input, { flex: 1 }]}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#888"
                  />
                  <TextInput
                    value={editedProfile.study_program || ""}
                    onChangeText={(text) =>
                      setEditedProfile({ ...editedProfile, study_program: text })
                    }
                    style={[styles.input, { flex: 2, marginLeft: 10 }]}
                    placeholder="Studierichting"
                    placeholderTextColor="#888"
                  />
                </>
                ) : (
                  <>
                    <Text style={styles.age}>{age} jaar</Text>
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>{profile.study_program}</Text>
                    </View>
                  </>
              )}
            </View>

            {isEditing ? (
              <TextInput
                value={editedProfile.location?.name || ""}
                onChangeText={(text) =>
                  setEditedProfile({ ...editedProfile, location: text })
                }
                style={styles.input}
                placeholder="Locatie"
                placeholderTextColor="#888"
              />
            ) : (
              <View style={styles.locationContainer}>
                <Text style={styles.locationIcon}>📍</Text>
                <Text style={styles.location}>
                  {profile.location?.name || "Locatie niet ingevuld"}
                </Text>
              </View>
            )}
            <View style={styles.reviewContainer}>
              <View style={styles.reviewRow}>
                <View style={styles.starsSection}>
                  <Text style={styles.stars}>★ ★ ★ ★ ☆</Text>
                  <Text style={styles.reviews}>{profile.review_count || 110} Reviews</Text>
                </View>
                <TouchableOpacity
                  style={styles.rateButton}
                  onPress={() => navigation.navigate('StarRating')}
                  accessible
                  accessibilityLabel="Geef een beoordeling"
                >
                  <Text style={styles.rateButtonText}>Beoordeel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Details</Text>
          {isEditing ? (
            <TextInput
              value={editedProfile.bio || ""}
              onChangeText={(text) =>
                setEditedProfile({ ...editedProfile, bio: text })
              }
              style={[styles.input, { height: 100 }]}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholder="Bio"
              placeholderTextColor="#888"
            />
            ) : (
              <Text style={styles.description}>
                {profile.bio || "Geen bio beschikbaar."}
              </Text>
          )}

          <TouchableOpacity style={styles.accordion} onPress={() => setInteresses(!Interesses)}>
            <View style={{ flex: 1 }}>
              <View style={[styles.row, {justifyContent: "space-between"}]}>
                <Text style={styles.accordionText}>Interesses</Text>
                <Text style={styles.chevron}>{Interesses ? '▲' : '▼'}</Text>
              </View>
              {Interesses && (
                <Text style={styles.description}>
                  {profile.interests || "Geen interesses beschikbaar."}
                </Text>
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.buttonGroup}>
            {isEditing ? (
              <>
                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={saveChanges}
                  accessible
                  accessibilityLabel="Opslaan"
                >
                  <Text style={styles.contactButtonText}>Opslaan</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dotButton}
                  onPress={cancelEditing}
                  accessible
                  accessibilityLabel="Annuleren"
                >
                  <Text style={styles.dotButtonText}>Annuleren</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {
                  user.id === userProfile ? (
                  <TouchableOpacity
                    style={styles.dotButton}
                    onPress={startEditing}
                    accessible
                    accessibilityLabel="Profiel bewerken"
                  >
                    <Text style={styles.dotButtonText}>Bewerken</Text>
                  </TouchableOpacity>
                  ) : null
                }

                <TouchableOpacity
                  style={styles.contactButton}
                  accessible
                  accessibilityLabel="Contacteer gebruiker"
                  onPress={() => {
                    const email = profile.email;
                    if (email) {
                      const mailtoUrl = `mailto:${email}`;
                      require('react-native').Linking.openURL(mailtoUrl);
                    }
                  }}
                >
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginTop: 8,
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
    color: "#555",
    fontSize: 14,
    marginBottom: 6,
    flex: 1,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    paddingVertical: 2,
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 6,
  },  reviewContainer: {
    marginBottom: 12,
  },
  reviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  starsSection: {
    flex: 1,
  },
  stars: {
    color: "#ffcc00",
    fontSize: 18,
  },
  reviews: {
    fontSize: 13,
    color: "#888",
  },
  rateButton: {
    backgroundColor: "#fdb924",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
  rateButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
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
    color: "#000",
  },
});
