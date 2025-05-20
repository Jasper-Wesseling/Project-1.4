import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Modal, Button } from "react-native";
import ProductPreview from "./ProductPreview";
import { API_URL } from '@env';
import { useFocusEffect } from "@react-navigation/native";
import { Icon } from "react-native-elements";
import SearchBar from "./SearchBar";
import ProductModal from "./ProductModal";

// Accept token and user as props
export default function Products({ navigation, token, user }) {

    const scrollY = useRef(new Animated.Value(0)).current;
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [searchModalVisible, setSearchModalVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    useFocusEffect(
        useCallback(() => {
            async function fetchAll() {
                if (!token) {
                    setLoading(false);
                    return;
                }
                try {
                    // Only fetch products, not user
                    const productsRes = await fetch(API_URL + '/api/products/get', {
                        method: 'GET',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (!productsRes.ok) throw new Error("Products fetch failed");
                    const products = await productsRes.json();
                    setProducts(products);
                    setLoading(false);
                } catch (err) {
                    console.error("API error:", err);
                    setLoading(false);
                }
            }
            fetchAll();
        }, [token])
    );


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


    const name = user && user.full_name ? user.full_name.split(' ')[0] : "";

    const filters = ['Boeken', 'Electra', 'Huis en tuin'];

    const [activeFilter, setActiveFilter] = useState(null);



    return (
        <View style={styles.container}>
            <SearchBar
            visible={searchModalVisible}
            value={search}
            onChange={setSearch}
            onClose={() => setSearchModalVisible(false)}
            />
            {/* Static Top Bar */}
            <View style={styles.topBar}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ color: "#fff", fontSize: 24, fontWeight: "bold" }}>{!loading ? `Hey, ${name}` : null}</Text>
                    <View style={{ flexDirection: 'row', width: 125, justifyContent: 'space-around', alignContent: 'center'}}>
                        <TouchableOpacity onPress={() => navigation.navigate('AddProduct')}>
                            <Icon name="plus" type="feather" size={34} color="#fff"/>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {setSearchModalVisible(true)}}>
                            <Icon name="search" size={34} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity><Icon name="bag-outline" type="ionicon" size={32} color="#fff"/></TouchableOpacity>
                    </View>
                </View>
            </View>
            {/* Animated Header */}
            <Animated.View style={[styles.header, { height: headerHeight }]}>
                <Animated.Text style={{opacity: headerOpacity, alignSelf: 'flex-start', color: "white", fontSize: 64}}>Shop</Animated.Text>
                <Animated.Text style={{opacity: headerOpacity, alignSelf: 'flex-start', color: "white", fontSize: 64}}>By Catagory</Animated.Text>
            </Animated.View>
            {/* Sticky Filter Row  */}
            <Animated.View style={[
                styles.filterRow,
                { top: filterTop, height: 50 }
            ]}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ alignItems: "center" }}
                >
                    {filters.map((filter, i) => (
                        <TouchableOpacity key={i} onPress={() => setActiveFilter(activeFilter === filter ? null : filter)}
                        >
                            <Text style={[styles.filter, activeFilter === filter ? styles.activeFilter : null]}>
                                {filter}
                            </Text>
                        </TouchableOpacity>
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
                {products
                    .filter(product =>
                        (!activeFilter || product.study_tag === activeFilter) &&
                        product.title.toLowerCase().includes(search.toLowerCase())
                    )
                    .map(product => (
                        <TouchableOpacity
                            key={product.id}
                            onPress={() => {
                                setSelectedProduct(product);
                                setModalVisible(true);
                            }}
                        >
                            <ProductPreview product={product} />
                        </TouchableOpacity>
                ))}
            </Animated.ScrollView>
            :
            <Text style={{ paddingTop: 300, fontSize: 64, color: 'black', alignSelf: 'center' }}>Loading...</Text>}
            <ProductModal
                visible={modalVisible}
                product={selectedProduct}
                onClose={() => setModalVisible(false)}
            />
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
        marginHorizontal: 8,
        paddingVertical: 7,
        borderWidth: 1,
        borderColor: 'grey',
        borderRadius: 100,
    },
    activeFilter: {
        backgroundColor: '#FFC83A'
    },
});