import { useState } from "react";
import { Button, SafeAreaView, TextInput, View, Alert, StyleSheet, TouchableOpacity, Text } from "react-native";
import { API_URL } from '@env';
import { Icon } from "react-native-elements";
import DropDownPicker from 'react-native-dropdown-picker';
import { useTranslation } from 'react-i18next';

// Post toevoegen component
export default function AddPost({ navigation, token, theme }) {
    const { t } = useTranslation();

    const [title, onChangeTitle] = useState('');
    const [description, onChangeDescription] = useState('');
    const [open, setOpen] = useState(false);
    const [type, setType] = useState('');
    const [items, setItems] = useState([
        { label: t('post.type.local'), value: 'Local' },
        { label: t('post.type.remote'), value: 'Remote' },
    ]);
    const [loading, setLoading] = useState(true);
    const styles = createAddPostStyles(theme);

    // post uploaden
    const uploadPost = async () => {
        // checken of alle velden zijn ingevuld
        if (!title || !description || !type) {
            Alert.alert(t('error'), t('fill_all_fields'));
            return;
        }
        try {
            // token check
            if (!token) throw new Error("No token received");
            const response = await fetch(API_URL + '/api/posts/new', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    "title": title,
                    "description": description,
                    "type": type,
                }),
            });
            // checken of de response ok is en laden uitzetten
            if (!response.ok)
                setLoading(false);
                Alert.alert(t('successfully_created'), '', [{
                text: t('ok'),
                onPress: () => navigation.goBack()
            }]);
        } catch (error) {
            // laden uitzetten en foutmelding tonen
            setLoading(false);
            console.error(error);
            Alert.alert(t('upload_failed'), t('try_again'));
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
                        value={title}
                        placeholder={t('title')}
                        placeholderTextColor={theme.text}
                    />
                    <TextInput
                        multiline
                        style={[styles.input, styles.inputDescription]}
                        onChangeText={onChangeDescription}
                        value={description}
                        placeholder={t('description')}
                        placeholderTextColor={theme.text}
                    />
                    <DropDownPicker
                        open={open}
                        value={type}
                        items={items}
                        setOpen={setOpen}
                        setValue={setType}
                        setItems={setItems}
                        placeholder={t('select_category')}
                        style={styles.input}
                        textStyle={{ color: theme.text }}
                        dropDownContainerStyle={{ backgroundColor: theme.formBg }}
                    />
                </View>
                <View style={styles.uploadButtonWrapper}>
                    <Button title={t('upload')} onPress={uploadPost} color={'white'} />
                </View>
            </View>
        </SafeAreaView>
    );
}

function createAddPostStyles(theme) {
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
        },
        formFields: {
            gap: 20,
        },
        input: {
            borderColor: 'grey',
            color: theme.text,
            backgroundColor: theme.formBg,
            borderWidth: 1,
            borderRadius: 16,
            fontSize: 24,
            padding: 12,
            textAlign: 'left',
            textAlignVertical: 'top',
        },
        inputDescription: {
            height: 100,
            color: theme.text,
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
