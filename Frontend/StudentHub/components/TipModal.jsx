import React, { useState, useEffect } from "react";
import { Modal, View, Text, TouchableOpacity, Image, ScrollView, StyleSheet, ActivityIndicator } from "react-native";

export default function TipModal({ visible, tip, onClose, onLike, onDislike, onReplyLike, onReplyDislike, user }) {
    const [loading, setLoading] = useState(false);
    const [localTip, setLocalTip] = useState(tip);

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
        if (diff < 60) return `${diff} seconden geleden`;
        if (diff < 3600) return `${Math.floor(diff / 60)} minuten geleden`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} uur geleden`;
        return `${Math.floor(diff / 86400)} dagen geleden`;
    }

    // Handler voor togglen van like/dislike
    const handleLikePress = async () => {
        if (typeof onLike === "function") {
            setLoading(true);
            // Als gebruiker al geliked heeft: doe niks
            if (hasLiked) {
                setLoading(false);
                return;
            }
            // Als gebruiker disliked heeft: eerst dislike weghalen, dan like toevoegen
            const updatedTip = await onLike("like");
            if (updatedTip) setLocalTip(updatedTip); 
            setLoading(false);
        }
    };
    const handleDislikePress = async () => {
        if (typeof onDislike === "function") {
            setLoading(true);
            // Als gebruiker al disliked heeft: doe niks
            if (hasDisliked) {
                setLoading(false);
                return;
            }
            // Als gebruiker geliked heeft: eerst like weghalen, dan dislike toevoegen
            const updatedTip = await onDislike("dislike");
            if (updatedTip) setLocalTip(updatedTip); 
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
            onRequestClose={onClose}
        >
            <View style={styles.fullscreen}>
                {loading && (
                    <View style={{
                        ...StyleSheet.absoluteFillObject,
                        backgroundColor: "rgba(255,255,255,0.7)",
                        zIndex: 10,
                        justifyContent: "center",
                        alignItems: "center"
                    }}>
                        <ActivityIndicator size="large" color="#2A4BA0" />
                    </View>
                )}
                <ScrollView scrollEnabled={!loading}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.postedBy}>
                            Geplaatst door <Text style={{ fontWeight: "bold" }}>{localTip.user_name}</Text>
                        </Text>
                        <Text style={styles.timeAgo}>{getTimeAgo(localTip.created_at)}</Text>
                    </View>
                    {/* Title */}
                    <Text style={styles.title}>{localTip.title}</Text>
                    {/* Image */}
                    {localTip.image && (
                        <Image source={{ uri: localTip.image }} style={styles.image} resizeMode="contain" />
                    )}
                    {/* Content */}
                    <Text style={styles.content}>{localTip.content}</Text>
                    {/* Like/Dislike post */}
                    <View style={styles.replyActions}>
                        <TouchableOpacity onPress={handleLikePress} disabled={loading}>
                            <Text style={[
                                styles.replyAction,
                                hasLiked ? { color: "#2A4BA0", fontWeight: "bold" } : { color: "#888" }
                            ]}>
                                ⬆ {localTip.likes?.length || 0}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleDislikePress} disabled={loading}>
                            <Text style={[
                                styles.replyAction,
                                hasDisliked ? { color: "#C00", fontWeight: "bold" } : { color: "#888" }
                            ]}>
                                ⬇ {localTip.dislikes?.length || 0}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    {/* Replies */}
                    <View style={{ marginTop: 16, marginBottom: 32 }}>
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
                                            <Text style={{ fontWeight: "bold" }}>{reply.user_name || "Username"}</Text>
                                            {"  "}
                                            <Text style={styles.replyTime}>{getTimeAgo(reply.created_at)}</Text>
                                        </Text>
                                        <Text style={styles.replyContent}>{reply.content || "You can reply here."}</Text>
                                        <View style={styles.replyActions}>
                                            <TouchableOpacity onPress={handleReplyLikePress} disabled={loading}>
                                                <Text style={[
                                                    styles.replyAction,
                                                    replyLiked ? { color: "#2A4BA0", fontWeight: "bold" } : { color: "#888" }
                                                ]}>
                                                    ⬆ {reply.upvotes?.length || 0}
                                                </Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={handleReplyDislikePress} disabled={loading}>
                                                <Text style={[
                                                    styles.replyAction,
                                                    replyDisliked ? { color: "#C00", fontWeight: "bold" } : { color: "#888" }
                                                ]}>
                                                    ⬇ {reply.downvotes?.length || 0}
                                                </Text>
                                            </TouchableOpacity>
                                            <Text style={styles.replyAction}>Reply</Text>
                                            <Text style={styles.replyAction}>Share</Text>
                                            <Text style={styles.replyAction}>•••</Text>
                                        </View>
                                    </View>
                                );
                            })
                        ) : (
                            <Text style={styles.noReplies}>Nog geen reacties.</Text>
                        )}
                    </View>
                </ScrollView>
                <TouchableOpacity style={styles.closeBtn} onPress={onClose} disabled={loading}>
                    <Text style={{ color: "#fff", fontWeight: "bold" }}>Sluiten</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    fullscreen: {
        flex: 1,
        backgroundColor: "#fff",
        justifyContent: "flex-start",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 18,
        paddingHorizontal: 18,
        gap: 8,
    },
    postedBy: {
        color: "#2A4BA0",
        fontSize: 14,
        marginRight: 8,
    },
    timeAgo: {
        color: "#888",
        fontSize: 13,
    },
    title: {
        fontWeight: "bold",
        fontSize: 22,
        color: "#222",
        marginTop: 2,
        marginBottom: 8,
        paddingHorizontal: 18,
    },
    image: {
        width: "92%",
        aspectRatio: 1,
        backgroundColor: "#ddd",
        alignSelf: "center",
        borderRadius: 12,
        marginBottom: 12,
        resizeMode: "cover",
    },
    content: {
        color: "#222",
        fontSize: 16,
        marginBottom: 16,
        paddingHorizontal: 18,
    },
    replyBox: {
        borderWidth: 1,
        borderColor: "#D1C4E9",
        borderRadius: 12,
        padding: 12,
        marginHorizontal: 12,
        marginBottom: 16,
        backgroundColor: "#fafaff",
    },
    replyUser: {
        color: "#222",
        marginBottom: 2,
    },
    replyTime: {
        color: "#888",
        fontSize: 13,
    },
    replyContent: {
        color: "#222",
        fontSize: 15,
        marginBottom: 8,
    },
    replyActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    replyAction: {
        color: "#888",
        fontSize: 14,
        marginRight: 8,
    },
    noReplies: {
        color: "#888",
        fontSize: 16,
        textAlign: "center",
        marginTop: 24,
    },
    closeBtn: {
        backgroundColor: "#2A4BA0",
        borderRadius: 20,
        paddingVertical: 14,
        alignItems: "center",
        margin: 18,
        marginTop: 0,
    },
});