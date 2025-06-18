import React, { useState } from "react";
import {
    Text,
    View,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Alert,
} from "react-native";
import { API_URL } from "@env";
import { useTranslation } from "react-i18next";

export default function StarRating({ navigation, token, route, theme }) {
    const [rating, setRating] = useState(0);
    const { userProfile, onGoBack } = route.params;
  const [hoveredRating, setHoveredRating] = useState(0);
  const styles = createStarRatingStyles(theme);
  const { t } = useTranslation();

    const handleStarPress = (starValue) => {
        setRating(starValue);
    };

    const submitRating = async() => {
        if (rating === 0) {
            Alert.alert(t("starRating.selectTitle"), t("starRating.selectMsg"));
            return;
        }
        try {
            const response = await fetch(`${API_URL}/api/reviews/new?user=${userProfile}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ rating }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            Alert.alert(
                t("starRating.sentTitle"),
                t("starRating.sentMsg", { rating, star: t(rating === 1 ? "starRating.star" : "starRating.stars") }),
                [
                    {
                        text: "OK",
                        onPress: () => {
                            if (onGoBack) onGoBack();
                            navigation.goBack();
                        }
                    }
                ]
            );
        } catch (error) {
            console.error("Error submitting rating:", error);
            Alert.alert(t("starRating.errorTitle"), t("starRating.errorMsg"));
            return;
        }
    };

  const resetRating = () => {
    setRating(0);
  };
  const renderInteractiveStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isActive = i <= rating;
      
      stars.push(
        <TouchableOpacity
          key={i}
          style={styles.starWrapper}
          onPress={() => handleStarPress(i)}
          activeOpacity={0.7}
          accessible
          accessibilityLabel={`${i} ${t(i === 1 ? "starRating.star" : "starRating.stars")}`}
        >
          <Text style={[
            styles.displayStar,
            isActive ? styles.activeStar : styles.inactiveStar
          ]}>
            ★
          </Text>
        </TouchableOpacity>
      );
    }
    return stars;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessible
            accessibilityLabel={t("starRating.goBack")}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>

          <Text style={styles.title}>{t("starRating.title")}</Text>
          <Text style={styles.subtitle}>
            {t("starRating.subtitle")}
          </Text>

          <View style={styles.starsContainer}>
            {renderInteractiveStars()}
          </View>

          <Text style={styles.ratingText}>
            {rating === 0
              ? t("starRating.noRating")
              : `${rating} ${t(rating === 1 ? "starRating.star" : "starRating.stars")}`}
          </Text>

          <View style={styles.ratingLabels}>
            <Text style={styles.labelText}>{t("starRating.bad")}</Text>
            <Text style={styles.labelText}>{t("starRating.excellent")}</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={resetRating}
              accessible
              accessibilityLabel={t("starRating.reset")}
            >
              <Text style={styles.resetButtonText}>{t("starRating.reset")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitButton,
                rating === 0 && styles.disabledButton
              ]}
              onPress={submitRating}
              disabled={rating === 0}
              accessible
              accessibilityLabel={t("starRating.send")}
            >
              <Text style={[
                styles.submitButtonText,
                rating === 0 && styles.disabledButtonText
              ]}>
                {t("starRating.send")}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>
              {t("starRating.tip")}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function createStarRatingStyles(theme) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    card: {
      backgroundColor: theme.background,
      borderRadius: 24,
      padding: 30,
      width: "100%",
      maxWidth: 400,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 5,
      alignItems: "center",
    },
    backButton: {
      alignSelf: "flex-start",
      marginBottom: 20,
    },
    backArrow: {
      fontSize: 24,
      color: theme.detailsText,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.detailsText,
      marginBottom: 8,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 16,
      color: theme.detailsText,
      marginBottom: 30,
      textAlign: "center",
      lineHeight: 22,
    },
    starsContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 24,
      paddingHorizontal: 10,
      height: 50,
    },
    starWrapper: {
      marginHorizontal: 4,
      width: 44,
      height: 44,
      justifyContent: "center",
      alignItems: "center",
    },
    displayStar: {
      fontSize: 44,
      textAlign: "center",
      lineHeight: 44,
      textShadowColor: "rgba(0, 0, 0, 0.1)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    activeStar: {
      color: "#FFD700",
    },
    inactiveStar: {
      color: "#E0E0E0",
    },
    ratingText: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.primary,
      marginBottom: 10,
    },
    ratingLabels: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      marginBottom: 30,
      paddingHorizontal: 10,
    },
    labelText: {
      fontSize: 14,
      color: theme.detailsText,
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      marginBottom: 20,
    },
    resetButton: {
      borderWidth: 2,
      borderColor: "red",
      borderRadius: 20,
      paddingVertical: 12,
      paddingHorizontal: 24,
      flex: 1,
      marginRight: 10,
    },
    resetButtonText: {
      fontSize: 16,
      color: theme.detailsText,
      textAlign: "center",
    },
    submitButton: {
      backgroundColor: "#fdb924",
      borderRadius: 20,
      paddingVertical: 12,
      paddingHorizontal: 24,
      flex: 1,
      marginLeft: 10,
    },
    submitButtonText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 16,
      textAlign: "center",
    },
    disabledButton: {
      backgroundColor: "#ccc",
    },
    disabledButtonText: {
      color: "#888",
    },
    instructionContainer: {
      backgroundColor: theme.formBg,
      borderRadius: 12,
      padding: 15,
      marginTop: 10,
    },
    instructionText: {
      fontSize: 14,
      color: theme.text,
      textAlign: "center",
      lineHeight: 20,
    },
  });
}
