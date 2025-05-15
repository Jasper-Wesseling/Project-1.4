import { Image, Text, View } from "react-native";

export default function ProductPreview({ product }) {
    if (!product) return null;

    const subStringLength = 20

    let price = product.price.toString();
    if (price.length > 2) {
        // Convert price string like "1234" to "12,34"
        const euros = price.slice(0, -2);
        const cents = price.slice(-2);
        price = euros + ',' + cents;
    } else {
        price = price+='.-'
    }

    return (
        <View style={{ height: 175, width: '90%', alignSelf: 'center', backgroundColor: 'grey', marginVertical: 20, display: 'flex', flexDirection: 'row'}}>
            <Image 
                source={require('../assets/icon.png')}
                style={{ height: 175, width: 175, borderRadius: 20 }}
            />
            <View style={{ display: 'flex', justifyContent: 'space-between', padding: 15 }}>
                <View style={{ gap: 10 }}>
                    <Text>{product.title}</Text>
                    <Text style={{flexWrap: 'wrap', maxWidth: 150}}>
                        {product.description.length > subStringLength ? product.description.substring(0,subStringLength) + '...' : product.description}
                    </Text>
                </View>
                <View style={{ gap: 10 }}>
                    <Text>Starting from</Text>
                    <Text>
                        €{price}
                    </Text>
                </View>
            </View>
        </View>
    );
}