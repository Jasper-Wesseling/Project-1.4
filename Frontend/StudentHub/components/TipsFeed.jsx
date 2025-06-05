import React, { useEffect, useState, useRef, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView, TextInput, Animated } from "react-native";
import { API_URL } from "@env";
import TipCard from "./TipCard";
import TipModal from "./TipModal";
import { Icon } from "react-native-elements";
import { useFocusEffect, useRoute } from "@react-navigation/native";

const FILTERS = ["aap", "banketstaaf", "Vlaflip", "Tech", "Overig"];
const PAGE_SIZE = 10;

export default function TipsFeed({ token, user, navigation }) {
    const [tips, setTips] = useState([]);
    const [search, setSearch] = useState("");
    const [activeFilters, setActiveFilters] = useState([]);
    const [sort, setSort] = useState({ field: "created_at", order: "desc" });
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [allLoaded, setAllLoaded] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedTip, setSelectedTip] = useState(null);

    const viewabilityConfig = { itemVisiblePercentThreshold: 50 };
    const loadingMoreRef = useRef(false);
    const flatListRef = useRef(null);
    const name = user && user.full_name ? user.full_name.split(' ')[0] : "";

    const scrollY = useRef(new Animated.Value(0)).current;

    const headerHeight = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [150, 0],
        extrapolate: "clamp",
    });

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

    const stickyBarMarginTop = headerHeight.interpolate({
        inputRange: [0, 166],
        outputRange: [100, 266],
        extrapolate: "clamp",
    });

    const route = useRoute();

    useFocusEffect(
        React.useCallback(() => {
            // Haal altijd opnieuw de forums op als je terugkomt op deze pagina
            setTips([]);
            setPage(1);
            setAllLoaded(false);
            fetchTips(1, true);
            // Scroll eventueel naar boven
            if (flatListRef.current) {
                flatListRef.current.scrollToOffset({ offset: 0, animated: false });
            }
            scrollY.setValue(0);

            // Open eventueel de modal als er een openTipId is
            if (route.params?.openTipId) {
                fetchTipById(route.params.openTipId).then(tip => {
                    setSelectedTip(tip);
                    setModalVisible(true);
                    navigation.setParams({ openTipId: null });
                });
            }
        }, [route.params?.openTipId, activeFilters, sort, search])
    );

    const fetchTips = useCallback(async (pageToLoad = 1, reset = false) => {
        setLoading(true);
        let url = `${API_URL}/api/forums/get?sort=${sort.field}&order=${sort.order}&limit=${PAGE_SIZE}&offset=${(pageToLoad - 1) * PAGE_SIZE}`;
        if (activeFilters.length === 1) url += `&category=${encodeURIComponent(activeFilters[0])}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (Array.isArray(data)) {
            if (reset) {
                setTips(data);
            } else {
                setTips(prev => [
                    ...prev,
                    ...data.filter(newTip => !prev.some(tip => tip.id === newTip.id))
                ]);
            }
            if (data.length < PAGE_SIZE) {
                setAllLoaded(true);
            } else {
                setAllLoaded(false);
            }
        } else {
            setAllLoaded(true);
        }
        setLoading(false);
    }, [activeFilters, sort, search, token]);

    const onViewableItemsChanged = useRef(({ viewableItems }) => {
        if (
            !loading &&
            !allLoaded &&
            tips.length >= PAGE_SIZE &&
            !loadingMoreRef.current &&
            viewableItems.some(item => item.index === 6)
        ) {
            loadingMoreRef.current = true;
            fetchTips(page + 1);
            setPage(p => p + 1);
        }
    }).current;

    useEffect(() => {
        loadingMoreRef.current = false;
    }, [tips]);

    const handleEndReached = () => {
        if (!loading && !allLoaded && tips.length >= PAGE_SIZE * page) {
            fetchTips(page + 1);
            setPage(p => p + 1);
        }
    };

    function toggleFilter(filter) {
        setActiveFilters(f =>
            f.includes(filter) ? f.filter(x => x !== filter) : [...f, filter]
        );
    }

    function toggleSort(field) {
        setSort(s => ({
            field,
            order: s.field === field && s.order === "desc" ? "asc" : "desc"
        }));
    }

    const fetchTipById = async (id) => {
        const res = await fetch(`${API_URL}/api/forums/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return await res.json();
    };

    const handleLike = async (action = "like") => {
        if (!selectedTip) return;
        await fetch(`${API_URL}/api/forums/${selectedTip.id}/like`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ action })
        });
        const updatedTip = await fetchTipById(selectedTip.id);
        setSelectedTip(updatedTip);
        setTips(tips => tips.map(t => t.id === updatedTip.id ? updatedTip : t));
        return updatedTip;
    };

    const handleDislike = async (action = "dislike") => {
        if (!selectedTip) return;
        await fetch(`${API_URL}/api/forums/${selectedTip.id}/dislike`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({ action })
        });
        const updatedTip = await fetchTipById(selectedTip.id);
        setSelectedTip(updatedTip);
        setTips(tips => tips.map(t => t.id === updatedTip.id ? updatedTip : t));
        return updatedTip;
    };

    const handleReplyLike = async (tipId, replyIdx, action = "like") => {
        await fetch(`${API_URL}/api/forums/${tipId}/reply-vote`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                reply_index: replyIdx,
                vote: action === "undo" ? "undo-up" : "up"
            })
        });
        const updatedTip = await fetchTipById(tipId);
        setSelectedTip(updatedTip);
        setTips(tips => tips.map(t => t.id === updatedTip.id ? updatedTip : t));
        return updatedTip;
    };

    const handleReplyDislike = async (tipId, replyIdx, action = "dislike") => {
        await fetch(`${API_URL}/api/forums/${tipId}/reply-vote`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                reply_index: replyIdx,
                vote: action === "undo" ? "undo-down" : "down"
            })
        });
        const updatedTip = await fetchTipById(tipId);
        setSelectedTip(updatedTip);
        setTips(tips => tips.map(t => t.id === updatedTip.id ? updatedTip : t));
        return updatedTip;
    };

    function handleTipPress(tip) {
        setSelectedTip(tip);
        setModalVisible(true);
    }

    function renderTipCard({ item }) {
        return (
            <TipCard
                tip={item}
                onPress={() => handleTipPress(item)}
            />
        );
    }

    return (
        <View style={styles.container}>
            {/* Static Top Bar */}
            <View style={styles.topBar}>
                <View style={styles.topBarRow}>
                    <Text style={styles.topBarText}>{`Hey, ${name}`}</Text>
                    <View style={styles.topBarIcons}>
                        <TouchableOpacity onPress={() => navigation.navigate("AddForum")}>
                            <Icon name="plus" type="feather" size={34} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <Icon name="search" size={34} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <Icon name="trophy" type="ionicon" size={32} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <Icon name="bag-outline" type="ionicon" size={32} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            {/* Animated Header */}
            <Animated.View style={[styles.header, { height: headerHeight }]}>
                <Animated.Text style={[styles.headerText, { opacity: headerOpacity }]}>
                    The Forum
                </Animated.Text>
                <Animated.Text style={[styles.headerText, { opacity: headerOpacity }]}>
                    By Everyone
                </Animated.Text>
            </Animated.View>
            {/* Sticky Filter Row */}
            <Animated.View style={[
                styles.filterRow,
                { top: filterTop, height: 50 }
            ]}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterScrollContent}
                >
                    {FILTERS.map((filter, i) => (
                        <TouchableOpacity key={i} onPress={() => toggleFilter(filter)}>
                            <Text style={[
                                styles.filter,
                                activeFilters.includes(filter) ? styles.activeFilter : null
                            ]}>
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </Animated.View>
            {/* Scrollable Content */}
            {loading && tips.length === 0 ? (
                <View style={{ marginTop: 40 }}>
                    {[...Array(3)].map((_, i) => (
                        <View key={i} style={{
                            backgroundColor: "#f3f3f3",
                            borderRadius: 16,
                            marginHorizontal: 16,
                            marginVertical: 8,
                            padding: 16,
                            minHeight: 110,
                            opacity: 0.7
                        }}>
                            <View style={{ width: 120, height: 16, backgroundColor: "#e0e0e0", borderRadius: 8, marginBottom: 8 }} />
                            <View style={{ width: "80%", height: 12, backgroundColor: "#e0e0e0", borderRadius: 8, marginBottom: 8 }} />
                            <View style={{ width: "60%", height: 12, backgroundColor: "#e0e0e0", borderRadius: 8, marginBottom: 16 }} />
                            <View style={{ flexDirection: "row", gap: 8 }}>
                                <View style={{ width: 60, height: 24, backgroundColor: "#e0e0e0", borderRadius: 12, marginRight: 8 }} />
                                <View style={{ width: 60, height: 24, backgroundColor: "#e0e0e0", borderRadius: 12 }} />
                            </View>
                        </View>
                    ))}
                </View>
            ) : tips.length === 0 ? (
                <Text style={{ textAlign: "center", marginTop: 40, color: "#000" }}>Geen tips gevonden</Text>
            ) : (
                <>
                    <Animated.FlatList
                        ref={flatListRef}
                        data={tips}
                        keyExtractor={item => `tip-${item.id}`}
                        renderItem={renderTipCard}
                        contentContainerStyle={{
                            paddingTop: 300, // 100(topBar) + 150(header) + 50(filterRow)
                            paddingBottom: 16,
                            paddingHorizontal: 0 // geen extra padding, net als Products
                        }}
                        onScroll={Animated.event(
                            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                            { useNativeDriver: false }
                        )}
                        scrollEventThrottle={16}
                        onEndReached={handleEndReached}
                        onEndReachedThreshold={0.2}
                        onViewableItemsChanged={onViewableItemsChanged}
                        viewabilityConfig={viewabilityConfig}
                        ListFooterComponent={
                            allLoaded && tips.length > 0 ? (
                                <Text style={{ textAlign: "center", color: "#000" }}>
                                    Je hebt elke post gezien
                                </Text>
                            ) : null
                        }
                    />
                    <TipModal
                        visible={modalVisible}
                        tip={selectedTip}
                        user={user}
                        onClose={() => setModalVisible(false)}
                        onLike={handleLike}
                        onDislike={handleDislike}
                        onReplyLike={(idx, action) => handleReplyLike(selectedTip.id, idx, action)}
                        onReplyDislike={(idx, action) => handleReplyDislike(selectedTip.id, idx, action)}
                    />
                </>
            )}
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