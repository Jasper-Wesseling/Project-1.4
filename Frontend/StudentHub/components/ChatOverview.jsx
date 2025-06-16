// Only the styling and related style usage has been updated for a more "chat overview" look.

import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import SearchBar from "./SearchBar";
import { useCallback, useEffect, useState } from "react";
import { Icon } from "react-native-elements";
import { API_URL } from '@env';
import { useFocusEffect } from "@react-navigation/native";

export default function ChatOverview({ navigation, token, user, theme }) {
   const [search, setSearch] = useState('');
   const [searchModalVisible, setSearchModalVisible] = useState(false);
   const [chats, setChats] = useState([]);
   const styles = createChatOverviewStyles(theme);

   const fetchChats = async () => {
      try {
         const chatsRes = await fetch(API_URL + `/api/messages/get_preview`, {
               method: 'GET',
               headers: {
                  'Authorization': `Bearer ${token}`,
               },

         });

         if (!chatsRes.ok) {
               const errorText = await chatsRes.text();
               console.error("Backend error:", errorText);
               throw new Error("messages fetch failed");
         };

         const chatData = await chatsRes.json();
         setChats(chatData);
      } catch (err) {
         console.error("API error:", err);   
      }

   }

   useFocusEffect(
      useCallback(() => {
         fetchChats();
      }, [token])
   );

   const name = user && user.full_name ? user.full_name.split(' ')[0] : "";

   // Filter chats based on search input
   const filteredChats = search
      ? chats.filter(
           (msg) =>
               (typeof msg.product === 'string' && msg.content.toLowerCase().includes(search.toLowerCase())) ||
               (typeof msg.sender === 'string' && msg.sender.toLowerCase().includes(search.toLowerCase())) ||
               (typeof msg.receiver === 'string' && msg.receiver.toLowerCase().includes(search.toLowerCase()))
         )
      : chats;
   
   const getTimeStamp = (msg) => msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: "2-digit"}) : '';

   return(
      <View style={styles.container}>
         <SearchBar
            visible={searchModalVisible}
            value={search}
            onChange={setSearch}
            onClose={() => setSearchModalVisible(false)}
         />
         {/* Static Top Bar */}
         <View style={styles.topBar}>
            <View style={styles.topBarRow}>
               <Icon name='arrow-left' type='feather' size={24} color='#fff' onPress={() => navigation.goBack()}/>
               <Text style={styles.topBarText}>All Chats</Text>
               <View style={styles.topBarIcons}>
                     <TouchableOpacity onPress={() => {setSearchModalVisible(true)}}>
                        <Icon name="search" size={34} color="#fff" />
                     </TouchableOpacity>
               </View>
            </View>
         </View>
         <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollViewContent]}>
            {filteredChats.map((msg, idx) => (
               <TouchableOpacity
                  onPress={()=> navigation.navigate('ProductChat', { product: msg.product, userToChat: msg.sender_id === user.id ? msg.receiver_id : msg.sender_id })}
                  key={idx}
                  style={styles.chatCard}
                  activeOpacity={0.8}
               >
                  <View style={styles.avatarCircle}>
                     <Text style={styles.avatarText}>
                        {(msg.sender === user.full_name ? msg.receiver : msg.sender)?.charAt(0)?.toUpperCase() || "?"}
                     </Text>
                  </View>
                  <View style={styles.chatInfo}>
                     <View style={styles.chatHeader}>
                        <Text style={styles.chatName}>
                           {msg.sender === user.full_name ? msg.receiver : msg.sender}
                        </Text>
                        <Text style={styles.chatTime}>{getTimeStamp(msg)}</Text>
                     </View>
                     <Text style={styles.chatMessage} numberOfLines={1}>
                        {msg.content}
                     </Text>
                     <Text style={styles.chatMeta}>
                        {msg.days_ago > 0 ? msg.days_ago+ (msg.days_ago == 1 ? ' day ago' : ' days ago') : 'less than 1 day ago'}
                     </Text>
                  </View>
               </TouchableOpacity>
            ))}
         </ScrollView>
      </View>
   );
}

function createChatOverviewStyles(theme) {
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
         elevation: 4,
         shadowColor: "#000",
         shadowOffset: { width: 0, height: 2 },
         shadowOpacity: 0.1,
         shadowRadius: 4,
      },
      topBarRow: {
         flexDirection: "row",
         justifyContent: "space-between",
         alignItems: "center"
      },
      topBarText: {
         color: "#fff",
         fontSize: 26,
         fontWeight: "bold",
         letterSpacing: 0.5
      },
      topBarIcons: {
         flexDirection: 'row',
         width: 50,
         justifyContent: 'flex-end',
         alignContent: 'center'
      },
      scrollViewContent: {
         paddingTop: 110,
         paddingBottom: 40,
      },
      chatCard: {
         flexDirection: "row",
         alignItems: "center",
         backgroundColor: theme.tabBarBg,
         marginHorizontal: 16,
         marginVertical: 8,
         borderRadius: 16,
         padding: 16,
         elevation: 2,
         shadowColor: "#000",
         shadowOffset: { width: 0, height: 1 },
         shadowOpacity: 0.07,
         shadowRadius: 2,
      },
      avatarCircle: {
         width: 54,
         height: 54,
         borderRadius: 27,
         backgroundColor: "#E7ECF0",
         justifyContent: "center",
         alignItems: "center",
         marginRight: 16,
      },
      avatarText: {
         fontSize: 24,
         fontWeight: "bold",
         color: "#2A4BA0",
      },
      chatInfo: {
         flex: 1,
         justifyContent: "center",
      },
      chatHeader: {
         flexDirection: "row",
         justifyContent: "space-between",
         alignItems: "center",
         marginBottom: 2,
      },
      chatName: {
         fontSize: 18,
         fontWeight: "bold",
         color: theme.text,
         flex: 1,
         marginRight: 8,
      },
      chatTime: {
         fontSize: 13,
         color: "#A0A4A8", 
         fontWeight: "500",
      },
      chatMessage: {
         fontSize: 15,
         color: theme.text,
         marginBottom: 2,
      },
      chatMeta: {
         fontSize: 12,
         color: "#A0A4A8",
      },
   });
}