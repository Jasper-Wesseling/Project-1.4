import { useState } from "react";
import { Button, SafeAreaView, TextInput, View, Image } from "react-native";
import * as ImagePicker from 'expo-image-picker';

export default function AddProduct() {

    const [title, onChangeTitle] = useState('');
    const [description, onChangeDescription] = useState('');
    const [studyTag, onChangeStudyTag] = useState('');
    const [price, onChangePrice] = useState('');
    const [image, setImage] = useState(null);
    const uploadProduct = async () => {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('study_tag', studyTag);
        formData.append('price', price);

        if (image) {
            formData.append('photo', {
                uri: image,
                name: 'photo.jpg',
                type: 'image/jpeg'
            });
        }

        const res = await fetch('http://YOUR_BACKEND_URL/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'multipart/form-data',
                // Add Authorization header if needed
            },
            body: formData
        });

        const data = await res.json();
        console.log(data);
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

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
                <Button title="Pick an image" onPress={pickImage} />
                {image && <Image source={{ uri: image }} style={{ width: 200, height: 200, marginTop: 10 }} />}
                <Button title="Save Product" onPress={uploadProduct} />
            </View>
        </SafeAreaView>
    );
}