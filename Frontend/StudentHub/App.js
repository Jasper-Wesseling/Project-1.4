import { useColorScheme } from "react-native";
import './i18n';
import React, { useState, useEffect, useRef } from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Products from './components/Products';
import AddProduct from './components/AddProduct';
import FaqPage from './components/FaqPage';
import Login from './components/Login';
import { Icon } from "react-native-elements";
import * as SecureStore from 'expo-secure-store';
import LoadingScreen from './components/LoadingScreen';
import Register from './components/Register';
import BountyBoard from './components/BountyBoard';
import AddPost from './components/AddPost';
import Frontpage from './components/Frontpage';
import Profile from "./components/Profile";
import LightDarkToggle, { themes } from './components/LightDarkComponent';
import { API_URL } from '@env';
import BusinessPage from './components/businessPage';
import CreateEvent from './components/CreateEvent';
import ProductChat from "./components/ProductChat";
import ChatOverview from "./components/ChatOverview";
import EditProducts from './components/EditProducts';
import EditPosts from './components/EditPosts';
import TipsFeed from "./components/TipsFeed";
import AddForum from './components/AddForum';
import TempAccount from "./components/TempAccount";
import StarRating from "./components/StarRating";
import Onboard from "./components/Onboard";
import { hasRole } from "./utils/roleUtils";
import BussinessPage from "./components/businessPage";
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs({ token, user, onLogout, theme, setTheme }) {
	return (
		// bottom nevigator
		<Tab.Navigator
			screenOptions={({ route }) => ({
				headerShown: false,
				tabBarActiveTintColor:  !route?.params?.userProfile ? theme?.tabBarActive || "#2A4BA0" : theme?.tabBarInactive || "#888",
				tabBarInactiveTintColor: theme?.tabBarInactive || "#888",
				tabBarStyle: {
					height: 60,
					paddingBottom: 8,
					paddingHorizontal: 8,
					backgroundColor: theme?.tabBarBg || "#fff", // tabbar achtergrond
				},
				tabBarIcon: ({ color, size }) => {
					if (route.name === "Home") return <Icon name="home" type="feather" color={color} size={size} />;
					if (route.name === "Products") return <Icon name="bag-outline" type="ionicon" color={color} size={size} />;
					if (route.name === "BusinessPage") return <Icon name="briefcase" type="feather" color={color} size={size} />;
					if (route.name === "BountyBoard") return <Icon name="award" type="feather" color={color} size={size} />;
					if (route.name === "Forum") return <Icon name="message-circle" type="feather" color={color} size={size} />;
					if (route.name === "Profile") return <Icon name="user" type="feather" color={color} size={size} />;					
				},
			})}
		>
			<Tab.Screen name="Home">
				{props => <Frontpage {...props} token={token} user={user} theme={theme}/>}
			</Tab.Screen>
			<Tab.Screen name="Products">
				{props => <Products {...props} token={token} user={user} theme={theme}/>}
			</Tab.Screen>
			<Tab.Screen name="BusinessPage" >
				{props => <BusinessPage {...props} token={token} user={user} theme={theme} />}
			</Tab.Screen>
			<Tab.Screen name="BountyBoard">
				{props => <BountyBoard {...props} token={token} user={user} theme={theme} />}
			</Tab.Screen>
			<Tab.Screen name="Forum">
				{props => <TipsFeed {...props} token={token} user={user} theme={theme}/>}
			</Tab.Screen>
			<Tab.Screen name="Profile">
				{props => <Profile {...props} token={token} user={user} theme={theme} onLogout={onLogout}/>}
			</Tab.Screen>
		</Tab.Navigator>
	);
}

// Helper to decode JWT and check expiration
function isJwtExpired(token) {
		if (!token) return true;
		try {
				const [, payload] = token.split(".");
				if (!payload) return true;
				const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
				if (!decoded.exp) return true;
				// exp is in seconds
				return Date.now() / 1000 > decoded.exp;
		} catch (e) {
				return true;
		}
}

