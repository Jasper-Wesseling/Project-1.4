import { useState, useEffect } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image, SafeAreaView, ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { Icon } from "react-native-elements";
import { API_URL } from '@env';

export default function BountyBoardModal({ visible, bounty, onClose, user, token, onPostDeleted, navigation }) {
    const [showOverige, setShowOverige] = useState(false);
    // Edit mode state
    const [editMode, setEditMode] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setEditMode(false); // Reset edit mode when bounty changes
        setEditTitle(bounty?.title || '');
        setEditDescription(bounty?.description || '');
    }, [bounty]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`${API_URL}/api/posts/edit?id=${bounty.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: editTitle,
                    description: editDescription,
                }),
            });            if (!res.ok) throw new Error("Edit failed");
            setEditMode(false);
            Alert.alert("Success", "Post updated!");
            if (onPostDeleted) onPostDeleted(); // Refresh the list
        } catch (err) {
            Alert.alert("Error", "Could not save changes.");
        }        setSaving(false);
    };

    const handleDelete = async () => {
        Alert.alert(
            "Delete Post", 
            "Are you sure you want to delete this post? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const res = await fetch(`${API_URL}/api/posts/delete?id=${bounty.id}`, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                },
                            });                            if (!res.ok) throw new Error("Delete failed");
                            Alert.alert("Success", "Post deleted!", [
                                { text: "OK", onPress: () => {
                                    onClose();
                                    if (onPostDeleted) onPostDeleted();
                                }}
                            ]);
                        } catch (err) {
                            Alert.alert("Error", "Could not delete post.");
                        }
                    }
                }
            ]
        );
    };    if (!bounty) return null;
    const isCreator = user && user.id === bounty.post_user_id;
    
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >            <SafeAreaView style={styles.overlay}>
                <KeyboardAvoidingView
                    style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' }}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
                >
                    <View style={styles.card}>
                    {/* Back Arrow Button */}
                    <TouchableOpacity style={styles.backButton} onPress={onClose}>
                        <View style={styles.backCircle}>
                            <Text style={styles.backArrow}>←</Text>
                        </View>
                    </TouchableOpacity>                    <ScrollView
                        style={{ width: '100%' }}
                        contentContainerStyle={{ paddingBottom: 32 }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* User info - Show post creator info */}
                        {bounty && (
                            <View style={styles.userRow}>
                                {bounty.post_user_avatar && bounty.post_user_avatar.startsWith('http') ? (
                                    <Image
                                        source={{ uri: bounty.post_user_avatar }}
                                        style={styles.avatar}
                                    />
                                ) : (
                                    <View style={[styles.avatar, styles.avatarFallback]}>
                                        <Text style={styles.avatarFallbackText}>
                                            {bounty.post_user_name ? bounty.post_user_name.charAt(0).toUpperCase() : '?'}
                                        </Text>
                                    </View>
                                )}
                                <Text style={styles.userName}>
                                    {bounty.post_user_name || "Onbekende gebruiker"}
                                </Text>
                            </View>                        )}{/* Title and Price */}
                        {editMode ? (
                            <TextInput
                                value={editTitle}
                                onChangeText={setEditTitle}
                                style={[styles.title, { backgroundColor: '#f4f5f7', borderRadius: 8, padding: 4 }]}
                            />
                        ) : (
                            <Text style={styles.title}>{bounty.title}</Text>
                        )}
                        <View style={styles.priceRow}>
                            <View style={styles.badge}><Text style={styles.badgeText}>{bounty.days_ago} days ago</Text></View>
                            <View style={styles.locationBox}>
                                <Icon name="location-on" type="material" size={16} />
                                <Text style={styles.locationText}>{bounty.type}</Text>
                            </View>
                        </View>
                        {/* Chat button */}
                        <View style={styles.buttonRow}>
                            <TouchableOpacity onPress={() => { navigation.navigate('ProductChat', { userToChat: bounty.user_id, receiverName: bounty.product_username, bountyTitle: bounty.title, bounty: bounty }); onClose();}} style={styles.filledButton}><Text style={styles.filledButtonText}>Chat nu</Text></TouchableOpacity>
                        </View>                        {/* Description */}
                        <Text style={styles.sectionTitle}>Beschrijving</Text>
                        {editMode ? (
                            <TextInput
                                value={editDescription}
                                onChangeText={setEditDescription}
                                style={[
                                    styles.details,
                                    {
                                        backgroundColor: '#f4f5f7',
                                        borderRadius: 8,
                                        padding: 4,
                                        minHeight: 100,
                                        maxHeight: 200,
                                    }
                                ]}
                                multiline
                                scrollEnabled={true}
                                textAlignVertical="top"
                            />
                        ) : (
                                <Text style={styles.details}>{bounty.description}</Text>                        
                            )}
                          {/* Edit/Delete Buttons */}
                        {isCreator && !editMode && (
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 10 }}>
                                <TouchableOpacity
                                    style={{ backgroundColor: '#2A4BA0', padding: 8, borderRadius: 8, marginRight: 8 }}
                                    onPress={() => setEditMode(true)}
                                >
                                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Edit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={{ backgroundColor: '#d32f2f', padding: 8, borderRadius: 8 }}
                                    onPress={handleDelete}
                                >
                                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        {isCreator && editMode && (
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 10 }}>
                                <TouchableOpacity
                                    style={{ backgroundColor: '#2A4BA0', padding: 8, borderRadius: 8, marginRight: 8 }}
                                    onPress={handleSave}
                                    disabled={saving}
                                >
                                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>{saving ? "Saving..." : "Save"}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={{ backgroundColor: '#aaa', padding: 8, borderRadius: 8 }}
                                    onPress={() => setEditMode(false)}
                                    disabled={saving}
                                >
                                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        
                        {/* Overige (expandable) */}
                        <TouchableOpacity
                            style={styles.sectionRow}
                            onPress={() => setShowOverige(!showOverige)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.sectionTitle}>Wat is een bounty?</Text>
                            <Text style={styles.sectionArrow}>{showOverige ? "▲" : "▼"}</Text>
                        </TouchableOpacity>
                        {showOverige && (
                            <Text style={styles.details}>
                                Een bounty is een oproep voor hulp: een student plaatst een vraag of probleem waar hij of zij graag ondersteuning bij wil.
                                Door een bounty te plaatsen, vraagt iemand de community om mee te denken of direct te helpen.
                                Dit kan gaan om studievragen, technische uitdagingen, praktische zaken of andere onderwerpen waarbij je snel hulp kunt gebruiken.
                                Heb jij het antwoord of kun je helpen? Reageer dan op deze bounty en maak samen het verschil!
                            </Text>
                        )}
                    </ScrollView>
                </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.25)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        width: '95%',
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: 28,
        padding: 24,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.13,
        shadowRadius: 12,
        elevation: 12,
    },
    backButton: {
        position: 'absolute',
        top: 18,
        right: 18,
        zIndex: 10,
    },
    backCircle: {
        backgroundColor: '#f4f5f7',
        borderRadius: 20,
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backArrow: {
        fontSize: 22,
        color: '#222',
        marginBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2A4BA0',
        alignSelf: 'flex-start',
        marginTop: 12,
        marginBottom: 2,
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        alignSelf: 'flex-start',
    },
    avatar: {
        width: 38,
        height: 38,
        borderRadius: 19,
        marginRight: 10,
        backgroundColor: "#eee",
    },
    userName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#2A4BA0",
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        marginTop: 4,
        marginBottom: 8,
    },
    badge: {
        backgroundColor: '#2A4BA0',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 10,
    },
    badgeText: {
        color: '#fff',
        fontSize: 13,
    },
    locationBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFC83A',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    locationText: {
        marginLeft: 6,
        fontWeight: '500',
        fontSize: 13,
    },
    starsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    stars: {
        color: '#FFC83A',
        fontSize: 18,
        marginRight: 6,
    },
    reviewCount: {
        color: '#888',
        fontSize: 14,
    },
    buttonRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'flex-end',
        marginVertical: 16,
    },
    outlineButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#2A4BA0',
        borderRadius: 16,
        paddingVertical: 12,
        marginRight: 8,
        alignItems: 'center',
    },
    outlineButtonText: {
        color: '#2A4BA0',
        fontWeight: 'bold',
        fontSize: 16,
    },
    filledButton: {
        flex: 1,
        backgroundColor: '#2A4BA0',
        borderRadius: 16,
        paddingVertical: 12,
        alignItems: 'center',
    },
    filledButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    sectionTitle: {
        fontWeight: 'bold',
        color: '#2A4BA0',
        fontSize: 16,
        marginTop: 14,
        marginBottom: 2,
        alignSelf: 'flex-start',
    },
    details: {
        color: '#444',
        fontSize: 15,
        marginBottom: 8,
        alignSelf: 'flex-start',
    },
    sectionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingVertical: 10,
        marginTop: 2,
    },
    sectionArrow: {
        fontSize: 18,
        color: '#8a94a6',
    },
    avatarFallback: {
        backgroundColor: "#ccc",
        justifyContent: "center",
        alignItems: "center",
    },
    avatarFallbackText: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "bold",
    },
});