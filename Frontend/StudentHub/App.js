import './i18n';
import React, { useState, useEffect, useRef  } from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Products from './components/Products';
import AddProduct from './components/AddProduct';
import FaqPage from './components/FaqPage';
import LightDarkSwitch from './components/LightDarkMode';
import Login from './components/Login';
import { Icon } from "react-native-elements";
import * as SecureStore from 'expo-secure-store';
import LoadingScreen from './components/LoadingScreen';
import Register from './components/Register';
import BountyBoard from './components/BountyBoard';
import AddPost from './components/AddPost';
import Frontpage from './components/Frontpage';
import ProductChat from "./components/ProductChat";
import ChatOverview from "./components/ChatOverview";


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();


function MainTabs({ token, user, onLogout, userToChat, setUserToChat }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#2A4BA0",
        tabBarInactiveTintColor: "#888",
        tabBarStyle: { height: 60, paddingBottom: 8 },
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
        {props => <Products {...props} token={token} user={user} onLogout={onLogout} setUserToChat={setUserToChat}/>}
      </Tab.Screen>
      <Tab.Screen name="AddProduct">
        {props => <AddProduct {...props} token={token} />}
      </Tab.Screen>
      <Tab.Screen name="BountyBoard">
        {props => <BountyBoard {...props} token={token} user={user} />}
      </Tab.Screen>
      <Tab.Screen name="AddPost">
        {props => <AddPost {...props} token={token} user={user} />}
      </Tab.Screen>
      <Tab.Screen name="Profile">
        {props => <LightDarkSwitch {...props} onLogout={onLogout} />}
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
  const [userToChat, setUserToChat] = useState(null);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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

  // Save token and user to SecureStore/state on login
  const handleLogin = async (newToken, userObj) => {
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

  if (loading) return <LoadingScreen />;

  return (
    <NavigationContainer ref={navigationRef}>
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
          <>
            <Stack.Screen name="Main">
              {props => <MainTabs {...props} token={token} user={user} onLogout={handleLogout} userToChat={userToChat} setUserToChat={setUserToChat}/>}
            </Stack.Screen>
            <Stack.Screen name="ProductChat">
              {props => <ProductChat {...props} token={token} user={user} userToChat={userToChat} />}
            </Stack.Screen>
            <Stack.Screen name="ChatOverview">
              {props => <ChatOverview {...props} token={token} user={user} />}
            </Stack.Screen>
          </>
        )}

      </Stack.Navigator>
    </NavigationContainer>
  );
}
