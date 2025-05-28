import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import SearchBar from "./SearchBar";
import { useEffect, useState } from "react";
import { Icon } from "react-native-elements";
import { API_URL } from '@env';



export default function ChatOverview({ navigation, token, user }) {
   const [search, setSearch] = useState('');
   const [searchModalVisible, setSearchModalVisible] = useState(false);
   const [chats, setChats] = useState([]);

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
         console.log('chats:'+chats);
      } catch (err) {
         console.error("API error:", err);   
      }

   }

   useEffect(() => {
      fetchChats();
   }, []);

   const name = user && user.full_name ? user.full_name.split(' ')[0] : "";


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
               <Text style={styles.topBarText}>{`Hey, ${name}`}</Text>
               <View style={styles.topBarIcons}>
                     <TouchableOpacity onPress={() => {setSearchModalVisible(true)}}>
                        <Icon name="search" size={34} color="#fff" />
                     </TouchableOpacity>
               </View>
            </View>
         </View>
         <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollViewContent]}>
            {chats.map((msg, idx) => (
               <TouchableOpacity onPress={()=> navigation.navigate('ProductChat', { product: msg.product, userToChat: msg.sender_id === user.id ? msg.receiver_id : msg.sender_id })}key={idx} style={{height: 100,width: '90%',alignSelf: 'center',backgroundColor: '#F8F9FB',marginVertical: 10 ,borderRadius: 20,borderColor: '#E7ECF0',borderWidth: 2,overflow: 'hidden', padding: 16}}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold',color: '#222',}} >{msg.content}</Text>
                  <Text style={{ fontSize: 18, fontWeight: 'bold',color: '#222',}}>{msg.sender === user.full_name ? msg.receiver : msg.sender}</Text>
               </TouchableOpacity>
            ))}
         </ScrollView>
      </View>
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
      justifyContent: 'flex-end',
      alignContent: 'center'
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
      alignSelf: 'flex-start',
      color: "white",
      fontSize: 64,
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
      paddingTop: 100,
      paddingBottom: 40,
   },
   loadingText: {
      paddingTop: 300,
      fontSize: 64,
      color: 'black',
      alignSelf: 'center'
   }
});