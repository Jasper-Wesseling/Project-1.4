import { useState, useRef } from "react";
import { View, Text, Animated, StyleSheet, TextInput, TouchableOpacity, Appearance } from "react-native";
import { Icon } from "react-native-elements";
import LightDarkToggle, { themes } from "./LightDarkComponent";
import UserFirstName from "./UserFirstName";

const faqs = [
  { id: 1, question: "blaaablaaa", answer: "Antwoord 1" },
  { id: 2, question: "blaaablaaaa", answer: "Antwoord 2" },
  { id: 3, question: "bloooo bloooo", answer: "Antwoord 3, ben het antwoord vergeten" },
  { id: 4, question: "blooooblllaaa", answer: "Antwoord 4" },
  { id: 5, question: "luke het aapje", answer: "Antwoord 5" },
  { id: 6, question: "luke het aapje", answer: "Antwoord 6" },
  { id: 7, question: "luke het aapje", answer: "Antwoord 7" },
  { id: 8, question: "luke het aapje", answer: "Antwoord 8" },
  { id: 9, question: "luke het aapje", answer: "Antwoord 9" },
  { id: 10, question: "luke het aapje", answer: "Antwoord 10" },
  { id: 11, question: "luke het aapje", answer: "Antwoord 11" },
  { id: 12, question: "luke het aapje", answer: "Antwoord 12" },
  { id: 13, question: "luke het aapje", answer: "Antwoord 13, is geen 12" },
  { id: 14, question: "luke het aapje", answer: "Antwoord 14" },
  { id: 15, question: "luke het aapje", answer: "Antwoord 15" },
  { id: 16, question: "luke het aapje", answer: "Antwoord 16" },
  { id: 17, question: "luke het aapje", answer: "Antwoord 17" },
  { id: 18, question: "luke het aapje", answer: "Antwoord 18" },
  { id: 19, question: "luke het aapje", answer: "Antwoord 19" },
  { id: 20, question: "luke het aapje", answer: "Antwoord 20" },
  { id: 21, question: "luke het aapje", answer: "Antwoord 21" },
  { id: 22, question: "luke het aapje", answer: "Antwoord 22" },
  { id: 23, question: "luke het aapje", answer: "Antwoord 23" },
  { id: 24, question: "luke het aapje", answer: "Antwoord 24" },  
  { id: 25, question: "luke het aapje", answer: "Antwoord 25" },
  { id: 26, question: "luke het aapje", answer: "Antwoord 26" },
  { id: 27, question: "luke het aapje", answer: "Antwoord 27" },
  { id: 28, question: "luke het aapje", answer: "easter egg luke het aapje" },
  { id: 29, question: "luke het aapje", answer: "Antwoord 29" },
  { id: 30, question: "luke het aapje", answer: "Antwoord 30" },
  { id: 31, question: "luke het aapje", answer: "Antwoord 31" },
  { id: 32, question: "luke het aapje", answer: "Antwoord 32" },
];

