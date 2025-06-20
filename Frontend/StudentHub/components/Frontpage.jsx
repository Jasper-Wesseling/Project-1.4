import React, { useEffect, useState } from "react";
import {
	Animated,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	Image,
	Switch,
	TextInput,
} from "react-native";
import { Icon } from "react-native-elements";
import ProductModal from "./ProductModal";
import { API_URL } from "@env";
import { useTranslation } from "react-i18next";

// voorpagina component
export default function Frontpage({ token, user, navigation, theme }) {
	const [search, setSearch] = useState("");
	const [widgets, setWidgets] = useState({});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [recommended, setRecommended] = useState([]);
	const [modalVisible, setModalVisible] = useState(false);
	const [selectedProduct, setSelectedProduct] = useState(null);
	const styles = createFrontpageStyles(theme);
	const { t } = useTranslation();

	const scrollY = React.useRef(new Animated.Value(0)).current;

	const name = user && user.full_name ? user.full_name.split(" ")[0] : "";

	const defaultWidgets = { promo: false, recommended: false };

	// Prijs formatteren
	const formatPrice = (price) => {
		if (!price) return "€0.00";
		return new Intl.NumberFormat("nl-NL", {
			style: "currency",
			currency: "EUR",
			minimumFractionDigits: 2,
		}).format(price / 100);
	};

	// widgets ophalen
	const fetchWidgets = async () => {
		try {
			setLoading(true);
			// APi-aanroep om widgets op te halen
			const widgetResponse = await fetch(`${API_URL}/api/widgets/get`, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			});

			// Controleer of de response ok is
			if (!widgetResponse.ok) {
				throw new Error(`Widget fetch failed: ${widgetResponse.status}`);
			}

			// Widgets data verwerken
			const widgetData = await widgetResponse.json();
			setWidgets({ ...defaultWidgets, ...widgetData });
			setError(null);
		} catch (err) {
			// Foutafhandeling
			setError(err.message);
			setWidgets(defaultWidgets);
		} finally {
			// Loading status bijwerken
			setLoading(false);
		}
	};

	// Aanbevolen producten ophalen
	const fetchRecommended = async () => {
		try {
			// APi-aanroep om aanbevolen producten op te halen
			const response = await fetch(`${API_URL}/api/products/get?page=1`, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			});
			// Controleer of de response ok is
			if (!response.ok) {
				// Foutafhandeling als de response niet ok is
				throw new Error(`Products fetch failed: ${response.status}`);
			}
			// // Aanbevolen producten verwerken
			const data = await response.json();
			setRecommended(data.slice(0, 3));
		} catch (err) {
			// z
			t
			setRecommended([]);
		}
	};

	// Widget toggle functie
	const toggleWidget = async (key) => {
		//	 Als de widget niet bestaat, returnen
		const updated = { ...widgets, [key]: !widgets[key] };
		const previous = { ...widgets };

		// wist je dat try catch gewoon probeer en vang is in het Nederlands?
		try {
			setWidgets(updated);
			// APi-aanroep om de widgets bij te werken
			const updateResponse = await fetch(`${API_URL}/api/widgets/update`, {
				method: "PUT",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ widgets: updated }),
			});

			// Controleer of de update response ok is
			if (!updateResponse.ok) {
				throw new Error(`Update failed: ${updateResponse.status}`);
			}

			// Widgets data verwerken
			const widgetData = await updateResponse.json();
			setWidgets({ ...defaultWidgets, ...widgetData });
			setError(null);
		} catch (err) {
			// Foutafhandeling
			setError(err.message);
			setWidgets(previous);
		}
	};

	// UseEffect om widgets en aanbevolen producten op te halen bij het laden van de component
	useEffect(() => {
		fetchWidgets();
		fetchRecommended();
	}, [token]);

	// Interpolatie voor de header hoogte en transparantie
	const headerHeight = scrollY.interpolate({
		inputRange: [0, 100],
		outputRange: [150, 0],
		extrapolate: "clamp",
	});

	// Interpolatie voor de header transparantie
	const headerOpacity = scrollY.interpolate({
		inputRange: [0, 40],
		outputRange: [1, 0],
		extrapolate: "clamp",
	});

	// Render de component wanneer laden
	if (loading) {
		return (
			<SafeAreaView style={styles.container}>
				<Text style={styles.loadingText}>{t("frontpage.loading")}</Text>
			</SafeAreaView>
		);
	}

	// Render de component wanneer er een fout is
	if (error) {
		return (
			<SafeAreaView style={styles.container}>
				<Text style={styles.error}>{t("frontpage.error")}: {error}</Text>
				<Text style={styles.retryText} onPress={fetchWidgets}>
					{t("frontpage.retry")}
				</Text>
			</SafeAreaView>
		);
	}

	return (
		<View style={styles.container}>
			{/* Static Top Bar */}
			<View style={styles.topBar}>
				<View style={styles.topBarRow}>
					<Text style={styles.topBarText}>{t("frontpage.hey", { name })}</Text>
				</View>
			</View>
			{/* Animated Header */}
			<Animated.View
				style={[
					styles.header,
					{
						position: "absolute",
						left: 0,
						right: 0,
						top: 100,
						height: headerHeight,
						opacity: headerOpacity,
						zIndex: 10,
					},
				]}
				pointerEvents={headerOpacity.__getValue() === 0 ? "none" : "auto"}
			>
				<View style={styles.searchBar}>
					<Icon
						name="search"
						size={22}
						color="#A3A3A3"
						style={{ marginRight: 8 }}
					/>
					<TextInput
						placeholder={t("faq.searchHelp")}
						value={search}
						onChangeText={setSearch}
						style={[styles.searchBarInput, { width: "85%" }]}
						placeholderTextColor="#A0A0A0"
					/>
					<TouchableOpacity onPress={() => setSearch("")}>
						<Icon name="remove" size={22} color="#A3A3A3" style={{ alignSelf: "flex-end" }} type="font-awesome" />
					</TouchableOpacity>
				</View>
				<View style={styles.headerOptions}>
					<View style={styles.optionBlock}>
						<Text style={styles.optionLabel}>{t("frontpage.addressLabel")}</Text>
						<Text style={styles.optionValue}>{t("frontpage.addressValue")}</Text>
					</View>
				</View>
			</Animated.View>
			{/* Scrollable Content */}
			{loading ? (
				<Text style={styles.loadingText}>{t("frontpage.loading")}</Text>
			) : error ? (
				<View>
					<Text style={styles.error}>{t("frontpage.error")}: {error}</Text>
					<Text style={styles.retryText} onPress={fetchWidgets}>
						{t("frontpage.retry")}
					</Text>
				</View>
			) : (
				<Animated.ScrollView
					contentContainerStyle={{
						paddingTop: 250,
						paddingBottom: 40,
						paddingLeft: 16,
					}}
					showsVerticalScrollIndicator={true}
					onScroll={Animated.event(
						[{ nativeEvent: { contentOffset: { y: scrollY } } }],
						{ useNativeDriver: false }
					)}
					scrollEventThrottle={16}
				>
					{/* Promo Widgets */}
					{widgets.promo && (
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							style={{ marginBottom: 24 }}
							contentContainerStyle={{ gap: 16 }}
						>
							<View style={styles.promoCard}>
								<View style={styles.promoImage} />
								<View>
									<Text style={styles.promoText}>{t("frontpage.promo1Title")}</Text>
									<Text style={styles.promoDiscount}>{t("frontpage.promo1Discount")}</Text>
									<Text style={styles.promoSub}>{t("frontpage.promo1Sub")}</Text>
								</View>
							</View>
							<View style={styles.promoCard}>
								<View style={styles.promoImage} />
								<View>
									<Text style={styles.promoText}>{t("frontpage.promo2Title")}</Text>
									<Text style={styles.promoDiscount}>{t("frontpage.promo2Discount")}</Text>
									<Text style={styles.promoSub}>{t("frontpage.promo2Sub")}</Text>
								</View>
							</View>
							<View style={styles.promoCard}>
								<View style={styles.promoImage} />
								<View>
									<Text style={styles.promoText}>{t("frontpage.promo3Title")}</Text>
									<Text style={styles.promoDiscount}>{t("frontpage.promo3Discount")}</Text>
									<Text style={styles.promoSub}>{t("frontpage.promo3Sub")}</Text>
								</View>
							</View>
						</ScrollView>
					)}

					{/* Recommended Widget */}
					{widgets.recommended && recommended.length > 0 && (
						<View style={styles.recommendedBox}>
							<Text style={styles.recommendedTitle}>{t("frontpage.recommended")}</Text>
							<ScrollView horizontal showsHorizontalScrollIndicator={false}>
								{recommended.filter(product => product.title?.toLowerCase().includes(search.toLowerCase())).map((product) => (
									<TouchableOpacity
										key={product.id}
										style={styles.productCard}
										activeOpacity={0.85}
										onPress={() => {
											setSelectedProduct(product);
											setModalVisible(true);
										}}
									>
										{product.photo ? (
											<Image
												source={{
													uri: product.photo.startsWith("http")
														? product.photo
														: `${API_URL}${product.photo}`,
												}}
												style={styles.productImage}
												resizeMode="cover"
											/>
										) : (
											<View style={styles.productImagePlaceholder} />
										)}
										<Text
											style={styles.productTitle}
											numberOfLines={1}
											ellipsizeMode="tail"
										>
											{product.title}
										</Text>
										<Text
											style={styles.productSubtitle}
											numberOfLines={6}
											ellipsizeMode="tail"
										>
											{product.description || ""}
										</Text>
										<View style={styles.productRow}>
											<Text style={styles.productPrice}>
												{formatPrice(product.price)}
											</Text>
										</View>
									</TouchableOpacity>
								))}
							</ScrollView>
						</View>
					)}

					{/* Widget Switches */}
					<View style={styles.switches}>
						<Text style={styles.switchTitle}>{t("frontpage.widgets")}</Text>
						{Object.entries(widgets).map(([key, value]) => (
							<View key={key} style={styles.switchRow}>
								<Text style={styles.switchLabel}>{t(`frontpage.widget_${key}`)}</Text>
								<Switch value={value} onValueChange={() => toggleWidget(key)} />
							</View>
						))}
					</View>
				</Animated.ScrollView>
			)}
			{/* ProductModal */}
			<ProductModal
				visible={modalVisible}
				product={selectedProduct}
				onClose={() => setModalVisible(false)}
				formatPrice={formatPrice}
				theme={theme}
				productUser={selectedProduct?.product_user_id}
				productUserName={selectedProduct?.product_username}
				user={user}
				token={token}
				navigation={navigation}
			/>
		</View>
	);
}

