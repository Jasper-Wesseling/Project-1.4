import { useState, useEffect, useRef } from "react";
import { Appearance, SafeAreaView, View, Text, StyleSheet, Button, Switch, Alert, Animated, Easing, Dimensions } from "react-native";

// Zet hier handmatig je backend URL
const BACKEND_URL = "http://192.168.178.225:8000";

// Theme variables
const lightTheme = {
    background: 'white',
    text: 'black',
};

const darkTheme = {
    background: '#222',
    text: 'white',
};

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
            minWidth: 120,
        },
    });

export default function LightDarkSwitch() {
    const [systemScheme, setSystemScheme] = useState(Appearance.getColorScheme());
    const [mode, setMode] = useState("system");
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null);

    // Animatie refs voor zon/maan
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const prevMode = useRef(mode);

    // Breedte voor animatie berekenen
    // const screenWidth = Dimensions.get("window").width;
    // const leftPos = 30;
    // const rightPos = screenWidth - 120; // niet meer nodig

    // Login en haal theme op bij laden component
    useEffect(() => {
        async function loginAndFetchTheme() {
            const jwt = await fetchJwtToken();
            if (!jwt) {
                setLoading(false);
                return;
            }
            setToken(jwt);
            const userTheme = await fetchUserTheme(jwt);
            if (userTheme === "dark" || userTheme === "light") {
                setMode(userTheme);
            } else {
                setMode("system");
            }
            setLoading(false);
        }
        loginAndFetchTheme();
    }, []);

    // Login en haal JWT-token op
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
            return data.token;
        } catch (error) {
            Alert.alert("Fout", error.message || "Kon niet inloggen.");
            return null;
        }
    }

    // Haal het theme van de ingelogde user op via JWT
    async function fetchUserTheme(token) {
        try {
            const response = await fetch(`${BACKEND_URL}/api/lightdark/gettheme`, {
                headers: {
                    Authorization: "Bearer " + token
                }
            });
            if (!response.ok) throw new Error("Kan thema niet ophalen");
            const data = await response.json();
            return data.theme;
        } catch (error) {
            Alert.alert("Fout", "Kon thema niet ophalen.");
            return null;
        }
    }

    // Zet het theme van de user in de database via JWT
    async function updateUserTheme(token, theme) {
        try {
            const response = await fetch(`${BACKEND_URL}/api/lightdark/settheme`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token
                },
                body: JSON.stringify({ theme }),
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Thema kon niet worden opgeslagen");
            }
        } catch (error) {
            Alert.alert("Fout", error.message || "Kon thema niet opslaan.");
        }
    }

    // Luister naar systeemwijzigingen
    useEffect(() => {
        const subscription = Appearance.addChangeListener(({ colorScheme }) => {
            setSystemScheme(colorScheme);
        });
        return () => subscription.remove();
    }, []);

    // Animatie effect bij theme-wissel (alleen fade en draai, geen links/rechts animatie)
    useEffect(() => {
        let isLightToDark = (prevMode.current === "light" && mode === "dark");
        let isDarkToLight = (prevMode.current === "dark" && mode === "light");

        if (isLightToDark || isDarkToLight) {
            // Eerst fade out, dan draai + fade in
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }).start(() => {
                rotateAnim.setValue(0);
                Animated.parallel([
                    Animated.timing(rotateAnim, {
                        toValue: 1,
                        duration: 600,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                ]).start();
            });
        } else {
            // Bij system aan/uit alleen fade
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }).start(() => {
                rotateAnim.setValue(0);
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }).start();
            });
        }
        prevMode.current = mode;
    }, [mode, systemScheme]);

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

    // Animatie waarden
    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
    });

    // Bepaal icon type en kleur
    const icon = theme === lightTheme ? "☀️" : "🌙";
    const iconStyle = {
        fontSize: 90,
        textShadowColor: theme === lightTheme ? "#fff176" : "#fff",
        textShadowRadius: theme === lightTheme ? 20 : 10,
    };

    // Zet icon altijd linksboven (zon) of rechtsboven (maan)
    const iconPositionStyle = {
        position: "absolute",
        top: 40,
        left: theme === lightTheme ? 30 : undefined,
        right: theme === darkTheme ? 30 : undefined,
        opacity: fadeAnim,
        transform: [{ rotate }],
        zIndex: 12,
    };

    // Handler voor system default switch
    const handleSystemDefault = async (value) => {
        if (!token) return;
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
        }).start(async () => {
            if (value) {
                setMode("system");
                await updateUserTheme(token, null);
            } else {
                const newMode = systemScheme === "dark" ? "dark" : "light";
                setMode(newMode);
                await updateUserTheme(token, newMode);
            }
        });
    };

    // Handler voor light/dark button
    const handleThemeSwitch = async (newMode) => {
        if (!token) return;
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
        }).start(async () => {
            setMode(newMode);
            await updateUserTheme(token, newMode);
        });
    };

    if (loading) {
        return (
            <SafeAreaView style={createStyles(lightTheme).container}>
                <Text style={createStyles(lightTheme).text}>Loading...</Text>
            </SafeAreaView>
        );
    }

    // Bepaal welke knop actief is
    const isSystem = mode === "system";
    const isLight = (!isSystem && mode === "light") || (isSystem && systemScheme === "light");
    const isDark = (!isSystem && mode === "dark") || (isSystem && systemScheme === "dark");

    // Dag/nacht achtergrond styles
    const dayBg = {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 180,
        backgroundColor: "#87ceeb",
        zIndex: 1,
        borderBottomLeftRadius: 80,
        borderBottomRightRadius: 80,
    };
    const nightBg = {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 180,
        backgroundColor: "#1a237e",
        zIndex: 1,
        borderBottomLeftRadius: 80,
        borderBottomRightRadius: 80,
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Dag/nacht achtergrond */}
            {theme === lightTheme && <View style={dayBg} />}
            {theme === darkTheme && <View style={nightBg} />}
            {/* Sterren bij nacht */}
            {theme === darkTheme && (
                <>
                    <Text style={{
                        position: "absolute",
                        top: 50,
                        right: 80,
                        color: "#fff",
                        fontSize: 22,
                        zIndex: 11,
                    }}>✦</Text>
                    <Text style={{
                        position: "absolute",
                        top: 70,
                        right: 40,
                        color: "#fff",
                        fontSize: 16,
                        zIndex: 11,
                    }}>✦</Text>
                    <Text style={{
                        position: "absolute",
                        top: 90,
                        right: 120,
                        color: "#fff",
                        fontSize: 14,
                        zIndex: 11,
                    }}>✦</Text>
                </>
            )}
            {/* Zon of maan, fade en draai */}
            <Animated.View style={iconPositionStyle}>
                <Text style={iconStyle}>{icon}</Text>
            </Animated.View>
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