import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Onboard from './components/Onboard';
import Products from './components/Products';
import LightDarkSwitch from './components/LightDarkMode';
import AddProduct from './components/AddProduct';
import BountyBoard from './components/BountyBoard';
import AddPost from './components/AddPost';


const Stack = createStackNavigator();
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{
          headerShown: false,
        }}>
        {/* <Stack.Screen name="Product" component={Products}/>
        <Stack.Screen name="AddProduct" component={AddProduct} /> */}
        <Stack.Screen name="BountyBoard" component={BountyBoard} />
        <Stack.Screen name="AddPost" component={AddPost} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
