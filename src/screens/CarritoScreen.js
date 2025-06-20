import { FlatList, StyleSheet, Text, View, Image, ActivityIndicator, SafeAreaView, TouchableOpacity, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { db, auth } from '../db/firebase';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc, increment, writeBatch, getDoc } from 'firebase/firestore';

export default function CarritoScreen({ navigation }) {
    const [carritoItems, setCarritoItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            cargarCarrito();
        });
        return unsubscribe;
    }, [navigation]);

    const calcularTotal = (items) => {
        const totalCalculado = items.reduce((sum, item) => sum + (item.price * item.cantidad), 0);
        setTotal(totalCalculado.toFixed(2));
    };

    const cargarCarrito = async () => {
        setLoading(true);
        try {
            const user = auth.currentUser;
            if (!user) {
                setCarritoItems([]);
                setLoading(false);
                return;
            }

            // Verifica si el usuario está realmente autenticado
            await user.reload();
            if (user.isAnonymous) {
                throw new Error('Usuario anónimo no permitido');
            }

            const q = query(
                collection(db, 'carrito'),
                where('userId', '==', user.uid)
            );

            const snapshot = await getDocs(q);
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setCarritoItems(items);
            calcularTotal(items);
        } catch (error) {
            console.error('Error cargando carrito:', error);
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const actualizarCantidad = async (id, nuevaCantidad) => {
        try {
            const item = carritoItems.find(i => i.id === id);

            if (!item) {
                console.warn('Item no encontrado en el carrito');
                return;
            }

            if (item.esDeAPI) {
                Alert.alert(
                    'Acción no permitida',
                    'No puedes modificar la cantidad de productos de la API'
                );
                return;
            }

            if (nuevaCantidad < 1) {
                eliminarDelCarrito(id);
                return;
            }

            await updateDoc(doc(db, 'carrito', id), {
                cantidad: nuevaCantidad
            });

            cargarCarrito();
        } catch (error) {
            console.error('Error actualizando cantidad:', {
                error: error.message,
                id,
                nuevaCantidad,
                item: item ? JSON.stringify(item) : 'no encontrado'
            });

            Alert.alert(
                'Error',
                'No se pudo actualizar la cantidad: ' + error.message
            );
        }
    };

    const eliminarDelCarrito = async (id) => {
        try {
            const itemRef = doc(db, 'carrito', id);
            const itemDoc = await getDoc(itemRef);

            if (!itemDoc.exists()) throw new Error("El item no existe");
            if (itemDoc.data().userId !== auth.currentUser?.uid) {
                throw new Error("No tienes permisos para eliminar este item");
            }

            await deleteDoc(itemRef);
            cargarCarrito();
        } catch (error) {
            console.error('Error eliminando:', {
                error: error.message,
                id,
                user: auth.currentUser?.uid
            });
            Alert.alert('Error', error.message);
        }
    };
    const finalizarCompra = async () => {
        try {
            const user = auth.currentUser;
            if (!user) {
                Alert.alert('Error', 'Debes iniciar sesión para completar la compra', [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Iniciar sesión', onPress: () => navigation.navigate('Login') }
                ]);
                return;
            }

            if (!carritoItems?.length) {
                Alert.alert('Carrito vacío', 'No hay productos en el carrito');
                return;
            }

            // Prepara los datos de la orden
            const ordenData = {
                userId: user.uid,
                sellerId: carritoItems[0].sellerId || 'default-seller', // Valor por defecto
                items: carritoItems.map(item => ({
                    productId: item.productId,
                    title: item.title,
                    price: item.price,
                    cantidad: item.cantidad,
                    image: item.image || null,
                    sellerId: item.sellerId || 'default-seller'
                })),
                total: Number(total),
                fecha: new Date(),
                estado: 'pendiente',
                direccionEnvio: null,
                metodoPago: 'no especificado'
            };

            // Intenta ejecutar todas las operaciones
            try {
                const batch = writeBatch(db);

                // 1. Crear orden
                const ordenRef = doc(collection(db, 'ordenes'));
                batch.set(ordenRef, ordenData);

                // 2. Actualizar stock (solo productos locales)
                for (const item of carritoItems) {
                    if (!item.esDeAPI) {
                        const productRef = doc(db, 'db-productos', item.productId);
                        const productDoc = await getDoc(productRef);

                        if (productDoc.exists()) {
                            batch.update(productRef, {
                                'rating.count': increment(-Number(item.cantidad))
                            });
                        }
                    }
                }

                // 3. Vaciar carrito
                carritoItems.forEach(item => {
                    batch.delete(doc(db, 'carrito', item.id));
                });

                await batch.commit();

                // Éxito - Actualizar estado local
                setCarritoItems([]);
                setTotal(0);

                Alert.alert(
                    'Compra exitosa',
                    'Tu orden ha sido procesada correctamente',
                    [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
                );

            } catch (batchError) {
                console.error('Error en operaciones batch:', batchError);

                // Fallback: Intentar operaciones individualmente
                try {
                    // Crear orden
                    await addDoc(collection(db, 'ordenes'), ordenData);

                    // Actualizar stock
                    for (const item of carritoItems) {
                        if (!item.esDeAPI) {
                            await updateDoc(doc(db, 'db-productos', item.productId), {
                                'rating.count': increment(-Number(item.cantidad))
                            });
                        }
                    }

                    // Vaciar carrito
                    const deletePromises = carritoItems.map(item =>
                        deleteDoc(doc(db, 'carrito', item.id))
                    );
                    await Promise.all(deletePromises);

                    // Éxito en fallback
                    setCarritoItems([]);
                    setTotal(0);

                    Alert.alert(
                        'Compra completada',
                        'La compra se completó con operaciones individuales',
                        [{ text: 'OK', onPress: () => navigation.navigate('Ordenes') }]
                    );

                } catch (individualError) {
                    console.error('Error en operaciones individuales:', individualError);

                    // Verifica si al menos la orden se creó
                    const ordenCreada = await getDocs(query(
                        collection(db, 'ordenes'),
                        where('userId', '==', user.uid),
                        where('fecha', '>=', new Date(Date.now() - 60000)) // Último minuto
                    ));

                    if (!ordenCreada.empty) {
                        // La orden se creó pero hubo otros errores
                        Alert.alert(
                            'Orden parcialmente completada',
                            'Se creó la orden pero hubo problemas con el stock o el carrito',
                            [{ text: 'OK', onPress: () => navigation.navigate('Ordenes') }]
                        );
                    } else {
                        // Error completo
                        Alert.alert(
                            'Error',
                            individualError.code === 'permission-denied'
                                ? 'Problema de permisos. Contacta al soporte.'
                                : 'No se pudo completar la compra: ' + individualError.message
                        );
                    }
                }
            }
        } catch (error) {
            console.error('Error general en finalizarCompra:', error);
            Alert.alert(
                'Error',
                typeof error === 'string' ? error : error.message
            );
        }
    };

    const renderCarritoItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <Image source={{ uri: item.image }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
                <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>

                <View style={styles.cantidadContainer}>
                    <TouchableOpacity
                        style={styles.cantidadButton}
                        onPress={() => actualizarCantidad(item.id, item.cantidad - 1)}
                        disabled={item.esDeAPI}
                    >
                        <Ionicons name="remove" size={20} color={item.esDeAPI ? "#ccc" : "#007bff"} />
                    </TouchableOpacity>

                    <Text style={styles.cantidadText}>{item.cantidad}</Text>

                    <TouchableOpacity
                        style={styles.cantidadButton}
                        onPress={() => actualizarCantidad(item.id, item.cantidad + 1)}
                        disabled={item.esDeAPI}
                    >
                        <Ionicons name="add" size={20} color={item.esDeAPI ? "#ccc" : "#007bff"} />
                    </TouchableOpacity>
                </View>

                <Text style={styles.subtotal}>
                    Subtotal: ${(item.price * item.cantidad).toFixed(2)}
                </Text>
            </View>

            <TouchableOpacity
                style={styles.eliminarButton}
                onPress={() => eliminarDelCarrito(item.id)}
            >
                <Ionicons name="trash-outline" size={24} color="#dc3545" />
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text style={styles.loadingText}>Cargando carrito...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Mi Carrito</Text>
                <Text style={styles.itemCount}>{carritoItems.length} {carritoItems.length === 1 ? 'producto' : 'productos'}</Text>
            </View>

            {carritoItems.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="cart-outline" size={80} color="#ccc" />
                    <Text style={styles.emptyText}>Tu carrito está vacío</Text>
                    <Text style={styles.emptySubtext}>Agrega productos para comenzar</Text>
                    <TouchableOpacity
                        style={styles.shopButton}
                        onPress={() => navigation.navigate('Home')}
                    >
                        <Text style={styles.shopButtonText}>Ir de compras</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <FlatList
                        data={carritoItems}
                        keyExtractor={(item) => item.id}
                        renderItem={renderCarritoItem}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContainer}
                    />

                    <View style={styles.footer}>
                        <View style={styles.totalContainer}>
                            <Text style={styles.totalLabel}>Total:</Text>
                            <Text style={styles.totalAmount}>${total}</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.checkoutButton}
                            onPress={finalizarCompra}
                        >
                            <Text style={styles.checkoutButtonText}>Finalizar Compra</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5DC',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    header: {
        backgroundColor: '#fff',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    itemCount: {
        fontSize: 16,
        color: '#666',
        marginTop: 4,
    },
    listContainer: {
        padding: 16,
    },
    itemContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    itemImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#f8f8f8',
    },
    itemInfo: {
        flex: 1,
        marginLeft: 12,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007bff',
        marginBottom: 8,
    },
    cantidadContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    cantidadButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#007bff',
    },
    cantidadText: {
        marginHorizontal: 16,
        fontSize: 16,
        fontWeight: 'bold',
        minWidth: 20,
        textAlign: 'center',
    },
    subtotal: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    eliminarButton: {
        padding: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 16,
        color: '#666',
        marginTop: 8,
        textAlign: 'center',
    },
    shopButton: {
        backgroundColor: '#007bff',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 24,
    },
    shopButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        backgroundColor: '#fff',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    totalLabel: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    totalAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#007bff',
    },
    checkoutButton: {
        backgroundColor: '#28a745',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    checkoutButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});