import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import { db } from "../db/firebase";
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { useRoute } from '@react-navigation/native';

export default function FormScreen({ navigation }) {
    const route = useRoute();
    const producto = route.params?.producto || null;

    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [image, setImage] = useState('');
    const [rate, setRate] = useState('');
    const [count, setCount] = useState('');

    useEffect(() => {
        if (producto) {
            setTitle(producto.title);
            setPrice(producto.price?.toString());
            setDescription(producto.description);
            setCategory(producto.category);
            setImage(producto.image);
            setRate(producto.rating?.rate?.toString());
            setCount(producto.rating?.count?.toString());
        }
    }, [producto]);

    const guardar = async () => {
        if (!title || !price || !description || !image || !category || !rate || !count) {
            Alert.alert('Error', 'Por favor llena todos los campos requeridos.');
            return;
        }

        const datos = {
            title,
            price: parseFloat(price),
            description,
            category,
            image,
            rating: {
                rate: parseFloat(rate),
                count: parseInt(count)
            }
        };

        try {
            if (producto) {
                await updateDoc(doc(db, 'db-productos', producto.id), datos);
                Alert.alert('Actualizado', 'Producto actualizado correctamente');
            } else {
                await addDoc(collection(db, 'db-productos'), datos);
                Alert.alert('Guardado', 'Producto agregado correctamente');
            }
            navigation.goBack();
        } catch (error) {
            console.error('Error al guardar:', error);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <TextInput style={styles.input}
                placeholder="Titulo"
                value={title}
                onChangeText={setTitle}
            />
            <TextInput style={styles.input}
                placeholder="Precio"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
            />
            <TextInput
                style={styles.input}
                placeholder="Descripción"
                value={description}
                onChangeText={setDescription}
                multiline
            />
            <TextInput style={styles.input}
                placeholder="Categoria"
                value={category}
                onChangeText={setCategory}
            />
            <TextInput style={styles.input}
                placeholder="URL de Imagen"
                value={image}
                onChangeText={setImage}
            />
            <TextInput
                style={styles.input}
                placeholder="Calificación"
                value={rate}
                onChangeText={setRate}
                keyboardType="numeric"
            />
            <TextInput
                style={styles.input}
                placeholder="Cantidad"
                value={count}
                onChangeText={setCount}
                keyboardType="numeric"
            />
            <Button title={producto ? 'Actualizar' : 'Guardar'} onPress={guardar} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        gap: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 6,
    }
});