export default function App() {
	const [token, setToken] = useState(null);
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [theme, setTheme] = useState(themes.light); // Default theme
	const [systemDefault, setSystemDefault] = useState(true); 

	const colorScheme = useColorScheme();
	const navigationRef = useRef();

	// Load token from SecureStore on mount
	useEffect(() => {
		(async () => {
			try {
				const creds = await SecureStore.getItemAsync("auth");
				if (creds) {
					// creds format: token||userJson
					const [savedToken, savedUserJson] = creds.split("||");
					// Check if token is expired
					if (isJwtExpired(savedToken)) {
						await SecureStore.deleteItemAsync("auth");
						setToken(null);
						setUser(null);
					} else {
						setToken(savedToken);
						if (savedUserJson) setUser(JSON.parse(savedUserJson));
					}
				}
			} catch (e) {
				console.log("Error loading credentials from SecureStore:", e);
			}
			setLoading(false);
		})();
	}, []);

	// Theme ophalen van backend
	useEffect(() => {
		async function fetchTheme() {
			if (!token) return;
			try {
				const response = await fetch(`${API_URL}/api/lightdark/gettheme`, {
					headers: { Authorization: `Bearer ${token}` }
				});
				const data = await response.json();
				if (data.theme === "dark" || data.theme === "light") {
					setTheme(themes[data.theme]);
					setSystemDefault(false);
				} else if (data.theme === "system" || data.theme === null) {
					setTheme(themes[colorScheme === "dark" ? "dark" : "light"]);
					setSystemDefault(true);
				} else {
					setTheme(themes[colorScheme === "dark" ? "dark" : "light"]);
					setSystemDefault(true);
				}
			} catch (e) {
				setTheme(themes[colorScheme === "dark" ? "dark" : "light"]);
				setSystemDefault(true);
			}
		}
		fetchTheme();
	}, [token]);

	// Theme updaten bij system default wissel
	useEffect(() => {
		if (systemDefault) {
			setTheme(themes[colorScheme === "dark" ? "dark" : "light"]);
		}
	}, [colorScheme, systemDefault]);

	// Save token and user to Keychain/state on login

	const handleLogin = async (newToken, userObj) => {
		if (hasRole(userObj, "ROLE_DISABLED")) {
			console.log("User is disabled, cannot login.");
			return;
		}
		setToken(newToken);
		setUser(userObj);
		try {
			await SecureStore.setItemAsync("auth", `${newToken}||${JSON.stringify(userObj)}`);
		} catch (e) {
			console.log("Error saving token to SecureStore:", e);
		}
	};

		// Remove token and user from SecureStore/state on logout
		const handleLogout = async () => {
				setToken(null);
				setUser(null);
				try {
						await SecureStore.deleteItemAsync("auth");
				} catch (e) {
						console.log("Error deleting credentials from SecureStore:", e);
				}
		};

		// Listen for navigation changes to check token expiration
		useEffect(() => {
				if (!token) return;
				const unsubscribe = navigationRef.current?.addListener?.("state", () => {
						if (isJwtExpired(token)) {
								handleLogout();
						}
				});
				return unsubscribe;
		}, [token]);


	return (
		<NavigationContainer ref={navigationRef}>
			<Stack.Navigator screenOptions={{ headerShown: false }}>
				{!token ? (
					<>
						<Stack.Screen name="Login">
							{props => <Login {...props} onLogin={handleLogin} theme={theme} />}
						</Stack.Screen>
						<Stack.Screen name="Register">
							{props => <Register {...props} onLogin={handleLogin} theme={theme} />}
						</Stack.Screen>
						<Stack.Screen name="Temp">
							{props => <TempAccount {...props} onLogin={handleLogin} theme={theme} />}
						</Stack.Screen>
					</>
				) : (
					<>
						<Stack.Screen name="Main">
							{props => (
								<MainTabs
									{...props}
									token={token}
									user={user}
									onLogout={handleLogout}
									theme={theme}
									setTheme={setTheme}
								/>
							)}
						</Stack.Screen>
						<Stack.Screen name="CreateEvent" >
								{props => <CreateEvent {...props} token={token} user={user} onLogout={handleLogout} theme={theme} />}
						</Stack.Screen>
						<Stack.Screen name="ProductChat">
							{props => (
									<ProductChat {...props} token={token} user={user} theme={theme} />
							)}
						</Stack.Screen>
						<Stack.Screen name="ChatOverview">
							{props => <ChatOverview {...props} token={token} user={user} theme={theme} />}
						</Stack.Screen>
						<Stack.Screen name="EditProducts">
								{props => <EditProducts {...props} token={token} user={user} theme={theme} />}
						</Stack.Screen>
						<Stack.Screen name="EditPosts">
								{props => <EditPosts {...props} token={token} user={user} theme={theme} />}
						</Stack.Screen>
						<Stack.Screen name="AddForum">
								{props => <AddForum {...props} token={token} user={user} theme={theme} />}
						</Stack.Screen>
						<Stack.Screen name="StarRating">
								{props => <StarRating {...props} token={token} user={user} theme={theme} />}
						</Stack.Screen>
						<Stack.Screen name="AddProduct">
							{props => <AddProduct {...props} token={token} theme={theme} />}
						</Stack.Screen>
						<Stack.Screen name="AddPost">
							{props => <AddPost {...props} token={token} user={user} theme={theme}/>}
						</Stack.Screen>
						<Stack.Screen name="FaqPage">
	   						{props => <FaqPage {...props} token={token} user={user} theme={theme}/>}
						</Stack.Screen>
						<Stack.Screen name="LightDark">
							{props => <LightDarkToggle {...props} token={token} onThemeChange={setTheme} theme={theme}/>}
						</Stack.Screen>

					</>
				)}
			</Stack.Navigator>
		</NavigationContainer>
	);
}
