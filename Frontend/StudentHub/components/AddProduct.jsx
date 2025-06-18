import { useState } from "react";
import { SafeAreaView, TextInput, View, Image, Alert, StyleSheet, TouchableOpacity, Text, useRef } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '@env';
import { Icon } from "react-native-elements";
import DropDownPicker from 'react-native-dropdown-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useTranslation } from 'react-i18next';

// Accept token as prop
export default function AddProduct({ navigation, token, theme }) {
    const { t } = useTranslation();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState('');
    const [items, setItems] = useState([
        { label: t('boeken'), value: 'Boeken' },
        { label: t('electra'), value: 'Electra' },
        { label: t('huis_en_tuin'), value: 'Huis en tuin' }
    ]);
    const [price, setPrice] = useState('');
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(false);
    const styles = createAddProductsStyles(theme);

const showPhotoOptions = () => {
    Alert.alert(
        'Foto toevoegen',
        'Kies een optie',
        [
            { text: 'Annuleren', style: 'cancel' },
            { text: 'Foto maken', onPress: takePhoto },
            { text: 'Selecteer uit galerij', onPress: selectPhoto },
        ]
    );
};

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        
        if (status !== 'granted') {
            Alert.alert('Sorry, we hebben camera toegang nodig!');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            // Handle foto
            console.log('Photo taken:', result.assets[0]);
        }
    };

    const selectPhoto = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (status !== 'granted') {
            Alert.alert('Sorry, we hebben galerij toegang nodig!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            // Handle foto
            console.log('Photo selected:', result.assets[0]);
        }
    };

    const uploadProduct = async () => {
        if (!photo || !title || !description || !value || !price) {
            Alert.alert(t('error'), t('fill_all_fields'));
            return;
        }
        if (price.charAt(0) === '0' && price.length > 1) {
            Alert.alert(t('error'), t('price_leading_zero'));
            return;
        }

        if (price.includes(",")) {
            if ((price.split(",").length - 1) > 1 || price.split(",")[1]?.length !== 2) {
                Alert.alert(t('error'), t('invalid_price'));
                return;
            }
        }
        let priceToDb = price;
        priceToDb = parseInt(priceToDb.trim().replace(",", ""))

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
            if (!token) {
                Alert.alert(t('not_logged_in'), t('login_required'));
                return;
            }
            const response = await fetch(API_URL + '/api/products/new', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            const data = await response.text();
            setLoading(false);
            setPhoto(null);
            setTitle('');
            setDescription('');
            setValue('');
            setPrice('');
            Alert.alert(t('success'), t('product_uploaded'), [{
                text: t('ok'),
                onPress: () => navigation.goBack()
            }]);
        } catch (error) {
            console.error(error);
            Alert.alert(t('upload_failed'), t('try_again'));
        }
    }

    const [pageHeight, setPageHeight] = useState(0);

    const descriptionInputRef = useRef(null);
    const categoryInputRef = useRef(null);
    const priceInputRef = useRef(null);

    const focusInput = (inputRef) => {
        inputRef.current?.focus();
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topBar}>
                <View>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Icon name="arrow-left" type="feather" size={24} color="#fff" />
                        <Text style={styles.backButtonText}>{t('go_back')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={[styles.formWrapper, { transform: [{ translateY: -pageHeight }] }]}>
                <View style={styles.formFields}>
                    <View style={styles.imageContainer}>
                        {photo ? (
                            <Image
                                source={{ uri: photo.uri }}
                                style={styles.mainPhoto}
                            />
                        ) : (
                            <TouchableOpacity style={styles.imagePlaceholder} onPress={showPhotoOptions}>
                                <Icon name="camera" type="feather" size={48} color="#B0B8C1" />
                                <Text style={styles.imagePlaceholderText}>{t('add_photo')}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <TextInput
                        style={styles.input}
                        onChangeText={setTitle}
                        value={title}
                        placeholder={t('title')}
                        placeholderTextColor={theme.text}
                        onSubmitEditing={() => focusInput(descriptionInputRef)}
                    />
                    <TextInput
                        ref={descriptionInputRef} 
                        style={[styles.input, styles.inputDescription]}
                        onChangeText={setDescription}
                        value={description}
                        placeholder={t('description')}
                        multiline
                        submitBehavior={"blurAndSubmit"}
                        returnKeyType="done"
                        placeholderTextColor={theme.text}
                    />
                    <DropDownPicker
                        ref={categoryInputRef}
                        open={open}
                        value={value}
                        items={items}
                        setOpen={setOpen}
                        setValue={setValue}
                        setItems={setItems}
                        placeholder={t('select_category')}
                        style={styles.input}
                        textStyle={{ color: theme.text }}
                        dropDownContainerStyle={{ backgroundColor: theme.formBg }}
                        onSubmitEditing={() => focusInput(priceInputRef)}
                    />
                    <TextInput
                        ref={priceInputRef}
                        style={styles.input}
                        onChangeText={setPrice}
                        value={price}
                        placeholder={t('price')}
                        keyboardType="numeric"
                        returnKeyType="done"
                        onFocus={() => setPageHeight(300)}
                        onBlur={() => setPageHeight(0)}
                        placeholderTextColor={theme.text}
                    />
                    <TouchableOpacity style={styles.uploadButton} onPress={uploadProduct}>
                        <Text style={styles.uploadButtonText}>{t('upload')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}
function createAddProductsStyles(theme) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background,
            minHeight: 1000
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
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.12,
            shadowRadius: 8,
            elevation: 6,
        },
        backButton: {
            flexDirection: "row",
            alignItems: 'center',
            backgroundColor: theme.background,
            borderRadius: 16,
            paddingVertical: 8,
            paddingHorizontal: 14,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.10,
            shadowRadius: 4,
            elevation: 2,
        },
        backButtonText: {
            color: theme.text,
            fontSize: 20,
            paddingLeft: 8,
            fontWeight: '600',
        },
        formWrapper: {
            flex: 1,
            justifyContent: "center",
            alignItems: 'center',
            backgroundColor: theme.background,
        },
        formFields: {
            position: "absolute",
            top: 50,
            left: 0,
            right: 0,
            width: '100%',
            height: '100%',
            backgroundColor: theme.background,
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
            borderColor: 'grey',
            backgroundColor: theme.formBg,
            borderWidth: 1.5,
            borderRadius: 16,
            fontSize: 18,
            padding: 14,
            color: '#222B45',
        },
        inputDescription: {
            height: 100,
            textAlignVertical: 'top',
            backgroundColor: theme.formBg,
        },
        mainPhoto: {
            width: '100%',
            height: 220,
            borderRadius: 20,
            marginBottom: 8,
            borderWidth: 1.5,
            borderColor: 'grey',
            backgroundColor: theme.formBg,
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
            backgroundColor: theme.formBg,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1.5,
            borderColor: 'grey',
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
}
