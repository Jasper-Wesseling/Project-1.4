import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image, SafeAreaView, ScrollView } from "react-native";
import { API_URL } from '@env';

export default function ProductModal({ visible, product, onClose, formatPrice }) {
    const [showOverige, setShowOverige] = useState(false);
    const [showReviews, setShowReviews] = useState(false);
    const [fullscreenImg, setFullscreenImg] = useState(false);

    if (!product) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.overlay}>
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
                        <Text style={styles.title}>{product.title}</Text>
                        <View style={styles.priceRow}>
                            <Text style={styles.price}>{formatPrice(product.price)}</Text>
                            <View style={styles.badge}><Text style={styles.badgeText}>{product.days_ago} days ago</Text></View>
                        </View>
                        {/* Stars and Reviews */}
                        <View style={styles.starsRow}>
                            <Text style={styles.stars}>★★★★★</Text>
                            <Text style={styles.reviewCount}>110 Reviews</Text>
                        </View>
                        {/* Buttons */}
                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={styles.outlineButton}><Text style={styles.outlineButtonText}>Add To Cart</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.filledButton}><Text style={styles.filledButtonText}>Buy Now</Text></TouchableOpacity>
                        </View>
                        {/* Details */}
                        <Text style={styles.sectionTitle}>Details</Text>
                        <Text style={styles.details}>{product.description}</Text>
                        {/* Overige (expandable) */}
                        <TouchableOpacity
                            style={styles.sectionRow}
                            onPress={() => setShowOverige(!showOverige)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.sectionTitle}>overige</Text>
                            <Text style={styles.sectionArrow}>{showOverige ? "▲" : "▼"}</Text>
                        </TouchableOpacity>
                        {showOverige && (
                            <Text style={styles.details}>
                                {/* Replace this with your actual "overige" content */}
                                Hier komt overige informatie over het product.
                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsam corporis vitae natus fuga ratione quasi laudantium deleniti non repellendus aperiam modi atque, suscipit aliquid veniam architecto. Voluptatem natus fugiat magni.
                                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nobis minima quam praesentium esse ab saepe, nam voluptate minus eum corporis similique in laboriosam expedita cum, sed asperiores nulla velit neque?
                                Lorem ipsum dolor sit, amet consectetur adipisicing elit. Odit earum minima, deleniti, dolore cumque rem fugiat officia excepturi eligendi rerum laborum provident temporibus necessitatibus, deserunt veritatis maxime illum magnam dolor.
                            </Text>
                        )}
                        {/* Reviews (expandable) */}
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
                                {/* Replace this with your actual reviews */}
                                Hier komen de reviews van het product.
                            </Text>
                        )}
                    </ScrollView>
                </View>
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

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: '#f4f5f7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        width: '92%',
        height: '100%',
        backgroundColor: '#fff',
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
    },
    imageContainer: {
        marginTop: 24,
        marginBottom: 16,
        width: 200,           // increased from 140
        height: 200,          // increased from 140
        borderRadius: 100,    // half of width/height
        backgroundColor: '#f4f5f7',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    },
    image: {
        width: 170,           // increased from 120
        height: 170,          // increased from 120
        borderRadius: 85,     // half of width/height
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#222',
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
        color: '#2A4BA0',
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
        color: '#222',
        fontSize: 16,
        marginTop: 10,
        marginBottom: 2,
        alignSelf: 'flex-start',
    },
    details: {
        color: '#8a94a6',
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
});