import React, { useState, useEffect } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image, SafeAreaView, ScrollView } from "react-native";
import { Icon } from "react-native-elements";
import { API_URL } from "@env";
import { themes } from "./LightDarkComponent"; // Zorg dat je themes importeert

export default function BountyBoardModal({ visible, bounty, onClose, navigation, theme }) {
    const [user, setUser] = useState(null);
    const [showOverige, setShowOverige] = useState(false);

    // Theme object ophalen
    const safeTheme =
        typeof theme === "object" && theme
            ? theme
            : typeof theme === "string" && themes[theme]
                ? themes[theme]
                : themes.light;

    useEffect(() => {
        setUser(null);
        let isMounted = true;
        async function fetchUser() {
            if (!bounty?.user_id || !bounty?.token) return;
            try {
                const res = await fetch(`${API_URL}/api/users/getbyid/${bounty.user_id}`, {
                    headers: {
                        'Authorization': `Bearer ${bounty.token}`,
                    },
                });
                if (!res.ok) return;
                const data = await res.json();
                if (isMounted) setUser(data);
            } catch (e) { }
        }
        fetchUser();
        return () => { isMounted = false; };
    }, [bounty?.user_id, bounty?.token, visible]);

    if (!bounty) return null;

    const styles = createModalStyles(safeTheme);

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.overlay}>
                <View style={styles.card}>
                    <ScrollView>
                        <View style={styles.userRow}>
                            <TouchableOpacity style={styles.backButton} onPress={onClose}>
                                <View style={styles.backCircle}>
                                    <Text style={styles.backArrow}>←</Text>
                                </View>
                            </TouchableOpacity>
                            {user ? (
                                user.avatar_url && user.avatar_url.startsWith('http') ? (
                                    <Image
                                        source={{ uri: user.avatar_url }}
                                        style={styles.avatar}
                                    />
                                ) : (
                                    <View style={[styles.avatar, styles.avatarFallback]}>
                                        <Text style={styles.avatarFallbackText}>?</Text>
                                    </View>
                                )
                            ) : (
                                <View style={[styles.avatar, styles.avatarFallback]}>
                                    <Text style={styles.avatarFallbackText}>?</Text>
                                </View>
                            )}
                            <Text style={styles.userName}>
                                {user?.full_name || "Onbekende gebruiker"}
                            </Text>
                        </View>
                        {/* Title and Price */}
                        <Text style={styles.title}>{bounty.title}</Text>
                        <View style={styles.priceRow}>
                            <View style={styles.badge}><Text style={styles.badgeText}>{bounty.days_ago} days ago</Text></View>
                            <View style={styles.locationBox}>
                                <Icon name="location-on" type="material" size={16} />
                                <Text style={styles.locationText}>{bounty.type}</Text>
                            </View>
                        </View>
                        {/* Chat button */}
                        <View style={styles.buttonRow}>
                            <TouchableOpacity disabled={hasRole(user, 'ROLE_TEMP')} style={styles.filledButton} onPress={() => { navigation.navigate('ProductChat', { userToChat: bounty.user_id, receiverName: bounty.product_username, bountyTitle: bounty.title, bounty: bounty }); onClose(); }}>
                                <Text style={styles.filledButtonText}>
                                    Chat nu
                                </Text>
                            </TouchableOpacity>
                        </View>
                        {/* Description */}
                        <Text style={styles.sectionTitle}>Beschrijving</Text>
                        <Text style={styles.details}>{bounty.description}</Text>
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
            </SafeAreaView>
        </Modal>
    );
}

function createModalStyles(theme) {
    return StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: theme.modalOverlay,
            justifyContent: 'center',
            alignItems: 'center',
        },
        card: {
            width: '95%',
            height: '100%',
            backgroundColor: theme.background,
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
            marginRight: 16,
        },
        backCircle: {
            backgroundColor: theme.backCircle,
            borderRadius: 20,
            width: 36,
            height: 36,
            justifyContent: 'center',
            alignItems: 'center',
        },
        backArrow: {
            fontSize: 22,
            color: theme.text || '#222',
            marginBottom: 10,
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            color: theme.headerText,
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
            backgroundColor: theme.avatarBg,
        },
        userName: {
            fontSize: 16,
            fontWeight: "bold",
            color: theme.text,
        },
        priceRow: {
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'flex-start',
            marginTop: 4,
            marginBottom: 8,
        },
        badge: {
            backgroundColor: theme.primary,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 6,
            marginRight: 10,
        },
        badgeText: {
            color: theme.badgeText,
            fontSize: 13,
        },
        locationBox: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.locationBg,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 6,
        },
        locationText: {
            marginLeft: 6,
            fontWeight: '500',
            fontSize: 13,
            color: theme.locationText,
        },
        starsRow: {
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'flex-start',
            marginBottom: 8,
        },
        stars: {
            color: theme.star,
            fontSize: 18,
            marginRight: 6,
        },
        reviewCount: {
            color: theme.reviewCount,
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
            borderColor: theme.primary,
            borderRadius: 16,
            paddingVertical: 12,
            marginRight: 8,
            alignItems: 'center',
        },
        outlineButtonText: {
            color: theme.primary,
            fontWeight: 'bold',
            fontSize: 16,
        },
        filledButton: {
            flex: 1,
            backgroundColor: theme.locationBg,
            borderRadius: 16,
            paddingVertical: 12,
            alignItems: 'center',
        },
        filledButtonText: {
            color: theme.filledButtonText,
            fontWeight: 'bold',
            fontSize: 16,
        },
        sectionTitle: {
            fontWeight: 'bold',
            color: theme.primary,
            fontSize: 16,
            marginTop: 14,
            marginBottom: 2,
            alignSelf: 'flex-start',
        },
        details: {
            color: theme.detailsText,
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
            borderTopColor: theme.sectionRowBorder,
            paddingVertical: 10,
            marginTop: 2,
        },
        sectionArrow: {
            fontSize: 18,
            color: theme.sectionArrow,
        },
        avatarFallback: {
            backgroundColor: theme.avatarFallback,
            justifyContent: "center",
            alignItems: "center",
        },
        avatarFallbackText: {
            color: theme.avatarFallbackText,
            fontSize: 22,
            fontWeight: "bold",
        },
    });
}