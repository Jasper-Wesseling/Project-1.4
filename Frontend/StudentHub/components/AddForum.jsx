import { useState } from "react";
import { Button, SafeAreaView, TextInput, View, Image, Alert, StyleSheet, TouchableOpacity, Text } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '@env';
import { Icon } from "react-native-elements";
import DropDownPicker from 'react-native-dropdown-picker';
import * as ImageManipulator from 'expo-image-manipulator';


export default function AddForum({ navigation, token }) {
    
    const [title, onChangeTitle] = useState('');
    const [content, onChangecontent] = useState('');
    const [open, setOpen] = useState(false);
    const [category, setCategory] = useState('');
    const [items, setItems] = useState([
        { label: 'Local', value: 'Local' },
        { label: 'Remote', value: 'Remote' },
    ]);
    const [loading, setLoading] = useState(true);


    const uploadForum = async () => {
        if (!title || !content || !category)
        {
            Alert.alert('Error', 'Fill in all fields');
            return;
        }

        try {
            if (!token) throw new Error("No token received");

            const response = await fetch(API_URL + '/api/forums/new', {
                method: 'POST',
                headers: {
                    // Do NOT set Content-Type for FormData; let fetch set it
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    "title": title,
                    "content": content,
                    "category": category,
                }),
            });
            if (!response.ok) throw new Error("add forum failed");
            setLoading(false);
            Alert.alert('Succesfully Created!', '', [{
                text: 'OK',
                onPress : () => navigation.goBack()
            }]);
        } catch (error) {
            console.error(error);
            Alert.alert('Upload Failed', 'Try again');
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topBar}>
                <View>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Icon name="arrow-left" type="feather" size={24} color="#fff"/>
                        <Text style={styles.backButtonText}>Go back</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.formWrapper}>
                <View style={styles.formFields}>
                    <TextInput
                        style={styles.input}
                        onChangeText={onChangeTitle}
                        value={title}
                        placeholder="Title"
                    />
                    <TextInput
                        multiline
                        style={[styles.input, styles.inputcontent]}
                        onChangeText={onChangecontent}
                        value={content}
                        placeholder="content"
                    />
                    <DropDownPicker
                        open={open}
                        value={category}
                        items={items}
                        setOpen={setOpen}
                        setValue={setCategory}
                        setItems={setItems}
                        placeholder="Select a category"
                        style={styles.input}
                    />
                </View>
                <View style={styles.uploadButtonWrapper}>
                    <Button title="Upload" onPress={uploadForum} color={'white'}/>
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
        borderWidth: 1,
        borderRadius: 16,
        fontSize: 24,
        padding: 12,
        textAlign: 'left',
        textAlignVertical: 'top',
    },
    inputcontent: {
        height: 100,
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