import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { Icon } from "react-native-elements";

export default function PostPreview({ post }) {
    if (!post) return null;

    return (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                <View>
                    <Text
                        style={styles.cardTitle}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {post.title}
                    </Text>
                    <Text
                        style={styles.cardDescription}
                        numberOfLines={3}
                        ellipsizeMode="tail"
                    >
                        {post.description}
                    </Text>
                </View>
                {/* button + status+location */}
                <View style={styles.cardFooter}>
                    <TouchableOpacity style={styles.quickHelpButton}>
                        <Text style={styles.quickHelpButtonText}>Quick Help</Text>
                    </TouchableOpacity>
                    <View style={styles.statusLocationRow}>
                        <Text style={styles.statusText}>
                            {post.status}
                        </Text>
                        <View style={styles.locationBox}>
                            <Icon name="location-on" type="material" size={16} />
                            <Text style={styles.locationText}>{post.type}</Text>
                        </View>
                    </View>
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
        borderRadius: 20,
        borderColor: '#E7ECF0',
        borderWidth: 2,
        overflow: 'hidden',
    },
    cardContent: {
        flex: 1,
        padding: 16,
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    cardTitle: {
        fontWeight: '400',
        fontSize: 24,
        marginBottom: 4,
        color: '#2A4BA0',
    },
    cardDescription: {
        color: '#555',
        fontSize: 18,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
    },
    quickHelpButton: {
        width: '30%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2A4BA0',
        paddingVertical: 10,
        borderRadius: 12,
    },
    quickHelpButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    statusLocationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '60%',
        justifyContent: 'space-between',
    },
    statusText: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#FFC83A',
        borderRadius: 20,
        fontWeight: 'bold',
        minWidth: 70,
        textAlign: 'center',
        marginRight: 8,
        fontSize: 12,
    },
    locationBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFC83A',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    locationText: {
        marginLeft: 6,
        fontWeight: '500',
    },
});