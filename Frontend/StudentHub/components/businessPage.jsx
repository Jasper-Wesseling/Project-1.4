import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState, useRef, useEffect } from "react";
import { SafeAreaView, View, Text, StyleSheet, Animated, ScrollView, TouchableOpacity, Pressable, Modal } from "react-native";
import { Icon } from "react-native-elements";
import { API_URL } from '@env';
import { MaterialIcons } from '@expo/vector-icons';
import { format, parseISO } from "date-fns";
import { useTranslation } from "react-i18next";

// business page component
export default function BussinessPage({ navigation, token, theme }) {
    const scrollY = useRef(new Animated.Value(0)).current;
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState([]);
    const [activeFilter, setActiveFilter] = useState(null);
    const [agendaVisible, setAgendaVisible] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [eventModalVisible, setEventModalVisible] = useState(false);
    const styles = createBusinessPageStyles(theme);
    const { t } = useTranslation();

    // Fetch companies van API
    const fetchCompanies = async () => {
        try {
            const res = await fetch(API_URL + '/api/companies/get', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            // checken of de response ok is
            if (!res.ok) throw new Error('Failed to fetch companies');
            const companies = await res.json();
            // checken of er bedrijven voldoen aan de filter
            if (Array.isArray(companies) && companies.length > 0) {
                setFilters(companies.map(c => ({ id: c.id, name: c.name })));
            } else {
                // Als er geen bedrijven zijn, zet filters op leeg
                setFilters([]);
            }
        } catch (err) {
            // Foutmelding tonen in de console en filters op leeg zetten
            console.error('Error fetching companies:', err);
            setFilters([]);
        }
    };

    // Haal events op
    const fetchEvents = async () => {
        try {
            // Check de token 
            let eventsUrl = API_URL + '/api/events/get';
            if (activeFilter) {
                eventsUrl += `?company_id=${activeFilter}`;
            }
            // Haal events op van de API
            const eventsRes = await fetch(eventsUrl, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Check of de response ok is
            if (!eventsRes.ok) throw new Error("Events fetch failed");

            // Zet de events in de state
            const eventsData = await eventsRes.json();
            setEvents(eventsData);
            setLoading(false);
        } catch (err) {
            // Foutmelding tonen in de console en laden uitzetten
            console.error("API error:", err);
            setLoading(false);
        }
    };

    // fetch bedrijven en events bij focus
    useFocusEffect(
        useCallback(() => {
            fetchCompanies();
        }, [])
    );
    // fetch events bij focus en bij filter wijziging
    useFocusEffect(
        useCallback(() => {
            fetchEvents();
        }, [activeFilter])
    );

    // Overgangen voor de animaties
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

    const filterTop = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [250, 100],
        extrapolate: "clamp",
    });

    // Functie om events te groeperen op datum
    const getEventsByDate = () => {
        // Groepeer de events op datum
        const grouped = {};
        events.forEach(event => {
            let dateKey = event.date;
            try {
                // Probeer de datum te parseren en te formatteren
                dateKey = format(parseISO(event.date), "yyyy-MM-dd");
            } catch { }
            // Als de datum niet bestaat, gebruik de originele datum
            if (!grouped[dateKey]) grouped[dateKey] = [];
            grouped[dateKey].push(event);
        });
        // sorteer de data bij datum
        return Object.keys(grouped)
            .sort()
            .map(date => ({ date, events: grouped[date] }));
    };

    // Sluit de event modal en reset de state
    const closeEventModal = () => {
        setEventModalVisible(false);
        setSelectedEvent(null);
        setAgendaVisible(true);
    };

    // Effect om agenda te sluiten als de event modal zichtbaar is
    useEffect(() => {
        if (eventModalVisible) {
            setAgendaVisible(false);
        }
    }, [eventModalVisible]);

    return (
        <SafeAreaView style={styles.container}>
            {/* Static Top Bar */}
            <View style={styles.topBar}>
                <View style={styles.topBarRow}>
                    <Text style={styles.topBarText}>{t("businessPage.hey", { name: "Jasper" })}</Text>
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
                <Animated.Text style={[styles.headerText, { opacity: headerOpacity }]}>{t("businessPage.discover")}</Animated.Text>
                <Animated.Text style={[styles.headerText, styles.headerTextBold, { opacity: headerOpacity }]}>{t("businessPage.byCompany")}</Animated.Text>
            </Animated.View>

            {/* Filter Row */}
            <Animated.View style={[styles.filterRow, { top: filterTop, height: 50, zIndex: 30, backgroundColor: theme.filterRowBg }]}>
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
                        <Text style={{color: theme.text, marginLeft: 16}}>{t("businessPage.noCompanies")}</Text>
                    )}
                </ScrollView>
            </Animated.View>

            {loading ? (
                <Text style={styles.loadingText}>{t("businessPage.loading")}</Text>
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
                            <TouchableOpacity
                                key={event.id || idx}
                                style={styles.eventContainer}
                                onPress={() => {
                                    setSelectedEvent(event);
                                    setEventModalVisible(true);
                                }}
                            >
                                <Text style={styles.eventTitle}>{event.title}</Text>
                                <Text style={styles.eventDate}>{event.date}</Text>
                                <Text style={styles.eventDescription}>{event.description}</Text>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.eventContainer}>
                            <Text style={styles.eventTitle}>{t("businessPage.noEvents")}</Text>
                        </View>
                    )}
                </Animated.ScrollView>
            )}
            {/* Agenda Button */}
            <Pressable
                style={styles.agendaButton}
                onPress={() => setAgendaVisible(true)}
            >
                <Text style={styles.agendaButtonText}>{t("businessPage.viewAgenda")}</Text>
                <MaterialIcons name="event" size={20} color="white" />
            </Pressable>

            {/* Agenda Modal */}
            <Modal
                visible={agendaVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setAgendaVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{t("businessPage.agenda")}</Text>
                        <ScrollView style={{maxHeight: 400, width: "100%"}}>
                            {events && events.length > 0 ? (
                                getEventsByDate().map(({ date, events }) => (
                                    <View key={date} style={styles.agendaDateSection}>
                                        <Text style={styles.agendaDateHeader}>
                                            {format(parseISO(date), "EEEE, MMMM d, yyyy")}
                                        </Text>
                                        {events.map((event, idx) => (
                                            <TouchableOpacity
                                                key={event.id || idx}
                                                style={styles.agendaCard}
                                                onPress={() => {
                                                    setSelectedEvent(event);
                                                    setEventModalVisible(true);
                                                }}
                                            >
                                                <View style={styles.agendaCardTimeBlock}>
                                                    <MaterialIcons name="access-time" size={18} color="#2A4BA0" />
                                                    <Text style={styles.agendaCardTime}>
                                                        {event.time ? event.time : (
                                                            event.date && event.date.length > 10
                                                                ? format(parseISO(event.date), "HH:mm")
                                                                : ""
                                                        )}
                                                    </Text>
                                                </View>
                                                <View style={styles.agendaCardContent}>
                                                    <Text style={styles.agendaCardTitle}>{event.title}</Text>
                                                    {event.description ? (
                                                        <Text style={styles.agendaCardDesc} numberOfLines={2}>{event.description}</Text>
                                                    ) : null}
                                                </View>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                ))
                            ) : (
                                <Text style={{color: theme.text, textAlign: 'center'}}>{t("businessPage.noEventsAgenda")}</Text>
                            )}
                        </ScrollView>
                        <TouchableOpacity style={styles.closeModalButton} onPress={() => setAgendaVisible(false)}>
                            <Text style={styles.closeModalButtonText}>{t("businessPage.close")}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Event Detail Modal */}
            <Modal
                visible={!!selectedEvent && eventModalVisible}
                animationType="none"
                transparent={true}
                onRequestClose={closeEventModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.eventModalContent}>
                        {selectedEvent ? (
                            <>
                                <Text style={styles.eventModalTitle}>{selectedEvent.title}</Text>
                                <View style={{marginBottom: 8, width: '100%'}}>
                                    <Text style={{fontWeight: 'bold', color: '#2A4BA0'}}>{t("businessPage.dateTime")}</Text>
                                    <Text style={styles.eventModalDate}>
                                        {selectedEvent.date ? format(parseISO(selectedEvent.date), "EEEE, MMMM d, yyyy") : ""}
                                    </Text>
                                </View>
                                {selectedEvent.company && (
                                    <View style={{marginBottom: 8, width: '100%'}}>
                                        <Text style={{fontWeight: 'bold', color: '#2A4BA0'}}>{t("businessPage.company")}</Text>
                                        <Text style={styles.eventModalCompany}>
                                            {selectedEvent.company.name || selectedEvent.company}
                                        </Text>
                                    </View>
                                )}
                                {selectedEvent.location && (
                                    <View style={{marginBottom: 8, width: '100%'}}>
                                        <Text style={{fontWeight: 'bold', color: '#2A4BA0'}}>{t("businessPage.location")}</Text>
                                        <Text style={styles.eventModalLocation}>
                                            {selectedEvent.location}
                                        </Text>
                                    </View>
                                )}
                                {selectedEvent.description && (
                                    <View style={{marginBottom: 8, width: '100%'}}>
                                        <Text style={{fontWeight: 'bold', color: '#2A4BA0'}}>{t("businessPage.description")}</Text>
                                        <Text style={styles.eventModalDesc}>{selectedEvent.description}</Text>
                                    </View>
                                )}
                            </>
                        ) : (
                            <Text>{t("businessPage.noEventData")}</Text>
                        )}
                        <TouchableOpacity style={styles.closeModalButton} onPress={closeEventModal}>
                            <Text style={styles.closeModalButtonText}>{t("businessPage.close")}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

function createBusinessPageStyles(theme) {
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
            backgroundColor: theme.headerBg,
            justifyContent: "center",
            alignItems: "flex-start",
            paddingHorizontal: 16,
            zIndex: 10,
        },
        headerText: {
            color: theme.headerText,
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
            backgroundColor: theme.filterRowBg,
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
            color: theme.text,
        },
        activeFilter: {
            backgroundColor: theme.activeFilter,
        },
        scrollViewContent: {
            paddingTop: 260,
            paddingBottom: 0,
        },
        loadingText: {
            paddingTop: 300,
            fontSize: 24,
            color: theme.text,
            alignSelf: 'center'
        },
        eventContainer: {
            backgroundColor: theme.formBg,
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
            color: theme.text,
            marginBottom: 4,
        },
        eventDate: {
            fontSize: 16,
            color: theme.detailsText,
            marginBottom: 8,
        },
        eventDescription: {
            fontSize: 16,
            color: theme.text,
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
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: theme.modalOverlay,
            justifyContent: 'center',
            alignItems: 'center',
        },
        modalContent: {
            backgroundColor: theme.background,
            borderRadius: 16,
            padding: 24,
            width: '85%',
            alignItems: 'flex-start',
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 5,
        },
        modalTitle: {
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 16,
            color: '#2A4BA0',
            alignSelf: 'center',
        },
        agendaDateSection: {
            marginBottom: 18,
            width: "100%",
        },
        agendaDateHeader: {
            fontSize: 18,
            fontWeight: 'bold',
            color: theme.text,
            marginBottom: 8,
            marginLeft: 2,
        },
        agendaCard: {
            flexDirection: "row",
            alignItems: "flex-start",
            backgroundColor: theme.formBg,
            borderRadius: 10,
            padding: 12,
            marginBottom: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.07,
            shadowRadius: 2,
            elevation: 1,
            width: "100%",
        },
        agendaCardTimeBlock: {
            width: 55,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 10,
        },
        agendaCardTime: {
            fontSize: 15,
            color: "#2A4BA0",
            fontWeight: "bold",
            marginTop: 2,
        },
        agendaCardContent: {
            flex: 1,
        },
        agendaCardTitle: {
            fontSize: 16,
            fontWeight: "bold",
            color: theme.text,
            marginBottom: 2,
        },
        agendaCardDesc: {
            fontSize: 14,
            color: theme.detailsText,
        },
        closeModalButton: {
            marginTop: 20,
            backgroundColor: '#2A4BA0',
            paddingVertical: 8,
            paddingHorizontal: 24,
            borderRadius: 10,
            alignSelf: 'center',
        },
        closeModalButtonText: {
            color: '#fff',
            fontSize: 16,
            fontWeight: 'bold'
        },
        eventModalContent: {
            backgroundColor: theme.background,
            borderRadius: 16,
            padding: 28,
            width: '85%',
            alignItems: 'flex-start',
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 5,
        },
        eventModalTitle: {
            fontSize: 22,
            fontWeight: 'bold',
            color: '#2A4BA0',
            marginBottom: 10,
            alignSelf: 'center',
        },
        eventModalDate: {
            fontSize: 16,
            color: theme.detailsText,
            marginBottom: 8,
        },
        eventModalCompany: {
            fontSize: 15,
            color: theme.text,
            marginBottom: 6,
        },
        eventModalLocation: {
            fontSize: 15,
            color: theme.text,
            marginBottom: 6,
        },
        eventModalDesc: {
            fontSize: 16,
            color: theme.text,
            marginTop: 10,
            marginBottom: 10,
        },
    });
}

