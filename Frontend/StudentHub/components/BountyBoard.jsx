import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useRef, useState } from "react";
import { SafeAreaView, View, Text, StyleSheet, Animated, TextInput } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import SearchBar from "./SearchBar";
import { API_URL } from '@env';
import { TouchableOpacity } from "react-native";
import { Icon } from "react-native-elements";
import PostPreview from "./PostPreview";
import BountyBoardModal from "./BountyBoardModal";
import { themes } from "./LightDarkComponent";

export default function BountyBoard({ navigation, token, theme }) {
    const scrollY = useRef(new Animated.Value(0)).current;
    const [posts, setPosts] = useState([]);
    const [currentUser, setCurrentUser] = useState(null); // Huidige ingelogde user
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [searchModalVisible, setSearchModalVisible] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMorePages, setHasMorePages] = useState(true);
    const filters = ['Local', 'Remote'];
    const [activeFilter, setActiveFilter] = useState(null);
    const [selectedPost, setSelectedPost] = useState(null);
    const [bountyModalVisible, setBountyModalVisible] = useState(false);
    // Gebruik altijd een geldig theme object
    const safeTheme =
        typeof theme === "object" && theme
            ? theme
            : typeof theme === "string" && themes[theme]
                ? themes[theme]
                : themes.light; // fallback naar light theme

    // niet laden als theme niet geldig is
    if (!safeTheme) {
        return null;
    }

    const fetchAll = async (pageToLoad = 1, append = false, searchValue = search, filterValue = activeFilter) => {
        try {
            if (!token) throw new Error("No token received");

            // Build query params for search and filter
            let query = `?page=${pageToLoad}`;
            if (searchValue) query += `&search=${encodeURIComponent(searchValue)}`;
            if (filterValue) query += `&type=${encodeURIComponent(filterValue)}`;

            // Fetch posts and current user in parallel
            const [postsRes, userRes] = await Promise.all([
                fetch(API_URL + `/api/posts/get${query}`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(API_URL + '/api/users/get', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            if (!postsRes.ok) throw new Error("posts fetch failed");
            if (!userRes.ok) throw new Error("User fetch failed");

            const postsData = await postsRes.json();
            const currentUser = await userRes.json();

            setHasMorePages(postsData.length === 20);
            setPosts(prev =>
                append
                    ? [...prev, ...postsData.filter(p => !prev.some(existing => existing.id === p.id))]
                    : postsData
            );
            setCurrentUser(currentUser);
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
        }, [search, activeFilter])
    );

    const loadMore = () => {
        if (hasMorePages && !loading) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchAll(nextPage, true, search, activeFilter);
        }
    };

    const openBountyModal = (post) => {
        setSelectedPost(post);
        setBountyModalVisible(true);
    };

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
        outputRange: [120, 290], // 150(topBar) + headerHeight + 24 margin
        extrapolate: "clamp",
      });

    const name = currentUser && currentUser.full_name ? currentUser.full_name.split(' ')[0] : "";

    const styles = createBountyStyles(safeTheme);

    return (
        <SafeAreaView style={styles.container} >
            <SearchBar
                visible={searchModalVisible}
                value={search}
                onChange={setSearch}
                onClose={() => setSearchModalVisible(false)}
            />
            {/* Static Top Bar */}
            <View style={styles.topBar}>
                <View style={styles.topBarRow}>
                    <Text style={styles.topBarText}>{!loading ? `Hey, ${name}` : 'hoi'}</Text>
                    <View style={styles.topBarIcons}>
                        <TouchableOpacity onPress={() => navigation.navigate('AddPost')} disabled={hasRole(user, 'ROLE_TEMP')}>
                            <Icon name="plus" type="feather" size={34} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            {/* Animated Header */}
            <Animated.View style={[styles.header, { height: headerHeight }]}>
                <Animated.Text style={[styles.headerText, { opacity: headerOpacity, marginTop: -20, fontWeight: '300' }]}>Step up,</Animated.Text>
                <Animated.Text style={[styles.headerText, styles.headerTextBold, { opacity: headerOpacity }]}>Take a bounty</Animated.Text>
            </Animated.View>
            <Animated.View style={[styles.stickyBar, { marginTop: stickyBarMarginTop }]}>
                {/* Searchbar */}
                <View style={styles.searchBarInner}>
                    <Icon type="Feather" name="search" size={22} color="#A0A0A0" style={styles.searchIcon} />
                    <TextInput
                        placeholder="Find your bounty"
                        value={search}
                        onChangeText={setSearch}
                        style={styles.searchBarInput}
                        placeholderTextColor="#A0A0A0"
                    />
                </View>
                {/* Filters*/}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterScrollContent}
                    style={{ marginVertical: 8, marginHorizontal: 12 }}
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
                    {posts
                        .filter(post =>
                            (!activeFilter || post.type === activeFilter) &&
                            post.title.toLowerCase().includes(search.toLowerCase())
                        )
                        .map(post => (
                            <View key={post.id}>
                                <PostPreview
                                    post={post}
                                    token={token}
                                    onQuickHelp={() => openBountyModal(post)}
                                />
                            </View>
                        ))}
                </Animated.ScrollView>
                :
                <Text style={styles.loadingText}>Loading...</Text>}

            {/* BountyModal */}
            <BountyBoardModal
                visible={bountyModalVisible}
                bounty={selectedPost ? { ...selectedPost, token } : null}
                onClose={() => setBountyModalVisible(false)}
                navigation={navigation}
            />
        </SafeAreaView>
    );
}

function createBountyStyles(theme) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background,
        },
        languageSwitcher: {
            position: 'absolute',
            paddingTop: 100,
            top: 10,
            right: 10,
            flexDirection: 'row',
            zIndex: 100,
            backgroundColor: theme.languageSwitcherBg,
            borderRadius: 10,
            padding: 2,
        },
        langButton: {
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 8,
            backgroundColor: theme.langButtonBg,
            marginHorizontal: 2,
        },
        langButtonActive: {
            backgroundColor: theme.langButtonActiveBg,
        },
        langButtonText: {
            color: theme.langButtonText,
            fontWeight: 'bold'
        },
        langButtonTextActive: {
            color: theme.text,
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
            top: 100, // below topBar
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
            fontSize: 60,
        },
        headerTextBold: {
            fontWeight: 'bold',
            width: 400,
        },
        filterRow: {
            paddingHorizontal: 16,
            backgroundColor: theme.filterRowBg,
            flexDirection: "row",
            alignItems: "center",
            zIndex: 15,
            borderBottomWidth: 1,
            borderBottomColor: theme.filterRowBorder,
            gap: 10,
            flex: 1,
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