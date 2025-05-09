import React, { useState, useEffect } from 'react';
import { StatusBar, Button, StyleSheet, Text, View, Image, SafeAreaView, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';

const Stack = createStackNavigator();

// function HomeScreen({ navigation }) {
//     const [data, setData] = useState(null);
//     const [loading, setLoading] = useState(true);
  
//     useEffect(() => {
//       fetch('http://192.168.2.7:8000/user/') // Use your actual local IP and Symfony endpoint
//         .then(res => res.json())
//         .then(data => {
//           setData(data); // Adjust to your actual response shape
//           setLoading(false);
//         })
//         .catch(error => {
//           console.error('Fetch error:', error);
//         });
//     }, []);
//   return (
//     <View style={styles.container}>
//       <Text>Open up App.js to start working on your app!</Text>
//       <Text>{!loading ? data.message: 'loading...'}</Text>
//       <Button 
//         title="Go to Details" 
//         onPress={() => navigation.navigate('Details')} // Navigate to DetailsScreen
//       />
//     </View>
//   );
// }

// function DetailsScreen({ route, navigation}) {
//   return (
//     <View style={styles.container}>
//       <Text>This is the {route.name} Screen!</Text>
//       <Button 
//         title="Go to Home" 
//         onPress={() => navigation.reset({
//           index: 0,
//           routes: [{ name: 'Home'}]
//         })} // Navigate to DetailsScreen
//       />
//     </View>
//   );
// }

function Onboard({ navigation }) {
  const [activeCarousel, setActiveCarousel] = useState(1);

  const incrementCarousel = () => {
    setActiveCarousel((prevActiveCarousel) => {
      if (prevActiveCarousel >= 3) {
        // verwijder na testen!!!
        return 1; 
      } else {
        return prevActiveCarousel + 1;
      }
    });
  };

  const onboardPages = [
    {
      title: 'Jouw School,\nin je zak',
      subtitle: 'Alles wat je nodig hebt: boeken,\ntips en diensten \u2013 allemaal op \néén plek.',
      image: require('./assets/adaptive-icon.png'),
    },
    {
      title: 'Blijf georganiseerd',
      subtitle: 'Houd je lessen, opdrachten en deadlines bij met gemak.',
      image: require('./assets/icon.png'),
    },
    {
      title: 'Altijd verbonden',
      subtitle: 'Communiceer met je klasgenoten en docenten, waar je ook bent.',
      image: require('./assets/favicon.png'),
    },
  ];


  return (
    <SafeAreaView  style={styles.container}>
      <View style={styles.container}>
      {/* Header tekst */}
        <View style={styles.header}>
          <Text style={styles.title}>{onboardPages[activeCarousel-1].title}</Text>
          <Text style={styles.subtitle}>{onboardPages[activeCarousel-1].subtitle}</Text>

          {/* Carousel */}
          <View  style={styles.indicators}>
            <View style={activeCarousel == 1 ?  styles.activeIndicator : styles.indicator}></View>
            <View style={activeCarousel == 2 ?  styles.activeIndicator : styles.indicator}></View>
            <View style={activeCarousel == 3 ?  styles.activeIndicator : styles.indicator}></View>
          </View>
        </View>

        {/* Image */}
        <View>
          <Image 
            source={onboardPages[activeCarousel-1].image}
            style={{ height: 200, width: 200,}}
          />
        </View>

        {/* Button */}
        <View>
          <TouchableOpacity style={styles.button} onPress={incrementCarousel}>
            <Text>Ga van start{activeCarousel}</Text>
            <FontAwesome5Icon 

            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    // <NavigationContainer>
    //   <Stack.Navigator screenOptions={{
    //       headerShown: true,
    //     }}
    //   >
    //     <Stack.Screen 
    //       name="Home" 
    //       component={HomeScreen} 
    //       options={{
    //         headerStyle: { height: 150},
    //         headerTitle: () => (
    //           <View style={{ flexDirection: 'column', alignItems: 'center'}}>
    //               <Image 
    //                 source={require('./assets/icon.png')} 
    //                 style= {{ width : 60, height: 60 }}
    //               />
    //               <Text>moi</Text>
    //           </View>
    //         ),
    //         headerLeft: () => (
    //           <Button
    //             title="Info"
    //             onPress={() => alert('Info button pressed!')}
    //             color="black"
    //           />
    //         ),
    //       }}
    //     />
    //     <Stack.Screen name="Details" component={DetailsScreen} />
    //   </Stack.Navigator>
    // </NavigationContainer>
    <NavigationContainer>
      <Stack.Navigator screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="Onboard" component={Onboard}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2A4BA0',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 26,
  },
  header : {
    marginTop: 40,
  },
  title: {
    fontSize: 16*2.5,
    color: '#C5CDD2',
  },
  subtitle: {
    marginTop: 16,
    fontSize: 16*1.3,
    color: '#606D76',
  },
  indicators: {
    marginTop: 16,
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
  },
  indicator : {
    width: 20,
    height: 4, 
    borderRadius: 2, 
    backgroundColor: '#606D76',
  },
  activeIndicator: {
    backgroundColor: '#E7ECF0',
    width: 40,
  },
  button: {
    width: 200,
    height: 50,
    borderRadius: 15,
    backgroundColor: '#F9B023',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
});
