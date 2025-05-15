import { useState } from "react";
import { Button, SafeAreaView, TextInput, View, Image, Alert } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '@env';


export default function AddProduct() {
    
    const [title, onChangeTitle] = useState('');
    const [description, onChangeDescription] = useState('');
    const [studyTag, onChangeStudyTag] = useState('');
    const [price, onChangePrice] = useState('');
    const [photo, setPhoto] = useState(null);
    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({mediaType: 'image'});

        if (result.assets && result.assets.length > 0) {
            setPhoto(result.assets[0]);
        }
    };

    const uploadProduct = async () => {
        if (!photo || !title || !description || !studyTag || !price)
        {
            Alert.alert('Error', 'Please provide all fields including image.');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('studyTag', studyTag);
        formData.append('price', price);
        formData.append('photo', {
            uri: photo.uri,
            name: photo.fileName || 'photo.jpg',
            type: photo.type || 'image/jpeg',
        });

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
            Alert.alert('Success');
        } catch (error) {
            console.error(error);
            Alert.alert('Upload Failed', 'Please try again.');
        }
    }
    // in backend !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // $photo = $request->files->get('photo');

    return(
        <SafeAreaView style={{ flex: 1, backgroundColor: 'pink' }}>
            <View style={{ flex: 1 }}>
                <TextInput
                style={{ borderColor: 'black', borderWidth: 1}}
                onChangeText={onChangeTitle}
                value={title}
                placeholder="Title"
                />
                <TextInput
                style={{ borderColor: 'black', borderWidth: 1}}
                onChangeText={onChangeDescription}
                value={description}
                placeholder="Description"
                />
                <TextInput
                style={{ borderColor: 'black', borderWidth: 1}}
                onChangeText={onChangeStudyTag}
                value={studyTag}
                placeholder="Study-Tag"
                />
                <TextInput
                style={{ borderColor: 'black', borderWidth: 1}}
                onChangeText={onChangePrice}
                value={price}
                placeholder="Price"
                />
                <Button title="Pick Image" onPress={pickImage} />
                <Button title="Upload" onPress={uploadProduct} />
                {photo && (
                    <Image
                    source={{uri: photo.uri}}
                    style={{width: 200,height: 200,marginVertical: 10,borderRadius: 10, alignSelf: 'center'}}
                    />
                )}
                <Image source={{uri: `${API_URL}/uploads/68261c2d11cb8.jpg`}} style={{ width: 200, height: 200 }}/>
            </View>
        </SafeAreaView>
    );
}