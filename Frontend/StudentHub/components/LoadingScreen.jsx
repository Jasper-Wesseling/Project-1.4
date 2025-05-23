import { Image, SafeAreaView, View, Text } from "react-native";


export default function LoadingScreen() {
    return(
        <SafeAreaView style={{ flex: 1, backgroundColor: '#2A4BA0' }}>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <Image source={require('../assets/favicon.png')} style={{ width: 200, height: 200, marginBottom: 20 }}/>
                <Text style={{fontSize: 64, color: 'white'}}>StudentHub</Text>
            </View>
        </SafeAreaView>
    );
}