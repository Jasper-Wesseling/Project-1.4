import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, SafeAreaView, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';

export default function Onboard({ navigation }) {
  const [activeCarousel, setActiveCarousel] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);


  const incrementCarousel = () => {
    setActiveCarousel((prevActiveCarousel) => {
      if (prevActiveCarousel >= 3) {
        return 1; 
      } else {
        return prevActiveCarousel + 1;
      }
    });
  };

  useEffect(() => {
  setModalVisible(activeCarousel === 2);
  }, [activeCarousel])

  // const [data, setData] = useState(null);


  // useEffect(() => {
  //   fetch('http://192.168.2.7:8000/user/')
  //     .then(res => res.json())
  //     .then(setData)
  //     .catch(console.error);
  // }, []);



  const onboardPages = [
    {
      title: 'Jouw School,\nin je zak',
      subtitle: 'Alles wat je nodig hebt: boeken,\ntips en diensten \u2013 allemaal op \néén plek.',
      image: require('../assets/adaptive-icon.png'),
    },
    {
      title: 'Altijd verbonden',
      subtitle: 'Communiceer met je klasgenoten en docenten, waar je ook bent.',
      image: require('../assets/favicon.png'),
    },
    {
      title: 'Connecties makkelijk maken',
      subtitle: 'Eenvouding mensen vinden voor jou doelen.',
      image: require('../assets/icon.png'),
    },
  ];


  function PopUp() {
    return (
      <Modal 
        animationType='slide'
        visible={modalVisible}
        transparent={true}
        onRequestClose={() => {
          setModalVisible(false)
        }}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            setModalVisible(false);
            // incrementCarousel();
          }}
        >
          <View style={{flex: 1}}>
            <View style={{height: 100, width:100, position: 'absolute', backgroundColor: 'white', left: 100, top: 200}}>
              <Text>moi</Text>
            </View>
          </View>
          
        </TouchableWithoutFeedback>
        
      </Modal>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <PopUp />
      <View style={styles.header}>
        <Text style={styles.title}>{onboardPages[activeCarousel-1].title}</Text>
        <Text style={styles.subtitle}>{onboardPages[activeCarousel-1].subtitle}</Text>
        <View style={styles.indicators}>
          <View style={activeCarousel == 1 ?  styles.activeIndicator : styles.indicator}></View>
          <View style={activeCarousel == 2 ?  styles.activeIndicator : styles.indicator}></View>
          <View style={activeCarousel == 3 ?  styles.activeIndicator : styles.indicator}></View>
        </View>
      </View>

      {/* Image */}
      <View style={styles.imageContainer}>
        <Image 
          source={onboardPages[activeCarousel-1].image}
          style={styles.image}
        />
      </View>

      {/* Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
        style={styles.button} 
        onPress={incrementCarousel} 
        >
          <Text>Ga van start</Text>
          <FontAwesome5Icon name='arrow-right' />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2A4BA0',
    justifyContent: 'space-between',
  },
  header: {
    marginTop: 40,
    paddingHorizontal: 32,
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
    flexDirection: 'row',
    gap: 10,
  },
  indicator: {
    width: 20,
    height: 4, 
    borderRadius: 2, 
    backgroundColor: '#606D76',
  },
  activeIndicator: {
    backgroundColor: '#E7ECF0',
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  button: {
    width: 200,
    height: 50,
    borderRadius: 15,
    backgroundColor: '#F9B023',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    alignSelf: 'center',
  },
  buttonContainer: {
    marginBottom: 40,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    height: 200, 
    width: 200,
  },
});