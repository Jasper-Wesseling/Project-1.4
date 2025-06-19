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
import { useTranslation } from "react-i18next";

export default function BountyBoard({ navigation, token, theme }) {
    const { t } = useTranslation();

    const scrollY = useRef(new Animated.Value(0)).current;
    const [posts, setPosts] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [searchModalVisible, setSearchModalVisible] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMorePages, setHasMorePages] = useState(true);
    const filters = ['Local', 'Remote'];
    const [activeFilter, setActiveFilter] = useState(null);
    const [selectedPost, setSelectedPost] = useState(null);
    const [bountyModalVisible, setBountyModalVisible] = useState(false);
    const styles = createBountyStyles(theme);

    const fetchAll = async (pageToLoad = 1, append = false, searchValue = search, filterValue = activeFilter) => {
        try {
            if (!token) throw new Error("No token received");

            let query = `?page=${pageToLoad}`;
            if (searchValue) query += `&search=${encodeURIComponent(searchValue)}`;
            if (filterValue) query += `&type=${encodeURIComponent(filterValue)}`;

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
        inputRange: [0, 249],
        outputRange: [166, 290],
        extrapolate: "clamp",
    });

    const name = currentUser && currentUser.full_name ? currentUser.full_name.split(' ')[0] : "";
    const filteredPosts = posts
        .filter(post => post && typeof post === 'object' && post.title)
        .filter(post =>
            (!activeFilter || post.type === activeFilter) &&
            post.title.toLowerCase().includes(search.toLowerCase())
        );

    return (
        <SafeAreaView style={styles.container} >
            <SearchBar
                visible={searchModalVisible}
                value={search}
                onChange={setSearch}
                onClose={() => setSearchModalVisible(false)}
                theme={theme}
            />
            {/* Static Top Bar */}
            <View style={styles.topBar}>
                <View style={styles.topBarRow}>
                    <Text style={styles.topBarText}>{!loading ? `${t('hey')}, ${name}` : t('hey')}</Text>
                    <View style={styles.topBarIcons}>
                        <TouchableOpacity onPress={() => navigation.navigate('AddPost')}>
                            <Icon name="plus" type="feather" size={34} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('EditPosts')}>
                            <Icon name="cog" type="material-community" size={34} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('ChatOverview')}>
                            <Icon name="chat" type="material-community" size={32} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            {/* Animated Header */}
            <Animated.View style={[styles.header, { height: headerHeight }]}>
                <Animated.Text style={[styles.headerText, { opacity: headerOpacity, marginTop: -20, fontWeight: '300' }]}>
                    {t('step_up')}
                </Animated.Text>
                <Animated.Text style={[styles.headerText, styles.headerTextBold, { opacity: headerOpacity }]}>
                    {t('take_a_bounty')}
                </Animated.Text>
            </Animated.View>
            <Animated.View style={[styles.stickyBar, { marginTop: stickyBarMarginTop }]}>
                {/* Searchbar */}
                <View style={styles.searchBarInner}>
                    <Icon type="Feather" name="search" size={22} color="#A0A0A0" style={styles.searchIcon} />
                    <TextInput
                        placeholder={t('find_your_bounty')}
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
                                {filter ? t(filter.toLowerCase()) : null}
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
                    {filteredPosts.length === 0 ? (
                        <Text style={styles.loadingText}>{t('no_bounties_found')}</Text>
                    ) : (
                        filteredPosts.map(post => (
                            <View key={post.id}>
                                <PostPreview
                                    post={post}
                                    user={{ full_name: post.post_user_name || t('unknown_user') }}
                                    token={token}
                                    theme={theme}
                                    onQuickHelp={() => openBountyModal(post)}
                                />
                            </View>
                        ))
                    )}
                </Animated.ScrollView>
                :
                <Text style={styles.loadingText}>{t('loading')}</Text>
            }

            {/* BountyModal */}
            <BountyBoardModal
                visible={bountyModalVisible}
                bounty={selectedPost}
                onClose={() => setBountyModalVisible(false)}
                navigation={navigation}
                user={currentUser}
                token={token}
                theme={theme}
                onPostDeleted={() => {
                    setBountyModalVisible(false);
                    setPage(1);
                    fetchAll(1, false, search, activeFilter);
                }}
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
            fontSize: 52,
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