import { useState } from "react";
import { SafeAreaView, View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { API_URL } from '@env';
import { useTranslation } from "react-i18next";
import { Icon } from "react-native-elements";

// creeer event component
export default function CreateEvent({ navigation, theme, token }) {
    const [title, setTitle] = useState("");
    const [date, setDate] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [companyId, setCompanyId] = useState("");
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();
    const styles = createEventStyles(theme);

    // Event aanmaken handelen
    const handleSubmit = async () => {
        // Controleer of alle velden zijn ingevuld
        if (!title || !date || !companyId) {
            // Toon een foutmelding als verplichte velden niet zijn ingevuld
            Alert.alert(t("createEvent.errorTitle"), t("createEvent.errorRequired"));
            return;
        }
        setLoading(true);
        try {
            // Controleer of de token aanwezig is
            if (!token) throw new Error(t("createEvent.errorNoToken"));

            // Controleer de velden en of de companyId een geldig getal is 
            const body = {
                title,
                date,
                company_id: parseInt(companyId, 10)
            };
            if (location) body.location = location;
            if (description) body.description = description;

            const res = await fetch(API_URL + '/api/events/new', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });
            // Controleer of de response ok is
            if (!res.ok) {
                let errorMsg = t('createEvent.errorCreate');
                try {
                    // Probeer de foutmelding van de server te lezen
                    const errorData = await res.json();
                    errorMsg = errorData.message || JSON.stringify(errorData);
                } catch (e) {
                    try {
                        // Probeer de tekst van de response te lezen
                        errorMsg = await res.text();
                    } catch {}
                }
                throw new Error(errorMsg);
            }
            // Toon een succesmelding en ga terug naar de vorige pagina
            Alert.alert(t("createEvent.successTitle"), t("createEvent.successMsg"));
            navigation.goBack();
        } catch (err) {
            Alert.alert(t("createEvent.errorTitle"), err.message);
        } finally {
            // laden uit (mag niet meer aan vandaag)
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
             <View style={styles.topBar}>
                 <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                     <Icon name="arrow-left" type="feather" size={24} color="#fff" />
                     <Text style={styles.backButtonText}>{t("createEvent.back")}</Text>
                 </TouchableOpacity>
             </View>
             <View style={styles.formWrapper}>
                 <View style={styles.formFields}>
                     <TextInput
                         style={styles.input}
                         value={title}
                         onChangeText={setTitle}
                         placeholder={t("createEvent.titlePlaceholder")}
                         placeholderTextColor={theme.text}
                     />
                     <TextInput
                         style={styles.input}
                         value={date}
                         onChangeText={setDate}
                         placeholder={t("createEvent.datePlaceholder")}
                         placeholderTextColor={theme.text}
                     />
                     <TextInput
                         style={[styles.input, styles.inputDescription]}
                         value={description}
                         onChangeText={setDescription}
                         placeholder={t("createEvent.descriptionPlaceholder")}
                         placeholderTextColor={theme.text}
                         multiline
                     />
                     <TextInput
                         style={styles.input}
                         value={location}
                         onChangeText={setLocation}
                         placeholder={t("createEvent.locationPlaceholder")}
                         placeholderTextColor={theme.text}
                     />
                     <TextInput
                         style={styles.input}
                         value={companyId}
                         onChangeText={setCompanyId}
                         placeholder={t("createEvent.companyIdPlaceholder")}
                         placeholderTextColor={theme.text}
                         keyboardType="numeric"
                     />
                 </View>
                 <View style={styles.uploadButtonWrapper}>
                     <Button title={loading ? t("createEvent.creating") : t("createEvent.createEvent")} onPress={handleSubmit} color={'white'} disabled={loading} />
                 </View>
             </View>
         </SafeAreaView>
     );
 }

function createEventStyles(theme) {
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
