import React, { useCallback, useRef, useState } from "react";
import { Animated, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import ProductPreview from "./ProductPreview";
import { API_URL } from '@env';
import { Icon } from "react-native-elements";
import SearchBar from "./SearchBar";
import ProductModal from "./ProductModal";
import { useFocusEffect } from "@react-navigation/native";
import { themes } from "./LightDarkComponent";

export default function Products({ navigation, token, user, onLogout, setUserToChat, theme }) {
    const scrollY = useRef(new Animated.Value(0)).current;
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [searchModalVisible, setSearchModalVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMorePages, setHasMorePages] = useState(true);

    const safeTheme =
        typeof theme === "object" && theme
            ? theme
            : typeof theme === "string" && themes[theme]
                ? themes[theme]
                : themes.light;

    if (!safeTheme) return null;

    const styles = createProductsStyles(safeTheme);

    // Filters should match your backend's product categories
    const filters = ['Boeken', 'Electra', 'Huis en tuin'];
    const [activeFilters, setActiveFilters] = useState([]);

    const fetchAll = async (pageToLoad = 1, append = false, searchValue = search, filterValues = activeFilters) => {
        try {
            if (!token) {
                setLoading(false);
                return;
            }
            let query = `?page=${pageToLoad}`;
            if (searchValue) query += `&search=${encodeURIComponent(searchValue)}`;
            if (filterValues.length > 0) query += `&category=${encodeURIComponent(filterValues.join(','))}`;

            const productsRes = await fetch(API_URL + `/api/products/get${query}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!productsRes.ok) throw new Error("Products fetch failed");

            const productsData = await productsRes.json();

            setHasMorePages(productsData.length === 20);
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
            fetchAll(1, false, search, activeFilters);
        }, [search, activeFilters, token])
    );

    const loadMore = () => {
        if (hasMorePages && !loading) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchAll(nextPage, true, search, activeFilters);
        }
    };

    // Animated header height (from 150 to 0)
    const headerHeight = scrollY.interpolate({
        inputRange: [0, 249],
        outputRange: [166, 0],
        extrapolate: "clamp",
    });

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 40],
        outputRange: [1, 0],
        extrapolate: "clamp",
    });

    const stickyBarMarginTop = headerHeight.interpolate({
        inputRange: [0, 166],
        outputRange: [120, 290],
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

    // TEMP: Logout function for testing
    const tempLogout = async () => {
        if (onLogout) {
            await onLogout();
        }
    };

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
                <View style={styles.topBarRow}>
                    <Text style={styles.topBarText}>{`Hey, ${name}`}</Text>
                    <View style={styles.topBarIcons}>
                        <TouchableOpacity onPress={tempLogout}>
                            <Icon name="trophy" type="ionicon" size={32} color="#fff"/>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('AddProduct')}>
                            <Icon name="plus" type="feather" size={34} color="#fff"/>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('EditProducts')}>
                            <Icon name="cog" type="material-community" size={34} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('ChatOverview')}>
                            <Icon name="chat" type="material-community" size={32} color="#fff"/>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            {/* Animated Header */}
            <Animated.View style={[styles.header, { height: headerHeight }]}>
                <Animated.Text style={[styles.headerText, {opacity: headerOpacity}]}>Shop</Animated.Text>
                <Animated.Text style={[styles.headerText, {opacity: headerOpacity}]}>By Category</Animated.Text>
            </Animated.View>
            {/* StickyBar met zoekbalk en filters */}
            <Animated.View style={[styles.stickyBar, { marginTop: stickyBarMarginTop }]}>
                {/* Zoekbalk */}
                <View style={styles.searchBarInner}>
                    <Icon type="Feather" name="search" size={22} color="#A0A0A0" style={styles.searchIcon} />
                    <TextInput
                        placeholder="Zoek producten"
                        value={search}
                        onChangeText={setSearch}
                        style={styles.searchBarInput}
                        placeholderTextColor="#A0A0A0"
                    />
                </View>
                {/* Filters */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterScrollContent}
                    style={{ marginVertical: 8, marginHorizontal: 12 }}
                >
                    {filters.map((filter, i) => {
                        const isActive = activeFilters.includes(filter);
                        return (
                            <TouchableOpacity
                                key={i}
                                onPress={() => {
                                    setActiveFilters(prev =>
                                        isActive
                                            ? prev.filter(f => f !== filter)
                                            : [...prev, filter]
                                    );
                                }}
                            >
                                <Text style={[styles.filter, isActive ? styles.activeFilter : null]}>
                                    {filter}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
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
                productUserName={selectedProduct?.product_username}
            />
        </View>
    );
}

function createProductsStyles(theme) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background
        },
        topBar: {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 100,
            backgroundColor: theme.headerBg,
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
            color: theme.headerText,
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
            backgroundColor: theme.headerBg,
            justifyContent: "center",
            alignItems: "flex-start",
            paddingHorizontal: 16,
            zIndex: 10,
        },
        headerText: {
            alignSelf: 'flex-start',
            color: theme.headerText,
            fontSize: 64,
        },
        stickyBar: {
            backgroundColor: theme.background,
            zIndex: 5,
            paddingBottom: 0,
            paddingHorizontal: 0,
            borderBottomWidth: 1,
            borderBottomColor: theme.stickyBarBorder,
        },
        searchBarInner: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: theme.searchBg,
            borderRadius: 16,
            paddingHorizontal: 16,
            paddingVertical: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.10,
            shadowRadius: 8,
            elevation: 5,
            marginHorizontal: 16,
            marginTop: 0,
        },
        searchBarInput: {
            flex: 1,
            fontSize: 16,
            backgroundColor: "transparent",
            borderWidth: 0,
            paddingVertical: 0,
            color: theme.text,
        },
        filterScrollContent: {
            alignItems: "center",
            backgroundColor: theme.filterRowBg,
        },
        filter: {
            paddingHorizontal: 12,
            marginHorizontal: 4,
            paddingVertical: 7,
            borderWidth: 1,
            borderColor: theme.filterBorder,
            borderRadius: 100,
            backgroundColor: theme.filterBg,
            color: theme.filterText,
        },
        activeFilter: {
            backgroundColor: theme.activeFilter,
            borderColor: theme.activeFilterBorder,
            color: theme.activeFilterText,
        },
        scrollViewContent: {
            paddingTop: 16,
            paddingBottom: 80,
        },
        loadingText: {
            paddingTop: 300,
            fontSize: 64,
            color: theme.text,
            alignSelf: 'center'
        }
    });
}