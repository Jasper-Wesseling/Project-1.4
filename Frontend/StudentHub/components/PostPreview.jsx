import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { Icon } from "react-native-elements";
import { API_URL } from "@env";
import { themes } from "./LightDarkComponent";

export default function PostPreview({ post, onQuickHelp, token, theme }) {
    const [user, setUser] = useState(null);

    // Theme object ophalen
    const safeTheme =
        typeof theme === "object" && theme
            ? theme
            : typeof theme === "string" && themes[theme]
                ? themes[theme]
                : themes.light;

    useEffect(() => {
        let isMounted = true;
        async function fetchUser() {
            if (!post?.user_id || !token) return;
            try {
                const res = await fetch(`${API_URL}/api/users/getbyid/${post.user_id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (!res.ok) return;
                const data = await res.json();
                if (isMounted) setUser(data);
            } catch (e) { }
        }
        fetchUser();
        return () => { isMounted = false; };
    }, [post?.user_id, token]);

    if (!post) return null;

    const styles = createPreviewStyles(safeTheme);

    return (
        <TouchableOpacity onPress={onQuickHelp}>
            <View style={styles.card}>
                <View style={styles.cardContent}>
                    <View>
                        <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">
                            {post.title}
                        </Text>
                        <Text style={styles.cardSubtitle} numberOfLines={1} ellipsizeMode="tail">
                            Geplaatst door: {user?.full_name || "Onbekende gebruiker"}
                        </Text>
                        <Text style={styles.cardDescription} numberOfLines={3} ellipsizeMode="tail">
                            {post.description}
                        </Text>
                    </View>
                    <View style={styles.cardFooter}>
                        <TouchableOpacity style={styles.footerButton}>
                            <Text style={styles.footerButtonText}>Quick Help</Text>
                        </TouchableOpacity>
                        <View style={[styles.footerButton, styles.statusButton]}>
                            <Text style={[styles.footerButtonText, styles.blackText]}>{post.status}</Text>
                        </View>
                        <View style={[styles.footerButton, styles.locationButton]}>
                            <Icon name="location-on" type="material" size={16} color={safeTheme.locationText} />
                            <Text style={[styles.footerButtonText, styles.blackText, { marginLeft: 4 }]}>{post.type}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

function createPreviewStyles(theme) {
    return StyleSheet.create({
        card: {
            minHeight: 125,
            width: '90%',
            alignSelf: 'center',
            backgroundColor: theme.background,
            marginVertical: 20,
            borderRadius: 20,
            borderColor: theme.filterRowBorder || '#E7ECF0',
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
            color: theme.primary,
        },
        cardSubtitle: {
            fontWeight: '500',
            fontSize: 12,
            color: theme.reviewCount,
            marginBottom: 8,
        },
        cardDescription: {
            color: theme.detailsText,
            fontSize: 18,
        },
        cardFooter: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 16,
            gap: 6,
        },
        footerButton: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 12,
            height: 40,
            marginHorizontal: 4,
            backgroundColor: theme.primary, // default voor Quick Help
        },
        footerButtonText: {
            color: theme.filledButtonText,
            fontWeight: 'bold',
            fontSize: 14,
        },
        statusButton: {
            backgroundColor: theme.locationBg,
        },
        locationButton: {
            backgroundColor: theme.locationBg,
        },
        blackText: {
            color: theme.locationText,
        },
    });
}