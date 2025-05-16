import React, { useEffect, useState } from "react";
import { SafeAreaView, Text, View, StyleSheet } from "react-native";
// import { API_URL } from "@env";

const ip = "192.168.2.18";

export default function Frontpage({}) {
  const [firstName, setFirstName] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://${ip}:8000/api/users/1`)
      .then((response) => response.json())
      .then((data) => {
        setFirstName(data.first_name);
      })
      .catch((error) => {
        console.error("Error fetching user:", error);
        setFirstName('John Noname');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Text style={styles.title}>Welkom, {firstName}!</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2A4BA0",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: "#C5CDD2",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#C5CDD2",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});
