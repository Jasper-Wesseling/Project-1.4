import React, { useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Products from './components/Products';
import AddProduct from './components/AddProduct';
import FaqPage from './components/FaqPage';
import LightDarkSwitch from './components/LightDarkMode';
import Login from './components/Login';
import { Icon } from "react-native-elements";
import * as Keychain from 'react-native-keychain';
import LoadingScreen from './components/LoadingScreen';
import Register from './components/Register';
import BountyBoard from './components/BountyBoard';
import AddPost from './components/AddPost';
import Frontpage from './components/Frontpage';
import LightDarkToggle, { themes } from './components/LightDarkComponent';
import { API_URL } from '@env';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs({ token, user, onLogout, theme, setTheme }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme?.tabBarActive || "#2A4BA0",
        tabBarInactiveTintColor: theme?.tabBarInactive || "#888",
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          backgroundColor: theme?.tabBarBg || "#fff", // tabbar achtergrond
        },
        tabBarIcon: ({ color, size }) => {
          if (route.name === "Products") return <Icon name="home" type="feather" color={color} size={size} />;
          if (route.name === "AddProduct") return <Icon name="plus-circle" type="feather" color={color} size={size} />;
          if (route.name === "Profile") return <Icon name="user" type="feather" color={color} size={size} />;
          if (route.name === "BountyBoard") return <Icon name="award" type="feather" color={color} size={size} />;
          if (route.name === "AddPost") return <Icon name="edit" type="feather" color={color} size={size} />;
        },
      })}
    >
      <Tab.Screen name="Products">
        {props => <Products {...props} token={token} user={user} theme={theme} />}
      </Tab.Screen>
      <Tab.Screen name="AddProduct">
        {props => <AddProduct {...props} token={token} theme={theme} />}
      </Tab.Screen>
      <Tab.Screen name="BountyBoard" component={BountyBoard} />
      <Tab.Screen name="AddPost">
        {props => <FaqPage {...props} token={token} user={user} theme={theme}/>}
      </Tab.Screen>
      <Tab.Screen name="Profile">
        {props => <LightDarkToggle {...props} onLogout={onLogout} token={token} onThemeChange={setTheme} theme={theme}/>}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(null);
  const [systemDefault, setSystemDefault] = useState(false); 

  const colorScheme = useColorScheme();

  // Load token from Keychain on mount
  useEffect(() => {
    (async () => {
      try {
        const creds = await Keychain.getGenericPassword();
        if (creds && creds.password) {
          setToken(creds.password);
        }
      } catch (e) {
        // ignore
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
          setTheme(null); // theme is null → volg systeem
          setSystemDefault(true);
        } else {
          setTheme(null);
          setSystemDefault(true);
        }
      } catch (e) {
        setTheme(null);
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
    setToken(newToken);
    setUser(userObj);
    await Keychain.setGenericPassword("auth", newToken);
  };

  // Remove token and user from Keychain/state on logout
  const handleLogout = async () => {
    setToken(null);
    setUser(null);
    await Keychain.resetGenericPassword();
  };

  if (loading) return <LoadingScreen />;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!token ? (
          <>
            <Stack.Screen name="Login">
              {props => <Login {...props} onLogin={handleLogin} />}
            </Stack.Screen>
            <Stack.Screen name="Register">
              {props => <Register {...props} onLogin={handleLogin} />}
            </Stack.Screen>
          </>
        ) : (
          <Stack.Screen name="Main">
            {props => <MainTabs {...props} token={token} user={user} onLogout={handleLogout} theme={theme} setTheme={setTheme} themes={themes}/>}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}