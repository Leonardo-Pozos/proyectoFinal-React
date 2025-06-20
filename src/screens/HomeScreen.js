import { FlatList, StyleSheet, Text, View, Image, ActivityIndicator, SafeAreaView, TouchableOpacity, Modal } from "react-native";
import React, { useEffect, useState } from "react";
import { auth, db } from "../db/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function ProductListingScreen({ navigation }) {
    const [products, setProducts] = useState([]);
    const [localProducts, setLocalProducts] = useState([]);
    const [combinedProducts, setCombinedProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedValue, setSelectedValue] = useState("default");
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                console.log('Iniciando carga de datos...');
                const [apiProducts, localProducts] = await Promise.all([
                    getProducts(),
                    getLocalProducts()
                ]);

                console.log('Datos cargados:', {apiProducts, localProducts});

                setProducts(apiProducts);
                setLocalProducts(localProducts);
                setCategories(updateUniqueCategories(apiProducts, localProducts));
                setIsLoading(false);

            } catch (err) {
                console.error('Error en loadData:', err);
                setError(err.message);
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    useEffect(() => {
        if (selectedValue === "default") {
            setCombinedProducts([...localProducts, ...products]);
        } else {
            const filteredApi = products.filter(item => item.category === selectedValue);
            const filteredLocal = localProducts.filter(item => item.category === selectedValue);
            setCombinedProducts([...filteredLocal, ...filteredApi]);
        }
    }, [selectedValue, products, localProducts]);

    const getProducts = async () => {
        try {
            const URL = "https://fakestoreapi.com/products";
            const response = await fetch(URL);
            if (!response.ok) throw new Error("Error en la conexión a la API");
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching API products:', error);
            throw error;
        }
    };

    const getLocalProducts = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'db-productos'));
            const productsData = querySnapshot.docs.map(doc => {
                const productData = doc.data();
                return {
                    id: doc.id,
                    ...productData,
                    isLocal: true
                };
            });
            return productsData;
        } catch (error) {
            console.error('Error fetching local products:', error);
            throw error;
        }
    };

    const updateUniqueCategories = (apiProducts = [], localProducts = []) => {


        const apiCategories = apiProducts
            .filter(product => product?.category)
            .map(product => product.category);

        const localCategories = localProducts
            .filter(product => product?.category)
            .map(product => product.category);



        const allCategories = [...apiCategories, ...localCategories];
        const uniqueCategories = [...new Set(allCategories)].sort();


        return ["default", ...uniqueCategories];
    };

    const handleSignOut = () => {
        auth.signOut()
            .then(() => navigation.replace("Login"))
            .catch(error => alert(error.message));
    };

    const renderCategoryItem = ({ item }) => (
        <TouchableOpacity
            style={styles.modalItem}
            onPress={() => {
                setSelectedValue(item);
                setModalVisible(false);
            }}
        >
            <Text style={styles.categoryText}>
                {item === "default" ? "Todas las categorías" : item}
            </Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.mainContainer}>
            <TouchableOpacity style={styles.btnLogOut} onPress={handleSignOut}>
                <Text style={styles.buttonText}>Log Out</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Buscar por categoría:</Text>
            <View style={styles.pickerContainer}>
                <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={styles.pickerText}>
                        {selectedValue === "default" ? "Selecciona una categoría" : selectedValue}
                    </Text>
                </TouchableOpacity>

                <Modal
                    transparent={true}
                    visible={modalVisible}
                    animationType="slide"
                    onRequestClose={() => setModalVisible(false)}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setModalVisible(false)}
                    >
                        <View style={styles.modalContent}>
                            <FlatList
                                data={categories}
                                renderItem={renderCategoryItem}
                                keyExtractor={(item) => item}
                                contentContainerStyle={styles.categoryList}
                                ListHeaderComponent={
                                    <Text style={styles.modalTitle}>Selecciona categoría</Text>
                                }
                            />
                        </View>
                    </TouchableOpacity>
                </Modal>
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color="#007bff" />
            ) : error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : (
                <FlatList
                    numColumns={2}
                    data={combinedProducts}
                    keyExtractor={(item) => item.isLocal ? `local_${item.id}` : `api_${item.id}`}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('ProductDetail', { productItem: item, userId: item.userId })}
                        >
                            <View style={styles.cardContainer}>
                                <Image
                                    source={{ uri: item.image }}
                                    style={styles.image}
                                    defaultSource={require('../../assets/placeholder.png')}
                                />
                                <Text style={styles.cardTitle} numberOfLines={2} ellipsizeMode="tail">
                                    {item.title}
                                    {item.isLocal && " ★"}
                                </Text>
                                <Text style={styles.price}>${item.price}</Text>
                                {item.category && (
                                    <Text style={styles.categoryBadge}>
                                        {item.category}
                                    </Text>
                                )}
                            </View>
                        </TouchableOpacity>
                    )}
                    columnWrapperStyle={styles.columnWrapper}
                    contentContainerStyle={styles.productList}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No hay productos en esta categoría</Text>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#E6E6D1',
    },
    label: {
        fontSize: 18,
        fontWeight: "600",
        marginHorizontal: 16,
        marginTop: 16,
        color: '#333',
    },
    pickerContainer: {
        marginHorizontal: 16,
        marginVertical: 8,
    },
    pickerButton: {
        backgroundColor: "#FFF",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#DDD',
        padding: 12,
    },
    pickerText: {
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '50%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        padding: 16,
        textAlign: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    categoryList: {
        paddingBottom: 20,
    },
    modalItem: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    categoryText: {
        fontSize: 16,
    },
    cardContainer: {
        backgroundColor: "#FFF",
        borderRadius: 12,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        height: 260,
        width: 170,
        padding: 10,
        margin: 7,
        position: 'relative',
    },
    image: {
        height: 130,
        width: "100%",
        resizeMode: "contain",
        marginBottom: 10,
        borderRadius: 8,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: "600",
        height: 40,
        marginBottom: 4,
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2ecc71',
    },
    categoryBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.7)',
        color: 'white',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        fontSize: 12,
        overflow: 'hidden',
    },
    columnWrapper: {
        justifyContent: "space-between",
        paddingHorizontal: 8,
    },
    productList: {
        paddingTop: 16,
        paddingBottom: 20,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#666',
    },
    errorText: {
        color: "red",
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
    },
    btnLogOut: {
        margin: 10,
        alignSelf: 'flex-end',
    },
    buttonText: {
        fontSize: 16,
        color: "red",
        fontWeight: '600',
    },
});