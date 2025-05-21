import { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, Text, View, Switch, StyleSheet } from "react-native";

const API_URL = 'http://192.168.2.11:8000';

export default function Frontpage() {
  const [widgets, setWidgets] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWidgets = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL + '/api/login', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: "sven@example.com",
          password: "test1234",
          full_name: "Sven Kiel",
        }),
      });

      if (!response.ok) throw new Error(`Status ${response.status}`);
      const loginData = await response.json();
      const token = loginData.access_token || loginData.token;
      if (!token) throw new Error("No token received");

      const widgetResponse = await fetch(API_URL + '/api/widgets/get', {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!widgetResponse.ok) throw new Error(`Status ${widgetResponse.status}`);
      const widgetData = await widgetResponse.json();
      setWidgets(widgetData);
      setError(null);

    } catch (err) {
      setError(err.message);
      setWidgets({ promo: false, recommended: false }); 
      
    } finally {
      setLoading(false);
    }
  };

  const toggleWidget = async (key) => {
    const updated = { ...widgets, [key]: !widgets[key] };
    const previous = { ...widgets };
    setWidgets(updated); 

    try {
      const response = await fetch(API_URL, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updated),
      });
      if (!response.ok) throw new Error(`Status ${response.status}`);
      const result = await response.json();
      setWidgets(result);
    } catch (err) {
      setWidgets(previous); 
      setError(`Update failed: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchWidgets();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Laden...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.error}>Fout: {error}</Text>
        <Text style={styles.retryText} onPress={fetchWidgets}>
          Tik om opnieuw te proberen
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.widgetArea} contentContainerStyle={styles.scrollContent}>
        {widgets.promo && (
          <View style={styles.widgetBox}>
            <Text style={styles.widgetTitle}>🎬 Promo - 50% op HBO Sport</Text>
          </View>
        )}
        {widgets.recommended && (
          <View style={styles.widgetBox}>
            <Text style={styles.widgetTitle}>🎯 Aanbevolen Producten</Text>
          </View>
        )}

        <View style={styles.switches}>
          <Text style={styles.switchTitle}>Widgets Aan/Uit</Text>
          {Object.entries(widgets).map(([key, value]) => (
            <View key={key} style={styles.switchRow}>
              <Text style={styles.switchLabel}>{key}</Text>
              <Switch value={value} onValueChange={() => toggleWidget(key)} />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingBottom: 40 },
  widgetArea: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  widgetBox: {
    backgroundColor: "#f0f0f0",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  widgetTitle: { fontSize: 18, fontWeight: "600" },
  switches: { marginTop: 30 },
  switchTitle: { fontSize: 18, marginBottom: 10, fontWeight: "bold" },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  switchLabel: { fontSize: 16, color: "#333", textTransform: "capitalize" },
  title: { fontSize: 24, color: "#333", textAlign: "center", marginTop: 40 },
  error: { color: 'red', fontSize: 16, textAlign: 'center', margin: 20 },
  retryText: {
    color: '#2A4BA0',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    textDecorationLine: 'underline',
  }
});
