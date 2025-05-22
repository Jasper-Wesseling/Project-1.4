import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, SafeAreaView, Alert } from "react-native";
import { API_URL } from '@env';

export default function Register({ navigation, onLogin }) {
    const [full_name, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

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
                    // If response is not JSON, fallback to text
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
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Register</Text>
            <TextInput
                style={styles.input}
                placeholder="name"
                value={full_name}
                onChangeText={setUsername}
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <Button title={loading ? "Registering..." : "Register"} onPress={handleRegister} disabled={loading} />
            <View style={{ height: 16 }} />
            <Button title="Back to Login" onPress={() => navigation.navigate('Login')} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
    title: { fontSize: 32, marginBottom: 32, color: "#2A4BA0", fontWeight: "bold" },
    input: { width: "80%", borderWidth: 1, borderColor: "#ccc", borderRadius: 12, padding: 12, marginBottom: 16, fontSize: 18 },
});