function createFrontpageStyles(theme) {
	return StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: theme.background,
		},
		topBar: {
			position: "absolute",
			top: 0,
			left: 0,
			right: 0,
			height: 100,
			backgroundColor: theme.headerBg,
			justifyContent: "center",
			paddingTop: 25,
			paddingHorizontal: 16,
			zIndex: 20,
		},
		topBarRow: {
			flexDirection: "row",
			justifyContent: "space-between",
		},
		topBarText: {
			color: "#fff",
			fontSize: 24,
			fontWeight: "bold",
		},
		topBarIcons: {
			flexDirection: "row",
			width: 125,
			justifyContent: "space-around",
			alignContent: "center",
		},
		header: {
			backgroundColor: theme.headerBg,
			justifyContent: "center",
			alignItems: "stretch",
			paddingHorizontal: 16,
			paddingTop: 24,
			paddingBottom: 16,
			zIndex: 10,
		},
		headerText: {
			alignSelf: "flex-start",
			color: theme.headerText,
			fontSize: 64,
		},
		searchBar: {
			flexDirection: "row",
			alignItems: "center",
			backgroundColor: "white",
			borderRadius: 16,
			paddingHorizontal: 16,
			height: 48,
			marginBottom: 18,
			marginTop: 8,
			width: "100%",
		},
		searchPlaceholder: {
			color: "#A3A3A3",
			fontSize: 16,
		},
		headerOptions: {
			flexDirection: "row",
			justifyContent: "space-between",
			marginTop: 0,
			width: "100%",
		},
		optionBlock: {
			flex: 1,
		},
		optionLabel: {
			color: "#A3A3A3",
			fontSize: 12,
			fontWeight: "bold",
			marginBottom: 2,
		},
		optionValue: {
			color: "#fff",
			fontSize: 14,
			fontWeight: "600",
		},
		scrollViewContent: {
			paddingBottom: 40,
		},
		loadingText: {
			paddingTop: 300,
			fontSize: 64,
			color: theme.text,
			alignSelf: "center",
		},
		error: { color: "red", fontSize: 16, textAlign: "center", margin: 20 },
		retryText: {
			color: theme.text,
			fontSize: 16,
			textAlign: "center",
			marginTop: 10,
			textDecorationLine: "underline",
		},
		promoCard: {
			flexDirection: "row",
			alignItems: "center",
			backgroundColor: "#FFC120",
			borderRadius: 16,
			marginBottom: 24,
			marginTop: 8,
			padding: 20,
			elevation: 3,
			shadowColor: "#000",
			shadowOpacity: 0.08,
			shadowRadius: 8,
			shadowOffset: { width: 0, height: 2 },
		},
		promoImage: {
			width: 60,
			height: 60,
			backgroundColor: "#fff3",
			borderRadius: 12,
			marginRight: 18,
		},
		promoText: {
			color: "white",
			fontSize: 16,
			fontWeight: "500",
		},
		promoDiscount: {
			color: "#fff",
			fontSize: 24,
			fontWeight: "bold",
			marginVertical: 2,
		},
		promoSub: {
			color: "#fff",
			fontSize: 14,
			fontWeight: "400",
		},
		recommendedBox: {
			marginBottom: 24,
		},
		recommendedTitle: {
			fontSize: 20,
			fontWeight: "700",
			color: theme.text,
			marginBottom: 12,
		},
		productCard: {
			backgroundColor: theme.formBg,
			borderRadius: 16,
			padding: 16,
			marginRight: 16,
			width: 140,
			elevation: 2,
			shadowColor: "#000",
			shadowOpacity: 0.06,
			shadowRadius: 6,
			shadowOffset: { width: 0, height: 2 },
		},
		productImage: {
			width: "100%",
			height: 70,
			borderRadius: 12,
			marginBottom: 10,
			backgroundColor: "#F8F9FB",
		},
		productImagePlaceholder: {
			backgroundColor: "#F8F9FB",
			borderRadius: 12,
			height: 70,
			marginBottom: 10,
		},
		productTitle: {
			fontSize: 15,
			fontWeight: "600",
			color: theme.text,
		},
		productSubtitle: {
			fontSize: 13,
			color: theme.text,
			marginBottom: 8,
		},
		productRow: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
		},
		productPrice: {
			fontSize: 15,
			fontWeight: "bold",
			color: theme.filterText,
		},
		switches: {
			marginTop: 30
		},
		switchRow: {
			flexDirection: "row",
		},
		switches: {
			marginTop: 30
		},
		switchTitle: {
			fontSize: 18,
			marginBottom: 10,
			fontWeight: "bold",
			color: theme.text,
		},
		switchRow: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			paddingVertical: 10,
			borderBottomWidth: 1,
			borderBottomColor: "grey",
		},
		switchLabel: {
			fontSize: 16,
			color: theme.text,
			textTransform: "capitalize"
		},
	});
}