export default function FaqPage() {
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState(null);
  const [theme, setTheme] = useState(Appearance.getColorScheme() === "dark" ? themes.dark : themes.light);

  const scrollY = useRef(new Animated.Value(0)).current;

  // Animated header height (from 166 to 0)
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 249],
    outputRange: [166, 0],
    extrapolate: "clamp",
  });

  // Animated header opacity (for big text)
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 40],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  // StickyBar marginTop animatie zodat hij altijd direct onder de header blijft
  const stickyBarMarginTop = headerHeight.interpolate({
    inputRange: [0, 166],
    outputRange: [120, 290], // 100(topBar) + headerHeight + 24 margin
    extrapolate: "clamp",
  });

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(search.toLowerCase())
  );

  const styles = createFaqStyles(theme);

  return (
    <View style={styles.container}>
      {/* Static Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarRow}>
          <Text style={styles.topBarTitle}>
            Hey, <UserFirstName style={styles.topBarTitle} />
          </Text>
          <View style={styles.topBarIcons}>
            <TouchableOpacity>
              <Icon name="search" size={34} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity>
              <LightDarkToggle onThemeChange={setTheme} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {/* Animated Header */}
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <Animated.Text style={[styles.headerText, styles.headerTextLight, { opacity: headerOpacity }]}>
          Get your
        </Animated.Text>
        <Animated.Text style={[styles.headerText, styles.headerTextBold, { opacity: headerOpacity }]}>
          answers
        </Animated.Text>
      </Animated.View>
      {/* Sticky zoekbalk + FAQ titel, schuift mee omhoog */}
      <Animated.View style={[styles.stickyBar, { marginTop: stickyBarMarginTop }]}>
        <View style={styles.searchBarInner}>
          <Icon type="Feather" name="search" size={22} color="#A0A0A0" style={styles.searchIcon} />
          <TextInput
            placeholder="Search Help"
            value={search}
            onChangeText={setSearch}
            style={styles.searchBarInput}
            placeholderTextColor="#A0A0A0"
          />
        </View>
        <Text style={styles.faqTitle}>FAQ</Text>
      </Animated.View>
      {/* Scrollbare FAQ lijst */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {filteredFaqs.map(faq => (
          <View key={faq.id}>
            <TouchableOpacity
              style={styles.faqRow}
              onPress={() => setOpenId(openId === faq.id ? null : faq.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.faqQuestion}>
                {faq.question.charAt(0).toUpperCase() + faq.question.slice(1)}
              </Text>
              <Text style={styles.plus}>{openId === faq.id ? "-" : "+"}</Text>
            </TouchableOpacity>
            {openId === faq.id && (
              <View style={styles.faqAnswerBox}>
                <Text style={styles.faqAnswer}>
                  {faq.answer.charAt(0).toUpperCase() + faq.answer.slice(1)}
                </Text>
              </View>
            )}
          </View>
        ))}
        {filteredFaqs.length === 0 && (
          <Text style={styles.noResults}>Geen resultaten gevonden.</Text>
        )}
      </Animated.ScrollView>
    </View>
  );
}

// Dynamische styles generator
function createFaqStyles(theme) {
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
      justifyContent: "space-between",
    },
    topBarTitle: {
      color: "#fff",
      fontSize: 24,
      fontWeight: "bold",
    },
    topBarIcons: {
      flexDirection: 'row',
      width: 125,
      justifyContent: 'space-around',
      alignItems: 'center',
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
      alignSelf: 'flex-start',
      color: "#fff",
      fontSize: 64,
    },
    headerTextLight: {
      fontWeight: "300",
    },
    headerTextBold: {
      fontWeight: "bold",
    },
    stickyBar: {
      backgroundColor: theme.background,
      zIndex: 5,
      paddingBottom: 0,
      paddingHorizontal: 0,
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
    faqTitle: {
      fontWeight: "bold",
      fontSize: 16,
      marginBottom: 16,
      marginLeft: 24,
      marginTop: 16,
      color: theme.text,
    },
    scrollView: {
      flex: 1,
    },
    scrollViewContent: {
      paddingTop: 0,
      paddingBottom: 24,
    },
    faqRow: {
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: 1,
      borderColor: theme.border,
      paddingVertical: 18,
      paddingHorizontal: 24,
      backgroundColor: theme.background,
      justifyContent: "space-between",
    },
    faqQuestion: {
      fontSize: 16,
      fontWeight: "600", //semi-bold
      color: theme.text,
      flex: 1,
      flexWrap: "wrap",
    },
    plus: {
      fontSize: 22,
      color: "#aaa",
      fontWeight: "bold",
      marginLeft: 12,
    },
    faqAnswerBox: {
      backgroundColor: theme.answerBg,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderColor: theme.border,
      marginBottom: 0,
    },
    faqAnswer: {
      fontSize: 15,
      color: theme.text,
    },
    searchIcon: {
      marginRight: 8,
    },
    noResults: {
      color: "gray",
      textAlign: "center",
      marginTop: 24,
    },
  });
}