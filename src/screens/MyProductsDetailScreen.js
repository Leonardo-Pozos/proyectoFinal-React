import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';

export default function MyProductsDetailScreen({ route }) {
    const { producto } = route.params;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Image source={{ uri: producto.image }} style={styles.image} />

            <Text style={styles.title}>{producto.title}</Text>
            <Text style={styles.label}>Precio:</Text>
            <Text style={styles.text}>{producto.price}</Text>

            <Text style={styles.label}>Descripción:</Text>
            <Text style={styles.text}>{producto.description}</Text>

            <Text style={styles.label}>Categoria:</Text>
            <Text style={styles.text}>{producto.category}</Text>

            <Text style={styles.label}>Calificación:</Text>
            <Text style={styles.text}>
                {producto.rating.rate}
            </Text>

            <Text style={styles.label}>Cantidad Disponible:</Text>
            <Text style={styles.text}>
                {producto.rating.count}
            </Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        gap: 10,
        backgroundColor: '#fff',
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 12,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
    },
    text: {
        fontSize: 15,
        color: '#444',
    },
});