import { useEffect, useRef, useState } from "react";
import { Animated, TouchableOpacity, Alert } from "react-native";
import { Icon } from "react-native-elements";

const BACKEND_URL = "http://192.168.178.179:8000";

export const themes = {
  light: {
    background: "#fff",
    text: "#222",
    headerBg: "#2A4BA0",
    answerBg: "#f7f7f7",
    border: "#eee",
    searchBg: "#fff",
  },
  dark: {
    background: "#181A20",
    text: "#fff",
    headerBg: "#23263A",
    answerBg: "#23263A",
    border: "#333",
    searchBg: "#23263A",
  }
};

export default function LightDarkToggle({ token: propToken, initialMode, onThemeChange }) {
  const [mode, setMode] = useState(initialMode || "light");
  const [token, setToken] = useState(propToken || null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Ophalen van token als die niet als prop wordt meegegeven
  useEffect(() => {
    if (token) return;
    async function fetchJwtToken() {
      try {
        const response = await fetch(`${BACKEND_URL}/api/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            "username": "jasper.wesseling@student.nhlstenden.com",
            "password": "wesselingjasper"
          })
        });
        const data = await response.json();
        if (!response.ok || !data.token) throw new Error("Login mislukt");
        setToken(data.token);
      } catch (error) {
        Alert.alert("Fout", error.message || "Kon niet inloggen.");
      }
    }
    fetchJwtToken();
  }, [token]);

  // Ophalen van huidige theme uit database
  useEffect(() => {
    if (!token) return;
    async function fetchUserTheme() {
      try {
        const response = await fetch(`${BACKEND_URL}/api/lightdark/gettheme`, {
          headers: { Authorization: "Bearer " + token }
        });
        if (!response.ok) throw new Error("Kan thema niet ophalen");
        const data = await response.json();
        if (data.theme === "dark" || data.theme === "light") {
          setMode(data.theme);
          if (onThemeChange) onThemeChange(themes[data.theme]); // <-- theme-object!
        }
      } catch (error) {
        Alert.alert("Fout", "Kon thema niet ophalen.");
      }
    }
    fetchUserTheme();
  }, [token]);

  // Theme wisselen en opslaan in database
  const toggleTheme = async () => {
    if (!token) return;
    const newMode = mode === "light" ? "dark" : "light";
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    setMode(newMode);
    if (onThemeChange) onThemeChange(themes[newMode]); // <-- theme-object!
    try {
      const response = await fetch(`${BACKEND_URL}/api/lightdark/settheme`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({ theme: newMode }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Thema kon niet worden opgeslagen");
      }
    } catch (error) {
      Alert.alert("Fout", error.message || "Kon thema niet opslaan.");
    }
  };

  // Feather sun/moon icon
  const iconName = mode === "light" ? "sun" : "moon";
  const iconColor = mode === "light" ? "#F9B023" : "#fff";

  return (
    <TouchableOpacity onPress={toggleTheme} activeOpacity={0.7}>
      <Animated.View
        style={{
          opacity: fadeAnim,
          borderRadius: 20,
          padding: 2,
        }}
      >
        <Icon
          type="feather"
          name={iconName}
          size={32}
          color={iconColor}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}