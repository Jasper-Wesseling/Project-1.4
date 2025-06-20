import { useState, useEffect } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image, SafeAreaView, ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { Icon } from "react-native-elements";
import { useTranslation } from "react-i18next";
import { API_URL } from '@env';
import { hasRole } from "../utils/roleUtils";

export default function BountyBoardModal({ visible, bounty, onClose, user, token, onPostDeleted, navigation, theme }) {
    const { t } = useTranslation();

    const [showOverige, setShowOverige] = useState(false);
    // Edit mode state
    const [editMode, setEditMode] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [saving, setSaving] = useState(false);
    const styles = createBountyBoardModalStyles(theme);

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
            });
            if (!res.ok) throw new Error("Edit failed");
            setEditMode(false);
            Alert.alert(t('success'), t('postUpdated'));
            if (onPostDeleted) onPostDeleted(); // Refresh the list
        } catch (err) {
            Alert.alert(t('error'), t('couldNotSaveChanges'));
        }
        setSaving(false);
    };

    const handleDelete = async () => {
        Alert.alert(
            t('deletePost'),
            t('deleteConfirmation'),
            [
                { text: t('cancel'), style: "cancel" },
                {
                    text: t('delete'),
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const res = await fetch(`${API_URL}/api/posts/delete?id=${bounty.id}`, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                },
                            });
                            if (!res.ok) throw new Error("Delete failed");
                            Alert.alert(t('success'), t('postDeleted'), [
                                {
                                    text: t('ok'), onPress: () => {
                                        onClose();
                                        if (onPostDeleted) onPostDeleted();
                                    }
                                }
                            ]);
                        } catch (err) {
                            Alert.alert(t('error'), t('couldNotDeletePost'));
                        }
                    }
                }
            ]
        );
    };

    if (!bounty) return null;
    const isCreator = user && user.id === bounty.post_user_id;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.overlay}>
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
                        </TouchableOpacity>

                        <ScrollView
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
                                        {bounty.post_user_name || t('unknownUser')}
                                    </Text>
                                </View>
                            )}

                            {/* Title and Price */}
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
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{t('daysAgo', { count: bounty.days_ago })}</Text>
                                </View>
                                <View style={styles.locationBox}>
                                    <Icon name="location-on" type="material" size={16} />
                                    <Text style={styles.locationText}>{bounty.type}</Text>
                                </View>
                            </View>

                            {/* Chat button */}
                            <View style={styles.buttonRow}>
                                <TouchableOpacity
                                    onPress={() => {
                                        navigation.navigate('ProductChat', {
                                            userToChat: bounty.user_id,
                                            receiverName: bounty.product_username,
                                            bountyTitle: bounty.title,
                                            bounty: bounty
                                        });
                                        onClose();
                                    }}
                                    style={styles.filledButton}
                                    disabled={hasRole(user, "ROLE_TEMP")}
                                >
                                    <Text style={styles.filledButtonText}>{t('chatNow')}</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Description */}
                            <Text style={styles.sectionTitle}>{t('description')}</Text>
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
                                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>{t('edit')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={{ backgroundColor: '#d32f2f', padding: 8, borderRadius: 8 }}
                                        onPress={handleDelete}
                                    >
                                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>{t('delete')}</Text>
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
                                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                                            {saving ? t('saving') : t('save')}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={{ backgroundColor: '#aaa', padding: 8, borderRadius: 8 }}
                                        onPress={() => setEditMode(false)}
                                        disabled={saving}
                                    >
                                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>{t('cancel')}</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* Overige (expandable) */}
                            <TouchableOpacity
                                style={styles.sectionRow}
                                onPress={() => setShowOverige(!showOverige)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.sectionTitle}>{t('whatIsBounty')}</Text>
                                <Text style={styles.sectionArrow}>{showOverige ? "▲" : "▼"}</Text>
                            </TouchableOpacity>
                            {showOverige && (
                                <Text style={styles.details}>
                                    {t('bountyExplanation')}
                                </Text>
                            )}
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </Modal>
    );
}

function createBountyBoardModalStyles(theme) {
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
            position: 'absolute',
            top: 18,
            right: 18,
            zIndex: 10,
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
            color: theme.text,
            marginBottom: 10,
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            color: theme.text,
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
            borderColor: theme.text,
            borderRadius: 16,
            paddingVertical: 12,
            marginRight: 8,
            alignItems: 'center',
        },
        outlineButtonText: {
            color: theme.text,
            fontWeight: 'bold',
            fontSize: 16,
        },
        filledButton: {
            flex: 1,
            backgroundColor: theme.primary,
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
