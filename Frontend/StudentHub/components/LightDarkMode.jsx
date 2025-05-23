import { useState, useEffect } from "react";
import { Appearance, SafeAreaView, View, Text, StyleSheet, Button, Switch } from "react-native";

// Theme variables
const lightTheme = {
    background: 'white',
    text: 'black',
};

const darkTheme = {
    background: '#222',
    text: 'white',
};

// Universal stylesheet using variables
const createStyles = (theme) =>
    StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.background,
        },
        text: {
            color: theme.text,
            marginBottom: 16,
        },
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
        },
        buttonRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
        },
        button: {
            marginHorizontal: 8,
            minWidth: 120, // vaste breedte voor knoppen
        },
    });

// Haal de user-id van de ingelogde gebruiker op
async function fetchUserId() {
    try {
        const response = await fetch("http://localhost:8000/api/me");
        const data = await response.json();
        return data.id; // Pas aan als jouw API een andere key gebruikt
    } catch (error) {
        return null;
    }
}

// Haal het theme van de user op
async function fetchUserTheme(userId) {
    try {
        const response = await fetch(`http://localhost:8000/api/user/${userId}/theme`);
        const data = await response.json();
        return data.theme;
    } catch (error) {
        return null;
    }
}

// Zet het theme van de user in de database
async function updateUserTheme(userId, theme) {
    try {
        await fetch(`http://localhost:8000/api/user/${userId}/theme`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ theme }),
        });
    } catch (error) {
        // Foutafhandeling indien nodig
    }
}

export default function LightDarkSwitch() {
    const [systemScheme, setSystemScheme] = useState(Appearance.getColorScheme());
    const [mode, setMode] = useState("system"); // "system", "light", "dark"
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);

    // Haal user id en theme op bij laden component
    useEffect(() => {
        fetchUserId().then(id => {
            setUserId(id);
            if (id) {
                fetchUserTheme(id).then(userTheme => {
                    if (userTheme === "dark" || userTheme === "light") {
                        setMode(userTheme);
                    } else {
                        setMode("system");
                    }
                    setLoading(false);
                });
            } else {
                setLoading(false);
            }
        });
    }, []);

    // Luister naar systeemwijzigingen
    useEffect(() => {
        const subscription = Appearance.addChangeListener(({ colorScheme }) => {
            setSystemScheme(colorScheme);
        });
        return () => subscription.remove();
    }, []);

    // Kies het juiste thema
    let theme;
    if (mode === "system") {
        theme = systemScheme === "dark" ? darkTheme : lightTheme;
    } else if (mode === "dark") {
        theme = darkTheme;
    } else {
        theme = lightTheme;
    }

    const styles = createStyles(theme);

    // Handler voor system default switch
    const handleSystemDefault = async (value) => {
        if (!userId) return;
        if (value) {
            setMode("system");
            await updateUserTheme(userId, null);
        } else {
            // Zet het theme op het huidige systeemthema
            const newMode = systemScheme === "dark" ? "dark" : "light";
            setMode(newMode);
            await updateUserTheme(userId, newMode);
        }
    };

    // Handler voor light/dark button
    const handleThemeSwitch = async (newMode) => {
        if (!userId) return;
        setMode(newMode);
        await updateUserTheme(userId, newMode);
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.text}>Loading...</Text>
            </SafeAreaView>
        );
    }

    // Bepaal welke knop actief is
    const isSystem = mode === "system";
    const isLight = (!isSystem && mode === "light") || (isSystem && systemScheme === "light");
    const isDark = (!isSystem && mode === "dark") || (isSystem && systemScheme === "dark");

    return (
        <SafeAreaView style={styles.container}>
            <View>
                <Text style={styles.text}>
                    {isDark ? "Dark mode" : "Light mode"} is enabled {isSystem ? "(System default)" : ""}
                </Text>
                <View style={styles.row}>
                    <Text style={[styles.text, { marginBottom: 0, marginRight: 8 }]}>System default</Text>
                    <Switch
                        value={isSystem}
                        onValueChange={handleSystemDefault}
                    />
                </View>
                <View style={styles.buttonRow}>
                    <View style={styles.button}>
                        <Button
                            title="Light mode"
                            onPress={() => handleThemeSwitch("light")}
                            disabled={isSystem}
                            color={isLight ? undefined : "#888"}
                        />
                    </View>
                    <View style={styles.button}>
                        <Button
                            title="Dark mode"
                            onPress={() => handleThemeSwitch("dark")}
                            disabled={isSystem}
                            color={isDark ? undefined : "#888"}
                        />
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}