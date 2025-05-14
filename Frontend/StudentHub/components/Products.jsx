import React, { useEffect, useRef, useState } from "react";
import { Animated, ScrollView, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import ProductPreview from "./ProductPreview";
import LoadingScreen from "./LoadingScreen";

export default function Products() {
    const scrollY = useRef(new Animated.Value(0)).current;

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

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
        outputRange: [250, 100], // 100 is top bar height, 150 is max header height
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
                <Animated.Text style={{opacity: headerOpacity, alignSelf: 'flex-start', color: "white", fontSize: 64}}>Shop</Animated.Text>
                <Animated.Text style={{opacity: headerOpacity, alignSelf: 'flex-start', color: "white", fontSize: 64}}>By Catagory</Animated.Text>
            </Animated.View>
            {/* Sticky Filter Row */}
            <Animated.View style={[
                styles.filterRow,
                { top: filterTop, height: 50 }
            ]}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ alignItems: "center" }}
                >
                    {Array.from({ length: 80 }).map((_, i) => (
                        <Text style={styles.filter} key={i}>doei</Text>
                    ))}
                </ScrollView>
            </Animated.View>
            {/* Scrollable Content */}
            {!loading ? 
            <Animated.ScrollView
                contentContainerStyle={{ paddingTop: 300 }} // 100(topBar) + 150(header) + 50(filterRow)
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
            <Text style={{ paddingTop: 300, fontSize: 64, color: 'black', alignSelf: 'center' }}>Loading...</Text>}
            
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff"
    },
    topBar: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 100,
        backgroundColor: "#2A4BA0",
        justifyContent: "center",
        paddingTop: 25,
        paddingHorizontal: 16,
        zIndex: 20,
    },
    header: {
        position: "absolute",
        top: 100, // below topBar
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
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        flexDirection: "row",
        alignItems: "center",
        zIndex: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        gap: 10,
        flex: 1,
    },
    filter: {
        paddingHorizontal: 10,
        marginHorizontal: 10,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: 'grey',
        borderRadius: 10,
    },
});