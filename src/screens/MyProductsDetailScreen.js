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
    padding: 20,
    backgroundColor: '#f9f9f9',
    flexGrow: 1,
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginBottom: 20,
    resizeMode: 'cover',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2a2a2a',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginTop: 14,
    marginBottom: 4,
  },
  text: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    backgroundColor: '#ffffff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    elevation: 1,
  },
});
