import { use, useEffect, useRef, useState } from "react";
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { ScrollView, TextInput } from "react-native-gesture-handler";
import { Icon } from 'react-native-elements';
import { API_URL } from '@env';


export default function ProductChat({ navigation, token, user, route}) {
    const userIDReciever = userToChat;
    const [chats, setChats] = useState([]);
    const [message, setMessage] = useState('');
    const [productTitle, setProductTitle] = useState('');
    const [receiverName, setReceiverName] = useState('');
    const [pageHeight, setPageHeight] = useState(0);
    const { product, userToChat } = route.params;
    console.log('product id: '+product)
    console.log('usertochat: '+userToChat)

    const fetchChats = async () => {
        try {
            const chatsRes = await fetch(API_URL + `/api/messages/get?reciever=${encodeURIComponent(userToChat)}&product=${encodeURIComponent(product)}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!chatsRes.ok) {
                const errorText = await chatsRes.text();
                console.error("Backend error:", errorText);
                throw new Error("messages fetch failed");
            };

            const chatData = await chatsRes.json();
            setChats(chatData.messages);
            setReceiverName(chatData.receiver);
            setProductTitle(chatData.product);
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
        const tempId = Date.now();
        setChats(prevChats => [
            ...prevChats,
            {
            id: tempId,
            content: message,
            sender: user.id,
            // add other fields if needed (e.g., timestamp)
            }
        ]);
        setMessage('');
        try {
            const response = await fetch(API_URL + `/api/messages/new`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: message,
                    receiver: userToChat, 
                    product: product,
                }),
            });
            if (!response.ok) {
                setChats(prevChats => prevChats.map(msg => msg.id === tempId ? {...msg,  content: '[Failed to send] ' + msg.content } : msg));
            }
            fetchChats();
        } catch (err) {
            console.error("API error:", err);
        }
    }
    console.log('user: ' + JSON.stringify(user) + '\nuserToChat: ' + JSON.stringify(userToChat));
    const scrollViewRef = useRef(null);
    useEffect(() => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: true });
        }
    }, [chats]);

    const name = user && user.full_name ? user.full_name.split(' ')[0] : "";                               //fix fetching user and product


    return(
        <View style={styles.container}>
            <View style={[styles.topBar, {height: 125, backgroundColor: "#2A4BA0", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, paddingTop:32 }]}>
                <Icon name='arrow-left' type='feather' size={24} color='#fff' onPress={() => navigation.goBack()}/>
                <View style={{ width: '80%', alignItems: 'flex-start', justifyContent: 'center'}}>
                    {/* profile picture */}
                    <Text style={{fontSize: 24, color: '#fff'}}>{receiverName}</Text>
                    <Text style={{fontSize: 16, color: '#fff'}}>{productTitle}</Text>
                </View>
            </View>
            <View
                style={{
                    flex:1,
                    padding: 32,
                    backgroundColor: '#fff',
                    transform: [{ translateY: -pageHeight }]
                }}
            >
                <ScrollView
                    ref={scrollViewRef}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end', paddingBottom: 40, paddingTop: 100 }}
                >
                    {chats.map((msg, idx) => (
                        <Text
                            key={idx}
                            style={msg.sender === user.id ? styles.sentMessage : styles.recievedMessage}
                        >
                            {msg.content}
                        </Text>
                    ))}
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
                            scrollViewRef.current && scrollViewRef.current.scrollToEnd({ animated: true });
                        }}
                    >
                        <Icon name='paper-airplane' type='octicon' size={32} style={{marginRight: -5}} color='#fff'/>
                    </TouchableOpacity>
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
    scrollViewContent: {
      paddingTop: 100,
      paddingBottom: 40,
   },
})