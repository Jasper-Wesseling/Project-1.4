import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState, useRef } from "react";
import { SafeAreaView, View, Text, StyleSheet, Animated, ScrollView, TouchableOpacity, Pressable } from "react-native";
import { Icon } from "react-native-elements";
import { API_URL } from '@env';
import { MaterialIcons } from '@expo/vector-icons';

export default function BountyBoard({ navigation }) {
    const scrollY = useRef(new Animated.Value(0)).current;
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    // Fetch companies for filters
    const [filters, setFilters] = useState([]);
    const [activeFilter, setActiveFilter] = useState(null);

    // Fetch all companies for filters
    const fetchCompanies = async () => {
        try {
            // Get token first (same as fetchEvents)
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

            // Now fetch companies with Authorization header
            const res = await fetch(API_URL + '/api/companies/get', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error('Failed to fetch companies');
            const companies = await res.json();
            console.log('Fetched companies:', companies); // Debug log
            // Use id and name for filters
            if (Array.isArray(companies) && companies.length > 0) {
                setFilters(companies.map(c => ({ id: c.id, name: c.name })));
            } else {
                setFilters([]);
            }
        } catch (err) {
            console.error('Error fetching companies:', err); // Debug log
            setFilters([]);
        }
    };

    // Fetch events (filtered by company id if selected)
    const fetchEvents = async () => {
        try {
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

            // Add filter to events fetch if activeFilter is set
            let eventsUrl = API_URL + '/api/events/get';
            if (activeFilter) {
                eventsUrl += `?company_id=${activeFilter}`;
            }
            const eventsRes = await fetch(eventsUrl, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!eventsRes.ok) throw new Error("Events fetch failed");

            const eventsData = await eventsRes.json();
            setEvents(eventsData);
            setLoading(false);
        } catch (err) {
            console.error("API error:", err);
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchCompanies();
        }, [])
    );
    useFocusEffect(
        useCallback(() => {
            fetchEvents();
        }, [activeFilter])
    );

    const headerHeight = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [150, 0],
        extrapolate: "clamp",
    });

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 40],
        outputRange: [1, 0],
        extrapolate: "clamp",
    });

    // Filter row position (sticky below header)
    const filterTop = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [250, 100], // 100 is top bar height, 150 is max header height
        extrapolate: "clamp",
    });

    return (
        <SafeAreaView style={styles.container}>
            {/* Static Top Bar */}
            <View style={styles.topBar}>
                <View style={styles.topBarRow}>
                    <Text style={styles.topBarText}>Hey, Jasper</Text>
                    <View style={styles.topBarIcons}>
                        <TouchableOpacity onPress={() => navigation.navigate('CreateEvent')}>
                            <Icon name="plus" type="feather" size={30} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <Icon name="calendar" type="feather" size={30} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <Icon name="user" type="feather" size={30} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Animated Header */}
            <Animated.View style={[styles.header, { height: headerHeight }]}>
                <Animated.Text style={[styles.headerText, { opacity: headerOpacity }]}>Step up,</Animated.Text>
                <Animated.Text style={[styles.headerText, styles.headerTextBold, { opacity: headerOpacity }]}>Take a bounty</Animated.Text>
            </Animated.View>

            {/* Filter Row (copied from Products.jsx) */}
            <Animated.View style={[styles.filterRow, { top: filterTop, height: 50, zIndex: 30, backgroundColor: '#fff' }]}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterScrollContent}
                >
                    {filters && filters.length > 0 ? (
                        filters.map((filter, i) => (
                            <TouchableOpacity key={filter.id} onPress={() => setActiveFilter(activeFilter === filter.id ? null : filter.id)}>
                                <Text style={[styles.filter, activeFilter === filter.id ? styles.activeFilter : null]}>
                                    {filter.name}
                                </Text>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <Text style={{color: '#888', marginLeft: 16}}>No companies found</Text>
                    )}
                </ScrollView>
            </Animated.View>

            {loading ? (
                <Text style={styles.loadingText}>Loading...</Text>
            ) : (
                <Animated.ScrollView
                    contentContainerStyle={styles.scrollViewContent}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: false }
                    )}
                    scrollEventThrottle={16}
                >
                    {events && events.length > 0 ? (
                        events.map((event, idx) => (
                            <View style={styles.eventContainer} key={event.id || idx}>
                                <Text style={styles.eventTitle}>{event.title}</Text>
                                <Text style={styles.eventDate}>{event.date}</Text>
                                <Text style={styles.eventDescription}>{event.description}</Text>
                            </View>
                        ))
                    ) : (
                        <View style={styles.eventContainer}>
                            <Text style={styles.eventTitle}>No events found</Text>
                        </View>
                    )}
                </Animated.ScrollView>
            )}
            {/* Agenda Button */}
            <Pressable
                style={styles.agendaButton}
                onPress={() => console.log('View Agenda Pressed')}
            >
                <Text style={styles.agendaButtonText}>View Agenda</Text>
                <MaterialIcons name="event" size={20} color="white" />
            </Pressable>
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
    topBarRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    topBarText: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "bold"
    },
    topBarIcons: {
        flexDirection: 'row',
        width: 125,
        justifyContent: 'space-between',
        alignItems: 'center'
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
        color: "white",
        fontSize: 64,
        fontWeight: '300'
    },
    headerTextBold: {
        fontWeight: 'bold',
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
        paddingTop: 280, // 100 topbar + 150 header + margin
        paddingBottom: 80,
    },
    loadingText: {
        paddingTop: 300,
        fontSize: 24,
        color: 'black',
        alignSelf: 'center'
    },
    eventContainer: {
        backgroundColor: '#EAF0FB',
        borderRadius: 12,
        padding: 18,
        marginBottom: 18,
        marginHorizontal: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    eventTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2A4BA0',
        marginBottom: 4,
    },
    eventDate: {
        fontSize: 16,
        color: '#555',
        marginBottom: 8,
    },
    eventDescription: {
        fontSize: 16,
        color: '#222',
    },
    agendaButton: {
        position: "absolute",
        bottom: 30, 
        right: 10, 
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F9B023", 
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
        zIndex: 30,
    },
    agendaButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
        marginRight: 5,
        }
});
