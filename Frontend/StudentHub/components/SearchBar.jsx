import { Modal, TextInput, View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

// to prevent run time error undifind
export default function SearchBar({ visible, value, onChange, onClose, theme = { searchBg: "#fff" } }) {
    const styles = createSearchBarStyles(theme);
    const { t } = useTranslation();
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <TextInput
                        style={styles.input}
                        placeholder={t("searchBar.placeholder")}
                        value={value}
                        onChangeText={onChange}
                        onSubmitEditing={onClose}
                        returnKeyType="search"
                        autoFocus
                    />
                </View>
            </View>
        </Modal>
    );
}

function createSearchBarStyles(theme) {
    return StyleSheet.create({
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
        },
        modalContent: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 100,
        },
        input: {
            margin: 16,
            borderRadius: 16,
            backgroundColor: theme.searchBg,
            paddingHorizontal: 12,
            height: 40,
            width: '90%',
            fontSize: 18,
        },
    });
}