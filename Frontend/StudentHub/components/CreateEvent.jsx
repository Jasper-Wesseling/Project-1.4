import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { API_URL } from '@env';
import { useTranslation } from "react-i18next";

export default function CreateEvent({ navigation, theme }) {
    const [title, setTitle] = useState("");
    const [date, setDate] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [companyId, setCompanyId] = useState("");
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();
    const styles = createCreateEventStyles(theme);

    const handleSubmit = async () => {
        if (!title || !date || !companyId) {
            Alert.alert(t("createEvent.errorTitle"), t("createEvent.errorRequired"));
            return;
        }
        setLoading(true);
        try {
            // TODO: Replace with real auth
            const loginRes = await fetch(API_URL + '/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "username": "jasper.wesseling@student.nhlstenden.com",
                    "password": "wesselingjasper",
                    "full_name": "Jasper Wesseling"
                })
            });
            if (!loginRes.ok) throw new Error(t("createEvent.errorLogin"));
            const loginData = await loginRes.json();
            const token = loginData.token || loginData.access_token;
            if (!token) throw new Error(t("createEvent.errorNoToken"));

            // Build request body with only required and non-empty optional fields
            const body = {
                title,
                date,
                company_id: parseInt(companyId, 10)
            };
            if (location) body.location = location;
            if (description) body.description = description;
            console.log('Event POST body:', body); // Debug log

            const res = await fetch(API_URL + '/api/events/new', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });
            if (!res.ok) {
                let errorMsg = t('createEvent.errorCreate');
                try {
                    const errorData = await res.json();
                    errorMsg = errorData.message || JSON.stringify(errorData);
                } catch (e) {
                    // fallback to text if not JSON
                    try {
                        errorMsg = await res.text();
                    } catch {}
                }
                throw new Error(errorMsg);
            }
            Alert.alert(t("createEvent.successTitle"), t("createEvent.successMsg"));
            navigation.goBack();
        } catch (err) {
            Alert.alert(t("createEvent.errorTitle"), err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.formTitel}>{t("createEvent.title")}</Text>
            <Button title={loading ? t("createEvent.creating") : t("createEvent.createBtn")} onPress={handleSubmit} disabled={loading} />
            <Button title={t("createEvent.backBtn")} onPress={() => navigation.goBack()} color="#2A4BA0" style={{marginTop: 12}} />
            <Text style={styles.label}>{t("createEvent.labelTitle")}</Text>
            <TextInput placeholderTextColor={theme.text} style={styles.input} value={title} onChangeText={setTitle} placeholder={t("createEvent.placeholderTitle")} />
            <Text style={styles.label}>{t("createEvent.labelDate")}</Text>
            <TextInput placeholderTextColor={theme.text} style={styles.input} value={date} onChangeText={setDate} placeholder={t("createEvent.placeholderDate")} />
            <Text style={styles.label}>{t("createEvent.labelDescription")}</Text>
            <TextInput placeholderTextColor={theme.text} style={styles.input} value={description} onChangeText={setDescription} placeholder={t("createEvent.placeholderDescription")} multiline />
            <Text style={styles.label}>{t("createEvent.labelLocation")}</Text>
            <TextInput placeholderTextColor={theme.text} style={styles.input} value={location} onChangeText={setLocation} placeholder={t("createEvent.placeholderLocation")} />
            <Text style={styles.label}>{t("createEvent.labelCompanyId")}</Text>
            <TextInput placeholderTextColor={theme.text} style={styles.input} value={companyId} onChangeText={setCompanyId} placeholder={t("createEvent.placeholderCompanyId")} />
        </View>
    );
}

function createCreateEventStyles(theme) {
    return StyleSheet.create({
        container: {
            flex: 1,
            padding: 24,
            backgroundColor: theme.background,
        },
        label: {
            fontWeight: 'bold',
            marginTop: 16,
            color: theme.text,
        },
        formTitel: {
            color: theme.text,
            fontSize: 24,
            fontWeight: 'bold',
            marginVertical: 16,
        },
        input: {
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 8,
            padding: 8,
            marginTop: 4,
            color: theme.text,
        },
    });
}
