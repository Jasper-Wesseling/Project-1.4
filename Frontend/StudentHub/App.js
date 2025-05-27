import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Onboard from './components/Onboard';
import Profile from './components/Profile';

const Stack = createStackNavigator();
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="Onboard" component={Profile}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
