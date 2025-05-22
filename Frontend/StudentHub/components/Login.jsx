import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, SafeAreaView, Alert } from "react-native";
import { API_URL } from '@env';

export default function Login({ navigation, onLogin }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

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
            if (!res.ok) throw new Error("Login failed");
            const data = await res.json();
            const token = data.token || data.access_token;
            if (token) {
                // Fetch user info after login
                const userRes = await fetch(API_URL + '/api/users/get', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!userRes.ok) throw new Error("User fetch failed");
                const user = await userRes.json();
                onLogin(token, user);
            } else {
                Alert.alert("Login failed", "No token received");
            }
        } catch (e) {
            Alert.alert("Login failed", e.message);
        }
        setLoading(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Login</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={username}
                onChangeText={setUsername}
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
            <Button title={loading ? "Logging in..." : "Login"} onPress={handleLogin} disabled={loading} />
            <View style={{ height: 16 }} />
            <Button title="Register" onPress={() => navigation.navigate('Register')} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
    title: { fontSize: 32, marginBottom: 32, color: "#2A4BA0", fontWeight: "bold" },
    input: { width: "80%", borderWidth: 1, borderColor: "#ccc", borderRadius: 12, padding: 12, marginBottom: 16, fontSize: 18 },
});
