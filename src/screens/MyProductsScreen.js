import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View, Image, ActivityIndicator, SafeAreaView, TouchableOpacity } from "react-native";
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { db, auth } from "../db/firebase";
import CardProducts from "../components/CardProducts";

export default function MyProductsScreen({ navigation }) {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(false);
    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused) {
            cargarProducto();
        }
    }, [isFocused]);

    const cargarProducto = async () => {
        setLoading(true);
        try {
            const currentUID = auth.currentUser?.uid;

            if (!currentUID) {
                console.warn('Usuario no autenticado.');
                setProductos([]);
                setLoading(false);
                return;
            }

            const q = query(collection(db, 'db-productos'), orderBy('title'));
            const snapshot = await getDocs(q);

            const producto = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(item => item.userId === currentUID);

            setProductos(producto);
        } catch (error) {
            console.error('Error cargando sus productos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = () => {
        auth.signOut()
            .then(() => navigation.replace("Login"))
            .catch(error => alert(error.message));
    };


    const eliminarProducto = async (id) => {
        try {
            await deleteDoc(doc(db, 'db-productos', id));
            cargarProducto();
        } catch (error) {
            console.error('Error eliminando producto:', error);
        }
    };

    if (loading) {
        return <ActivityIndicator size="large" style={styles.loading} />;
    }

    return (
        <View style={styles.container}>
            <View style={styles.actionsContainer}>
                <Text style={styles.userName}>{auth.currentUser?.email}</Text>
                <TouchableOpacity style={styles.btnLogOut} onPress={handleSignOut}>
                    <Text style={styles.buttonText}>Log Out</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={productos}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <CardProducts
                        producto={item}
                        mostrarInfo={() =>
                            navigation.navigate('MyProductDetail', { producto: item })
                        }
                        onEditar={() =>
                            navigation.navigate('Form', { producto: item })
                        }
                        onEliminar={() => eliminarProducto(item.id)}
                    />
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            />

            <TouchableOpacity
                style={styles.botonFlotante}
                onPress={() => navigation.navigate('Form')}>
                <Ionicons name="add" size={32} color="#fff" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#E6E6D1'
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10
    },
    userName: {
        flex: 1,
        elevation: 3,
        alignSelf: 'center',
        marginLeft: 20,
        fontSize: 17,
        fontWeight: 600
    },
    botonFlotante: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        backgroundColor: '#007bff',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },
    btnLogOut: {
        backgroundColor: 'gray', 
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        elevation: 3, // sombra en Android
        shadowColor: '#000', // sombra en iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },

    buttonText: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 16,
    },
});