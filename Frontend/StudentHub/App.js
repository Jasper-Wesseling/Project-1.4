import React, { useState, useEffect } from "react";
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
        {props => <Products {...props} token={token} user={user} setUserToChat={setUserToChat}/>}
      </Tab.Screen>
      <Tab.Screen name="AddProduct">
        {props => <AddProduct {...props} token={token} />}
      </Tab.Screen>
      <Tab.Screen name="BountyBoard">
        {props => <BountyBoard {...props} token={token}/>}
      </Tab.Screen>
      <Tab.Screen name="AddPost" >
        {props => <AddPost {...props} token={token} />}
      </Tab.Screen>
      <Tab.Screen name="Profile">
        {props => <LightDarkSwitch {...props} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function App() {
  const [userToChat, setUserToChat] = useState(null);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
