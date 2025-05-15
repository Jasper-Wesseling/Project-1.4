import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Onboard from './components/Onboard';
import Products from './components/Products';
import LightDarkSwitch from './components/LightDarkMode';


const Stack = createStackNavigator();
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="Products" component={Products}/>
        <Stack.Screen name="LightDarkSwitch" component={LightDarkSwitch}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
