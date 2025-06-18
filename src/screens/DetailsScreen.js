import React, { useState } from "react";
import { SafeAreaView, Text, TouchableOpacity, Image, StyleSheet, View } from "react-native";

export default function ProductDetailScreen({ route, navigation }) {
    const { productItem } = route.params;

return (
    <SafeAreaView style={styles.container}>
        <Text style={styles.title}>{productItem.title}</Text>

        <Image source={{ uri: productItem.image }} style={styles.image} />

        <Text style={styles.price}>Precio: ${productItem.price}</Text>

        <Text style={styles.sectionTitle}>Descripción</Text>
        <Text style={styles.description}>{productItem.description}</Text>

        <View style={styles.ratingContainer}>
            <Text style={styles.rating}>{productItem.rating.rate} ⭐</Text>
            <Text style={styles.count}>({productItem.rating.count})</Text>
        </View>

        <TouchableOpacity style={styles.buttonComprar}>
            <Text style={styles.buttonTextComprar}>Comprar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Agregar al carrito</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnVolver} onPress={() => navigation.goBack()}>
            <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>

    </SafeAreaView>
);

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fefefe',
    },
    image: {
        width: '100%',
        height: 300,
        resizeMode: 'contain',
        marginBottom: 20,
        borderRadius: 12,
        backgroundColor: '#fff',
    },
    card: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
    price: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    rating: {
        fontSize: 16,
        marginRight: 8,
    },
    count: {
        fontSize: 14,
        color: '#777',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
        color: '#444',
    },
    description: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
        marginBottom: 24,
    },
    buttonComprar: {
        backgroundColor: '#e00a0a',
        paddingVertical: 12,
        marginTop: 10,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#DDD'
    },
    button: {
        paddingVertical: 12,
        marginTop: 10,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#DDD'
    },
    buttonTextComprar: {
        fontWeight: '600',
        fontSize: 16,
        color: 'white'
    },
    buttonText: {
        color: 'black',
        fontWeight: '600',
        fontSize: 16,
    },
    btnVolver: {
        backgroundColor: '#999',
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
        alignSelf: 'flex-end',
        paddingHorizontal: 20,
        marginTop: 10
    }
});
