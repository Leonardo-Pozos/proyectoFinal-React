import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProductDetailScreen from './src/screens/DetailsScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MyProductsScreen from './src/screens/MyProductsScreen';
import FormScreen from './src/screens/FormScreen';
import MyProductsDetailScreen from './src/screens/MyProductsDetailScreen';
import {Ionicons} from '@expo/vector-icons';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tabs para Home y MyProducts
function BottomTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false,
      tabBarIcon: ({ color, size }) => (
        <Ionicons name="home-outline" size={size} color={color} />
      ) }} />
      <Tab.Screen name="MyProducts" component={MyProductsScreen} options={{
      tabBarIcon: ({ color, size }) => (
        <Ionicons name="list-outline" size={size} color={color} />
      )
    }}/>
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen}/>
        <Stack.Screen name="Main" component={BottomTabs} options={{ headerShown: false }}/>
        {/* <Stack.Screen name="Home" options={{ headerShown: false }}  component={HomeScreen}/> */}
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen}/>
        <Stack.Screen name="Form" component={FormScreen}/>
        <Stack.Screen name="MyProductDetail" component={MyProductsDetailScreen}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
