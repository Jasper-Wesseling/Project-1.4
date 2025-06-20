import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { API_URL } from '@env';
import { useTranslation } from "react-i18next";

// TempAccount Component
export default function TempAccount({ navigation, onLogin, theme })
{
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();
    const styles = createTempAccountStyles(theme);

    // Functie om een tijdelijke account aan te maken
    const handleGetTempAccount = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/users/register/temp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            if (!res.ok) throw new Error(t("tempAccount.errorCreate"));
            const data = await res.json();
            setUsername(data.username);
            setPassword(data.password);
        } catch (error) {
            console.error("Error creating temporary account:", error);
        }
        setLoading(false);
    }

    // Functie om in te loggen met de tijdelijke account
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
            if (!res.ok) throw new Error(t("tempAccount.errorLogin"));
            const data = await res.json();
            const token = data.token || data.access_token;
            if (token) {
                // Fetch user info after login
                const userRes = await fetch(API_URL + '/api/users/get', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!userRes.ok) throw new Error(t("tempAccount.errorUserFetch"));
                const user = await userRes.json();
                onLogin(token, user);
            } else {
                Alert.alert(t("tempAccount.errorLogin"), t("tempAccount.errorNoToken"));
            }
        } catch (e) {
            Alert.alert(t("tempAccount.errorLogin"), e.message);
        }
        setLoading(false);
    };

    if (username && password) {
        return (
            <View style={styles.successContainer}>
                <View style={styles.successHeader}>
                    <View style={styles.iconContainer}>
                        <Text style={styles.successIcon}>✓</Text>
                    </View>
                    <Text style={styles.successTitle}>{t("tempAccount.createdTitle")}</Text>
                    <Text style={styles.successSubtitle}>{t("tempAccount.createdSubtitle")}</Text>
                </View>
                
                <View style={styles.credentialsCard}>
                    <View style={styles.credentialRow}>
                        <Text style={styles.credentialLabel}>{t("tempAccount.username")}</Text>
                        <View style={styles.credentialValueContainer}>
                            <Text style={styles.credentialValue}>{username}</Text>
                        </View>
                    </View>
                    
                    <View style={styles.credentialRow}>
                        <Text style={styles.credentialLabel}>{t("tempAccount.password")}</Text>
                        <View style={styles.credentialValueContainer}>
                            <Text style={styles.credentialValue}>{password}</Text>
                        </View>
                    </View>
                    
                    <View style={styles.warningContainer}>
                        <Text style={styles.warningIcon}>⚠️</Text>
                        <Text style={styles.warningText}>
                            {t("tempAccount.warning")}
                        </Text>
                    </View>
                </View>
                
                <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                        style={[styles.primaryButton, loading && styles.buttonDisabled]} 
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        <Text style={styles.primaryButtonText}>
                            {loading ? t("tempAccount.loggingIn") : t("tempAccount.continue")}
                        </Text>
                        {!loading && <Text style={styles.buttonArrow}>→</Text>}
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.secondaryButton}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.secondaryButtonText}>{t("tempAccount.goBack")}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.welcomeContainer}>
                <Text style={styles.title}>StudentHub</Text>
                <Text style={styles.subtitle}>{t("tempAccount.subtitle")}</Text>
                <TouchableOpacity 
                    style={[styles.button, loading && styles.buttonDisabled]} 
                    onPress={handleGetTempAccount} 
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? t("tempAccount.creating") : t("tempAccount.getTemp")}
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={styles.linkButton}
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text style={styles.linkText}>{t("tempAccount.alreadyAccount")}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

function createTempAccountStyles(theme) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 24,
        },
        welcomeContainer: {
            alignItems: "center",
            width: "100%",
        },
        title: {
            fontSize: 32,
            fontWeight: "bold",
            color: "#fff",
            marginBottom: 8,
            textAlign: "center",
        },
        subtitle: {
            fontSize: 16,
            color: "#fff",
            opacity: 0.8,
            marginBottom: 32,
            textAlign: "center",
        },
        button: {
            width: "100%",
            height: 48,
            backgroundColor: "#FDBB2C",
            borderRadius: 16,
            justifyContent: "center",
            alignItems: "center",
            elevation: 2,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            marginBottom: 16,
        },
        buttonDisabled: {
            backgroundColor: "#ccc",
            elevation: 0,
            shadowOpacity: 0,
        },
        buttonText: {
            color: "#23244A",
            fontSize: 18,
            fontWeight: "bold",
            letterSpacing: 0.5,
        },
        linkButton: {
            padding: 8,
        },
        linkText: {
            color: "#fff",
            fontSize: 16,
            textDecorationLine: "underline",
        },
        successContainer: {
            flex: 1,
            backgroundColor: theme.background,
            paddingHorizontal: 24,
            paddingTop: 60,
        },
        successHeader: {
            alignItems: "center",
            marginBottom: 32,
        },
        iconContainer: {
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: "#E8F5E8",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 16,
        },
        successIcon: {
            fontSize: 40,
            color: "#4CAF50",
            fontWeight: "bold",
        },
        successTitle: {
            fontSize: 24,
            fontWeight: "bold",
            color: theme.text,
            marginBottom: 8,
            textAlign: "center",
        },
        successSubtitle: {
            fontSize: 16,
            color: theme.detailsText,
            textAlign: "center",
        },
        credentialsCard: {
            backgroundColor: theme.background,
            borderRadius: 16,
            padding: 20,
            marginBottom: 32,
            borderWidth: 1,
            borderColor: "grey",
        },
        credentialRow: {
            marginBottom: 16,
        },
        credentialLabel: {
            fontSize: 14,
            fontWeight: "600",
            color: theme.text,
            marginBottom: 6,
            textTransform: "uppercase",
            letterSpacing: 0.5,
        },
        credentialValueContainer: {
            backgroundColor: theme.formBg,
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: "#E3E6ED",
        },
        credentialValue: {
            fontSize: 16,
            color: theme.text,
            fontFamily: "monospace",
            fontWeight: "500",
        },
        warningContainer: {
            flexDirection: "row",
            alignItems: "flex-start",
            backgroundColor: "#FFF3CD",
            borderRadius: 12,
            padding: 12,
            marginTop: 8,
            borderLeftWidth: 4,
            borderLeftColor: "#FDBB2C",
        },
        warningIcon: {
            fontSize: 16,
            marginRight: 8,
            marginTop: 1,
        },
        warningText: {
            flex: 1,
            fontSize: 14,
            color: "#856404",
            lineHeight: 20,
        },
        buttonContainer: {
            gap: 12,
        },
        primaryButton: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#FDBB2C",
            borderRadius: 16,
            paddingVertical: 16,
            paddingHorizontal: 24,
            elevation: 2,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
        },
        primaryButtonText: {
            color: "#23244A",
            fontWeight: "bold",
            fontSize: 18,
            letterSpacing: 0.5,
        },
        buttonArrow: {
            fontSize: 18,
            color: "#23244A",
            marginLeft: 8,
            fontWeight: "bold",
        },
        secondaryButton: {
            borderWidth: 2,
            borderColor: theme.primary,
            borderRadius: 16,
            paddingVertical: 14,
            paddingHorizontal: 24,
            alignItems: "center",
            backgroundColor: "transparent",
        },
        secondaryButtonText: {
            color: theme.primary,
            fontWeight: "600",
            fontSize: 16,
        },
    });
}