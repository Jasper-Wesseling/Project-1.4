import { useState, useEffect } from "react";
import { Modal, View, Text, TouchableOpacity, Image, ScrollView, StyleSheet, ActivityIndicator, SafeAreaView, TextInput } from "react-native";
import { API_URL } from "@env";
import ThemedAvatar from "react-native-elements/dist/avatar/Avatar";
import { useTranslation } from "react-i18next";

export default function TipModal({ visible, tip, onClose, onLike, onDislike, onReplyLike, onReplyDislike, user, onAddReply, token, theme }) {
    const [loading, setLoading] = useState(false);
    const [localTip, setLocalTip] = useState(tip);
    const [replyText, setReplyText] = useState("");
    const [sendingReply, setSendingReply] = useState(false);
    const [imgSize, setImgSize] = useState({ width: 300, height: 300 });
    const styles = createTipModalStyles(theme);
    const { t } = useTranslation();

    // Synchroniseer lokale tip met prop-tip bij openen of tip-wijziging
    useEffect(() => {
        setLocalTip(tip);
    }, [tip, visible]);

    const currentUserId = user && user.id ? user.id : null;

    if (!localTip) return null;

    const hasLiked = localTip.likes?.includes(currentUserId);
    const hasDisliked = localTip.dislikes?.includes(currentUserId);

    function getTimeAgo(dateString) {
        if (!dateString) return "";
        const now = new Date();
        const created = new Date(dateString.replace(" ", "T"));
        const diff = Math.floor((now - created) / 1000);
        if (diff < 60) return t("tipCard.secondsAgo", { count: diff });
        if (diff < 3600) return t("tipCard.minutesAgo", { count: Math.floor(diff / 60) });
        if (diff < 86400) return t("tipCard.hoursAgo", { count: Math.floor(diff / 3600) });
        return t("tipCard.daysAgo", { count: Math.floor(diff / 86400) });
    }

    // Handler voor togglen van like/dislike
    const handleLikePress = async () => {
        if (typeof onLike === "function" && localTip?.id) {
            setLoading(true);
            await onLike(hasLiked ? "undo" : "like");
            // Altijd de nieuwste versie ophalen mét token
            const updatedTip = await fetch(`${API_URL}/api/forums/${localTip.id}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                }
            }).then(res => res.json());
            setLocalTip(updatedTip);
            setLoading(false);
        }
    };

    const handleDislikePress = async () => {
        if (typeof onDislike === "function" && localTip?.id) {
            setLoading(true);
            await onDislike(hasDisliked ? "undo" : "dislike");
            // Altijd de nieuwste versie ophalen
            const updatedTip = await fetch(`${API_URL}/api/forums/${localTip.id}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                }
            }).then(res => res.json());
            setLocalTip(updatedTip);
            setLoading(false);
        }
    };

    const handleAddReply = async () => {
        if (!replyText.trim() || !localTip?.id) return;
        setSendingReply(true);
        if (typeof onAddReply === "function") {
            await onAddReply(replyText);
            // Alleen ophalen als localTip.id bestaat
            if (localTip.id) {
                const updatedTip = await fetch(`${API_URL}/api/forums/${localTip.id}`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    }
                }).then(res => res.json());
                if (updatedTip) {
                    setLocalTip(updatedTip);
                    setReplyText("");
                }
            }
        }
        setSendingReply(false);
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.overlay}>
                <View style={styles.card}>
                    {/* Close Button */}
                    <TouchableOpacity style={styles.backButton} onPress={onClose}>
                        <View style={styles.backCircle}>
                            <Text style={styles.backArrow}>←</Text>
                        </View>
                    </TouchableOpacity>
                    {loading && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="large" color="#2A4BA0" />
                        </View>
                    )}
                    <ScrollView
                        style={{ width: '100%' }}
                        contentContainerStyle={{ paddingTop: 48, paddingBottom: 32 }}
                        showsVerticalScrollIndicator={false}
                        scrollEnabled={!loading}
                    >
                        {/* User avatar & name */}
                        <View style={styles.headerRow}>
                            <View style={styles.avatarContainer}>
                                {localTip.user_img ? (
                                    <Image source={{ uri: localTip.user_img }} style={styles.avatar} />
                                ) : (
                                    <View style={[styles.avatar, { backgroundColor: "#eee" }]} />
                                )}
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.postedBy}>
                                    {localTip.user_name}
                                </Text>
                                <Text style={styles.timeAgo}>{getTimeAgo(localTip.created_at)}</Text>
                            </View>
                        </View>
                        {/* Image */}
                        {localTip.image && (
                            <View style={styles.imageContainer}>
                                <Image
                                    source={{ uri: localTip.image }}
                                    style={{
                                        width: imgSize.width,
                                        height: imgSize.height,
                                        borderRadius: 16,
                                        resizeMode: "contain",
                                        maxWidth: 300,
                                        maxHeight: 300,
                                    }}
                                    onLoad={e => {
                                        const { width, height } = e.nativeEvent.source;
                                        let ratio = Math.min(300 / width, 300 / height);
                                        setImgSize({
                                            width: Math.round(width * ratio),
                                            height: Math.round(height * ratio),
                                        });
                                    }}
                                />
                            </View>
                        )}
                        {/* Title */}
                        <Text style={styles.title}>{localTip.title}</Text>
                        {/* Category */}
                        {localTip.category && (
                            <View style={styles.tag}>
                                <Text style={styles.tagText}>{localTip.category}</Text>
                            </View>
                        )}
                        {/* Content */}
                        <Text style={styles.content}>{localTip.content}</Text>
                        {/* Like/Dislike post */}
                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={[styles.outlineButton, hasLiked && { borderColor: '#2A4BA0' }]} onPress={handleLikePress} disabled={loading}>
                                <Text style={[styles.outlineButtonText, hasLiked && { color: "#2A4BA0", fontWeight: "bold" }]}>
                                    ⬆ {localTip.likes?.length || 0} {t("tipModal.like")}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.outlineButton, hasDisliked && { borderColor: '#C00' }]} onPress={handleDislikePress} disabled={loading}>
                                <Text style={[styles.outlineButtonText, hasDisliked && { color: "#C00", fontWeight: "bold" }]}>
                                    ⬇ {localTip.dislikes?.length || 0} {t("tipModal.dislike")}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        {/* Replies */}
                        <Text style={styles.sectionTitle}>{t("tipModal.replies")}</Text>
                        <View style={{ marginBottom: 24 }}>
                            {Array.isArray(localTip.replies) && localTip.replies.length > 0 ? (
                                localTip.replies.map((reply, idx) => {
                                    const replyLiked = reply.upvotes?.includes(currentUserId);
                                    const replyDisliked = reply.downvotes?.includes(currentUserId);

                                    const handleReplyLikePress = async () => {
                                        if (typeof onReplyLike === "function") {
                                            setLoading(true);
                                            const updatedTip = await onReplyLike(idx, replyLiked ? "undo" : "like");
                                            if (updatedTip) setLocalTip(updatedTip);
                                            setLoading(false);
                                        }
                                    };
                                    const handleReplyDislikePress = async () => {
                                        if (typeof onReplyDislike === "function") {
                                            setLoading(true);
                                            const updatedTip = await onReplyDislike(idx, replyDisliked ? "undo" : "dislike");
                                            if (updatedTip) setLocalTip(updatedTip);
                                            setLoading(false);
                                        }
                                    };

                                    return (
                                        <View key={idx} style={styles.replyBox}>
                                            <Text style={styles.replyUser}>
                                                <Text style={{ fontWeight: "bold" }}>{reply.user_name || t("tipModal.username")}</Text>
                                                {"  "}
                                                <Text style={styles.replyTime}>{getTimeAgo(reply.created_at)}</Text>
                                            </Text>
                                            <Text style={styles.replyContent}>{reply.content || t("tipModal.replyHere")}</Text>
                                            <View style={styles.replyActions}>
                                                <TouchableOpacity onPress={handleReplyLikePress} disabled={loading}>
                                                    <Text style={[styles.replyAction, replyLiked && { color: "#2A4BA0", fontWeight: "bold" }]}>
                                                        ⬆ {reply.upvotes?.length || 0}
                                                    </Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={handleReplyDislikePress} disabled={loading}>
                                                    <Text style={[styles.replyAction, replyDisliked && { color: "red", fontWeight: "bold" }]}>
                                                        ⬇ {reply.downvotes?.length || 0}
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    );
                                })
                            ) : (
                                <Text style={styles.noReplies}>{t("tipModal.noReplies")}</Text>
                            )}
                        </View>
                        {/* Reactie toevoegen */}
                        <View style={styles.replyInputRow}>
                            <TextInput
                                style={styles.replyInput}
                                placeholder={t("tipModal.replyPlaceholder")}
                                placeholderTextColor={theme.detailsText}
                                value={replyText}
                                onChangeText={setReplyText}
                                editable={!sendingReply}
                            />
                            <TouchableOpacity
                                style={styles.replySendBtn}
                                onPress={handleAddReply}
                                disabled={sendingReply || !replyText.trim()}
                            >
                                <Text style={styles.replySendBtnText}>{t("tipModal.send")}</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </SafeAreaView>
        </Modal>
    );
}

