import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import LoginScreen from "./src/screens/LoginScreen";
import HomeScreen from './src/screens/HomeScreen';
import DetailsScreen from './src/screens/DetailsScreen';
import MyProductsScreen from './src/screens/MyProductsScreen';
import MyProductsDetailScreen from './src/screens/MyProductsDetailScreen';
import FormScreen from './src/screens/FormScreen';
import CarritoScreen from './src/screens/CarritoScreen';

// Usa SOLO Native Stack Navigator (mejor rendimiento)
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Stack Navigator para Home y sus pantallas relacionadas
function HomeStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="HomeMain"
                component={HomeScreen}
                options={{
                    title: 'Productos',
                    headerStyle: { backgroundColor: '#007bff' },
                    headerTintColor: '#fff',
                    headerTitleStyle: { fontWeight: 'bold' }
                }}
            />
            <Stack.Screen
                name="ProductDetail"
                component={DetailsScreen}
                options={{
                    title: 'Detalle del Producto',
                    headerStyle: { backgroundColor: '#007bff' },
                    headerTintColor: '#fff'
                }}
            />
        </Stack.Navigator>
    );
}

// Stack Navigator para Mis Productos
function MyProductsStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="MyProductsMain"
                component={MyProductsScreen}
                options={{
                    title: 'Mis Productos',
                    headerStyle: { backgroundColor: '#007bff' },
                    headerTintColor: '#fff',
                    headerTitleStyle: { fontWeight: 'bold' }
                }}
            />
            <Stack.Screen
                name="MyProductDetail"
                component={MyProductsDetailScreen}
                options={{
                    title: 'Detalle',
                    headerStyle: { backgroundColor: '#007bff' },
                    headerTintColor: '#fff'
                }}
            />
            <Stack.Screen
                name="Form"
                component={FormScreen}
                options={{
                    title: 'Producto',
                    headerStyle: { backgroundColor: '#007bff' },
                    headerTintColor: '#fff'
                }}
            />
        </Stack.Navigator>
    );
}

// Tab Navigator principal
function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'MyProducts') {
                        iconName = focused ? 'list' : 'list-outline';
                    } else if (route.name === 'Carrito') {
                        iconName = focused ? 'cart' : 'cart-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#007bff',
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: {
                    backgroundColor: '#fff',
                    borderTopWidth: 1,
                    borderTopColor: '#eee',
                    height: 85,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
                headerShown: false,
            })}
        >
            <Tab.Screen
                name="Home"
                component={HomeStack}
                options={{
                    tabBarLabel: 'Inicio',
                }}
            />
            <Tab.Screen
                name="MyProducts"
                component={MyProductsStack}
                options={{
                    tabBarLabel: 'Mis Productos',
                }}
            />
            <Tab.Screen
                name="Carrito"
                component={CarritoScreen}
                options={{
                    tabBarLabel: 'Carrito',
                    headerShown: true,
                    headerStyle: { backgroundColor: '#007bff' },
                    headerTintColor: '#fff',
                    headerTitleStyle: { fontWeight: 'bold' },
                    title: 'Mi Carrito'
                }}
            />
        </Tab.Navigator>
    );
}

// Navegación principal de la app
export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Login"
                screenOptions={{
                    headerShown: false
                }}
            >
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Main" component={MainTabs} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}