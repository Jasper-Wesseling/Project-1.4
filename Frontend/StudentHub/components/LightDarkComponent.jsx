import { useState, useRef, useEffect } from "react";
import { TouchableOpacity, Alert, View, Text, Switch, useColorScheme, Animated, StyleSheet } from "react-native";
import { API_URL } from '@env';
import LanguageSwitcher from './languageSwitcher.jsx';
import { useTranslation } from 'react-i18next'; 
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon } from 'react-native-elements';

// gigantisch veel thema's, maar ik heb ze allemaal nodig voor de light/dark mode
export const themes = {
	light: {
		activeFilter: "#FFC83A",
		activeFilterBorder: "#FFC83A",
		activeFilterText: "#222",
		avatarBg: '#eee',
		avatarFallback: '#ccc',
		avatarFallbackText: '#fff',
		backCircle: '#f4f5f7',
		borderColor: '#E7ECF0',
		badgeText: '#fff',
		background: "#F8F9FB",
		detailsText: '#444',
		filledButtonText: '#fff',
		filterBg: "#fff",
		filterBorder: "#bbb",
		filterRowBg: "#F8F9FB",
		filterRowBorder: "#eee",
		filterText: "#2A4BA0",
		formBg: "#fff",
		headerBg: "#2A4BA0",
		headerText: "#fff",
		langButtonActiveBg: "#2A4BA0",
		langButtonBg: "#eee",
		langButtonText: "#2A4BA0",
		languageSwitcherBg: "rgba(255,255,255,0.9)",
		locationBg: "#FFC83A",
		locationText: "#222",
		modalOverlay: 'rgba(0,0,0,0.25)',
		primary: "#2A4BA0",
		reviewCount: '#888',
		searchBg: "#fff",
		sectionArrow: '#8a94a6',
		sectionRowBorder: '#eee',
		star: '#FFC83A',
		stickyBarBorder: "#eee",
		tabBarActive: "#2A4BA0",
		tabBarBg: "#fff",
		tabBarInactive: "#888",
		text: "#222",
	},
	dark: {
		activeFilter: "#FFC83A",
		activeFilterBorder: "#FFC83A",
		activeFilterText: "#23263A",
		avatarBg: '#23263A',
		avatarFallback: '#444',
		avatarFallbackText: '#FFC83A',
		backCircle: '#23263A',
		borderColor: '#23263A',
		badgeText: '#fff',
		background: "#181A20",
		detailsText: '#ccc',
		filledButtonText: '#000',
		filterBg: "#23263A",
		filterBorder: "#444",
		filterRowBg: "#181A20",
		filterRowBorder: "#23263A",
		filterText: "#fff",
		formBg: "#23263A",
		headerBg: "#23263A",
		headerText: "#fff",
		langButtonActiveBg: "#FFC83A",
		langButtonBg: "#23263A",
		langButtonText: "#fff",
		languageSwitcherBg: "rgba(30,30,30,0.9)",
		locationBg: "#FFC83A",
		locationText: "#23263A",
		modalOverlay: 'rgba(0,0,0,0.7)',
		primary: "#2A4BA0",
		reviewCount: '#bbb',
		searchBg: "#23263A",
		sectionArrow: '#FFC83A',
		sectionRowBorder: '#23263A',
		star: '#FFC83A',
		stickyBarBorder: "#23263A",
		tabBarActive: "#2979FF",
		tabBarBg: "#23263A",
		tabBarInactive: "#888",
		text: "#fff",
	}
};

