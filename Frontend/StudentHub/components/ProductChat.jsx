import { useEffect, useState } from "react";
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ScrollView, TextInput } from "react-native-gesture-handler";
import { Icon } from 'react-native-elements';
import { API_URL } from '@env';


export default function ProductChat({ navigation, token, user, userToChat}) {
    const userIDReciever = userToChat;
    const [chats, setChats] = useState([]);
    const [message, setMessage] = useState('');
    const [pageHeight, setPageHeight] = useState(0);

    const fetchChats = async () => {
        try {
            const chatsRes = await fetch(API_URL + `/api/messages/get?reciever=${encodeURIComponent(userIDReciever)}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
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
    }, [userIDReciever]);

    const sendMessage = async () => {

        if (!message || !userToChat) {
            console.error('mssing');
            return;
        }

        try {
            console.log(message, userToChat)
            const response = await fetch(API_URL + `/api/messages/new`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: message,
                    receiver: userToChat, // or receiver_id, depending on your backend
                }),
            });

            setMessage('');
            fetchChats();
        } catch (err) {
            console.error("API error:", err);
        }
    }
    console.log('user: ' + JSON.stringify(user) + '\nuserToChat: ' + JSON.stringify(userToChat));


    return(
        <View style={styles.container}>
            <View style={styles.topBar}>
                <View>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Icon name="arrow-left" type="feather" size={24} color="#fff"/>
                        <Text style={styles.backButtonText}>Go back</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{flex:1, marginTop: 75, backgroundColor: "#2A4BA0" }}>
                <View style={{flex:1, padding:16, backgroundColor: '#fff', margin: 25, borderRadius: 16, transform: [{ translateY: -pageHeight }] }}>
                    <ScrollView>
                      {chats.map((msg, idx) =>
                        Array.isArray(msg.content)
                        ? msg.content.map((item, subIdx) => (
                            <Text key={idx + '-' + subIdx} style={item.sender === user.id ? styles.sentMessage : styles.recievedMessage}>{item.content}</Text>
                            ))
                        : <Text key={idx}>{msg.content || msg.text}</Text>
                    )}
                    </ScrollView>
                    <View style={{display: "flex", flexDirection: "row", justifyContent: "space-between"}}>
                        <TextInput 
                            style={[styles.input, {width: '80%'}]}
                            onChangeText={setMessage}
                            value={message}
                            placeholder="Type something..."
                            onFocus={() => setPageHeight(325)}
                            onBlur={() => setPageHeight(0)}
                            multiline={true}
                            blurOnSubmit={true}
                            returnKeyType="done"
                        />
                        <TouchableOpacity
                            style={{backgroundColor:'#2A4BA0', justifyContent: "center", borderRadius: 100, width: 50}}
                            onPress={()=> {
                                sendMessage();
                                }
                            }
                        >
                            <Icon name='paper-airplane' type='octicon' size={32} style={{marginRight: -5}} color='#fff'/>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F6F8FC",
    },
    topBar: {
        flex: 1,
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
    backButton: {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: 'center',
        backgroundColor: '#4164C9',
        borderRadius: 16,
        paddingVertical: 8,
        paddingHorizontal: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.10,
        shadowRadius: 4,
        elevation: 2,
    },
    backButtonText: {
        color: "#fff",
        fontSize: 20,
        paddingLeft: 8,
        fontWeight: '600',
    },
    input: {
        borderColor: '#E3E6ED',
        borderWidth: 1.5,
        borderRadius: 16,
        fontSize: 18,
        padding: 14,
        backgroundColor: '#F6F8FC',
        color: '#222B45',
        marginBottom: 0,
    },
    sentMessage: {
        backgroundColor: '#E3E6ED',
        alignSelf: "flex-end",
        borderRadius: 12,
        marginVertical: 4,
        padding: 10,
        maxWidth: '75%',
    },
    recievedMessage: {
        backgroundColor: '#DCF8C6',
        alignSelf: "flex-start",
        borderRadius: 12,
        marginVertical: 4,
        padding: 10,
        maxWidth: '75%',
    },
})