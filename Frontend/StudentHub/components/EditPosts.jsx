import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import SearchBar from "./SearchBar";
import { useCallback, useEffect, useState } from "react";
import { Icon } from "react-native-elements";
import { API_URL } from '@env';
import { useFocusEffect } from "@react-navigation/native";
import PostPreview from "./PostPreview";
import BountyBoardModal from "./BountyBoardModal";

export default function EditPosts({ navigation, token, user }) {
   const [posts, setPosts] = useState([]);
   const [loading, setLoading] = useState(true);
   const [selectedPost, setSelectedPost] = useState(null);
   const [modalVisible, setModalVisible] = useState(false);

   const fetchPosts = async () => {
      try {
         if (!token) {
            setLoading(false);
            return;
         }
         const res = await fetch(API_URL + `/api/posts/get/fromCurrentUser`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
         });
         if (!res.ok) throw new Error("Posts fetch failed");
         const data = await res.json();
         setPosts(data);
         setLoading(false);
      } catch (err) {
         console.error("API error:", err);
         setLoading(false);
      }
   };

   useFocusEffect(
      useCallback(() => {
         fetchPosts();
      }, [token])
   );


   return(
      <View style={styles.container}>
         {/* Static Top Bar */}
         <View style={styles.topBar}>
            <View style={styles.topBarRow}>
               <Icon name='arrow-left' type='feather' size={24} color='#fff' onPress={() => navigation.goBack()}/>
               <Text style={styles.topBarText}>Edit Posts</Text>
               <View style={styles.topBarIcons}>
                  <TouchableOpacity>
                     <Icon name="search" size={34} color="#fff" />
                  </TouchableOpacity>
               </View>
            </View>
         </View>
         <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollViewContent}
            style={{paddingHorizontal: 16}}
         >
            {loading ? (
               <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#2A4BA0" />
                  <Text style={styles.loadingText}>Posts laden...</Text>
               </View>            ) : (
               posts.map(post => (
                  <TouchableOpacity
                     key={post.id}
                     activeOpacity={0.8}
                     onPress={() => {
                        setSelectedPost(post);
                        setModalVisible(true);
                     }}
                  >                     <View style={styles.chatCard}>
                        <PostPreview 
                           post={post} 
                           user={{ full_name: post.post_user_name || "Unknown User" }} 
                           token={token} 
                        />
                     </View>
                  </TouchableOpacity>
               ))
            )}
         </ScrollView>         <BountyBoardModal
            visible={modalVisible}
            bounty={selectedPost}
            onClose={() => setModalVisible(false)}
            navigation={navigation}
            user={user}
            token={token}
            onPostDeleted={() => {
               setModalVisible(false);
               fetchPosts(); // Refresh the posts list
            }}
         />
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: "#F4F6FA"
   },
   topBar: {
      height: 100,
      backgroundColor: "#2A4BA0",
      justifyContent: "center",
      paddingTop: 25,
      paddingHorizontal: 16,
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
   },
   topBarIcons: {
      flexDirection: 'row',
      width: 50,
      justifyContent: 'flex-end',
      alignContent: 'center'
   },
   scrollViewContent: {
      paddingTop: 16,
      paddingBottom: 40,
      paddingHorizontal: 0, // Remove horizontal padding
   },
   chatCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#fff",
      borderRadius: 16,
      padding: 16,
      marginBottom: 12, // Only bottom margin for spacing
      // Remove marginHorizontal and marginVertical
   },
   loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingTop: 150,
   },
   loadingText: {
      marginTop: 16,
      fontSize: 18,
      color: "#2A4BA0",
      fontWeight: "600",
   },
});