import React, { useState } from "react";
import { TouchableOpacity, Alert, View, Text, Switch, useColorScheme } from "react-native";
import { useFocusEffect } from '@react-navigation/native'; 
import { StyleSheet } from "react-native";
import { API_URL } from '@env';

export default function LightDarkToggle({ token, initialMode, onThemeChange, theme }) {
  const [mode, setMode] = useState(initialMode || null);
  const [systemDefault, setSystemDefault] = useState(false);
  const colorScheme = useColorScheme();

  // Theme ophalen bij mount of token change
  const fetchUserTheme = async () => {
    if (!token || !API_URL) {
      Alert.alert("Fout", "Geen geldige token of API_URL");
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
        setMode(data.theme);
        // Gebruik het actuele systeemthema!
        if (onThemeChange) onThemeChange(themes[colorScheme === "dark" ? "dark" : "light"]);
      } else if (data.theme === "dark" || data.theme === "light") {
        setSystemDefault(false);
        setMode(data.theme);
        if (onThemeChange) onThemeChange(themes[data.theme]);
      }
    } catch (error) {
      Alert.alert("Fout", "Kon thema niet ophalen: " + error.message);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchUserTheme();
    }, [token])
  );

  // Theme eerst wisselen en daarna opslaan in database
  const toggleTheme = async () => {
    if (!token || !API_URL) {
      Alert.alert("Fout", "Geen geldige token of API_URL");
      return;
    }
    const newMode = mode === "light" ? "dark" : "light";

    // Eerst lokaal theme updaten
    setSystemDefault(false);
    setMode(newMode);
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
    tabBarBg: "#fff",
    tabBarActive: "#2A4BA0",
    tabBarInactive: "#888",
  },
  dark: {
    background: "#181A20",
    text: "#fff",
    headerBg: "#23263A",
    answerBg: "#23263A",
    border: "#333",
    searchBg: "#23263A",
    tabBarBg: "#23263A",
    tabBarActive: "#2979FF",
    tabBarInactive: "#888",
  },
};