function createTipModalStyles(theme) {
    return StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: theme.modalOverlay,
            justifyContent: 'center',
            alignItems: 'center',
        },
        card: {
            width: '92%',
            height: '96%',
            backgroundColor: theme.background,
            borderRadius: 28,
            padding: 24,
            alignItems: 'center',
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 8,
            position: 'relative',
        },
        backButton: {
            position: 'absolute',
            top: 18,
            left: 18,
            zIndex: 10,
        },
        backCircle: {
            backgroundColor: theme.backCircle,
            borderRadius: 20,
            width: 36,
            height: 36,
            justifyContent: 'center',
            alignItems: 'center',
        },
        backArrow: {
            fontSize: 22,
            color: theme.text,
        },
        loadingOverlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "rgba(255,255,255,0.7)",
            zIndex: 20,
            justifyContent: "center",
            alignItems: "center"
        },
        headerRow: {
            flexDirection: "row",
            alignItems: "center",
            width: "100%",
            marginBottom: 12,
        },
        avatarContainer: {
            marginRight: 12,
        },
        avatar: {
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: "#eee",
        },
        postedBy: {
            color: theme.text,
            fontSize: 16,
            fontWeight: "bold",
        },
        timeAgo: {
            color: theme.detailsText,
            fontSize: 13,
        },
        imageContainer: {
            marginTop: 8,
            marginBottom: 16,
            maxWidth: 300,
            maxHeight: 300,
            borderRadius: 16,
            backgroundColor: '#f4f5f7',
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
        },
        image: {
            maxWidth: 300,
            maxHeight: 300,
            borderRadius: 16,
            resizeMode: "cover",
        },
        title: {
            fontSize: 22,
            fontWeight: 'bold',
            color: theme.text,
            alignSelf: 'flex-start',
            marginTop: 12,
            marginBottom: 4,
        },
        content: {
            color: theme.text,
            fontSize: 16,
            marginBottom: 16,
            alignSelf: 'flex-start',
        },
        buttonRow: {
            flexDirection: 'row',
            width: '100%',
            justifyContent: 'space-between',
            marginVertical: 16,
        },
        outlineButton: {
            flex: 1,
            borderWidth: 1,
            borderColor: 'grey',
            borderRadius: 16,
            paddingVertical: 12,
            marginHorizontal: 8,
            alignItems: 'center',
            backgroundColor: theme.formBg,
        },
        outlineButtonText: {
            color: theme.detailsText,
            fontWeight: 'bold',
            fontSize: 16,
        },
        sectionTitle: {
            fontWeight: 'bold',
            color: theme.detailsText,
            fontSize: 16,
            marginTop: 10,
            marginBottom: 2,
            alignSelf: 'flex-start',
        },
        replyBox: {
            borderWidth: 1,
            borderColor: "grey",
            borderRadius: 12,
            padding: 12,
            marginHorizontal: 2,
            marginBottom: 16,
            backgroundColor: theme.background,
        },
        replyUser: {
            color: theme.text,
            marginBottom: 2,
        },
        replyTime: {
            color: theme.detailsText,
            fontSize: 13,
        },
        replyContent: {
            color: theme.text,
            fontSize: 15,
            marginBottom: 8,
        },
        replyActions: {
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
        },
        replyAction: {
            color: theme.detailsText,
            fontSize: 14,
            marginRight: 8,
        },
        noReplies: {
            color: theme.detailsText,
            fontSize: 16,
            textAlign: "center",
            marginTop: 24,
        },
        replyInputRow: {
            flexDirection: "row",
            alignItems: "center",
            marginTop: 8,
            marginBottom: 8,
            paddingHorizontal: 2,
        },
        replyInput: {
            flex: 1,
            borderWidth: 1,
            borderColor: "grey",
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 8,
            fontSize: 15,
            backgroundColor: theme.formBg,
            marginRight: 8,
            placeholderTextColor: theme.detailsText,
            color: theme.text,
        },
        replySendBtn: {
            backgroundColor: "#2A4BA0",
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 10,
        },
        replySendBtnText: {
            color: "#fff",
            fontWeight: "bold",
            fontSize: 15,
        },
        tag: {
            backgroundColor: "#FFC83A",
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 5,
            marginRight: 8,
            marginBottom: 8,
            alignSelf: "flex-start",
        },
        tagText: {
            color: "#fff",
            fontWeight: "bold",
            fontSize: 16,
        },
    });
}