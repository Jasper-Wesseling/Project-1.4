import { Image, Text, View } from "react-native";

export default function ProductPreview({ product }) {
    if (!product) return null;

    const subStringLength = 20

    return (
        <View style={{ height: 175, width: '90%', alignSelf: 'center', backgroundColor: 'grey', marginVertical: 20, display: 'flex', flexDirection: 'row'}}>
            <Image 
                source={require('../assets/icon.png')}
                style={{ height: 175, width: 175, borderRadius: 20 }}
            />
            <View style={{ display: 'flex', justifyContent: 'space-between', padding: 15 }}>
                <View style={{ gap: 10 }}>
                    <Text>{product.title}</Text>
                    <Text style={{flexWrap: 'wrap', maxWidth: 150}}>{product.description.length > subStringLength ? product.description.substring(0,subStringLength) + '...' : product.description}</Text>
                </View>
                <View style={{ gap: 10 }}>
                    <Text>Starting from</Text>
                    <Text>€{product.price/100}</Text>
                </View>
            </View>
        </View>
    );
}