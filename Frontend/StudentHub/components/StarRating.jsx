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


export default function StarRating({ navigation,token,route }) {
    const [rating, setRating] = useState(0);
    const { userProfile, onGoBack } = route.params;
    const [hoveredRating, setHoveredRating] = useState(0);

    const handleStarPress = (starValue) => {
        setRating(starValue);
    };

    const submitRating = async() => {
        if (rating === 0) {
            Alert.alert("Selecteer een beoordeling", "Kies een aantal sterren om je beoordeling te geven.");
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
        "Beoordeling verzonden!",
        `Je hebt ${rating} ${rating === 1 ? 'ster' : 'sterren'} gegeven.`,
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
        Alert.alert("Fout", "Er is een probleem opgetreden bij het verzenden van je beoordeling. Probeer het later opnieuw.");
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
          accessibilityLabel={`${i} ${i === 1 ? 'ster' : 'sterren'}`}
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
            accessibilityLabel="Ga terug"
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Geef je beoordeling</Text>
          <Text style={styles.subtitle}>
            Hoe tevreden ben je? Selecteer het aantal sterren.
          </Text>

          <View style={styles.starsContainer}>
            {renderInteractiveStars()}
          </View>

          <Text style={styles.ratingText}>
            {rating === 0 ? "Geen beoordeling" : 
             `${rating} ${rating === 1 ? 'ster' : 'sterren'}`}
          </Text>

          <View style={styles.ratingLabels}>
            <Text style={styles.labelText}>Slecht</Text>
            <Text style={styles.labelText}>Uitstekend</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={resetRating}
              accessible
              accessibilityLabel="Reset beoordeling"
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitButton,
                rating === 0 && styles.disabledButton
              ]}
              onPress={submitRating}
              disabled={rating === 0}
              accessible
              accessibilityLabel="Verzend beoordeling"
            >
              <Text style={[
                styles.submitButtonText,
                rating === 0 && styles.disabledButtonText
              ]}>
                Verzenden
              </Text>
            </TouchableOpacity>
          </View>          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>
              💡 Tip: Tik op een ster om je beoordeling te geven van 1 tot 5 sterren.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#efefef",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
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
    color: "#555",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
    lineHeight: 22,
  },  starsContainer: {
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
    color: "#1d3b84",
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
    color: "#888",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  resetButton: {
    borderWidth: 2,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flex: 1,
    marginRight: 10,
  },
  resetButtonText: {
    fontSize: 16,
    color: "#666",
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
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
  },
  instructionText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
});
