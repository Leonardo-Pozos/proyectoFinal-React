import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function CardProducts({ producto, onEliminar, onEditar, mostrarInfo }) {
    return (
        <TouchableOpacity style={styles.card} onPress={() => mostrarInfo(producto)}>
            <Image source={{ uri: producto.image }} style={styles.image} />
            <View style={styles.container}>
                <Text style={styles.title}>{producto.title}</Text>
                <View style={styles.actions}>
                    <TouchableOpacity onPress={onEditar} style={styles.iconButton}>
                        <Ionicons name="pencil" size={20} color='#007bff' />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onEliminar} style={styles.iconButton}>
                        <Ionicons name="trash" size={20} color='#dc3545' />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        marginVertical: 10,
        borderRadius: 10,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    image: {
        width: '100%',
        height: 180,
    },
    container: {
        padding: 12,
    },
    title: {
        fontSize: 35,
        fontWeight: 'bold',
        whiteSpace: '100%',
        textAlign: 'center',
    },
    multiplayer: {
        fontSize: 14,
        color: '#444',
        marginTop: 4
    },
    actions: {
        flexDirection: 'row',
        marginTop: 10,
        gap: 16
    },
    iconButton: {
        padding: 6,
    }
});