import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Frontpage from './components/Frontpage';

const Stack = createStackNavigator();
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="Frontpage" component={Frontpage}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
