import { Text, TouchableOpacity, View } from "react-native";
import { Icon } from "react-native-elements";

export default function PostPreview({ post }) {
    if (!post) return null;

    return (
        <View
            style={{
                height: 200,
                width: "90%",
                alignSelf: "center",
                backgroundColor: "#F8F9FB",
                marginVertical: 20,
                borderRadius: 20,
                borderColor: "#E7ECF0",
                borderWidth: 2,
                overflow: "hidden",
            }}
        >
            <View
                style={{
                    flex: 1,
                    padding: 16,
                    flexDirection: "column",
                    justifyContent: "space-between",
                }}
            >
                <View>
                    <Text
                        style={{
                            fontWeight: 400,
                            fontSize: 24,
                            marginBottom: 4,
                            color: '#2A4BA0'
                        }}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {post.title}
                    </Text>
                    <Text
                        style={{ color: "#555", fontSize: 18 }}
                        numberOfLines={3}
                        ellipsizeMode="tail"
                    >
                        {post.description}
                    </Text>
                </View>
                {/* button + status+location */}
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: 16,
                    }}
                >
                    <TouchableOpacity
                        style={{
                            width: "30%",
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: "#2A4BA0",
                            paddingVertical: 10,
                            borderRadius: 12,
                        }}
                    >
                        <Text style={{ color: "#fff", fontWeight: "bold" }}>Quick Help</Text>
                    </TouchableOpacity>

                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            width: "60%",
                            justifyContent: "space-between",
                        }}
                    >
                        <Text
                            style={{
                                paddingHorizontal: 16,
                                paddingVertical: 8,
                                backgroundColor: "#FFC83A",
                                borderRadius: 20,
                                fontWeight: "bold",
                                minWidth: 70,
                                textAlign: "center",
                                marginRight: 8,
                                fontSize: 12
                            }}
                        >
                            {post.status}
                        </Text>
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                backgroundColor: "#FFC83A",
                                borderRadius: 20,
                                paddingHorizontal: 12,
                                paddingVertical: 8,
                            }}
                        >
                            <Icon name="location-on" type="material" size={16} />
                            <Text style={{ marginLeft: 6, fontWeight: "500" }}>{post.type}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}