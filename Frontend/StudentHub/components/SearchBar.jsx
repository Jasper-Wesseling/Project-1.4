import { Modal, TextInput, View, StyleSheet } from "react-native";

export default function SearchBar({ visible , value, onChange, onClose }) {
    
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
                        placeholder="Search..."
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

const styles = StyleSheet.create({
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
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 12,
        height: 40,
        width: '90%',
        fontSize: 18,
    },
});