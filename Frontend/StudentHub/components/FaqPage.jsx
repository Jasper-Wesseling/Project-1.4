import { useState, useRef } from "react";
import { View, Text, Animated, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { Icon } from "react-native-elements";
import { themes } from "./LightDarkComponent";

const faqs = [
  { id: 1, question: "Hoe maak ik een goede planning voor mijn studie?", answer: "Gebruik een agenda of digitale planner, stel prioriteiten en verdeel grote taken in kleinere stappen." },
  { id: 2, question: "Wat kan ik doen tegen uitstelgedrag?", answer: "Stel duidelijke doelen, werk in blokken en beloon jezelf na het afronden van taken." },
  { id: 3, question: "Hoe vind ik studiemaatjes?", answer: "Sluit je aan bij studiegroepen, bezoek introductieactiviteiten of gebruik de chatfunctie in de StudentHub app." },
  { id: 4, question: "Waar kan ik samenvattingen vinden?", answer: "Vraag medestudenten, kijk op het intranet van je opleiding of deel zelf samenvattingen in de app." },
  { id: 5, question: "Hoe bereid ik me voor op tentamens?", answer: "Begin op tijd, maak oefenopgaven en bespreek moeilijke onderwerpen met anderen." },
  { id: 6, question: "Wat als ik mijn motivatie verlies?", answer: "Denk aan je doelen, praat met studiegenoten of een studiecoach en probeer afwisseling in je dag te brengen." },
  { id: 7, question: "Hoe combineer ik werk en studie?", answer: "Maak een realistische planning, communiceer met je werkgever en neem voldoende rust." },
  { id: 8, question: "Waar kan ik hulp krijgen bij stress?", answer: "Praat met een studieloopbaanbegeleider, gebruik mindfulness-oefeningen of zoek contact met een vertrouwenspersoon." },
  { id: 9, question: "Hoe kan ik beter presenteren?", answer: "Oefen je presentatie hardop, vraag feedback en gebruik duidelijke slides." },
  { id: 10, question: "Wat moet ik doen als ik een deadline niet haal?", answer: "Neem direct contact op met je docent en leg je situatie uit. Soms is uitstel mogelijk." },
  { id: 11, question: "Hoe vind ik een stageplek?", answer: "Gebruik het netwerk van je opleiding, zoek op vacaturesites en vraag medestudenten naar tips." },
  { id: 12, question: "Wat zijn handige apps voor studenten?", answer: "StudentHub, Google Calendar, Notion, Microsoft OneNote en Slack zijn populair onder studenten." },
  { id: 13, question: "Hoe blijf ik gemotiveerd tijdens online lessen?", answer: "Zorg voor een vaste routine, maak aantekeningen en neem actief deel aan de les." },
  { id: 14, question: "Hoe kan ik effectief samenwerken aan groepsopdrachten?", answer: "Maak duidelijke afspraken, verdeel taken en houd regelmatig contact via chat of video." },
  { id: 15, question: "Wat als ik moeite heb met een bepaald vak?", answer: "Vraag om hulp bij je docent, zoek een tutor of vorm een studiegroepje." },
  { id: 16, question: "Hoe houd ik balans tussen studie en privé?", answer: "Plan vrije tijd in, blijf sporten en zorg voor voldoende slaap." },
  { id: 17, question: "Waar kan ik terecht met persoonlijke problemen?", answer: "Neem contact op met de studentenpsycholoog of vertrouwenspersoon van je opleiding." },
  { id: 18, question: "Hoe kan ik mijn concentratie verbeteren?", answer: "Werk in korte blokken, leg je telefoon weg en zorg voor een opgeruimde studieplek." },
  { id: 19, question: "Wat zijn goede manieren om te netwerken?", answer: "Bezoek evenementen, sluit je aan bij studieverenigingen en wees actief op LinkedIn." },
  { id: 20, question: "Hoe kan ik omgaan met faalangst?", answer: "Praat erover met anderen, bereid je goed voor en probeer ontspanningsoefeningen." },
  { id: 21, question: "Hoe vraag ik studiefinanciering aan?", answer: "Ga naar de website van DUO en volg de stappen voor het aanvragen van studiefinanciering." },
  { id: 22, question: "Wat moet ik doen bij ziekte tijdens een tentamen?", answer: "Meld je direct ziek bij je opleiding en vraag naar de mogelijkheden voor een herkansing." },
  { id: 23, question: "Hoe kan ik mijn studieresultaten inzien?", answer: "Log in op het studentenportaal van je opleiding om je cijfers te bekijken." },
  { id: 24, question: "Wat zijn tips voor het schrijven van een scriptie?", answer: "Begin op tijd, maak een duidelijke structuur en vraag regelmatig feedback." },
  { id: 25, question: "Hoe vind ik goedkope studieboeken?", answer: "Kijk op tweedehands websites, vraag ouderejaars of gebruik digitale versies." },
  { id: 26, question: "Wat als ik mijn OV-kaart kwijt ben?", answer: "Meld dit direct bij de klantenservice van OV-chipkaart en vraag een vervangende kaart aan." },
  { id: 27, question: "Hoe kan ik mijn Engels verbeteren?", answer: "Kijk Engelse films, lees boeken en oefen met medestudenten of via apps." },
  { id: 28, question: "Hoe maak ik een goed CV?", answer: "Gebruik een duidelijk format, benoem relevante ervaring en houd het overzichtelijk." },
  { id: 29, question: "Wat zijn handige studietips?", answer: "Maak samenvattingen, stel vragen en wissel studeren af met pauzes." },
  { id: 30, question: "Hoe kan ik omgaan met studiestress?", answer: "Praat erover, neem voldoende rust en zoek ontspanning in hobby’s of sport." },
  { id: 31, question: "Hoe kan ik mijn tijd beter indelen?", answer: "Gebruik een planner, stel prioriteiten en wees realistisch over wat je kunt doen." },
  { id: 32, question: "Wat moet ik doen als ik wil stoppen met mijn studie?", answer: "Overleg met een studieadviseur en meld je tijdig af bij je opleiding en DUO." },
  { id: 33, question: "Hoe kan ik een bijbaan vinden naast mijn studie?", answer: "Kijk op vacaturesites, vraag rond bij vrienden of kijk op het prikbord van je opleiding." },
  { id: 34, question: "Wat zijn de voordelen van lid worden van een studievereniging?", answer: "Je leert nieuwe mensen kennen, doet ervaring op en krijgt toegang tot leuke activiteiten." },
  { id: 35, question: "Hoe kan ik mijn presentatieskills verbeteren?", answer: "Oefen veel, vraag feedback en kijk naar goede voorbeelden op YouTube." },
  { id: 36, question: "Wat moet ik doen als ik een onvoldoende heb gehaald?", answer: "Bekijk waar het misging, vraag om feedback en bereid je goed voor op de herkansing." },
  { id: 37, question: "Hoe kan ik mijn studiepunten bijhouden?", answer: "Gebruik het studentenportaal of een eigen overzicht in Excel of een app." },
  { id: 38, question: "Hoe maak ik makkelijk contact met docenten?", answer: "Stuur een duidelijke e-mail of spreek ze aan na de les." },
  { id: 39, question: "Wat zijn goede manieren om te ontspannen na het studeren?", answer: "Ga sporten, kijk een film, spreek af met vrienden of maak een wandeling." },
  { id: 40, question: "Hoe kan ik omgaan met groepsdruk?", answer: "Blijf bij jezelf, geef je grenzen aan en praat erover met iemand die je vertrouwt." },
];


export default function FaqPage({ token, user, theme }) {
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState(null);
  const name = user && user.full_name ? user.full_name.split(' ')[0] : "";
  const scrollY = useRef(new Animated.Value(0)).current;

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
    outputRange: [120, 266], // 100(topBar) + headerHeight
    extrapolate: "clamp",
  });

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Static Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarRow}>
          <Text style={styles.topBarTitle}>
            {`Hey, ${name}`}
          </Text>
          <View style={styles.topBarIcons}>
            <TouchableOpacity>
              <Icon name="search" size={34} color="#fff" />
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
      alignItems: "center",
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