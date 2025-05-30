import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { API_URL } from '@env';

export default function CreateEvent({ navigation }) {
    const [title, setTitle] = useState("");
    const [date, setDate] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [companyId, setCompanyId] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!title || !date || !companyId) {
            Alert.alert("Error", "Title, date, and company ID are required.");
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
            if (!loginRes.ok) throw new Error("Login failed");
            const loginData = await loginRes.json();
            const token = loginData.token || loginData.access_token;
            if (!token) throw new Error("No token received");

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
                let errorMsg = 'Failed to create event';
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
            Alert.alert("Success", "Event created!");
            navigation.goBack();
        } catch (err) {
            Alert.alert("Error", err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Title</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Event Title" />
            <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
            <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="2025-06-01" />
            <Text style={styles.label}>Description</Text>
            <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder="Description" multiline />
            <Text style={styles.label}>Location</Text>
            <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="Location" />
            <Text style={styles.label}>Company ID</Text>
            <TextInput style={styles.input} value={companyId} onChangeText={setCompanyId} placeholder="Company ID" />
            <Button title={loading ? "Creating..." : "Create Event"} onPress={handleSubmit} disabled={loading} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: '#fff',
    },
    label: {
        fontWeight: 'bold',
        marginTop: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 8,
        marginTop: 4,
    },
});
