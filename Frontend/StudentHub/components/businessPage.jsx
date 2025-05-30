import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState, useRef } from "react";
import { SafeAreaView, View, Text, StyleSheet, Animated, ScrollView, TouchableOpacity } from "react-native";
import { API_URL } from '@env';

export default function BountyBoard({ navigation }) {
    const scrollY = useRef(new Animated.Value(0)).current;
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

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

            const eventsRes = await fetch(API_URL + '/api/events/get', {
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
            fetchEvents();
        }, [])
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

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity
                style={{backgroundColor:'#2A4BA0', padding:12, borderRadius:8, margin:16, alignItems:'center'}}
                onPress={() => navigation.navigate('CreateEvent')}
            >
                <Text style={{color:'#fff', fontWeight:'bold', fontSize:18}}>Maak Event</Text>
            </TouchableOpacity>
            {/* Animated Header */}
            <Animated.View style={[styles.header, { height: headerHeight }]}>
                <Animated.Text style={[styles.headerText, { opacity: headerOpacity, marginTop: -20, fontWeight: '300' }]}>Step up,</Animated.Text>
                <Animated.Text style={[styles.headerText, styles.headerTextBold, { opacity: headerOpacity }]}>Take a bounty</Animated.Text>
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff"
    },
    header: {
        position: "absolute",
        top: 0,
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
    scrollViewContent: {
        paddingTop: 180,
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
    }
});
