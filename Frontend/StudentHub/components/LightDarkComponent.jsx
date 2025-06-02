import { useEffect, useRef, useState } from "react";
import { Animated, TouchableOpacity, Alert } from "react-native";
import { Icon } from "react-native-elements";

const BACKEND_URL = "http://192.168.178.179:8000";

export const themes = {
  light: {
    background: "#F8F9FB",
    headerBg: "#2A4BA0",
    headerText: "#fff",
    text: "#222",
    searchBg: "#fff",
    filterBg: "#fff",
    filterBorder: "#bbb",
    filterRowBg: "#F8F9FB",
    filterRowBorder: "#eee",
    filterText: "#2A4BA0",
    activeFilter: "#FFC83A",
    activeFilterBorder: "#FFC83A",
    activeFilterText: "#222",
    stickyBarBorder: "#eee",
    langButtonBg: "#eee",
    langButtonActiveBg: "#2A4BA0",
    langButtonText: "#2A4BA0",
    languageSwitcherBg: "rgba(255,255,255,0.9)",

    // Modal specifieke kleuren
    modalOverlay: 'rgba(0,0,0,0.25)',
    backCircle: '#f4f5f7',
    avatarBg: '#eee',
    badgeText: '#fff',
    locationBg: "#FFC83A",
    locationText: "#222",
    star: '#FFC83A',
    reviewCount: '#888',
    filledButtonText: '#fff',
    detailsText: '#444',
    sectionRowBorder: '#eee',
    sectionArrow: '#8a94a6',
    avatarFallback: '#ccc',
    avatarFallbackText: '#fff',
    primary: "#2A4BA0",     
  },
  dark: {
    background: "#181A20",
    headerBg: "#23263A",
    headerText: "#fff",
    text: "#fff",
    searchBg: "#23263A",
    filterBg: "#23263A",
    filterBorder: "#444",
    filterRowBg: "#181A20",
    filterRowBorder: "#23263A",
    filterText: "#fff",
    activeFilter: "#FFC83A",            // altijd geel
    activeFilterBorder: "#FFC83A",
    activeFilterText: "#23263A",   
    stickyBarBorder: "#23263A",
    langButtonBg: "#23263A",
    langButtonActiveBg: "#FFC83A",
    langButtonText: "#fff",
    languageSwitcherBg: "rgba(30,30,30,0.9)",

    // Modal specifieke kleuren
    modalOverlay: 'rgba(0,0,0,0.7)',
    backCircle: '#23263A',
    avatarBg: '#23263A',
    badgeText: '#fff',
    locationBg: "#FFC83A",
    locationText: "#23263A",
    star: '#FFC83A',
    reviewCount: '#bbb',
    filledButtonText: '#fff',
    detailsText: '#ccc',
    sectionRowBorder: '#23263A',
    sectionArrow: '#FFC83A',
    avatarFallback: '#444',
    avatarFallbackText: '#FFC83A',
    primary: "#2A4BA0", 
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