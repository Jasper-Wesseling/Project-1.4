import { useState, useEffect } from "react";
import { Button, SafeAreaView, TextInput, View, Image, Alert, StyleSheet, TouchableOpacity, Text, ScrollView } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '@env';
import { Icon } from "react-native-elements";
import DropDownPicker from 'react-native-dropdown-picker';
import * as ImageManipulator from 'expo-image-manipulator';

// Accept token as prop
export default function AddProduct({ navigation, token }) {
    
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState('');
    const [items, setItems] = useState([
        { label: 'Boeken', value: 'Boeken' },
        { label: 'Electra', value: 'Electra' },
        { label: 'Huis en tuin', value: 'Huis en tuin' }
    ]);
    const [price, setPrice] = useState('');
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(false);

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
        if (!photo || !title || !description || !value || !price)
        {
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
        priceToDb = parseInt(priceToDb.trim().replace(",",""))
        
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

        try {
            // Use token prop for authentication
            if (!token) {
                Alert.alert('Niet ingelogd', 'Je bent niet ingelogd.');
                return;
            }
            const response = await fetch(API_URL + '/api/products/new', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Do NOT set Content-Type for FormData; let fetch set it
                },
                body: formData,
            });

            const data = await response.text();
            setLoading(false);
            setPhoto(null);
            setTitle('');
            setDescription('');
            setValue('');
            setPrice('')
            Alert.alert('Success', '', [{
                text: 'OK',
                onPress: () => navigation.goBack()
            }]);
        } catch (error) {
            console.error(error);
            Alert.alert('Upload Gefaald', 'Probeer opnieuw');
        }
    }

    const [pageHeight, setPageHeight] = useState(0);
    
    return(
        <SafeAreaView style={styles.container}>
            <View style={styles.topBar}>
                <View>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Icon name="arrow-left" type="feather" size={24} color="#fff"/>
                        <Text style={styles.backButtonText}>Go back</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={[styles.formWrapper, { transform: [{ translateY: -pageHeight }] }]}>
                <View style={styles.formFields}>
                    {/* Show photo at the top, styled as a main product image */}
                    <View style={styles.imageContainer}>
                        {photo ? (
                            <Image
                                source={{uri: photo.uri}}
                                style={styles.mainPhoto}
                            />
                        ) : (
                            <TouchableOpacity style={styles.imagePlaceholder} onPress={pickImage}>
                                <Icon name="camera" type="feather" size={48} color="#B0B8C1" />
                                <Text style={styles.imagePlaceholderText}>Voeg een foto toe</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <TextInput
                        style={styles.input}
                        onChangeText={setTitle}
                        value={title}
                        placeholder="Title"
                        
                    />
                    <TextInput
                        style={[styles.input, styles.inputDescription]}
                        onChangeText={setDescription}
                        value={description}
                        placeholder="Description"
                        multiline
                        submitBehavior={"blurAndSubmit"}
                        returnKeyType="done"
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
                        returnKeyType="done"
                        onFocus={() => setPageHeight(300)}
                        onBlur={() => setPageHeight(0)}
                    />
                    <TouchableOpacity style={styles.uploadButton} onPress={uploadProduct}>
                        <Text style={styles.uploadButtonText}>Upload</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F6F8FC",
        minHeight: 1000
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 6,
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
    formWrapper: {
        flex: 1,
        justifyContent: "center", // Center vertically between top and bottom bar
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    formFields: {
        flex: 1,
        position: "absolute",
        top: 50,
        left: 0,
        right: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: 24,
        paddingHorizontal: 24,
        gap: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.10,
        shadowRadius: 8,
        elevation: 4,
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
    inputDescription: {
        height: 100,
        textAlignVertical: 'top',
    },
    photo: {
        width: 200,
        height: 200,
        marginVertical: 10,
        borderRadius: 16,
        alignSelf: 'center',
        borderWidth: 1.5,
        borderColor: '#E3E6ED',
        backgroundColor: '#F6F8FC',
    },
    mainPhoto: {
        width: '100%',
        height: 220,
        borderRadius: 20,
        alignSelf: 'center',
        marginBottom: 8,
        borderWidth: 1.5,
        borderColor: '#E3E6ED',
        backgroundColor: '#F6F8FC',
        resizeMode: 'cover',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.10,
        shadowRadius: 8,
        elevation: 4,
    },
    imageContainer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 8,
    },
    imagePlaceholder: {
        width: '92%',
        height: 220,
        borderRadius: 20,
        backgroundColor: '#E7ECF0',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: '#E3E6ED',
        marginTop: 16,
        marginBottom: 8,
    },
    imagePlaceholderText: {
        color: '#B0B8C1',
        fontSize: 16,
        marginTop: 8,
    },
    uploadButton: {
        backgroundColor: '#2A4BA0',
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
    },
    uploadButtonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
});