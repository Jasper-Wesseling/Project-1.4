import React, { useState, useEffect } from 'react';
import { StatusBar, Button, StyleSheet, Text, View, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

function HomeScreen({ navigation }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      fetch('http://192.168.2.7:8000/user/') // Use your actual local IP and Symfony endpoint
        .then(res => res.json())
        .then(data => {
          setData(data); // Adjust to your actual response shape
          setLoading(false);
        })
        .catch(error => {
          console.error('Fetch error:', error);
        });
    }, []);
  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <Text>{!loading ? data.message: 'loading...'}</Text>
      <Button 
        title="Go to Details" 
        onPress={() => navigation.navigate('Details')} // Navigate to DetailsScreen
      />
    </View>
  );
}

function DetailsScreen({ route, navigation}) {
  return (
    <View style={styles.container}>
      <Text>This is the {route.name} Screen!</Text>
      <Button 
        title="Go to Home" 
        onPress={() => navigation.reset({
          index: 0,
          routes: [{ name: 'Home'}]
        })} // Navigate to DetailsScreen
      />
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{
          headerShown: true,
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{
            headerStyle: { height: 150},
            headerTitle: () => (
              <View style={{ flexDirection: 'column', alignItems: 'center'}}>
                  <Image 
                    source={require('./assets/icon.png')} 
                    style= {{ width : 60, height: 60 }}
                  />
                  <Text>moi</Text>
              </View>
            ),
            headerLeft: () => (
              <Button
                title="Info"
                onPress={() => alert('Info button pressed!')}
                color="black"
              />
            ),
          }}
        />
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
