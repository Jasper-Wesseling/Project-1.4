import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useRef, useState } from "react";
import { SafeAreaView, View, Text, StyleSheet, Animated } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import SearchBar from "./SearchBar";
import { API_URL } from '@env';
import { TouchableOpacity } from "react-native";
import { Icon } from "react-native-elements";
import PostPreview from "./PostPreview";



export default function BountyBoard({ navigation }) {
    
    const scrollY = useRef(new Animated.Value(0)).current;
    const [posts, setposts] = useState([]);
    const [user, setUser] = useState();
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [searchModalVisible, setSearchModalVisible] = useState(false);
    
    useFocusEffect(
        useCallback(() => {
        async function fetchAll() {
            try {
                // Login and get token
                const loginRes = await fetch(API_URL + '/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        "username": "jasper.wesseling@student.nhlstenden.com",
                        "password": "wesselingjasper",
                        "full_name": "Jasper Wesseling"
                    })
                });
                if (!loginRes.ok) throw new Error("Login failed");
                const loginData = await loginRes.json();
                const token = loginData.token || loginData.access_token;
                if (!token) throw new Error("No token received");
    
                // Fetch posts and user in parallel
                const [postsRes, userRes] = await Promise.all([
                    fetch(API_URL + '/api/posts/get', {
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
    
                const posts = await postsRes.json();
                const users = await userRes.json();
    
                setposts(posts);
                setUser(users);
                setLoading(false);
            } catch (err) {
                console.error("API error:", err);
                setLoading(false);
            }
        }
        fetchAll();
        }, [])
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

    const name = user && user.full_name ? user.full_name.split(' ')[0] : "";
    
    const filters = ['Local', 'Remote'];
    
    const [activeFilter, setActiveFilter] = useState(null);


    return(
        <SafeAreaView style={styles.container} >
            <SearchBar
            visible={searchModalVisible}
            value={search}
            onChange={setSearch}
            onClose={() => setSearchModalVisible(false)}
            />
            {/* Static Top Bar */}
            <View style={styles.topBar}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ color: "#fff", fontSize: 24, fontWeight: "bold" }}>{!loading ? `Hey, ${name}` : 'hoi'}</Text>
                    <View style={{ flexDirection: 'row', width: 125, justifyContent: 'space-around', alignContent: 'center'}}>
                        <TouchableOpacity onPress={() => navigation.navigate('AddPost')}>
                            <Icon name="plus" type="feather" size={34} color="#fff"/>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {setSearchModalVisible(true)}}>
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
            {/* Animated Header */}
            <Animated.View style={[styles.header, { height: headerHeight }]}>
                <Animated.Text style={{opacity: headerOpacity, alignSelf: 'flex-start', color: "white", fontSize: 56, marginTop: -20, fontWeight: 300}}>Step up,</Animated.Text>
                <Animated.Text style={{opacity: headerOpacity, alignSelf: 'flex-start', color: "white", fontSize: 56, fontWeight: 'bold', width: 400}}>Take a bounty</Animated.Text>
            </Animated.View>



            {!loading ? 
            <Animated.ScrollView
                contentContainerStyle={{ paddingTop: 250 }} // 100(topBar) + 150(header) + 50(filterRow)
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
            >
                {posts
                    .filter(post =>
                        (!activeFilter || post.type === activeFilter) &&
                        post.title.toLowerCase().includes(search.toLowerCase())
                    )
                    .map(post => (
                        <PostPreview key={post.id} post={post} />
                        
                ))}
            </Animated.ScrollView>
            :
            <Text style={{ paddingTop: 300, fontSize: 64, color: 'black', alignSelf: 'center' }}>Loading...</Text>}
        </SafeAreaView>                      
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