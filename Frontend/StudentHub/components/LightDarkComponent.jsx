import React, { useEffect, useRef, useState } from "react";
import { Animated, TouchableOpacity, Alert, View, Text, Switch } from "react-native";
import { Icon } from "react-native-elements";
import { useFocusEffect } from '@react-navigation/native'; 
import { StyleSheet } from "react-native";
import { API_URL } from '@env';

export default function LightDarkToggle({ token, initialMode, onThemeChange, showIconToggle = true, theme }) {
  const [mode, setMode] = useState(initialMode || "light");
  const [systemDefault, setSystemDefault] = useState(false);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;


  // Theme ophalen bij mount of token change
  const fetchUserTheme = async () => {
    if (!token || !API_URL) {
      Alert.alert("Fout", "Geen geldige token of API_URL");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/lightdark/gettheme`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Kan thema niet ophalen");
      const data = await response.json();
      if (data.theme === null) {
        setSystemDefault(true);
        setMode("light");
        if (onThemeChange) onThemeChange(themes.light);
      } else if (data.theme === "dark" || data.theme === "light") {
        setSystemDefault(false);
        setMode(data.theme);
        if (onThemeChange) onThemeChange(themes[data.theme]);
      }
    } catch (error) {
      Alert.alert("Fout", "Kon thema niet ophalen: " + error.message);
    }
    setLoading(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      fetchUserTheme();
    }, [token])
  );

  // Theme wisselen en opslaan in database
  const toggleTheme = async () => {
    if (!token || !API_URL) {
      Alert.alert("Fout", "Geen geldige token of API_URL");
      return;
    }
    const newMode = mode === "light" ? "dark" : "light";
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();

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
      setSystemDefault(false);
      setMode(newMode);
      if (onThemeChange) onThemeChange(themes[newMode]);
    } catch (error) {
      Alert.alert("Fout", error.message || "Kon thema niet opslaan.");
    }
  };

  // Handler voor system default switch
const handleSystemDefault = async (value) => {
  if (!token || !API_URL) return;
  setSystemDefault(value);
  if (value) {
    // Zet theme op null in backend
    try {
      await fetch(`${API_URL}/api/lightdark/settheme`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ theme: null }),
      });
      setMode("light");
      if (onThemeChange) onThemeChange(themes.light);
    } catch (error) {
      Alert.alert("Fout", "Kon system default niet opslaan.");
    }
  } else {
    // Zet terug naar huidige mode en sla op in backend
    try {
      await fetch(`${API_URL}/api/lightdark/settheme`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ theme: mode }),
      });
      if (onThemeChange) onThemeChange(themes[mode]);
    } catch (error) {
      Alert.alert("Fout", "Kon thema niet opslaan.");
      // Reset system default bij fout
      setSystemDefault(true);
    }
  }
};
  if (loading) {
    return (
      <View style={{ alignItems: "center", margin: 16 }}>
            <Icon
              type="feather"
              name="loader"
              size={24}
              color="#fff"
            />
      </View>
    );
  }

  if (showIconToggle) {
    const iconName = mode === "light" ? "sun" : "moon";
    const iconColor = mode === "light" ? "#F9B023" : "#fff";
    return (
      <View style={{ alignItems: "center", margin: 16 }}>
        <TouchableOpacity
          onPress={systemDefault ? undefined : toggleTheme}
          activeOpacity={0.7}
          disabled={systemDefault}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              borderRadius: 20,
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
      </View>
    );
  }

  // Tekstuele toggle met system default knop
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
        <Text style={{ color: mode === "light" ? "#fff" : "#222" }}>
          Wissel naar {mode === "light" ? "dark" : "light"}
        </Text>
      </TouchableOpacity>
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
  },
};