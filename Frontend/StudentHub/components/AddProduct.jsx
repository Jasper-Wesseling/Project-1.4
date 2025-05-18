import { useState } from "react";
import { Button, SafeAreaView, TextInput, View, Image, Alert, StyleSheet, TouchableOpacity, Text } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '@env';
import { Icon } from "react-native-elements";
import DropDownPicker from 'react-native-dropdown-picker';
import * as ImageManipulator from 'expo-image-manipulator';


export default function AddProduct({ navigation }) {
    
    const [title, onChangeTitle] = useState('');
    const [description, onChangeDescription] = useState('');
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState('');
    const [items, setItems] = useState([
        { label: 'Boeken', value: 'Boeken' },
        { label: 'Electra', value: 'Electra' },
        { label: 'Huis en tuin', value: 'Huis en tuin' }
    ]);
    const [price, setPrice] = useState('');
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(true);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({mediaType: 'image'});

        if (result.assets && result.assets.length > 0) {
            const manipResult = await ImageManipulator.manipulateAsync(
                result.assets[0].uri,
                [{ resize: { width: 1200 } }],
                { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
            );
            setPhoto({
                uri: manipResult.uri,
                fileName: result.assets[0].fileName || 'photo.jpg',
                type: 'image/jpeg',
            });
        }
    };

    const uploadProduct = async () => {
        console.log(price)
        if (!photo || !title || !description || !value || !price)
        {
            console.log(!photo, !title, !description, !value, !price)
            Alert.alert('Error', 'Alle velden invullen AUB');
            return;
        }
        if (price.charAt(0) === '0' && price.length > 1)
        {
            Alert.alert('Prijs mag niet beginnen met 0');
            return;
        }

        if (price.includes(",")) {
            if ((price.split(",").length - 1) > 1 || price.split(",")[1]?.length !== 2 ) {
                Alert.alert('Vul een valide prijs in!');
                return;
            }
        }
        let priceToDb = price;
        console.log('here');
        priceToDb = parseInt(priceToDb.trim().replace(",","")+"00")
        
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('studyTag', value);
        formData.append('price', priceToDb);
        formData.append('photo', {
            uri: photo.uri,
            name: photo.fileName || 'photo.jpg',
            type: photo.type || 'image/jpeg',
        });
        console.log('here');

        try {
            const loginRes = await fetch(API_URL + '/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "username": "jasper.wesseling@student.nhlstenden.com",
                    "password": "wesselingjasper",
                    "full_name": "Jasper Wesseling"
                })
            });
            if (!loginRes.ok) throw new Error("Login failed");
            const loginData = await loginRes.json();
            const token = loginData.token || loginData.access_token;
            if (!token) throw new Error("No token received");


            const response = await fetch(API_URL + '/api/products/new', {
                method: 'POST',
                headers: {
                    // Do NOT set Content-Type for FormData; let fetch set it
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            const data = await response.text();
            setLoading(false);
        } catch (error) {
            console.error(error);
            Alert.alert('Upload Gefaald', 'Probeer opnieuw');
        }
    }
    

    if (!loading) {
        Alert.alert('Success', '', [{
            text: 'OK',
            onPress : () => navigation.goBack()
        }]);
    }

    return(
        <SafeAreaView style={styles.container}>
            <View style={styles.topBar}>
                <View>
                    <TouchableOpacity style={{ display: 'flex', flexDirection: "row", justifyContent: "flex-start", alignItems: 'center'}} onPress={() => navigation.goBack()}>
                        <Icon name="arrow-left" type="feather" size={24} color="#fff"/>
                        <Text style={{ color: "#fff", fontSize: 24, paddingLeft: 8  }}>Go back</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{ flex: 1, paddingTop: 100, paddingHorizontal: 16, display: 'flex', justifyContent: "space-between" }}>
                <View style={{display: 'flex', gap:20}}>
                    <TextInput
                    style={styles.input}
                    onChangeText={onChangeTitle}
                    value={title}
                    placeholder="Title"
                    />
                    <TextInput
                    multiline
                    style={[styles.input, {height: 100}]}
                    onChangeText={onChangeDescription}
                    value={description}
                    placeholder="Description"
                    />
                    <DropDownPicker
                    open={open}
                    value={value}
                    items={items}
                    setOpen={setOpen}
                    setValue={setValue}
                    setItems={setItems}
                    placeholder="Select a category"
                    style={styles.input}
                    />

                    <TextInput
                    style={styles.input}
                    onChangeText={setPrice}
                    value={price}
                    placeholder="Price"
                    keyboardType="numeric"
                    />

                    {photo && (
                    <Image
                    source={{uri: photo.uri}}
                    style={{width: 200,height: 200,marginVertical: 10,borderRadius: 10, alignSelf: 'center'}}
                    />
                )}
                </View>
                <View>
                    <Button title="Pick Image" onPress={pickImage} />
                    <Button title="Upload" onPress={uploadProduct} />
                </View>
            </View>
        </SafeAreaView>
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
    input: {
        borderColor: 'grey', 
        borderWidth: 1,
        borderRadius: 16,
        fontSize: 24,
        padding: 12,
        textAlign: 'left',
        textAlignVertical: 'top',
    },
})