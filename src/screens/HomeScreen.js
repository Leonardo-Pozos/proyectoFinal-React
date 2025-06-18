import { FlatList, StyleSheet, Text, View, Image, ActivityIndicator, SafeAreaView, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { Picker } from '@react-native-picker/picker';
import { auth } from "../db/firebase";

export default function ProductListingScreen({ navigation }) {
    const [products, setProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedValue, setSelectedValue] = useState("default");

    useEffect(() => {
        getProducts();
    }, []);

    useEffect(() => {
        if (selectedValue === "default") {
            setProducts(allProducts);
        } else {
            const filtered = allProducts.filter(item => item.category === selectedValue);
            setProducts(filtered);
        }
    }, [selectedValue]);

    const getProducts = () => {
        const URL = "https://fakestoreapi.com/products";

        fetch(URL)
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Algo malo ha pasado en la conexión.");
                }
                return res.json();
            })
            .then((data) => {
                setAllProducts(data);
                setProducts(data);
                setIsLoading(false);
            })
            .catch((error) => {
                setError(error.message);
                setIsLoading(false);
            });
    };

    const handleSignOut = () => {
        auth
            .signOut()
            .then(() => {
                navigation.replace("Login");
            })
            .catch(error => alert(error.message))
    };

    return (
        <SafeAreaView style={styles.mainContainer}>
            <TouchableOpacity style={styles.btnLogOut} onPress={handleSignOut}>
                <Text style={styles.buttonText}>Sing Out</Text>
            </TouchableOpacity>
            <Text style={styles.label}>Buscar por categoría:</Text>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={selectedValue}
                    onValueChange={(itemValue) => setSelectedValue(itemValue)}
                    dropdownIconColor="#333">
                    <Picker.Item label="------" value="default" />
                    <Picker.Item label="Men's clothing" value="men's clothing" />
                    <Picker.Item label="Jewelery" value="jewelery" />
                    <Picker.Item label="Electronics" value="electronics" />
                    <Picker.Item label="Women's clothing" value="women's clothing" />
                </Picker>
            </View>

            {
                isLoading ? (
                    <ActivityIndicator color="red" size="large" />
                ) : error ? (
                    <Text>{error}</Text>
                ) : (
                    <FlatList
                        numColumns={2}
                        data={products}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => navigation.navigate('ProductDetail', { productItem: item })}>
                                <View style={styles.cardContainer}>
                                    <Image source={{ uri: item.image }} style={styles.image} />
                                    <Text style={styles.cardTitle}>{item.title}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        columnWrapperStyle={{ justifyContent: "space-between" }}
                        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}
                    />
                )
            }
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    mainContainer: {
        flex: 1
    },
    label: {
        fontSize: 18,
        fontWeight: "600",
        marginHorizontal: 16,
        marginTop: 16,
    },
    pickerContainer: {
        marginHorizontal: 16,
        marginVertical: 8,
        backgroundColor: "#FFF",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#DDD',
    },
    cardContainer: {
        backgroundColor: "#FFF",
        borderRadius: 12,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
        height: 260,
        width: 170,
        padding: 10,
        margin: 7
    },
    image: {
        height: 130,
        width: "100%",
        resizeMode: "contain",
        marginBottom: 10,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: "600"
    },
    errorStyle: {
        color: "red",
        fontSize: 18,
        marginTop: 30,
        textAlign: "center",
    },
    btnLogOut:{
        margin: 10
    }
});
