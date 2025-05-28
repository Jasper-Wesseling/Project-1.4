import React, { useCallback, useRef, useState } from "react";
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ProductPreview from "./ProductPreview";
import { API_URL } from '@env';
import { Icon } from "react-native-elements";
import SearchBar from "./SearchBar";
import ProductModal from "./ProductModal";
import { useFocusEffect } from "@react-navigation/native";
import ChatOverview from "./ChatOverview";

// Accept token and user as props
export default function Products({ navigation, token, user, setUserToChat }) {
    const scrollY = useRef(new Animated.Value(0)).current;
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [searchModalVisible, setSearchModalVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMorePages, setHasMorePages] = useState(true);

    // Filters should match your backend's product categories
    const filters = ['Boeken', 'Electra', 'Huis en tuin'];
    const [activeFilter, setActiveFilter] = useState(null);

    const fetchAll = async (pageToLoad = 1, append = false, searchValue = search, filterValue = activeFilter) => {
        try {
            if (!token) {
                setLoading(false);
                return;
            }
            // Build query params for search and filter
            let query = `?page=${pageToLoad}`;
            if (searchValue) query += `&search=${encodeURIComponent(searchValue)}`;
            if (filterValue) query += `&category=${encodeURIComponent(filterValue)}`;

            // Fetch product
            const productsRes = await fetch(API_URL + `/api/products/get${query}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!productsRes.ok) throw new Error("Products fetch failed");

            const productsData = await productsRes.json();

            setHasMorePages(productsData.length === 20); // If less than limit, no more data
            setProducts(prev =>
                append
                    ? [...prev, ...productsData.filter(p => !prev.some(existing => existing.id === p.id))]
                    : productsData
            );
            setLoading(false);
        } catch (err) {
            console.error("API error:", err);
            setLoading(false);
        }
    };
    useFocusEffect(
        useCallback(() => {
            setPage(1);
            fetchAll(1, false, search, activeFilter);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [search, activeFilter, token])
    );

    const loadMore = () => {
        if (hasMorePages && !loading) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchAll(nextPage, true, search, activeFilter);
        }
    };

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

    const name = user && user.full_name ? user.full_name.split(' ')[0] : "";

    let priceFormat = new Intl.NumberFormat('nl-NL', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2
    });

    function formatPrice(price) {
        return price ? priceFormat.format(price / 100): '';
    }

    return (
        <View style={styles.container}>
            <View style={styles.container}>
                <SearchBar
                    visible={searchModalVisible}
                    value={search}
                    onChange={setSearch}
                    onClose={() => setSearchModalVisible(false)}
                />
                {/* Static Top Bar */}
                <View style={styles.topBar}>
                    <View style={styles.topBarRow}>
                        <Text style={styles.topBarText}>{`Hey, ${name}`}</Text>
                        <View style={styles.topBarIcons}>
                            <TouchableOpacity onPress={() => navigation.navigate('AddProduct')}>
                                <Icon name="plus" type="feather" size={34} color="#fff"/>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {setSearchModalVisible(true)}}>
                                <Icon name="search" size={34} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => navigation.navigate('ChatOverview')}>
                                <Icon name="bag-outline" type="ionicon" size={32} color="#fff"/>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                {/* Animated Header */}
                <Animated.View style={[styles.header, { height: headerHeight }]}>
                    <Animated.Text style={[styles.headerText, {opacity: headerOpacity}]}>Shop</Animated.Text>
                    <Animated.Text style={[styles.headerText, {opacity: headerOpacity}]}>By Catagory</Animated.Text>
                </Animated.View>
                {/* Sticky Filter Row  */}
                <Animated.View style={[
                    styles.filterRow,
                    { top: filterTop, height: 50 }
                ]}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filterScrollContent}
                    >
                        {filters.map((filter, i) => (
                            <TouchableOpacity key={i} onPress={() => setActiveFilter(activeFilter === filter ? null : filter)}>
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
                    contentContainerStyle={styles.scrollViewContent}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: false }
                    )}
                    scrollEventThrottle={16}
                    onScrollEndDrag={loadMore}
                >

                    {products.map(product => (
                        <TouchableOpacity
                            key={product.id}
                            activeOpacity={0.8}
                            onPress={() => {
                                setSelectedProduct(product);
                                setModalVisible(true);
                            }}
                        >
                            <ProductPreview product={product} formatPrice={formatPrice}/>
                        </TouchableOpacity>
                    ))}
                </Animated.ScrollView>
                :
                <Text style={styles.loadingText}>Loading...</Text>}
                <ProductModal
                    visible={modalVisible}
                    product={selectedProduct}
                    onClose={() => setModalVisible(false)}
                    formatPrice={formatPrice}
                    navigation={navigation}
                    setUserToChat={setUserToChat}
                    productUser={selectedProduct?.user_id}
                />
            </View>
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
    topBarRow: {
        flexDirection: "row",
        justifyContent: "space-between"
    },
    topBarText: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "bold"
    },
    topBarIcons: {
        flexDirection: 'row',
        width: 125,
        justifyContent: 'space-around',
        alignContent: 'center'
    },
    header: {
        position: "absolute",
        top: 100,
        left: 0,
        right: 0,
        backgroundColor: '#2A4BA0',
        justifyContent: "center",
        alignItems: "flex-start",
        paddingHorizontal: 16,
        zIndex: 10,
    },
    headerText: {
        alignSelf: 'flex-start',
        color: "white",
        fontSize: 64,
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
    filterScrollContent: {
        alignItems: "center"
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
    scrollViewContent: {
        paddingTop: 300,
        paddingBottom: 40,
    },
    loadingText: {
        paddingTop: 300,
        fontSize: 64,
        color: 'black',
        alignSelf: 'center'
    }
});