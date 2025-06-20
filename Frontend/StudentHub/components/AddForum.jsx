import { useState } from "react";
import { Button, SafeAreaView, TextInput, View, Image, Alert, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '@env';
import { Icon } from "react-native-elements";
import DropDownPicker from 'react-native-dropdown-picker';
import { useTranslation } from 'react-i18next';

// Forum artikel toevoegen component
export default function AddForum({ navigation, token, theme }) {
    const [title, onChangeTitle] = useState('');
    const [content, onChangecontent] = useState('');
    const [open, setOpen] = useState(false);
    const [category, setCategory] = useState('');
    const [items, setItems] = useState([
        { label: 'Plannen', value: 'Plannen' },
        { label: 'Stress', value: 'Stress' },
        { label: 'Vakken', value: 'Vakken' },
        { label: 'Sociale tips', value: 'Sociale tips' },
        { label: 'Huiswerk', value: 'Huiswerk' },
        { label: 'Presentaties', value: 'Presentaties' },
        { label: 'Samenwerken', value: 'Samenwerken' },
        { label: 'Stage', value: 'Stage' },
        { label: 'Overig', value: 'Overig' },
    ]);
    const [image, setImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const styles = createAddForumStyles(theme);
    const { t } = useTranslation();

    const translatedItems = items.map(item => ({
        label: t(`${item.value.toLowerCase()}`),
        value: item.value
    }));
    // foto uploaden
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
        });
        // wanneer geannuleerd foto weer op null zetten
        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImage(result.assets[0].uri);
        }
    };

    // Forum artikel uploaden
    const uploadForum = async () => {
        // checken of alle velden zijn ingevuld
        if (!title || !content || !category) {
            Alert.alert('Error', 'Fill in all fields');
            return;
        }
        // laden aanzetten
        setUploading(true);

        try {
            // token check
            if (!token) throw new Error("No token received");
            // data uit form verzamelen
            let formData = new FormData();
            formData.append("title", title);
            formData.append("content", content);
            formData.append("category", category);
            // als er een foto deel aan formData toevoegen
            if (image) {
                const filename = image.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;
                formData.append("image", {
                    uri: image,
                    name: filename,
                    type,
                });
            }
            // API call om forum artikel toe te voegen
            const response = await fetch(API_URL + '/api/forums/new', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });
            // checken of de response ok is en daarna laden uitzetten
            if (!response.ok) throw new Error("add forum failed");
            setUploading(false);
            navigation.goBack();

        } catch (error) {
            // als er een error is laden uitzetten en error tonen
            setUploading(false);
            console.error(error);
            Alert.alert('Upload Failed', 'Try again');
        }
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
            <View style={styles.formWrapper}>
                <View style={styles.formFields}>
                    <TextInput
                        style={styles.input}
                        onChangeText={onChangeTitle}
                        text={{ color: theme.text }}
                        placeholderTextColor={theme.text}
                        value={title}
                        placeholder={t('titlePlaceholder')}
                    />
                    <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                        <Text style={styles.imagePickerText}>
                            {image ? t('changeImage') : t('uploadImage')}
                        </Text>
                    </TouchableOpacity>
                    {image && (
                        <Image
                            source={{ uri: image }}
                            style={styles.previewImage}
                        />
                    )}
                    <TextInput
                        multiline
                        style={[styles.input, styles.inputcontent]}
                        onChangeText={onChangecontent}
                        placeholderTextColor={theme.text}
                        value={content}
                        placeholder={t('contentPlaceholder')}
                    />
                    <DropDownPicker
                        open={open}
                        value={category}
                        items={translatedItems}
                        setOpen={setOpen}
                        setValue={setCategory}
                        setItems={setItems}
                        placeholder={t('selectCategory')}
                        style={styles.input}
                        textStyle={{ color: theme.text }}
                        dropDownContainerStyle={{ backgroundColor: theme.formBg}}
                    />
                </View>
                <View style={styles.uploadButtonWrapper}>
                    {uploading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Button
                        title={t('upload')}
                        onPress={uploadForum}
                        color="white"
                        />
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
}

function createAddForumStyles(theme) {
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
        },
        backButton: {
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: 'center',
        },
        backButtonText: {
            color: "#fff",
            fontSize: 24,
            paddingLeft: 8,
        },
        formWrapper: {
            flex: 1,
            paddingTop: 100,
            paddingHorizontal: 16,
            justifyContent: "space-between",
            color: theme.text,
        },
        formFields: {
            gap: 20,
        },
        input: {
            borderColor: 'grey',
            backgroundColor: theme.formBg,
            color: theme.text,
            borderWidth: 1,
            borderRadius: 16,
            fontSize: 24,
            padding: 12,
            textAlign: 'left',
            textAlignVertical: 'top',
        },
        inputcontent: {
            height: 100,
            color: theme.text,
        },
        imagePicker: {
            backgroundColor: "#FFC83A",
            borderRadius: 16,
            padding: 12,
            alignItems: "center",
        },
        imagePickerText: {
            color: "#2A4BA0",
            fontWeight: "bold",
            fontSize: 16,
        },
        previewImage: {
            width: "100%",
            height: 180,
            borderRadius: 16,
            marginTop: 8,
            marginBottom: 8,
            resizeMode: "cover",
        },
        uploadButtonWrapper: {
            marginBottom: 50,
            padding: 20,
            backgroundColor: "#2A4BA0",
            width: 200,
            alignSelf: "center",
            borderRadius: 100,
        },
    });
}