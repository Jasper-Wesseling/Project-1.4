import React, { useEffect, useRef, useState } from "react";
import { Animated, ScrollView, StyleSheet, Text, View, SafeAreaView, Pressable } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import ProductPreview from "./ProductPreview";
import LoadingScreen from "./LoadingScreen";

export default function Products() {
    const scrollY = useRef(new Animated.Value(0)).current;

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFilter, setSelectedFilter] = useState(null); // for filter selection

    useEffect(() => {
        // Login and fetch products ONCE
        fetch('http://192.168.2.7:8000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "username": "jasper.wesseling@student.nhlstenden.com",
                "password": "wesselingjasper",
                "full_name": "Jasper Wesseling"
            })
        })
        .then(res => res.json())
        .then(data => {
            const token = data.token || data.access_token;
            if (token) {
                fetch('http://192.168.2.7:8000/api/products/get', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                .then(res => res.json())
                .then(products => {
                    setProducts(products);
                    setLoading(false);
                });
            }
        });
    }, []);

    // Animated header height (from 150 to 0)
    const headerHeight = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [150, 0],
        extrapolate: "clamp",
    });

    // Animated filter row top position (starts at 100+150, ends at 100)
    const filterTop = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [210, 100], // Adjusted to match the header height
        extrapolate: "clamp",
    });

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 40],
        outputRange: [1, 0],
        extrapolate: "clamp",
    });

    // Helper: Only enable buttons if opacity > 0.5
    const [buttonsEnabled, setButtonsEnabled] = useState(false);

    useEffect(() => {
        const listener = scrollY.addListener(({ value }) => {
            setButtonsEnabled(value >= 90); // adjust threshold as needed
        });
        return () => scrollY.removeListener(listener);
    }, [scrollY]);

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Agenda Button */}
            <Pressable
                style={styles.agendaButton}
                onPress={() => console.log('View Agenda Pressed')}
            >
                <Text style={styles.agendaButtonText}>View Agenda</Text>
                <MaterialIcons name="event" size={20} color="white" />
            </Pressable>
            <View style={styles.container}>
                {/* Static Top Bar */}
                <View style={styles.topBar}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={{ color: "#fff", fontSize: 24, fontWeight: "bold" }}>Hey, Username</Text>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ color: "#fff" }}>Icon1</Text>
                            <Text style={{ color: "#fff" }}>Icon2</Text>
                        </View>
                    </View>
                </View>
                {/* Animated Header */}
                <Animated.View style={[styles.header, { height: headerHeight }]}>
                    <Animated.Text style={{opacity: headerOpacity, alignSelf: 'flex-start', color: "white", fontWeight: '300',fontSize: 64}}>Discover</Animated.Text>
                    <Animated.Text style={{opacity: headerOpacity, alignSelf: 'flex-start', color: "white", fontWeight: 'bold', fontSize: 64}}>By Company</Animated.Text>
                </Animated.View>
                {/* Sticky Filter Row */}
                <Animated.View style={[styles.filterRow, { top: filterTop }]}>
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
                        <View key={index} style={styles.dayContainer}>
                            <View style={styles.dayBlob}>
                                <Text style={styles.dayText}>{day}</Text>
                                <Text style={styles.dayNumber}>{index + 1}</Text> 
                            </View>
                        </View>
                    ))}
                </Animated.View>
                {/* Scrollable Content */}
                {!loading ? 
                <Animated.ScrollView
                    // contentContainerStyle={{ paddingTop: 300 }} // 100(topBar) + 150(header) + 50(filterRow)
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: false }
                    )}
                    scrollEventThrottle={16}
                >
                    {products.map((product) => (
                    <ProductPreview key={product.id} product={product} />
                    ))}
                </Animated.ScrollView>
                :
                <View style={{ paddingTop: 275, alignItems: 'center' }}> {/* Adjusted paddingTop to move events up */}
                    <View style={styles.eventBox}>
                        <Text style={styles.eventTitle}>Event 1</Text>
                        <Text style={styles.eventDescription}>Meeting with Team</Text>
                    </View>
                    <View style={styles.eventBox}>
                        <Text style={styles.eventTitle}>Event 2</Text>
                        <Text style={styles.eventDescription}>Project Deadline</Text>
                    </View>
                    <View style={styles.eventBox}>
                        <Text style={styles.eventTitle}>Event 3</Text>
                        <Text style={styles.eventDescription}>Client Presentation</Text>
                    </View>
                    <View style={styles.eventBox}>
                        <Text style={styles.eventTitle}>Event 4</Text>
                        <Text style={styles.eventDescription}>Workshop</Text>
                    </View>
                </View>
                }
                
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#2A4BA0", 
    },
    container: {
        flex: 1,
        backgroundColor: "#fff",
        marginBottom: -100, // to avoid overlap with agenda button
    },
    topBar: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 50,
        backgroundColor: "#2A4BA0",
        justifyContent: "center",
        paddingHorizontal: 16,
        zIndex: 20,
    },
    header: {
        position: "absolute",
        top: 50, 
        left: 0,
        right: 0,
        backgroundColor: '#2A4BA0',
        justifyContent: "center",
        alignItems: "flex-start",
        paddingHorizontal: 16,
        zIndex: 10,
    },
    filterRow: {
        position: "absolute",
        top: 10, 
        left: "5%", 
        right: "5%", 
        flexDirection: "row",
        justifyContent: "space-around", 
        alignItems: "center",
        zIndex: 15,        
        backgroundColor: "#F9B023", 
        borderRadius: 20, 
    },
    dayContainer: {
        alignItems: "center",
    },
    dayBlob: {
        borderRadius: 20, 
        paddingVertical: 10,
        paddingHorizontal: 15,
        alignItems: "center",
    },
    dayText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#fff", 
    },
    dayNumber: {
        fontSize: 12,
        color: "red", 
    },
    agendaButton: {
        position: "absolute",
        bottom: 30, 
        right: 10, 
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F9B023", 
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
        zIndex: 30,
    },
    agendaButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
        marginRight: 5,
    },
    eventBox: {
        width: '90%',
        backgroundColor: '#f0f0f0', // Light gray background
        padding: 15,
        marginVertical: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3, // For Android shadow
    },
    eventTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    eventDescription: {
        fontSize: 14,
        color: '#555',
        marginTop: 5,
    },
});