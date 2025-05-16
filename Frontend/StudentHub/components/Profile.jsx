import React from "react";
import { Text, View, Image, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.backArrow}>←</Text>

          <View style={styles.imageContainer}>
              <Text style={styles.nameText}>Wouter Wesseling</Text>
            <Image
              source={require("../assets/wnwoufer.png")} // voor de test
              style={styles.profileImage}
            />
          </View>

          <View style={styles.infoSection}>
            <View style={styles.nameBox}>
            <Text style={styles.userName}>Wouter</Text>
            <Text style={styles.userName}>Wesseling</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.age}>20 jaar</Text>
              <View style={styles.tag}>
                <Text style={styles.tagText}>Informatica, jaar 1</Text>
              </View>
            </View>

            <Text style={styles.location}>NHL Stenden, Emmen</Text>

            <View style={styles.reviewContainer}>
              <Text style={styles.stars}>★ ★ ★ ★ ☆</Text>
              <Text style={styles.reviews}>110 Reviews</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Details</Text>
          <Text style={styles.description}>
            Eerstejaars Informatica aan NHL Stenden.{"\n"}
            Geïnteresseerd in front-end en AI.{"\n"}
            Altijd bezig met nieuwe tech-projecten.
          </Text>

          <TouchableOpacity style={styles.accordion}>
            <Text style={styles.accordionText}>Overige Details</Text>
            <Text style={styles.chevron}>⌄</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.accordion}>
            <Text style={styles.accordionText}>Interesses</Text>
            <Text style={styles.chevron}>⌄</Text>
          </TouchableOpacity>

          <View style={styles.buttonGroup}>
            <TouchableOpacity style={styles.dotButton}>
              <Text style={styles.dotButtonText}>..........</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactButton}>
              <Text style={styles.contactButtonText}>contact</Text>
            </TouchableOpacity>
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
});