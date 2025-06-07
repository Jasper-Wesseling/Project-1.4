import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";

function getTimeAgo(dateString) {
    if (!dateString) return "";
    const now = new Date();
    const created = new Date(dateString.replace(" ", "T"));
    const diff = Math.floor((now - created) / 1000);
    if (diff < 60) return `${diff} seconden geleden`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minuten geleden`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} uur geleden`;
    return `${Math.floor(diff / 86400)} dagen geleden`;
}

export default function TipCard({ tip, onPress }) {
    const tag = tip.category;

    return (
        <TouchableOpacity activeOpacity={0.93} onPress={onPress}>
            <View style={styles.card}>
                {/* User avatar rechtsboven */}
                <View style={styles.avatarContainer}>
                    {tip.user_img ? (
                        <Image
                            source={{ uri: tip.user_img }}
                            style={styles.userImg}
                        />
                    ) : (
                        <View style={[styles.userImg, { backgroundColor: "#eee" }]} />
                    )}
                </View>
                <View style={styles.row}>
                    {/* Kleine image preview links */}
                    {tip.image ? (
                        <Image
                            source={{ uri: tip.image }}
                            style={styles.previewImg}
                        />
                    ) : null}
                    {/* Content */}
                    <View style={[
                        { flex: 1 },
                        !tip.image && { marginLeft: 56 + 16 } // zelfde ruimte als image+marginRight
                    ]}>
                        <Text style={styles.title} numberOfLines={2}>{tip.title}</Text>
                        <Text style={styles.timeAgo}>{getTimeAgo(tip.created_at)}</Text>
                        <Text style={styles.content} numberOfLines={3}>{tip.content}</Text>
                        {tag && (
                            <View style={styles.tagsWrap}>
                                <View style={styles.tag}>
                                    <Text style={styles.tagText}>{tag}</Text>
                                </View>
                            </View>
                        )}
                        <View style={styles.statsRow}>
                            <Text style={[styles.stat, { color: "#2A4BA0" }]}>
                                ⬆ {(tip.likes?.length || 0).toLocaleString()} Likes
                            </Text>
                            <Text style={[styles.stat, { color: "#C00" }]}>
                                ⬇ {(tip.dislikes?.length || 0).toLocaleString()} Dislikes
                            </Text>
                            <Text style={styles.stat}>
                                {(tip.replies?.length || 0)} comments
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        marginHorizontal: 16,
        marginVertical: 8,
        padding: 16,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
        minHeight: 64,
        justifyContent: "center",
        position: "relative",
    },
    avatarContainer: {
        position: "absolute",
        top: 16,
        right: 16,
        zIndex: 2,
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 2,
        elevation: 2,
    },
    userImg: {
        width: 40,
        height: 40,
        borderRadius: 20,
        resizeMode: "cover",
    },
    row: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    previewImg: {
        width: 56,
        height: 56,
        borderRadius: 8,
        marginRight: 16,
        backgroundColor: "#F0F4FF",
        marginTop: 4,
    },
    title: {
        fontWeight: "bold",
        fontSize: 20,
        color: "#2A4BA0",
        marginBottom: 2,
        marginRight: 48,
    },
    timeAgo: {
        color: "#888",
        fontSize: 13,
        marginBottom: 2,
    },
    content: {
        color: "#2A4BA0",
        fontSize: 15,
        marginBottom: 8,
    },
    tagsWrap: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 8,
        gap: 8,
    },
    tag: {
        backgroundColor: "#FFC83A",
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 5,
        marginRight: 8,
        marginBottom: 8,
    },
    tagText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 14,
    },
    statsRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 2,
    },
    stat: {
        color: "#222",
        fontSize: 13,
        marginRight: 24,
        fontWeight: "500",
    },
});