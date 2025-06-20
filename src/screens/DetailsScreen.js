import React, { useState } from "react";
import { FlatList, SafeAreaView, Text, TouchableOpacity, Image, StyleSheet, View, Alert, ActivityIndicator } from "react-native";
import { auth, db } from "../db/firebase";
import { addDoc, collection, doc, getDoc, updateDoc, increment } from "firebase/firestore";

export default function ProductDetailScreen({ route, navigation }) {
    const { productItem } = route.params;
    const [loading, setLoading] = useState(false);
    const [cartLoading, setCartLoading] = useState(false);

    const agregarAlCarrito = async () => {
        setCartLoading(true);
        try {
            // Validación del producto
            if (!productItem?.id || !productItem?.title || !productItem?.price) {
                throw new Error("El producto no tiene todos los datos requeridos");
            }

            const user = auth.currentUser;
            if (!user) {
                Alert.alert('Error', 'Debes iniciar sesión para agregar al carrito', [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Iniciar sesión', onPress: () => navigation.navigate('Login') }
                ]);
                return;
            }

            await addDoc(collection(db, 'carrito'), {
                userId: user.uid,
                productId: productItem.id,
                title: productItem.title,
                price: productItem.price,
                cantidad: 1,
                image: productItem.image || null,
                sellerId: productItem.userId || 'api-product', // Usa userId del producto o marca como API
                fecha: new Date(),
                esDeAPI: !productItem.hasOwnProperty('userId') // true si es de API, false si es local
            });

            Alert.alert('Éxito', 'Producto agregado al carrito');
        } catch (error) {
            console.error("Error al agregar al carrito:", {
                error: error.message,
                product: productItem,
                user: auth.currentUser?.uid
            });
            Alert.alert('Error', 'No se pudo agregar al carrito: ' + error.message);
        } finally {
            setCartLoading(false);
        }
    };
    const crearOrden = async () => {
        try {
            setLoading(true);
            const user = auth.currentUser;

            if (!user) {
                Alert.alert('Error', 'Debes iniciar sesión para comprar', [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Iniciar sesión', onPress: () => navigation.navigate('Login') }
                ]);
                return;
            }

            // Verificar stock para productos locales
            const esProductoLocal = productItem.hasOwnProperty('userId');

            if (esProductoLocal) {
                const productRef = doc(db, 'db-productos', productItem.id);
                const productSnap = await getDoc(productRef);

                if (!productSnap.exists() || productSnap.data().rating.count < 1) {
                    Alert.alert('Error', 'No hay suficiente stock de este producto');
                    return;
                }
            }

            // Crear la orden
            const orderData = {
                productId: productItem.id,
                buyerId: user.uid,
                sellerId: productItem.userId || 'api-product',
                price: productItem.price,
                status: 'pending',
                createdAt: new Date(),
                productName: productItem.title,
                productImage: productItem.image,
                quantity: 1,
                shippingAddress: null, // Puedes añadir esto más tarde
                paymentMethod: 'Por definir'
            };

            await addDoc(collection(db, 'ordenes'), orderData);

            // Actualizar stock si es producto local
            if (esProductoLocal) {
                await updateDoc(doc(db, 'db-productos', productItem.id), {
                    'rating.count': increment(-1)
                });
            }

            Alert.alert(
                'Compra exitosa',
                `Gracias por tu compra de ${productItem.title}`,
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );

        } catch (error) {
            console.error('Error en la compra:', error);
            Alert.alert('Error', error.message.includes('permission')
                ? 'No tienes permisos para realizar esta acción'
                : 'No se pudo completar la compra');
        } finally {
            setLoading(false);
        }
    };

    const detailSections = [
        {
            key: 'image',
            render: () => (
                <Image
                    source={{ uri: productItem.image || 'https://via.placeholder.com/300' }}
                    style={styles.image}
                    resizeMode="contain"
                    defaultSource={require('../../assets/placeholder.png')}
                />
            )
        },
        {
            key: 'title',
            render: () => <Text style={styles.title}>{productItem.title}</Text>
        },
        {
            key: 'price',
            render: () => <Text style={styles.price}>${productItem.price.toFixed(2)}</Text>
        },
        {
            key: 'description',
            render: () => (
                <>
                    <Text style={styles.sectionTitle}>Descripción</Text>
                    <Text style={styles.description}>{productItem.description || 'Sin descripción disponible'}</Text>
                </>
            )
        },
        {
            key: 'rating',
            render: () => (
                <View style={styles.ratingContainer}>
                    <Text style={styles.rating}>{productItem.rating?.rate || 0} ⭐</Text>
                    <Text style={styles.count}>({productItem.rating?.count || 0} reseñas)</Text>
                </View>
            )
        },
        {
            key: 'actions',
            render: () => (
                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={[styles.buttonComprar, (loading || cartLoading) && styles.disabledButton]}
                        onPress={crearOrden}
                        disabled={loading || cartLoading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.buttonTextComprar}>Comprar ahora</Text>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, (loading || cartLoading) && styles.disabledButton]}
                        onPress={agregarAlCarrito}
                        disabled={loading || cartLoading}
                    >
                        {cartLoading ? (
                            <ActivityIndicator color="#0782F9" />
                        ) : (
                            <Text style={styles.buttonText}>Agregar al carrito</Text>
                        )}
                    </TouchableOpacity>
                </View>
            )
        }
    ];

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={detailSections}
                renderItem={({ item }) => item.render()}
                keyExtractor={item => item.key}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E6E6D1',
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    image: {
        width: '100%',
        height: 300,
        marginBottom: 20,
        borderRadius: 12,
        backgroundColor: '#f0f0f0',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    price: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#2ecc71',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
        color: '#444',
        marginTop: 16,
    },
    description: {
        fontSize: 16,
        color: '#555',
        lineHeight: 24,
        marginBottom: 16,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    rating: {
        fontSize: 18,
        marginRight: 8,
        color: '#f39c12',
        fontWeight: 'bold',
    },
    count: {
        fontSize: 14,
        color: '#777',
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 30,
        gap: 15,
    },
    buttonComprar: {
        backgroundColor: '#e74c3c',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        flex: 1,
        elevation: 3,
    },
    button: {
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#0782F9',
        flex: 1,
        backgroundColor: 'white',
    },
    buttonTextComprar: {
        fontWeight: 'bold',
        fontSize: 16,
        color: 'white'
    },
    buttonText: {
        color: '#0782F9',
        fontWeight: 'bold',
        fontSize: 16,
    },
    disabledButton: {
        opacity: 0.7,
    },
});