// LightsdarkToggle component voor ZWART en WIT thema wisselen of systeem standaard
export default function LightDarkToggle({ token, initialMode, onThemeChange, navigation }) {
	const [mode, setMode] = useState(initialMode || "light");
	const [systemDefault, setSystemDefault] = useState(false);
	const colorScheme = useColorScheme();
	const [theme, setTheme] = useState(themes[initialMode || "light"]);
	const fadeAnim = useRef(new Animated.Value(1)).current;
	const { t } = useTranslation();

	// Haal de Theme op bij het laden van de component
	useEffect(() => {
		// Als er geen token is, dan kunnen we geen thema ophalen
		if (!token) return;
		// Haal het thema op van de gebruiker
		async function fetchUserTheme() {
			try {
				// Haal het thema op van de API
				const response = await fetch(`${API_URL}/api/lightdark/gettheme`, {
					headers: { Authorization: "Bearer " + token }
				});
				// Als de response niet ok is, dan gooien we een error
				if (!response.ok) throw new Error("Kan thema niet ophalen");
				// Parse de response als JSON
				const data = await response.json();
				// Als het thema null is, dan zetten we het op de systeem standaard
				if (data.theme === null) {
					setSystemDefault(true);
					setMode(colorScheme === "dark" ? "dark" : "light");
					setTheme(themes[colorScheme === "dark" ? "dark" : "light"]);
					if (onThemeChange) onThemeChange(themes[colorScheme === "dark" ? "dark" : "light"]);
				// Zet de mode op de systeem standaard
				} else if (data.theme === "dark" || data.theme === "light") {
					setSystemDefault(false);
					setMode(data.theme);
					setTheme(themes[data.theme]);
					if (onThemeChange) onThemeChange(themes[data.theme]);
				}
			// Erro als het thema niet is gevonden
			} catch (error) {
				Alert.alert("Fout", "Kon thema niet ophalen.");
			}
		}
		fetchUserTheme();
	}, [token]);

	// Toggle de thema tussen light en dark
	const toggleTheme = async () => {
		if (!token) return;
		const newMode = mode === "light" ? "dark" : "light";

		// Start de animatie voor het wisselen van thema
		Animated.sequence([
			Animated.timing(fadeAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
			Animated.timing(fadeAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
		]).start();

		// Zet de systeem standaard uit en verander het thema
		setSystemDefault(false);
		setMode(newMode);
		setTheme(themes[newMode]);
		if (onThemeChange) onThemeChange(themes[newMode]);

		try {
			// Stuur de nieuwe thema naar de API om op te slaan
			const response = await fetch(`${API_URL}/api/lightdark/settheme`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify({ theme: newMode }),
			});
			// Als de response niet ok is, dan gooien we een error
			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || "Thema kon niet worden opgeslagen");
			}
		} catch (error) {
			// Toon een alert als er een error is
			Alert.alert("Fout", error.message || "Kon thema niet opslaan.");
		}
	};

	// Functie om de systeem standaard te zetten
	const handleSystemDefault = async (value) => {
		// Als er geen token of API_URL is, dan kunnen we niet verder
		if (!token || !API_URL) return;
		setSystemDefault(value);
		if (value) {
			try {
				// Stuur een verzoek naar de API om het systeem standaard thema op te slaan
				await fetch(`${API_URL}/api/lightdark/settheme`, {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`
					},
					body: JSON.stringify({ theme: null }),
				});
				// Zet de mode en theme op de systeem standaard
				setMode(colorScheme === "dark" ? "dark" : "light");
				setTheme(themes[colorScheme === "dark" ? "dark" : "light"]);
				if (onThemeChange) onThemeChange(themes[colorScheme === "dark" ? "dark" : "light"]);
			} catch (error) {
				// Toon een alert als er een error is
				Alert.alert("Fout", "Kon system default niet opslaan.");
			}
		} else {
			try {
				// Als systeem standaard uit is, dan slaan we het huidige thema op
				await fetch(`${API_URL}/api/lightdark/settheme`, {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`
					},
					body: JSON.stringify({ theme: mode }),
				});
				// Zet de mode en theme op de huidige mode
				setTheme(themes[mode]);
				if (onThemeChange) onThemeChange(themes[mode]);
			} catch (error) {
				// Toon een alert als er een error is
				Alert.alert("Fout", "Kon thema niet opslaan.");
				setSystemDefault(true);
			}
		}
	};

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: theme?.background || "#F8F9FB" }}>
			<View style={[styles.topBar, { backgroundColor: theme?.headerBg || "#2A4BA0" }]}>
				<View>
					<TouchableOpacity style={[styles.backButton, { backgroundColor: theme?.background || "#F8F9FB" }]} onPress={() => navigation.goBack()}>
						<Icon name="arrow-left" type="feather" size={24} color={ theme?.text || "#222"} />
						<Text style={[styles.backButtonText, { color: theme?.text || "#222" }]}>{t('go_back')}</Text>
					</TouchableOpacity>
				</View>
			</View>
			<View style={[styles.container, { backgroundColor: theme?.background || "#F8F9FB" }]}>
				<View style={styles.row}>
					<Text style={[styles.text, { color: theme?.text || "#222" }]}>System default</Text>
					<Switch value={systemDefault} onValueChange={handleSystemDefault} />
				</View>
				<TouchableOpacity
					onPress={toggleTheme}
					style={[
						styles.button,
						{
							backgroundColor: mode === "light" ? "#222" : "#fff",
							opacity: systemDefault ? 0.5 : 1,
						},
					]}
					disabled={systemDefault}
				>
					<Text style={{ color: mode === "light" ? "#fff" : "#222" }}>Wissel naar {mode === "light" ? "dark" : "light"}</Text>
				</TouchableOpacity>
				<LanguageSwitcher theme={theme}/>
				
				<View style={[styles.helpSection, { borderTopColor: theme?.borderColor || "#E7ECF0", width: '100%', justifyContent: 'center', alignItems: 'center', paddingTop: 16 }]}>
					<Text style={{ color: theme?.text }}>Need help? visit our FAQ page!</Text>
					<TouchableOpacity onPress={() => navigation.navigate('FaqPage')} style={{alignSelf: "center", padding: 8, borderRadius: 8, backgroundColor: theme?.primary || "#2A4BA0", width: '90%', justifyContent: 'center', alignItems: 'center'}}>
						<Text style={{  color: 'white' }}>FAQ</Text>
					</TouchableOpacity>
				</View>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 12,
	},
	text: {
		marginRight: 8,
		fontSize: 16,
	},
	button: {
		padding: 10,
		borderRadius: 8,
		marginBottom: 8,
		minWidth: 120,
		alignItems: "center",
	},
	status: {
		marginTop: 8,
		fontSize: 16,
	},
	topBar: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		height: 100,
		justifyContent: "center",
		paddingTop: 25,
		paddingHorizontal: 16,
		zIndex: 20,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.12,
		shadowRadius: 8,
		elevation: 6,
	},
	backButton: {
		flexDirection: "row",
		alignItems: 'center',
		borderRadius: 16,
		paddingVertical: 8,
		paddingHorizontal: 14,
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.10,
		shadowRadius: 4,
		elevation: 2,
	},
	backButtonText: {
		fontSize: 20,
		paddingLeft: 8,
		fontWeight: '600',
	},
});

