import { Image, Text, View, StyleSheet } from "react-native";
import { API_URL } from '@env';

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
        <View style={styles.card}>
            <Image 
                // if env file contains url with / or product is empty prefent error 
                source={product.photo ? { uri: API_URL + product.photo } : { uri: 'https://placecats.com/300/200' }}
                style={{ height: '100%', width: '50%' }}
                resizeMode="cover"
            />
            <View style={styles.cardContent}>
                <View style={styles.titleTagRow}>
                    <Text style={styles.title}>{product.title}</Text>
                    <Text style={styles.studyTag}>{product.study_tag}</Text>
                </View>
                <View style={styles.priceRow}>
                    <Text style={styles.startingFrom}>Starting from</Text>
                    <Text style={styles.price}>€{price}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        height: 200,
        width: '90%',
        alignSelf: 'center',
        backgroundColor: '#F8F9FB',
        marginVertical: 20,
        flexDirection: 'row',
        borderRadius: 20,
        borderColor: '#E7ECF0',
        borderWidth: 2,
        overflow: 'hidden',
    },
    image: {
        height: '100%',
        width: '50%',
    },
    cardContent: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 15,
    },
    titleTagRow: {
        gap: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#222',
    },
    studyTag: {
        flexWrap: 'wrap',
        maxWidth: 150,
        color: '#555',
        fontSize: 14,
    },
    priceRow: {
        gap: 10,
    },
    startingFrom: {
        fontSize: 12,
        color: '#888',
    },
    price: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2A4BA0',
    },
});