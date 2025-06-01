import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useRef, useState } from "react";
import { SafeAreaView, View, Text, StyleSheet, Animated } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import SearchBar from "./SearchBar";
import { API_URL } from '@env';
import { TouchableOpacity } from "react-native";
import { Icon } from "react-native-elements";
import PostPreview from "./PostPreview";
import BountyBoardModal from "./BountyBoardModal";

export default function BountyBoard({ navigation, token }) {
    const scrollY = useRef(new Animated.Value(0)).current;
    const [posts, setPosts] = useState([]);
    const [user, setUser] = useState();
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [searchModalVisible, setSearchModalVisible] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMorePages, setHasMorePages] = useState(true);
    const filters = ['Local', 'Remote'];
    const [activeFilter, setActiveFilter] = useState(null);
    const [selectedPost, setSelectedPost] = useState(null);
    const [bountyModalVisible, setBountyModalVisible] = useState(false);

    const fetchAll = async (pageToLoad = 1, append = false, searchValue = search, filterValue = activeFilter) => {
        try {
            if (!token) throw new Error("No token received");

            // Build query params for search and filter
            let query = `?page=${pageToLoad}`;
            if (searchValue) query += `&search=${encodeURIComponent(searchValue)}`;
            if (filterValue) query += `&type=${encodeURIComponent(filterValue)}`;

            // Fetch posts and user in parallel
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
            const users = await userRes.json();

            setHasMorePages(postsData.length === 20);
            setPosts(prev =>
                append
                    ? [...prev, ...postsData.filter(p => !prev.some(existing => existing.id === p.id))]
                    : postsData
            );
            setUser(users);
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
        inputRange: [0, 100],
        outputRange: [150, 0],
        extrapolate: "clamp",
    });
    const filterTop = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [250, 100],
        extrapolate: "clamp",
    });
    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 40],
        outputRange: [1, 0],
        extrapolate: "clamp",
    });
    const name = user && user.full_name ? user.full_name.split(' ')[0] : "";

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
                        <TouchableOpacity onPress={() => navigation.navigate('AddPost')}>
                            <Icon name="plus" type="feather" size={34} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { setSearchModalVisible(true) }}>
                            <Icon name="search" size={34} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
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
            {/* Animated Header */}
            <Animated.View style={[styles.header, { height: headerHeight }]}>
                <Animated.Text style={[styles.headerText, { opacity: headerOpacity, marginTop: -20, fontWeight: '300' }]}>Step up,</Animated.Text>
                <Animated.Text style={[styles.headerText, styles.headerTextBold, { opacity: headerOpacity }]}>Take a bounty</Animated.Text>
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
                        .map(post => {
                            // Zoek de user die bij deze post hoort
                            const postUser = Array.isArray(user)
                                ? user.find(u => u.id === post.user_id)
                                : user && user.id === post.user_id
                                    ? user
                                    : null;
                            return (
                                <View key={post.id}>
                                    <PostPreview
                                        post={post}
                                        user={postUser}
                                        onQuickHelp={() => openBountyModal(post)}
                                    />
                                </View>
                            );
                        })}
                </Animated.ScrollView>
                :
                <Text style={styles.loadingText}>Loading...</Text>}

            {/* BountyModal */}
            <BountyBoardModal
                visible={bountyModalVisible}
                bounty={selectedPost}
                user={
                    selectedPost
                        ? (Array.isArray(user)
                            ? user.find(u => u.id === selectedPost.user_id)
                            : user && user.id === selectedPost.user_id
                                ? user
                                : null)
                        : null
                }
                onClose={() => setBountyModalVisible(false)}
                navigation={navigation}
                productUser={selectedPost?.user_id}
                productUserName={selectedPost?.product_username}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff"
    },
    languageSwitcher: {
        position: 'absolute',
        paddingTop: 100,
        top: 10,
        right: 10,
        flexDirection: 'row',
        zIndex: 100,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 10,
        padding: 2,
    },
    langButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#eee',
        marginHorizontal: 2,
    },
    langButtonActive: {
        backgroundColor: '#2A4BA0',
    },
    langButtonText: {
        color: '#2A4BA0',
        fontWeight: 'bold'
    },
    langButtonTextActive: {
        color: '#fff'
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
        top: 100, // below topBar
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
        fontSize: 60,
    },
    headerTextBold: {
        fontWeight: 'bold',
        width: 400,
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
        paddingTop: 250,
        paddingBottom: 80,
    },
    loadingText: {
        paddingTop: 300,
        fontSize: 64,
        color: 'black',
        alignSelf: 'center'
    }
});