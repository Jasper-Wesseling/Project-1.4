import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Onboard from './components/Onboard';
import Products from './components/Products';
import LightDarkSwitch from './components/LightDarkMode';
import AddProduct from './components/AddProduct';
import FaqPage from './components/FaqPage';


const Stack = createStackNavigator();
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{
          headerShown: false,
        }}>

        <Stack.Screen name="products" component={FaqPage}/>

      </Stack.Navigator>
    </NavigationContainer>
  );
}
