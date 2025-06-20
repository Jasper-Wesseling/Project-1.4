import { Image, SafeAreaView, View, Text } from "react-native";

// laad onderdeel, deze duurt super lang om te laden, dus laten we een laadscherm maken
export default function LoadingScreen() {
    return(
        <SafeAreaView style={{ flex: 1, backgroundColor: '#2A4BA0' }}> {/* veilige beeld */}
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}> {/* Styling */}
                <Image source={require('../assets/favicon.png')} style={{ width: 200, height: 200, marginBottom: 20 }} /> {/* Studenthub logo */}
                <Text style={{fontSize: 64, color: 'white'}}>StudentHub</Text> {/* Studenthubnaam */ }
            </View>
        </SafeAreaView>
    );
}