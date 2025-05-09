import { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
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
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
