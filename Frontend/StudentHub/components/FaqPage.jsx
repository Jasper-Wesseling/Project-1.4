import React, { useState, useRef } from "react";
import { View, Text, Animated, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Icon } from "react-native-elements";

const faqs = [
  { id: 1, question: "blaaablaaa", answer: "Antwoord 1" },
  { id: 2, question: "blaaablaaaa", answer: "Antwoord 2" },
  { id: 3, question: "bloooo bloooo", answer: "Antwoord 3" },
  { id: 4, question: "blooooblllaaa", answer: "Antwoord 4" },
  { id: 5, question: "luke het aapje", answer: "Antwoord 5" },
  { id: 6, question: "luke het aapje", answer: "Antwoord 6" },
  { id: 7, question: "luke het aapje", answer: "Antwoord 7" },
  { id: 8, question: "luke het aapje", answer: "Antwoord 8" },
  { id: 9, question: "luke het aapje", answer: "Antwoord 9" },
  { id: 10, question: "luke het aapje", answer: "Antwoord 10" },
  { id: 11, question: "luke het aapje", answer: "Antwoord 11" },
  { id: 12, question: "luke het aapje", answer: "Antwoord 12" },
  { id: 13, question: "luke het aapje", answer: "Antwoord 13" },
  { id: 14, question: "luke het aapje", answer: "Antwoord 14" },
];

export default function FaqPage() {
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState(null);
  const [searchModalVisible, setSearchModalVisible] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;

  // Animated header height (from 150 to 0)
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [166, 0],
    extrapolate: "clamp",
  });

  // Animated header opacity (for big text)
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 40],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={faqStyles.container}>
      {/* Static Top Bar */}
      <View style={faqStyles.topBar}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ color: "#fff", fontSize: 24, fontWeight: "bold" }}>Hey, Wouter</Text>
          <View style={{ flexDirection: 'row', width: 125, justifyContent: 'space-around', alignContent: 'center'}}>
            <TouchableOpacity onPress={() => {setSearchModalVisible(true)}}>
              <Icon name="search" size={34} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Icon name="bag-outline" type="ionicon" size={32} color="#fff"/>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {/* Animated Header */}
      <Animated.View style={[faqStyles.header, { height: headerHeight }]}>
        <Animated.Text style={{opacity: headerOpacity, alignSelf: 'flex-start', color: "white", fontSize: 64, fontWeight: 300,}}>Get your</Animated.Text>
        <Animated.Text style={{opacity: headerOpacity, alignSelf: 'flex-start', color: "white", fontSize: 64, fontWeight: "bold",}}>answers</Animated.Text>
        <View style={{ height: 16 }} />
      </Animated.View>
      {/* FAQ lijst */}
      <Animated.ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 290 }} // 100(topBar) + 150(header max) + 24(marge) 
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
      {/* Zoekbalk direct onder header, niet sticky */}
      <View style={faqStyles.searchBarSticky}>
        <View style={faqStyles.searchBarInner}>
          <Feather name="search" size={22} color="#A0A0A0" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search Help"
            value={search}
            onChangeText={setSearch}
            style={faqStyles.searchBarInput}
            placeholderTextColor="#A0A0A0"
          />
        </View>
      </View >
        <Text style={faqStyles.faqTitle}>FAQ</Text>
        {filteredFaqs.map(faq => (
          <View key={faq.id} >
            <TouchableOpacity
              style={faqStyles.faqRow}
              onPress={() => setOpenId(openId === faq.id ? null : faq.id)}
              activeOpacity={0.7}
            >
              <Text style={faqStyles.faqQuestion}>{faq.question}</Text>
              <Text style={faqStyles.plus}>{openId === faq.id ? "-" : "+"}</Text>
            </TouchableOpacity>
            {openId === faq.id && (
              <View style={faqStyles.faqAnswerBox}>
                <Text style={faqStyles.faqAnswer}>{faq.answer}</Text>
              </View>
            )}
          </View>
        ))}
        {filteredFaqs.length === 0 && (
          <Text style={{ color: "gray", textAlign: "center", marginTop: 24 }}>Geen resultaten gevonden.</Text>
        )}
      </Animated.ScrollView>
    </View>
  );
}

const faqStyles = StyleSheet.create({
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
  badgeWrapper: {
    position: "relative",
    marginLeft: 10,
  },
  badge: {
    position: "absolute",
    top: -8,
    right: -10,
    backgroundColor: "#FFC83A",
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
    zIndex: 2,
  },
  badgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
    textAlign: "center",
  },
  searchBarSticky: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 8,
    zIndex: 9,
  },
  searchBarInner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 5,
  },
  searchBarInput: {
    flex: 1,
    fontSize: 16,
    backgroundColor: "transparent",
    borderWidth: 0,
    paddingVertical: 0,
  },
  faqTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 16,
    marginLeft: 24,
    marginTop: 24,
  },
  faqRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingVertical: 18,
    paddingHorizontal: 24,
    backgroundColor: "#fff",
    justifyContent: "space-between",
  },
  faqQuestion: {
    fontSize: 16,
    color: "#222",
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
    backgroundColor: "#f7f7f7",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
    marginBottom: 0,
  },
  faqAnswer: {
    fontSize: 15,
    color: "#444",
  },
});