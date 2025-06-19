import { useState, useRef } from "react";
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
import { useTranslation } from "react-i18next";
import { Icon } from "react-native-elements";

export default function Profile({ token, navigation, route, user, theme, onLogout }) {
  const [userProfile, setUserProfile] = useState(null);
  const product = route.params?.product || null;
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(null);
  const [profileMissing, setProfileMissing] = useState(false);
  const [Interesses, setInteresses] = useState(false);
  const styles = createProfileStyles(theme);
  const { t } = useTranslation();

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
  
const firstLoad = useRef(true);

useFocusEffect(
  useCallback(() => {
    setProfile(null);
    let targetUserId;

    // Alleen bij de eerste keer laden of als params veranderen
    if (product && product.product_user_id) {
      targetUserId = product.product_user_id;
    } else if (route.params && route.params.userToChat) {
      targetUserId = route.params.userToChat;
    } else if (route.params && route.params.userProfile) {
      targetUserId = route.params.userProfile;
    } else {
      targetUserId = user.id;
    }

    // Voorkom dubbele fetch bij eerste render
    if (firstLoad.current || userProfile !== targetUserId) {
      setUserProfile(targetUserId);
      if (token && targetUserId) {
        fetchProfile(targetUserId);
      }
      firstLoad.current = false;
    }

    return () => {
      if (route.params) {
        navigation.setParams({ product: null, userToChat: null });
      }
    };
  }, [token, product, route.params?.userToChat, route.params?.userProfile, user.id])
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
    Alert.alert(
      t("profile.cancelTitle"),
      t("profile.cancelMsg"),
      [
        { text: t("profile.no"), style: "cancel" },
        { text: t("profile.yes"), onPress: () => setIsEditing(false) },
      ]
    );
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
      await fetchProfile(userProfile);
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
        <Text style={{ marginBottom: 10 }}>{t("profile.noProfileFound")}</Text>
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
            <Text style={styles.dotButtonText}>{t("profile.createProfile")}</Text>
          </TouchableOpacity>
        ) : (
          <>
            <Text style={{ marginBottom: 10 }}>{t("profile.newProfile")}</Text>
            <TextInput
              value={editedProfile.first_name || ""}
              onChangeText={(text) =>
                setEditedProfile({ ...editedProfile, first_name: text })
              }
              style={styles.input}
              placeholder={t("profile.firstName")}
            />
            <TextInput
              value={editedProfile.last_name || ""}
              onChangeText={(text) =>
                setEditedProfile({ ...editedProfile, last_name: text })
              }
              style={styles.input}
              placeholder={t("profile.lastName")}
            />
            <TextInput
              value={editedProfile.date_of_birth || ""}
              onChangeText={(text) =>
                setEditedProfile({ ...editedProfile, date_of_birth: text })
              }
              style={styles.input}
              placeholder={t("profile.dob")}
            />
            <TextInput
              value={editedProfile.study_program || ""}
              onChangeText={(text) =>
                setEditedProfile({ ...editedProfile, study_program: text })
              }
              style={styles.input}
              placeholder={t("profile.studyProgram")}
            />
            <TextInput
              value={editedProfile.location?.name || ""}
              onChangeText={(text) =>
                setEditedProfile({ ...editedProfile, location: text })
              }
              style={styles.input}
              placeholder={t("profile.location")}
            />
            <TextInput
              value={editedProfile.bio || ""}
              onChangeText={(text) =>
                setEditedProfile({ ...editedProfile, bio: text })
              }
              style={[styles.input, { height: 80 }]}
              multiline
              placeholder={t("profile.bio")}
            />
            <TouchableOpacity
              style={styles.contactButton}
              onPress={createProfile}
            >
              <Text style={styles.contactButtonText}>{t("profile.save")}</Text>
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
        <Text style={{ color: "#555", marginTop: 10 }}>{t("profile.loading")}</Text>
      </View>
    );
  }
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <TouchableOpacity
            accessible
            accessibilityLabel={t("profile.goBack")}
            style={{ marginBottom: 10 }}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>

                <View style={styles.imageContainer}>
                  <Image
                    source={{
                    uri: profile.avatar_url
                        ? API_URL + profile.avatar_url
                        : DEFAULT_AVATAR_URL,
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
                      placeholder={t("profile.firstName")}
                      />
                      <TextInput
                      value={editedProfile.last_name || ""}
                      onChangeText={(text) =>
                        setEditedProfile({ ...editedProfile, last_name: text })
                      }
                      style={styles.input}
                      placeholder={t("profile.lastName")}
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
                    placeholder={t("profile.dobShort")}
                    placeholderTextColor={theme.text}
                      />
                      <TextInput
                      value={editedProfile.study_program || ""}
                      onChangeText={(text) =>
                        setEditedProfile({ ...editedProfile, study_program: text })
                      }
                      style={[styles.input, { flex: 2, marginLeft: 10 }]}
                      placeholder={t("profile.studyProgram")}
                      />
                    </>
                    ) : (
                      <>
                      <Text style={styles.age}>{age} {t("profile.years")}</Text>
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
                    placeholder={t("profile.location")}
                    placeholderTextColor={theme.text}
                    />
                  ) : (
                    <View style={styles.locationContainer}>
                    <Text style={styles.locationIcon}>📍</Text>
                    <Text style={styles.location}>
                      {profile.location?.name || t("profile.noLocation")}
                    </Text>
                    </View>
                  )}
                  <View style={styles.reviewContainer}>
                    <View style={styles.reviewRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Text
                            key={i}
                            style={[
                              i < Math.round(profile.review_average || 0)
                                ? styles.starFilled
                                : styles.starEmpty
                            ]}
                          >
                            ★
                          </Text>
                        ))}
                        <Text style={styles.reviews}> {profile.review_count || t("profile.noReviews")} {t("profile.reviews")}</Text>
                      </View>
                      {user.id !== userProfile ? (
                        <TouchableOpacity
                          style={styles.rateButton}
                          onPress={() => navigation.navigate('StarRating', { userProfile, onGoBack: () => fetchProfile(userProfile) })}
                          accessible
                          accessibilityLabel={t("profile.rate")}
                        >
                          <Text style={styles.rateButtonText}>{t("profile.rate")}</Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  </View>
                  </View>

                  <Text style={styles.sectionTitle}>{t("profile.details")}</Text>
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
                    placeholder={t("profile.bio")}
                  />
                  ) : (
                    <Text style={styles.description}>
                    {profile.bio || t("profile.noBio")}
                    </Text>
                  )}

                  <TouchableOpacity style={styles.accordion} onPress={() => setInteresses(!Interesses)}>
                  <View style={{ flex: 1 }}>
                    <View style={[styles.row, {justifyContent: "space-between"}]}>
                    <Text style={styles.accordionText}>{t("profile.interests")}</Text>
                    <Text style={styles.chevron}>{Interesses ? '▲' : '▼'}</Text>
                    </View>
                    {Interesses && (
                    <Text style={styles.description}>
                      {profile.interests || t("profile.noInterests")}
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
                      accessibilityLabel={t("profile.save")}
                    >
                      <Text style={styles.contactButtonText}>{t("profile.save")}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.dotButton}
                      onPress={cancelEditing}
                      accessible
                      accessibilityLabel={t("profile.cancel")}
                    >
                      <Text style={styles.dotButtonText}>{t("profile.cancel")}</Text>
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
                      accessibilityLabel={t("profile.edit")}
                      >
                      <Text style={styles.dotButtonText}>{t("profile.edit")}</Text>
                      </TouchableOpacity>
                      ) : null
                    }
                    

                    <TouchableOpacity
                      style={styles.contactButton}
                      accessible
                      accessibilityLabel={t("profile.contact")}
                      onPress={() => {
                    const email = profile.email;
                    if (email) {
                      const mailtoUrl = `mailto:${email}`;
                      require('react-native').Linking.openURL(mailtoUrl);
                    }
                  }}
                >
                  <Text style={styles.contactButtonText}>{t("profile.contact")}</Text>
                </TouchableOpacity>
                
              </>
            )}
          </View>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout} accessible accessibilityLabel={t("profile.logout")}>
        <Icon name="log-out" type="feather" size={32} color="#fff" />
      </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function createProfileStyles(theme) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
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
      backgroundColor: theme.background,
      borderColor: "grey",
      borderWidth: 1,
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
      color: theme.detailsText,
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
      color: theme.text,
    },
    infoSection: {
      alignItems: "flex-start",
    },
    nameBox: {
      marginVertical: 10,
    },
    nameText: {
      fontSize: 14,
      color: theme.text,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 4,
      marginBottom: 6,
    },
    age: {
      color: theme.text,
      fontSize: 14,
      marginRight: 10,
    },
    tag: {
      backgroundColor: theme.primary,
      borderRadius: 14,
      paddingVertical: 4,
      paddingHorizontal: 10,
    },
    tagText: {
      color: theme.text,
      fontSize: 12,
    },
    location: {
      color: theme.detailsText,
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
    },
    reviewContainer: {
      marginBottom: 12,
    },
    reviewRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    starsSection: {
      flex: 1,
    },
    stars: {
      // oude style voor sterren, nu niet meer gebruikt voor individuele sterren
      color: "#ffcc00",
      fontSize: 18,
    },
    starFilled: {
      color: "#ffcc00",
      fontSize: 20,
      marginRight: 2,
    },
    starEmpty: {
      color: "#ddd",
      fontSize: 20,
      marginRight: 2,
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
      color: theme.text,
    },
    description: {
      fontSize: 14,
      color: theme.detailsText,
      lineHeight: 20,
      marginBottom: 10,
    },
    accordion: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderTopWidth: 1,
      borderTopColor: "grey",
      paddingVertical: 12,
    },
    accordionText: {
      fontSize: 15,
      color: theme.detailsText,
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
      borderColor: theme.primary,
      borderRadius: 20,
      paddingVertical: 10,
      paddingHorizontal: 20,
    },
    dotButtonText: {
      fontSize: 16,
      color: theme.text,
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
      color: theme.text,
      placeholderTextColor: theme.text,
    },
    logoutButton: {
      backgroundColor: "#e74c3c",
      borderRadius: 24,
      padding: 14,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 24,
      marginBottom: 12,
      alignSelf: "center",
      width: 60,
      height: 60,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 4,
    },
    logoutIcon: {
      color: "#fff",
    },
  });
}
