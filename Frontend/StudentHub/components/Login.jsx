import React, { useRef, useState } from "react";
import { View, Text, TextInput, StyleSheet, SafeAreaView, Alert, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Animated } from "react-native";
import { API_URL } from '@env';
import { Ionicons } from '@expo/vector-icons';
import { Image } from "react-native-elements";
import { useTranslation } from "react-i18next";
import { Dimensions } from "react-native";

const { height: screenHeight } = Dimensions.get('window');

export default function Login({ navigation, onLogin, theme }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const styles = createLoginStyles(theme);
    const { t } = useTranslation();

    // Replace pageHeight state with Animated.Value
    const animatedTranslateY = useRef(new Animated.Value(0)).current;

    const animateTranslateY = (toValue) => {
        Animated.timing(animatedTranslateY, {
            toValue,
            duration: 150,
            useNativeDriver: true,
        }).start();
    };

    const handleLogin = async () => {
        setLoading(true);
        try {
            const res = await fetch(API_URL + '/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    password,
                }),
            });
            if (!res.ok) throw new Error(t("login.errorLogin"));
            const data = await res.json();
            const token = data.token || data.access_token;
            if (token) {
                // Fetch user info after login
                const userRes = await fetch(API_URL + '/api/users/get', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!userRes.ok) throw new Error(t("login.errorUserFetch"));
                const user = await userRes.json();
                onLogin(token, user);
            } else {
                Alert.alert(t("login.errorLogin"), t("login.errorNoToken"));
            }
        } catch (e) {
            Alert.alert(t("login.errorLogin"), e.message);
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
                                source={require("../assets/logoEmmen2.png")}
                                style={{ width: 180, height: 180, borderRadius: 28 }}
                                resizeMode="cover"
                            />
                        </View>
                    </View>
                </SafeAreaView>
                <View style={styles.bottomHalf}>
                    <Text style={styles.title}>{t("login.title")}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder={t("login.email")}
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        placeholderTextColor="#888"
                        onFocus={() => animateTranslateY(-100)}
                        onBlur={() => animateTranslateY(0)}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder={t("login.password")}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        placeholderTextColor="#888"
                        onFocus={() => animateTranslateY(-100)}
                        onBlur={() => animateTranslateY(0)}
                    />
                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>{loading ? t("login.loggingIn") : t("login.continue")}</Text>
                        <Ionicons name="arrow-forward" size={22} color="#23244A" style={{ marginLeft: 8 }} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.registerLink}
                        onPress={() => navigation.navigate('Register')}
                    >
                        <Text style={styles.registerText}>{t("login.noAccount")}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.registerLink}
                        onPress={() => navigation.navigate('Temp')}
                    >
                        <Text style={styles.registerText}>{t("login.tempAccount")}</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </TouchableWithoutFeedback>
    );
}

function createLoginStyles(theme) {
    return StyleSheet.create({
        container: {
            backgroundColor: theme.background,
            height: screenHeight * 1.0 + 400,
        },
        safeArea: {
            backgroundColor: theme.headerBg,
        },
        topHalf: {
            height: 320, // increased for more space
            backgroundColor: theme.headerBg,
            alignItems: "center",
            justifyContent: "center",
        },
        imagePlaceholder: {
            width: 240, // increased for more space
            height: 240, // increased for more space
            borderRadius: 40, // increased for more space
            borderWidth: 2,
            borderColor: "#bfc8e6",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.headerBg,
        },
        bottomHalf: {
            backgroundColor: theme.background,
            marginTop: -24, // less negative so it doesn't overlap the image
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
            color: theme.text,
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
