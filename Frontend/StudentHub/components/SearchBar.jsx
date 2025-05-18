import { Modal, TextInput, View } from "react-native";


export default function SearchBar({ visible , value, onChange, onClose }) {
    
    return(
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)'}}>
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 100,
                }}>
                    <TextInput
                        style={{
                            margin: 16,
                            borderRadius: 16,
                            backgroundColor: '#f0f0f0',
                            paddingHorizontal: 12,
                            height: 40,
                            width: '90%',
                            fontSize: 18,
                        }}
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