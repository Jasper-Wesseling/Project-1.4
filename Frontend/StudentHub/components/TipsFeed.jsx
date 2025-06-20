import React, { useEffect, useState, useRef, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Animated, Dimensions } from "react-native";
import { API_URL } from "@env";
import TipCard from "./TipCard";
import TipModal from "./TipModal";
import { Icon } from "react-native-elements";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { hasRole } from "../utils/roleUtils";

// constanten filters en paginering
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

// forum component
export default function TipsFeed({ token, user, navigation, theme }) {

    // initialiseren van state variabelen
    const [tips, setTips] = useState([]);
    const [search, setSearch] = useState("");
    const [activeFilters, setActiveFilters] = useState([]);
    const [sort, setSort] = useState({ field: "created_at", order: "desc" });
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [allLoaded, setAllLoaded] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedTip, setSelectedTip] = useState(null);
    
    // refs voor paginering en scroll controle
    const loadingMoreRef = useRef(false);
    const scrollViewRef = useRef(null);

    // naam van de gebruiker extraheren voor personalisatie
    const name = user && user.full_name ? user.full_name.split(' ')[0] : "";

    // vertaling functie
    const { t } = useTranslation();

    // styles aanmaken met de huidige thema
    const styles = createTipsFeedStyles(theme);
    
    // referentie voor de scroll animatie
    const scrollY = useRef(new Animated.Value(0)).current;

    // animatie configuraties voor header
    // hoogte van de header die krimpt tijdens scrollen
    const headerHeight = scrollY.interpolate({
        inputRange: [0, 166],
        outputRange: [156, 0],
        extrapolate: "clamp",
    });

    // opaciteit van de header tekst die verdwijnt tijdens scrollen
    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 40],
        outputRange: [1, 0],
        extrapolate: "clamp",
    });

    // marge boven de sticky bar die zich aanpast aan header hoogte
    const stickyBarMarginTop = headerHeight.interpolate({
        inputRange: [0, 166],
        outputRange: [100, 266],
        extrapolate: "clamp",
    });

    // route parameter om toegang te krijgen tot navigatie parameters
    const route = useRoute();

    // focus effect om tips te laden wanneer de component in focus komt
    useFocusEffect(
        React.useCallback(() => {
            // reset alle state voor fresh load
            setTips([]);
            setPage(1);
            setAllLoaded(false);
            fetchTips(1, true);

            // reset scrollView naar boven wanneer de component in focus komt 
            if (scrollViewRef.current && scrollViewRef.current.scrollTo) {
                scrollViewRef.current.scrollTo({ y: 0, animated: false });
            }

            // reset scrollY waarde naar 0 bij focus
            scrollY.setValue(0);

            // check of er een openTipId parameter is in de route voor deep linking
            if (route.params?.openTipId) {
                fetchTipById(route.params.openTipId).then(tip => {
                    setSelectedTip(tip);
                    setModalVisible(true);
                    // reset parameter na gebruik
                    navigation.setParams({ openTipId: null });
                });
            }

            // dependency array - herlaad als deze waarden veranderen
        }, [route.params?.openTipId, activeFilters, sort, search])
    );

    // functie om tips op te halen van de API
    // deze functie wordt aangeroepen bij het laden van de component en bij het scrollen
    const fetchTips = useCallback(async (pageToLoad = 1, reset = false) => {
        setLoading(true);

        // bouw API URL met alle filter en sort parameters
        let url = `${API_URL}/api/forums/get?sort=${sort.field}&order=${sort.order}&limit=${PAGE_SIZE}&offset=${(pageToLoad - 1) * PAGE_SIZE}`;
        
        // voeg category filter toe (alleen 1 filter tegelijk toegestaan)
        if (activeFilters.length === 1) url += `&category=${encodeURIComponent(activeFilters[0])}`;
        
        // voeg zoekterm toe als deze bestaat
        if (search) url += `&search=${encodeURIComponent(search)}`;
        
        try {
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            
            if (Array.isArray(data)) {
                if (reset) {
                    // vervang alle tips bij reset
                    setTips(data);
                } else {
                    // voeg nieuwe tips toe en voorkom duplicaten
                    setTips(prev => [
                        ...prev,
                        ...data.filter(newTip => !prev.some(tip => tip.id === newTip.id))
                    ]);
                }
                
                // check of alle data geladen is (minder dan page size betekent einde)
                if (data.length < PAGE_SIZE) {
                    setAllLoaded(true);
                } else {
                    setAllLoaded(false);
                }
            } else {
                // geen geldige data ontvangen
                setAllLoaded(true);
            }
        } catch (error) {
            console.error('Error fetching tips:', error);
            setAllLoaded(true);
        }
        
        setLoading(false);
    }, [activeFilters, sort, search, token]);

    // reset loading ref wanneer tips veranderen
    useEffect(() => {
        loadingMoreRef.current = false;
    }, [tips]);

    // scroll handler voor infinite loading
    const handleScroll = ({ nativeEvent }) => {
        const { contentOffset, contentSize, layoutMeasurement } = nativeEvent;
        const scrollPosition = contentOffset.y + layoutMeasurement.height;
        const halfway = contentSize.height * 0.7; // laad meer bij 70% scroll

        // voorwaarden voor het laden van meer tips
        if (
            scrollPosition >= halfway &&           // gebruiker is ver genoeg gescrolld
            !loading &&                           // er wordt niet al geladen
            !allLoaded &&                         // er zijn nog meer tips beschikbaar
            tips.length >= PAGE_SIZE * page &&    // huidige page is volledig geladen
            !loadingMoreRef.current               // voorkom dubbele requests
        ) {
            loadingMoreRef.current = true;
            fetchTips(page + 1);
            setPage(p => p + 1);
        }
    };

    // toggle functie voor filters (alleen 1 filter tegelijk)
    function toggleFilter(filter) {
        setActiveFilters(f =>
            f[0] === filter ? [] : [filter] // deactiveer als al actief, anders activeer
        );
    }

    // toggle functie voor sortering
    function toggleSort(field) {
        setSort(s => ({
            field,
            // wissel tussen asc en desc, default naar desc
            order: s.field === field && s.order === "desc" ? "asc" : "desc"
        }));
    }

    // functie om een specifieke tip op te halen via ID
    const fetchTipById = async (id) => {
        try {
            const res = await fetch(`${API_URL}/api/forums/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return await res.json();
        } catch (error) {
            console.error('Error fetching tip by ID:', error);
            return null;
        }
    };

    // functie om een tip te liken of unlike
    const handleLike = async (action = "like") => {
        if (!selectedTip) return;
        
        try {
            await fetch(`${API_URL}/api/forums/${selectedTip.id}/like`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ action })
            });
            
            // haal bijgewerkte tip op en update state
            const updatedTip = await fetchTipById(selectedTip.id);
            setSelectedTip(updatedTip);
            // update tip in de lijst
            setTips(tips => tips.map(t => t.id === updatedTip.id ? updatedTip : t));
            return updatedTip;
        } catch (error) {
            console.error('Error liking tip:', error);
        }
    };

    // functie om een tip te disliken of undislike
    const handleDislike = async (action = "dislike") => {
        if (!selectedTip) return;
        
        try {
            await fetch(`${API_URL}/api/forums/${selectedTip.id}/dislike`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: JSON.stringify({ action })
            });
            
            // haal bijgewerkte tip op en update state
            const updatedTip = await fetchTipById(selectedTip.id);
            setSelectedTip(updatedTip);
            // update tip in de lijst
            setTips(tips => tips.map(t => t.id === updatedTip.id ? updatedTip : t));
            return updatedTip;
        } catch (error) {
            console.error('Error disliking tip:', error);
        }
    };

    // functie om een reply te liken
    const handleReplyLike = async (tipId, replyIdx, action = "like") => {
        try {
            await fetch(`${API_URL}/api/forums/${tipId}/reply-vote`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    reply_index: replyIdx,
                    vote: action === "undo" ? "undo-up" : "up"
                })
            });
            
            // haal bijgewerkte tip op en update state
            const updatedTip = await fetchTipById(tipId);
            setSelectedTip(updatedTip);
            setTips(tips => tips.map(t => t.id === updatedTip.id ? updatedTip : t));
            return updatedTip;
        } catch (error) {
            console.error('Error liking reply:', error);
        }
    };

    // functie om een reply te disliken
    const handleReplyDislike = async (tipId, replyIdx, action = "dislike") => {
        try {
            await fetch(`${API_URL}/api/forums/${tipId}/reply-vote`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    reply_index: replyIdx,
                    vote: action === "undo" ? "undo-down" : "down"
                })
            });
            
            // haal bijgewerkte tip op en update state
            const updatedTip = await fetchTipById(tipId);
            setSelectedTip(updatedTip);
            setTips(tips => tips.map(t => t.id === updatedTip.id ? updatedTip : t));
            return updatedTip;
        } catch (error) {
            console.error('Error disliking reply:', error);
        }
    };

    // functie om een nieuwe reply toe te voegen
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

            // haal bijgewerkte tip op met nieuwe reply
            const updatedTip = await fetchTipById(selectedTip.id);

            setSelectedTip(updatedTip);
            // update tip in de lijst
            setTips(tips => tips.map(t => t.id === updatedTip.id ? updatedTip : t));

            return updatedTip;
        } catch (e) {
            alert("Reactie plaatsen mislukt");
            return null;
        }
    };

    // functie om een tip te openen in modal
    function handleTipPress(tip) {
        if (!tip || !tip.id) return;
        
        // haal verse data op voor de modal
        fetchTipById(tip.id).then(freshTip => {
            setSelectedTip(freshTip);
            setModalVisible(true);
        });
    }

    // render functie voor individuele tip cards
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
            {/* Statische top bar met gebruikersnaam en plus knop */}
            <View style={styles.topBar}>
                <View style={styles.topBarRow}>
                    <Text style={styles.topBarText}>{t("tipsFeed.hey", { name })}</Text>
                    <View style={styles.topBarIcons}>
                        {/* Plus knop - uitgeschakeld voor tijdelijke gebruikers */}
                        <TouchableOpacity onPress={() => navigation.navigate("AddForum")} disabled={hasRole(user, "ROLE_TEMP")}>
                            <Icon name="plus" type="feather" size={34} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            
            {/* Geanimeerde header die krimpt tijdens scrollen */}
            <Animated.View style={[styles.header, { height: headerHeight }]}>
                <Animated.Text style={[styles.headerText, { opacity: headerOpacity, fontWeight: "300" }]}>
                    {t("tipsFeed.forum")}
                </Animated.Text>
                <Animated.Text style={[styles.headerText, { opacity: headerOpacity }]}>
                    {t("tipsFeed.byEveryone")}
                </Animated.Text>
            </Animated.View>

            {/* Sticky zoekbalk + filters die altijd zichtbaar blijven */}
            <Animated.View
                style={[
                    styles.stickyBar,
                    { position: "absolute", left: 0, right: 0, marginTop: stickyBarMarginTop, zIndex: 5 }
                ]}
            >
                {/* Zoekbalk en create knop */}
                <View style={styles.searchRow}>
                    <View style={styles.searchBar}>
                        <Icon type="Feather" name="search" size={20} color="#A0A0A0" style={{ marginRight: 8 }} />
                        <TextInput
                            placeholder={t("tipsFeed.searchPlaceholder")}
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
                        <Text style={styles.createBtnText}>{t("tipsFeed.createPost")}</Text>
                    </TouchableOpacity>
                </View>
                
                {/* Filter knoppen en sort opties */}
                <View style={styles.filterRow}>
                    {/* Horizontaal scrollbare filter knoppen */}
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
                    
                    {/* Sort knoppen voor likes en datum */}
                    <View style={styles.sortBtns}>
                        <TouchableOpacity onPress={() => toggleSort("likes")}>
                            <Text style={{
                                color: sort.field === "likes" ? "#2A4BA0" : theme.detailsText,
                                fontWeight: "bold",
                                marginRight: 8,
                                minWidth: 60,
                                textAlign: "center",
                            }}>
                                {t("tipsFeed.likes")}
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
                                {t("tipsFeed.date")}
                                <Text>
                                    {sort.field === "created_at" ? (sort.order === "asc" ? " ▲" : " ▼") : " "}
                                </Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>
            
            {/* Scrollbare content met tips */}
            {loading && tips.length === 0 ? (
                // Loading skeleton tijdens eerste load
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
                            {/* Skeleton elementen */}
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
                // Bericht wanneer geen tips gevonden
                <Text style={{ textAlign: "center", marginTop: 40, color: "#000" }}>{t("tipsFeed.noTips")}</Text>
            ) : (
                <>
                    {/* Hoofdcontent met tip lijst */}
                    <Animated.ScrollView
                        ref={scrollViewRef}
                        style={{
                            flex: 1,
                            paddingBottom: 16,
                            paddingHorizontal: 0
                        }}
                        contentContainerStyle={{
                            paddingTop: 360, // ruimte voor sticky header
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
                        {/* Render alle tip cards */}
                        {tips.map((item, idx) => (
                            <React.Fragment key={item.id || idx}>
                                {renderTipCard({ item, index: idx })}
                            </React.Fragment>
                        ))}
                        
                        {/* Bericht aan einde van lijst */}
                        {allLoaded && tips.length > 0 ? (
                            <Text style={{ textAlign: "center", color: "#000", margin: 16 }}>
                                {t("tipsFeed.allSeen")}
                            </Text>
                        ) : null}
                    </Animated.ScrollView>
                    
                    {/* Modal voor gedetailleerde tip weergave */}
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

// functie om styles te maken gebaseerd op het huidige thema
function createTipsFeedStyles(theme) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background
        },
        // Statische top bar styling
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
        // Geanimeerde header styling
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
        // Sticky bar styling
        stickyBar: {
            backgroundColor: theme.headerBg,
            zIndex: 5,
            paddingBottom: 8,
            paddingTop: 8,
            paddingHorizontal: 0,
        },
        // Zoekbalk styling
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
        // Create knop styling
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
        // Filter styling
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
        // Sort knoppen styling
        sortBtns: {
            flexDirection: "row",
            marginLeft: 8,
            alignItems: "center",
            minWidth: 130,
            justifyContent: "flex-end"
        },
    });
}