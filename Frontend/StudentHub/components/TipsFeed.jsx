import React, { useEffect, useState, useRef, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Animated, Dimensions } from "react-native";
import { API_URL } from "@env";
import TipCard from "./TipCard";
import TipModal from "./TipModal";
import { Icon } from "react-native-elements";
import { useFocusEffect, useRoute } from "@react-navigation/native";

const FILTERS = [
    "Plannen",
    "Stress",
    "Vakken",
    "Sociale tips",
    "Huiswerk",
    "Presentaties",
    "Samenwerken",
    "Stage",
    "Overig",
];
const PAGE_SIZE = 10;

export default function TipsFeed({ token, user, navigation, theme }) {
    const [tips, setTips] = useState([]);
    const [search, setSearch] = useState("");
    const [activeFilters, setActiveFilters] = useState([]);
    const [sort, setSort] = useState({ field: "created_at", order: "desc" });
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [allLoaded, setAllLoaded] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedTip, setSelectedTip] = useState(null);
    const loadingMoreRef = useRef(false);
    const scrollViewRef = useRef(null);
    const name = user && user.full_name ? user.full_name.split(' ')[0] : "";
    const styles = createTipsFeedStyles(theme);

    const scrollY = useRef(new Animated.Value(0)).current;

    const headerHeight = scrollY.interpolate({
        inputRange: [0, 166],
        outputRange: [156, 0],
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
            if (scrollViewRef.current && scrollViewRef.current.scrollTo) {
                scrollViewRef.current.scrollTo({ y: 0, animated: false });
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

    useEffect(() => {
        loadingMoreRef.current = false;
    }, [tips]);

    const handleScroll = ({ nativeEvent }) => {
        const { contentOffset, contentSize, layoutMeasurement } = nativeEvent;
        const scrollPosition = contentOffset.y + layoutMeasurement.height;
        const halfway = contentSize.height * 0.7;

        if (
            scrollPosition >= halfway &&
            !loading &&
            !allLoaded &&
            tips.length >= PAGE_SIZE * page &&
            !loadingMoreRef.current
        ) {
            loadingMoreRef.current = true;
            fetchTips(page + 1);
            setPage(p => p + 1);
        }
    };

    function toggleFilter(filter) {
        setActiveFilters(f =>
            f[0] === filter ? [] : [filter]
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

    const handleAddReply = async (replyText) => {
        if (!selectedTip || !replyText.trim()) return;
        try {
            const response = await fetch(`${API_URL}/api/forums/${selectedTip.id}/reply`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ content: replyText }),
            });
            if (!response.ok) throw new Error("Reply failed");

            // Haal altijd de volledige, actuele forum op na reply
            const updatedTip = await fetchTipById(selectedTip.id);

            setSelectedTip(updatedTip);
            setTips(tips => tips.map(t => t.id === updatedTip.id ? updatedTip : t));

            return updatedTip;
        } catch (e) {
            alert("Reactie plaatsen mislukt");
            return null;
        }
    };

    function handleTipPress(tip) {
        if (!tip || !tip.id) return;
        fetchTipById(tip.id).then(freshTip => {
            setSelectedTip(freshTip);
            setModalVisible(true);
        });
    }

    function renderTipCard({ item }) {
        return (
            <TipCard
                tip={item}
                onPress={() => handleTipPress(item)}
                theme={theme}
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
                <Animated.Text style={[styles.headerText, { opacity: headerOpacity, fontWeight: "300" }]}>
                    The Forum
                </Animated.Text>
                <Animated.Text style={[styles.headerText, { opacity: headerOpacity }]}>
                    By Everyone
                </Animated.Text>
            </Animated.View>

            {/* Sticky zoekbalk + filters */}
            <Animated.View
                style={[
                    styles.stickyBar,
                    { position: "absolute", left: 0, right: 0, marginTop: stickyBarMarginTop, zIndex: 5 }
                ]}
            >
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
                    <TouchableOpacity
                        style={styles.createBtn}
                        onPress={() => navigation.navigate("AddForum")}
                    >
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
                                    activeFilters[0] === filter && styles.filterBtnActive
                                ]}
                                onPress={() => toggleFilter(filter)}
                            >
                                <Text style={[
                                    styles.filterBtnText,
                                    activeFilters[0] === filter && styles.filterBtnTextActive
                                ]}>{filter}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <View style={styles.sortBtns}>
                        <TouchableOpacity onPress={() => toggleSort("likes")}>
                            <Text style={{
                                color: sort.field === "likes" ? "#2A4BA0" : theme.detailsText,
                                fontWeight: "bold",
                                marginRight: 8,
                                minWidth: 60,
                                textAlign: "center",
                            }}>
                                Likes
                                <Text>
                                    {sort.field === "likes" ? (sort.order === "asc" ? " ▲" : " ▼") : " "}
                                </Text>
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => toggleSort("created_at")}>
                            <Text style={{
                                color: sort.field === "created_at" ? "#2A4BA0" : theme.detailsText,
                                fontWeight: "bold",
                                minWidth: 60,
                                textAlign: "center",
                            }}>
                                Datum
                                <Text>
                                    {sort.field === "created_at" ? (sort.order === "asc" ? " ▲" : " ▼") : " "}
                                </Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>
            {/* Scrollable Content */}
            {loading && tips.length === 0 ? (
                <View style={{ marginTop: 360 }}>
                    {[...Array(3)].map((_, i) => (
                        <View key={i} style={{
                            backgroundColor: theme.formBg,
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
                    <Animated.ScrollView
                        ref={scrollViewRef}
                        style={{
                            flex: 1,
                            paddingBottom: 16,
                            paddingHorizontal: 0
                        }}
                        contentContainerStyle={{
                            paddingTop: 360,
                            paddingHorizontal: 0,
                            minHeight: Dimensions.get("window").height
                        }}
                        onScroll={Animated.event(
                            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                            {
                                useNativeDriver: false,
                                listener: handleScroll
                            }
                        )}
                        scrollEventThrottle={16}
                    >
                        {tips.map((item, idx) => (
                            <React.Fragment key={item.id || idx}>
                                {renderTipCard({ item, index: idx })}
                            </React.Fragment>
                        ))}
                        {allLoaded && tips.length > 0 ? (
                            <Text style={{ textAlign: "center", color: "#000", margin: 16 }}>
                                Je hebt elke post gezien
                            </Text>
                        ) : null}
                    </Animated.ScrollView>
                    <TipModal
                        visible={modalVisible}
                        tip={selectedTip}
                        user={user}
                        onClose={() => setModalVisible(false)}
                        onLike={handleLike}
                        onDislike={handleDislike}
                        onReplyLike={(idx, action) => handleReplyLike(selectedTip.id, idx, action)}
                        onReplyDislike={(idx, action) => handleReplyDislike(selectedTip.id, idx, action)}
                        onAddReply={handleAddReply}
                        token={token}
                        theme={theme}
                    />
                </>
            )}
        </View>
    );
}

function createTipsFeedStyles(theme) {
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
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
        },
        topBarText: {
            color: "#fff",
            fontSize: 24,
            fontWeight: "bold",
        },
        topBarIcons: {
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
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
            color: "#fff",
            fontSize: 64,
            fontWeight: "bold",
        },
        headerTextBold: {
            color: "#fff",
            fontSize: 64,
            fontWeight: "bold",
        },
        stickyBar: {
            backgroundColor: theme.headerBg,
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
            backgroundColor: theme.searchBg,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: "grey",
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
            color: theme.text,
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
            backgroundColor: theme.filterBg,
            borderRadius: 16,
            paddingHorizontal: 14,
            paddingVertical: 7,
            marginHorizontal: 4,
            borderWidth: 1,
            borderColor: theme.filterBorder,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 3,
            elevation: 1,
        },
        filterBtnActive: {
            backgroundColor: theme.activeFilter,
            borderColor: theme.activeFilterBorder,
        },
        filterBtnText: {
            color: theme.filterText,
            fontWeight: "bold",
        },
        filterBtnTextActive: {
            color: theme.activeFilterText,
        },
        sortBtns: {
            flexDirection: "row",
            marginLeft: 8,
            alignItems: "center",
            minWidth: 130,
            justifyContent: "flex-end"
        },
    });
}