import { useRef, useState } from "react";
import { View, Text, TextInput, StyleSheet, SafeAreaView, Alert, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Animated } from "react-native";
import { API_URL } from '@env';
import { Ionicons } from '@expo/vector-icons';
import { Image } from "react-native-elements";
import { useTranslation } from "react-i18next";

// Register component
export default function Register({ navigation, onLogin, theme }) {
    const [full_name, setFullName] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const styles = createRegisterStyles(theme);

    const animatedTranslateY = useRef(new Animated.Value(0)).current;

    const animateTranslateY = (toValue) => {
        Animated.timing(animatedTranslateY, {
            toValue,
            duration: 150,
            useNativeDriver: true,
        }).start();
    };

    const { t } = useTranslation();

    // Register handler
    const handleRegister = async () => {
        setLoading(true);
        try {
            // Haal de API URL uit de omgevingsvariabelen
            const res = await fetch(API_URL + '/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    full_name,
                    password,
                    email,
                }),
            });
            if (!res.ok) {
                let err = {};
                try {
                    err = await res.json();
                } catch (jsonErr) {
                    const text = await res.text();
                    err = { message: text || t("register.errorRegister") };
                }
                if (err.violations && Array.isArray(err.violations)) {
                    const messages = err.violations.map(v => `${v.propertyPath}: ${v.message}`).join('\n');
                    Alert.alert(t("register.errorRegister"), messages);
                } else {
                    Alert.alert(t("register.errorRegister"), err.error || err.message || t("register.errorRegister"));
                }
                setLoading(false);
                return;
            }

            // Automatisch inloggen na registratie
            const loginRes = await fetch(API_URL + '/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: email, password: password }),
            });
            if (!loginRes.ok) {
                let err = {};
                try {
                    err = await loginRes.json();
                } catch (jsonErr) {
                    const text = await loginRes.text();
                    err = { message: text || t("register.errorAutoLogin") };
                }
                Alert.alert(t("register.errorAutoLogin"), err.error || err.message || t("register.errorAutoLogin"));
                setLoading(false);
                return;
            }
            const data = await loginRes.json();
            const token = data.token || data.access_token;
            if (token) {
                const userRes = await fetch(API_URL + '/api/users/get', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!userRes.ok) throw new Error(t("register.errorUserFetch"));
                const user = await userRes.json();
                onLogin(token, user);
            } else {
                Alert.alert(t("register.errorRegister"), t("register.errorNoToken"));
            }
        } catch (e) {
            Alert.alert(t("register.errorRegister"), e.message);
        }
        setLoading(false);
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <Animated.View style={[styles.container, { transform: [{ translateY: animatedTranslateY }] }]}>
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.topHalf}>
                        <View style={styles.imagePlaceholder}>
                            <Image
                                source={{ uri: API_URL + "/uploads/6828e77836564.jpg" }}
                                style={{ width: 180, height: 180, borderRadius: 28 }}
                                resizeMode="cover"
                            />
                        </View>
                    </View>
                </SafeAreaView>
                <View style={styles.bottomHalf}>
                    <Text style={styles.title}>{t("register.title")}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder={t("register.username")}
                        value={full_name}
                        onChangeText={setFullName}
                        autoCapitalize="none"
                        placeholderTextColor="#888"
                        onFocus={() => animateTranslateY(-100)}
                        onBlur={() => animateTranslateY(0)}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder={t("register.email")}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        placeholderTextColor="#888"
                        onFocus={() => animateTranslateY(-100)}
                        onBlur={() => animateTranslateY(0)}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder={t("register.password")}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        placeholderTextColor="#888"
                        onFocus={() => animateTranslateY(-100)}
                        onBlur={() => animateTranslateY(0)}
                    />
                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>{loading ? t("register.registering") : t("register.register")}</Text>
                        <Ionicons name="arrow-forward" size={22} color="#23244A" style={{ marginLeft: 8 }} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.registerLink}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.registerText}>{t("register.alreadyAccount")}</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </TouchableWithoutFeedback>
    );
}

function createRegisterStyles(theme) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background,
        },
        safeArea: {
            backgroundColor: theme.background,
        },
        topHalf: {
            height: 320,
            backgroundColor: theme.headerBg,
            alignItems: "center",
            justifyContent: "center",
        },
        imagePlaceholder: {
            width: 240,
            height: 240,
            borderRadius: 40,
            borderWidth: 2,
            borderColor: "#bfc8e6",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.headerBg,
        },
        bottomHalf: {
            backgroundColor: theme.background,
            marginTop: -24,
            paddingTop: 32,
            alignItems: "center",
            paddingHorizontal: 24,
            flex: 1,
        },
        title: {
            fontSize: 22,
            fontWeight: "bold",
            color: theme.text,
            marginBottom: 24,
            alignSelf: "flex-start",
        },
        input: {
            width: "100%",
            backgroundColor: theme.formBg,
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            fontSize: 16,
            color: "#23244A",
        },
        button: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#FDBB2C",
            borderRadius: 18,
            paddingVertical: 16,
            width: "100%",
            marginTop: 16,
            marginBottom: 8,
        },
        buttonText: {
            color: "#23244A",
            fontWeight: "bold",
            fontSize: 18,
            letterSpacing: 1,
        },
        registerLink: {
            marginTop: 8,
        },
        registerText: {
            color: "#2A4BA0",
            fontSize: 15,
            textDecorationLine: "underline",
        },
    });
}
