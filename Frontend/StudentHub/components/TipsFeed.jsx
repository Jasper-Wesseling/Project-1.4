import React, { useEffect, useState, useRef, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView, TextInput, Animated } from "react-native";
import { API_URL } from "@env";
import TipCard from "./TipCard";
import TipModal from "./TipModal";
import { Icon } from "react-native-elements";

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
        outputRange: [100, 266],
        extrapolate: "clamp",
    });

    useEffect(() => {
        setTips([]);
        setPage(1);
        setAllLoaded(false);
        fetchTips(1, true);
        if (flatListRef.current) {
            flatListRef.current.scrollToOffset({ offset: 0, animated: false });
        }
        scrollY.setValue(0);
    }, [activeFilters, sort, search, modalVisible]);

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
                <Text style={styles.topBarTitle}>{`Hey, ${name}`}</Text>
            </View>
            {/* Animated Header */}
            <Animated.View style={[styles.header, { height: headerHeight }]}>
                <Animated.Text style={[styles.headerText, { opacity: headerOpacity }]}>
                    The Forum
                </Animated.Text>
                <Animated.Text style={[styles.headerTextBold, { opacity: headerOpacity }]}>
                    By Everyone
                </Animated.Text>
            </Animated.View>
            {/* Sticky zoekbalk + filters */}
            <Animated.View style={[styles.stickyBar, { marginTop: stickyBarMarginTop }]}>
                <View style={styles.searchRow}>
                    <View style={styles.searchBar}>
                        <Icon type="Feather" name="search" size={20} color="#A0A0A0" style={{ marginRight: 8 }} />
                        <TextInput
                            placeholder="Search for a post"
                            value={search}
                            onChangeText={setSearch}
                            style={styles.searchInput}
                            placeholderTextColor="#A0A0A0"
                        />
                    </View>
                    <TouchableOpacity style={styles.createBtn} onPress={() => navigation.navigate("AddForum")}>
                        <Text style={styles.createBtnText}>Create post</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.filterRow}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ flexGrow: 1, paddingRight: 12 }}
                        style={{ flex: 1, minWidth: 0 }}
                    >
                        {FILTERS.map(filter => (
                            <TouchableOpacity
                                key={filter}
                                style={[
                                    styles.filterBtn,
                                    activeFilters.includes(filter) && styles.filterBtnActive
                                ]}
                                onPress={() => toggleFilter(filter)}
                            >
                                <Text style={[
                                    styles.filterBtnText,
                                    activeFilters.includes(filter) && styles.filterBtnTextActive
                                ]}>{filter}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <View style={styles.sortBtns}>
                        <TouchableOpacity onPress={() => toggleSort("likes")}>
                            <Text style={{
                                color: sort.field === "likes" ? "#2A4BA0" : "#888",
                                fontWeight: "bold",
                                marginRight: 8,
                                minWidth: 60,
                                textAlign: "center",
                                flexDirection: "row",
                                alignItems: "center",
                            }}>
                                Likes
                                <Text style={{ width: 16, display: "inline-block" }}>
                                    {sort.field === "likes" ? (sort.order === "asc" ? " ▲" : " ▼") : " "}
                                </Text>
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => toggleSort("created_at")}>
                            <Text style={{
                                color: sort.field === "created_at" ? "#2A4BA0" : "#888",
                                fontWeight: "bold",
                                minWidth: 60,
                                textAlign: "center",
                                flexDirection: "row",
                                alignItems: "center",
                            }}>
                                Datum
                                <Text style={{ width: 16, display: "inline-block" }}>
                                    {sort.field === "created_at" ? (sort.order === "asc" ? " ▲" : " ▼") : " "}
                                </Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>
            {/* Scrollbare feed */}
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
                        contentContainerStyle={{ paddingBottom: 16, paddingTop: 8 }}
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

// ...styles blijven ongewijzigd...

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
    topBarTitle: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "bold",
    },
    header: {
        position: "absolute",
        top: 100,
        left: 0,
        right: 0,
        backgroundColor: "#2A4BA0",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingHorizontal: 16,
        zIndex: 10,
    },
    headerText: {
        color: "#fff",
        fontSize: 64,
        fontWeight: "300",
    },
    headerTextBold: {
        color: "#fff",
        fontSize: 64,
        fontWeight: "bold",
    },
    stickyBar: {
        backgroundColor: "#fff",
        zIndex: 5,
        paddingBottom: 8,
        paddingTop: 8,
        paddingHorizontal: 0,
    },
    searchRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
        marginHorizontal: 16,
    },
    searchBar: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 24,
        borderWidth: 1,
        borderColor: "#E0E0E0",
        paddingHorizontal: 16,
        marginRight: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: "#222",
    },
    createBtn: {
        backgroundColor: "#FFC83A",
        borderRadius: 24,
        paddingHorizontal: 18,
        paddingVertical: 10,
    },
    createBtnText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    filterRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
        marginHorizontal: 8,
    },
    filterBtn: {
        backgroundColor: "#fff",
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 7,
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: "#2A4BA0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 1,
    },
    filterBtnActive: {
        backgroundColor: "#FFC83A",
        borderColor: "#FFC83A",
    },
    filterBtnText: {
        color: "#2A4BA0",
        fontWeight: "bold",
    },
    filterBtnTextActive: {
        color: "#fff",
    },
    sortBtns: {
        flexDirection: "row",
        marginLeft: 8,
        alignItems: "center",
        minWidth: 130,
        justifyContent: "flex-end"
    },
});