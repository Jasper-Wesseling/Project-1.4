import { useState, useRef } from "react";
import { View, Text, Animated, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { Icon } from "react-native-elements";
import { useTranslation } from "react-i18next";

// Use translation keys for FAQ
const faqs = Array.from({ length: 40 }, (_, i) => ({
  id: i + 1,
  question: `faq.q${i + 1}`,
  answer: `faq.a${i + 1}`,
}));

export default function FaqPage({ token, user, theme, navigation }) {
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const { t } = useTranslation();

  const styles = createFaqStyles(theme);

  // Animated header height (from 249 to 0)
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
    outputRange: [120, 290], // 100(topBar) + headerHeight
    extrapolate: "clamp",
  });

  const filteredFaqs = faqs.filter(faq =>
    t(faq.question).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      /* Static Top Bar */
        <View style={styles.topBar}>
          <View>
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                  <Icon name="arrow-left" type="feather" size={24} color="#fff" />
                  <Text style={styles.backButtonText}>{t('go_back')}</Text>
              </TouchableOpacity>
          </View>
        </View>
        {/* Animated Header */}
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <Animated.Text style={[styles.headerText, styles.headerTextLight, { opacity: headerOpacity }]}>
          {t("faq.getYour")}
        </Animated.Text>
        <Animated.Text style={[styles.headerText, styles.headerTextBold, { opacity: headerOpacity }]}>
          {t("faq.answers")}
        </Animated.Text>
      </Animated.View>
      {/* Sticky zoekbalk + FAQ titel, schuift mee omhoog */}
      <Animated.View style={[styles.stickyBar, { marginTop: stickyBarMarginTop }]}>
        <View style={styles.searchBarInner}>
          <Icon type="Feather" name="search" size={22} color="#A0A0A0" style={styles.searchIcon} />
          <TextInput
            placeholder={t("faq.searchHelp")}
            value={search}
            onChangeText={setSearch}
            style={styles.searchBarInput}
            placeholderTextColor="#A0A0A0"
          />
        </View>
        <Text style={styles.faqTitle}>{t("faq.title")}</Text>
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
                {t(faq.question).charAt(0).toUpperCase() + t(faq.question).slice(1)}
              </Text>
              <Text style={styles.plus}>{openId === faq.id ? "-" : "+"}</Text>
            </TouchableOpacity>
            {openId === faq.id && (
              <View style={styles.faqAnswerBox}>
                <Text style={styles.faqAnswer}>
                  {t(faq.answer).charAt(0).toUpperCase() + t(faq.answer).slice(1)}
                </Text>
              </View>
            )}
          </View>
        ))}
        {filteredFaqs.length === 0 && (
          <Text style={styles.noResults}>{t("faq.noResults")}</Text>
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
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 6,
    },
    backButton: {
        flexDirection: "row",
        alignItems: 'center',
        backgroundColor: theme.background,
        borderRadius: 16,
        paddingVertical: 8,
        paddingHorizontal: 14,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.10,
        shadowRadius: 4,
        elevation: 2,
    },
    backButtonText: {
        color: theme.text,
        fontSize: 20,
        paddingLeft: 8,
        fontWeight: '600',
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
      borderColor: "grey",
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
      backgroundColor: theme.formBg,
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
      color: theme.text,
      textAlign: "center",
      marginTop: 24,
    },
  });
}