import React, { useState, useEffect } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image, SafeAreaView, ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { API_URL } from '@env';
import { hasRole } from "../utils/roleUtils";
// Add translation import
import { useTranslation } from "react-i18next";

export default function ProductModal({ visible, product, onClose, formatPrice, navigation, productUser, productUserName, user, token, theme }) {
    const [fullscreenImg, setFullscreenImg] = useState(false);
    const [sellerData, setSellerData] = useState(null);

    // Edit mode state
    const [editMode, setEditMode] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editPrice, setEditPrice] = useState('');
    const [saving, setSaving] = useState(false);
    const styles = createProductModalStyles(theme);
    const { t } = useTranslation();

    useEffect(() => {
        setEditMode(false); // Reset edit mode when product changes
        setEditTitle(product?.title || '');
        setEditDescription(product?.description || '');
        setEditPrice(product?.price ? String(product.price) : '');
    }, [product]);

    useEffect(() => {
        const fetchSeller = async () => {
            try {
                if (!product || !product.product_user_id || !token) {
                    setSellerData(null);
                    return;
                }
                const res = await fetch(`${API_URL}/api/users/getbyid?id=${product.product_user_id}`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error("Seller fetch failed");
                const data = await res.json();
                setSellerData(data);
            } catch (err) {
                console.error("Seller API error:", err);
                setSellerData(null);
            }
        };

        fetchSeller();
    }, [product, token]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`${API_URL}/api/products/edit?id=${product.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: editTitle,
                    description: editDescription,
                    price: parseFloat(editPrice),
                }),
            });
            if (!res.ok) throw new Error(t("productModal.editFailed"));
            setEditMode(false);
            Alert.alert(t("productModal.success"), t("productModal.productUpdated"));
        } catch (err) {
            Alert.alert(t("productModal.error"), t("productModal.saveError"));
        }
        setSaving(false);
    };

    // Add delete handler
    const handleDelete = async () => {
        Alert.alert(
            t("productModal.deleteTitle"),
            t("productModal.deleteConfirm"),
            [
                { text: t("productModal.cancel"), style: "cancel" },
                {
                    text: t("productModal.delete"),
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const res = await fetch(`${API_URL}/api/products/delete?id=${product.id}`, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                }
                            });
                            if (!res.ok) throw new Error(t("productModal.deleteFailed"));
                            Alert.alert(t("productModal.deleted"), t("productModal.productDeleted"));
                            setEditMode(false);
                            onClose();
                        } catch (err) {
                            Alert.alert(t("productModal.error"), t("productModal.deleteError"));
                        }
                    }
                }
            ]
        );
    };

    if (!product) return null;
    const isCreator = user && user.id === product.product_user_id;
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
                    keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24} // adjust if needed
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
                            {/* Placeholder Image */}
                            <View style={styles.imageContainer}>
                                <TouchableOpacity onPress={() => setFullscreenImg(true)} activeOpacity={0.8}>
                                    <Image
                                        source={product.photo ? { uri: API_URL + product.photo } : { uri: 'https://placecats.com/300/200' }}
                                        style={styles.image}
                                        resizeMode="cover"
                                    />
                                </TouchableOpacity>
                            </View>
                            {/* Title and Price */}
                            <Text style={styles.title}>
                                {editMode ? (
                                    <TextInput
                                        value={editTitle}
                                        onChangeText={setEditTitle}
                                        style={[styles.title, { backgroundColor: '#f4f5f7', borderRadius: 8, padding: 4 }]}
                                    />
                                ) : (
                                    product.title
                                )}
                            </Text>
                            <View style={styles.priceRow}>
                                {editMode ? (
                                    <TextInput
                                        value={editPrice}
                                        onChangeText={setEditPrice}
                                        style={[styles.price, { backgroundColor: '#f4f5f7', borderRadius: 8, padding: 4, minWidth: 80 }]}
                                        keyboardType="numeric"
                                    />
                                ) : (
                                    <Text style={styles.price}>{formatPrice(product.price)}</Text>
                                )}
                                <View style={styles.badge}><Text style={styles.badgeText}>{product.days_ago} {t("productModal.daysAgo")}</Text></View>
                            </View>
                            
                            {/* Buttons */}
                            <View style={styles.buttonRow}>

//                                 <TouchableOpacity style={styles.outlineButton}><Text style={styles.outlineButtonText}>{t("productModal.addToCart")}</Text></TouchableOpacity>
//                                 <TouchableOpacity style={styles.filledButton} onPress={() => { navigation.navigate('ProductChat', { product: product.id, userToChat: productUser, productTitle: product.title, receiverName: productUserName }); onClose();  }}><Text style={styles.filledButtonText}>{t("productModal.buyNow")}</Text></TouchableOpacity>

                                <TouchableOpacity style={styles.outlineButton}><Text style={styles.outlineButtonText}>Add To Cart</Text></TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.filledButton,
                                        isCreator && { backgroundColor: '#ccc' }
                                    ]}
                                    onPress={() => {
                                        navigation.navigate('ProductChat', { product: product.id, userToChat: productUser, productTitle: product.title, receiverName: productUserName });
                                        onClose();
                                    }}
                                    disabled={isCreator}
                                >
                                    <Text style={styles.filledButtonText}>
                                        Buy Now
                                    </Text>
                                </TouchableOpacity>

                            </View>
                            {/* Seller Info - improved */}
                            <Text style={styles.sectionTitle}>{t("productModal.sellerInfo")}</Text>
                            <TouchableOpacity onPress={() => {navigation.navigate('Profile', { product: product}); onClose(); }} activeOpacity={0.8} style={styles.sellerContainer}>
                                    <View style={styles.sellerRow}>
                                        <Image
                                            source={sellerData ? { uri: API_URL + sellerData.avatar_url } : { uri: 'https://placecats.com/300/200' }}
                                            style={styles.sellerImg}
                                        />
                                        <Text style={styles.sellerName}>{product.product_username}</Text>
                                    </View>
                                    <View style={styles.sellerRatingRow}>
                                        {sellerData && (
                                            <View style={styles.reviewContainer}>
                                                <View style={styles.reviewRow}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <Text
                                                                key={i}
                                                                style={[
                                                                    i < Math.round(sellerData.review_average || 0)
                                                                        ? styles.starFilled
                                                                        : styles.starEmpty
                                                                ]}
                                                            >★</Text>
                                                        ))}
                                                        <Text style={styles.reviews}> {sellerData.review_count || t("productModal.noReviews")} {t("productModal.reviews")}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        )}
                                    </View>
                               
                            </TouchableOpacity>
                            

                            

                            {/* Details */}
                            <Text style={styles.sectionTitle}>{t("productModal.details")}</Text>
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
                                            minHeight: 100, // Increased for better scrolling
                                            maxHeight: 200, // Optional: limit max height
                                        }
                                    ]}
                                    multiline
                                    scrollEnabled={true}
                                    textAlignVertical="top"
                            />
                            ) : (
                                <Text style={styles.details}>{product.description}</Text>
                            )}

                            {/* Edit/Save Buttons */}
                            {isCreator && !editMode && (
                                <TouchableOpacity
                                    style={{ alignSelf: 'flex-end', marginBottom: 10, backgroundColor: '#2A4BA0', padding: 8, borderRadius: 8 }}
                                    onPress={() => setEditMode(true)}
                                >
                                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>{t("productModal.edit")}</Text>
                                </TouchableOpacity>
                            )}
                            {isCreator && editMode && (
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                                    <TouchableOpacity
                                        style={{ backgroundColor: '#ff4d4f', padding: 8, borderRadius: 8 }}
                                        onPress={handleDelete}
                                        disabled={saving}
                                    >
                                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>{t("productModal.delete")}</Text>
                                    </TouchableOpacity>
                                    <View style={{ flexDirection: 'row' }}>
                                        <TouchableOpacity
                                            style={{ backgroundColor: '#2A4BA0', padding: 8, borderRadius: 8, marginRight: 8 }}
                                            onPress={handleSave}
                                            disabled={saving}
                                        >
                                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>{saving ? t("productModal.saving") : t("productModal.save")}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={{ backgroundColor: '#aaa', padding: 8, borderRadius: 8 }}
                                            onPress={() => setEditMode(false)}
                                            disabled={saving}
                                        >
                                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>{t("productModal.cancel")}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}

                            {/* for later use when there needs to be more infomation added to the modal */}
                            {/* <TouchableOpacity
                                style={styles.sectionRow}
                                onPress={() => setShowOverige(!showOverige)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.sectionTitle}>overige</Text>
                                <Text style={styles.sectionArrow}>{showOverige ? "▲" : "▼"}</Text>
                            </TouchableOpacity>
                            {showOverige && (
                                <Text style={styles.details}>
                                    test
                                </Text>
                            )}
                            
                            <TouchableOpacity
                                style={styles.sectionRow}
                                onPress={() => setShowReviews(!showReviews)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.sectionTitle}>Reviews</Text>
                                <Text style={styles.sectionArrow}>{showReviews ? "▲" : "▼"}</Text>
                            </TouchableOpacity>
                            {showReviews && (
                                <Text style={styles.details}>
                                    Hier komen de reviews van het product.
                                </Text>
                            )} */}
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
                {/* Fullscreen Image Modal */}
                <Modal
                    visible={fullscreenImg}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setFullscreenImg(false)}
                >
                    <TouchableOpacity style={styles.fullscreenOverlay} activeOpacity={1} onPress={() => setFullscreenImg(false)}>
                        <Image
                            source={product.photo ? { uri: API_URL + product.photo } : { uri: 'https://placecats.com/300/200' }}
                            style={styles.fullscreenImage}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                </Modal>
            </SafeAreaView>
        </Modal>
    );
}

function createProductModalStyles(theme) {
    return StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: theme.modalOverlay,
            justifyContent: 'center',
            alignItems: 'center',
        },
        card: {
            width: '92%',
            height: '100%',
            backgroundColor: theme.background,
            borderRadius: 28,
            padding: 24,
            alignItems: 'center',
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 8,
        },
        backButton: {
            position: 'absolute',
            top: 18,
            left: 18,
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
        },
        imageContainer: {
            marginTop: 24,
            marginBottom: 16,
            width: 200,
            height: 200,
            borderRadius: 100,
            backgroundColor: '#f4f5f7',
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
        },
        image: {
            width: 170,
            height: 170,
            borderRadius: 85,
        },
        title: {
            fontSize: 22,
            fontWeight: 'bold',
            color: theme.text,
            alignSelf: 'flex-start',
            marginTop: 12,
        },
        priceRow: {
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'flex-start',
            marginTop: 4,
            marginBottom: 8,
        },
        price: {
            fontSize: 20,
            fontWeight: 'bold',
            color: theme.text,
            marginRight: 10,
        },
        badge: {
            backgroundColor: '#2A4BA0',
            borderRadius: 12,
            paddingHorizontal: 10,
            paddingVertical: 3,
        },
        badgeText: {
            color: '#fff',
            fontSize: 13,
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
            justifyContent: 'space-between',
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
            marginLeft: 8,
            alignItems: 'center',
        },
        filledButtonText: {
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 16,
        },
        sectionTitle: {
            fontWeight: 'bold',
            color: theme.primary,
            fontSize: 16,
            marginTop: 10,
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
            borderTopColor: '#eee',
            paddingVertical: 10,
            marginTop: 2,
        },
        sectionArrow: {
            fontSize: 18,
            color: theme.sectionArrow,
        },
        fullscreenOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.95)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        fullscreenImage: {
            width: '95%',
            height: '80%',
            borderRadius: 16,
        },
        sellerContainer: {
            width: '100%',
            backgroundColor: theme.formBg,
            borderRadius: 12,
            padding: 16,
            marginTop: 16,
            marginBottom: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 4,
        },
        sellerRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
        },
        sellerImg: {
            width: 32,
            height: 32,
            borderRadius: 16,
            marginRight: 8,
            backgroundColor: '#eee',
        },
        sellerLabel: {
            fontWeight: 'bold',
            color: '#222',
            fontSize: 14,
            marginRight: 4,
        },
        sellerName: {
            color: '#2A4BA0',
            fontSize: 14,
        },
        sellerRatingRow: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        sellerRatingText: {
            color: '#888',
            fontSize: 14,
            marginLeft: 4,
        },
        // --- Added styles below ---
        reviewContainer: {
            marginBottom: 12,
        },
        reviewRow: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
        },
        starsSection: {
            flex: 1,
        },
        stars: {
            // oude style voor sterren, nu niet meer gebruikt voor individuele sterren
            color: "#ffcc00",
            fontSize: 18,
        },
        starFilled: {
            color: "#ffcc00",
            fontSize: 20,
            marginRight: 2,
        },
        starEmpty: {
            color: "#ddd",
            fontSize: 20,
            marginRight: 2,
        },
        reviews: {
            fontSize: 13,
            color: "#888",
        },
    });
}