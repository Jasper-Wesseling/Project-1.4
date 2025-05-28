import React, { useRef, useState } from "react";
import { View, Text, TextInput, StyleSheet, SafeAreaView, Alert, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Animated } from "react-native";
import { API_URL } from '@env';
import { Ionicons } from '@expo/vector-icons';
import { Image } from "react-native-elements";

export default function Register({ navigation, onLogin }) {
    const [full_name, setFullName] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const animatedTranslateY = useRef(new Animated.Value(0)).current;

    const animateTranslateY = (toValue) => {
        Animated.timing(animatedTranslateY, {
            toValue,
            duration: 150,
            useNativeDriver: true,
        }).start();
    };

    const handleRegister = async () => {
        setLoading(true);
        try {
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
                    err = { message: text || "Registration failed" };
                }
                if (err.violations && Array.isArray(err.violations)) {
                    const messages = err.violations.map(v => `${v.propertyPath}: ${v.message}`).join('\n');
                    Alert.alert("Registration failed", messages);
                } else {
                    Alert.alert("Registration failed", err.error || err.message || "Registration failed");
                }
                setLoading(false);
                return;
            }
            // Optionally auto-login after registration
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
                    err = { message: text || "Auto-login failed" };
                }
                Alert.alert("Auto-login failed", err.error || err.message || "Auto-login failed");
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
                if (!userRes.ok) throw new Error("User fetch failed");
                const user = await userRes.json();
                onLogin(token, user);
            } else {
                Alert.alert("Registration failed", "No token received");
            }
        } catch (e) {
            Alert.alert("Registration failed", e.message);
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
                    <Text style={styles.title}>Register</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Username"
                        value={full_name}
                        onChangeText={setFullName}
                        autoCapitalize="none"
                        placeholderTextColor="#888"
                        onFocus={() => animateTranslateY(-100)}
                        onBlur={() => animateTranslateY(0)}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
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
                        placeholder="Password"
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
                        <Text style={styles.buttonText}>{loading ? "Registering..." : "Register"}</Text>
                        <Ionicons name="arrow-forward" size={22} color="#23244A" style={{ marginLeft: 8 }} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.registerLink}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.registerText}>Already have an account? Login</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    safeArea: {
        backgroundColor: "#2A4BA0",
    },
    topHalf: {
        height: 320,
        backgroundColor: "#2A4BA0",
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
        backgroundColor: "#2A4BA0",
    },
    bottomHalf: {
        backgroundColor: "#fff",
        marginTop: -24,
        paddingTop: 32,
        alignItems: "center",
        paddingHorizontal: 24,
        flex: 1,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#23244A",
        marginBottom: 24,
        alignSelf: "flex-start",
    },
    input: {
        width: "100%",
        backgroundColor: "#F5F4F8",
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
