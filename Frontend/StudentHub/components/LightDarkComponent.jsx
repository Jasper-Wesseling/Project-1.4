import { useState, useRef, useEffect } from "react";
import { TouchableOpacity, Alert, View, Text, Switch, useColorScheme, Animated, StyleSheet } from "react-native";
import { API_URL } from '@env';
import LanguageSwitcher from './languageSwitcher.jsx';
import { useTranslation } from 'react-i18next'; 

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
    tabBarBg: "#fff",
    tabBarActive: "#2A4BA0",
    tabBarInactive: "#888",
    formBg: "#fff",
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
    activeFilter: "#FFC83A",
    activeFilterBorder: "#FFC83A",
    activeFilterText: "#23263A",
    stickyBarBorder: "#23263A",
    langButtonBg: "#23263A",
    langButtonActiveBg: "#FFC83A",
    langButtonText: "#fff",
    languageSwitcherBg: "rgba(30,30,30,0.9)",
    modalOverlay: 'rgba(0,0,0,0.7)',
    backCircle: '#23263A',
    avatarBg: '#23263A',
    badgeText: '#fff',
    locationBg: "#FFC83A",
    locationText: "#23263A",
    star: '#FFC83A',
    reviewCount: '#bbb',
    filledButtonText: '#000',
    detailsText: '#ccc',
    sectionRowBorder: '#23263A',
    sectionArrow: '#FFC83A',
    avatarFallback: '#444',
    avatarFallbackText: '#FFC83A',
    primary: "#2A4BA0",
    tabBarBg: "#23263A",
    tabBarActive: "#2979FF",
    tabBarInactive: "#888",
    formBg: "#23263A",
  }
};

export default function LightDarkToggle({ token: propToken, initialMode, onThemeChange }) {
  const [mode, setMode] = useState(initialMode || "light");
  const [token, setToken] = useState(propToken || null);
  const [systemDefault, setSystemDefault] = useState(false);
  const colorScheme = useColorScheme();
  const [theme, setTheme] = useState(themes[initialMode || "light"]);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Ophalen van token als die niet als prop wordt meegegeven
  useEffect(() => {
    if (token) return;
    async function fetchJwtToken() {
      try {
        const response = await fetch(`${API_URL}/api/login`, {
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
        const response = await fetch(`${API_URL}/api/lightdark/gettheme`, {
          headers: { Authorization: "Bearer " + token }
        });
        if (!response.ok) throw new Error("Kan thema niet ophalen");
        const data = await response.json();
        if (data.theme === null) {
          setSystemDefault(true);
          setMode(colorScheme === "dark" ? "dark" : "light");
          setTheme(themes[colorScheme === "dark" ? "dark" : "light"]);
          if (onThemeChange) onThemeChange(themes[colorScheme === "dark" ? "dark" : "light"]);
        } else if (data.theme === "dark" || data.theme === "light") {
          setSystemDefault(false);
          setMode(data.theme);
          setTheme(themes[data.theme]);
          if (onThemeChange) onThemeChange(themes[data.theme]);
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

    // Eerst lokaal theme updaten
    setSystemDefault(false);
    setMode(newMode);
    setTheme(themes[newMode]);
    if (onThemeChange) onThemeChange(themes[newMode]);

    // Daarna pas naar de database sturen (asynchroon)
    try {
      const response = await fetch(`${API_URL}/api/lightdark/settheme`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
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

  // Handler voor system default switch
  const handleSystemDefault = async (value) => {
    if (!token || !API_URL) return;
    setSystemDefault(value);
    if (value) {
      try {
        await fetch(`${API_URL}/api/lightdark/settheme`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ theme: null }),
        });
        setMode(colorScheme === "dark" ? "dark" : "light");
        setTheme(themes[colorScheme === "dark" ? "dark" : "light"]);
        if (onThemeChange) onThemeChange(themes[colorScheme === "dark" ? "dark" : "light"]);
      } catch (error) {
        Alert.alert("Fout", "Kon system default niet opslaan.");
      }
    } else {
      try {
        await fetch(`${API_URL}/api/lightdark/settheme`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ theme: mode }),
        });
        setTheme(themes[mode]);
        if (onThemeChange) onThemeChange(themes[mode]);
      } catch (error) {
        Alert.alert("Fout", "Kon thema niet opslaan.");
        setSystemDefault(true);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={[styles.text, { color: theme?.text || "#222" }]}>System default</Text>
        <Switch value={systemDefault} onValueChange={handleSystemDefault} />
      </View>
      <TouchableOpacity
        onPress={toggleTheme}
        style={[
          styles.button,
          {
            backgroundColor: mode === "light" ? "#222" : "#fff",
            opacity: systemDefault ? 0.5 : 1,
          },
        ]}
        disabled={systemDefault}
      >
        <Text style={{ color: mode === "light" ? "#fff" : "#222" }}>Wissel naar {mode === "light" ? "dark" : "light"}</Text>
      </TouchableOpacity>
      <LanguageSwitcher/>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    margin: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  text: {
    marginRight: 8,
    fontSize: 16,
  },
  button: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    minWidth: 120,
    alignItems: "center",
  },
  status: {
    marginTop: 8,
    fontSize: 16,
  },
});
