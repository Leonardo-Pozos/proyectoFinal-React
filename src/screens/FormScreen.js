import React, { useState } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    Alert,
    Modal,
    TouchableOpacity,
    Text,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from "react-native";
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { db, auth } from '../db/firebase';
import { Ionicons } from '@expo/vector-icons';

const CATEGORIAS = [
    'electronics',
    'men\'s clothing',
    'women\'s clothing',
    'jewelery',
    'home',
    'sports',
    'toys'
];

export default function FormScreen({ navigation, route }) {
    const productoExistente = route.params?.producto;
    const [title, setTitle] = useState(productoExistente?.title || '');
    const [price, setPrice] = useState(productoExistente?.price?.toString() || '');
    const [image, setImage] = useState(productoExistente?.image || '');
    const [description, setDescription] = useState(productoExistente?.description || '');
    const [category, setCategory] = useState(productoExistente?.category || CATEGORIAS[0]);
    const [count, setCount] = useState(productoExistente?.rating?.count?.toString() || '1');
    const [modalVisible, setModalVisible] = useState(false);

    const guardarProducto = async () => {
        try {
            const productData = {
                title: title,
                price: Number(price),
                image: image,
                description: description,
                category: category,
                rating: {
                    rate: 0,
                    count: Number(count || 1)
                },
                userId: auth.currentUser.uid
            };

            if (productoExistente) {
                await updateDoc(doc(db, 'db-productos', productoExistente.id), productData);
                Alert.alert('Éxito', 'Producto actualizado');
            } else {
                await addDoc(collection(db, 'db-productos'), productData);
                Alert.alert('Éxito', 'Producto creado');
            }

            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', 'No se pudo guardar el producto');
            console.error(error);
        }
    };

    const renderCategoryItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.option,
                item === category && styles.selectedOption
            ]}
            onPress={() => {
                setCategory(item);
                setModalVisible(false);
            }}
        >
            <Text style={item === category ? styles.selectedText : styles.optionText}>
                {item}
            </Text>
            {item === category && <Ionicons name="checkmark" size={20} color="#007bff" />}
        </TouchableOpacity>
    );

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
            >
                <TextInput
                    placeholder="Título"
                    value={title}
                    onChangeText={setTitle}
                    style={styles.input}
                    returnKeyType="next"
                />
                <TextInput
                    placeholder="Precio"
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="numeric"
                    style={styles.input}
                    returnKeyType="next"
                />
                <TextInput
                    placeholder="Imagen URL"
                    value={image}
                    onChangeText={setImage}
                    style={styles.input}
                    returnKeyType="next"
                />
                <TextInput
                    placeholder="Descripción"
                    value={description}
                    onChangeText={setDescription}
                    style={[styles.input, styles.multilineInput]}
                    multiline
                    numberOfLines={4}
                    returnKeyType="next"
                />
                <TextInput
                    placeholder="Cantidad"
                    value={count}
                    onChangeText={setCount}
                    keyboardType="numeric"
                    style={styles.input}
                    returnKeyType="done"
                />

                <Text style={styles.label}>Categoría:</Text>

                <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={styles.pickerButtonText}>{category}</Text>
                    <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>

                <Modal
                    transparent={true}
                    visible={modalVisible}
                    animationType="slide"
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Selecciona una categoría</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Ionicons name="close" size={24} color="#666" />
                                </TouchableOpacity>
                            </View>

                            <FlatList
                                data={CATEGORIAS}
                                renderItem={renderCategoryItem}
                                keyExtractor={(item) => item}
                                contentContainerStyle={styles.listContent}
                            />
                        </View>
                    </View>
                </Modal>

                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={guardarProducto}
                >
                    <Text style={styles.saveButtonText}>
                        {productoExistente ? "GUARDAR CAMBIOS" : "CREAR PRODUCTO"}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E6E6D1'
    },
    scrollContainer: {
        padding: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        fontSize: 16,
        backgroundColor: '#f9f9f9'
    },
    multilineInput: {
        minHeight: 100,
        textAlignVertical: 'top'
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333'
    },
    pickerButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 15,
        marginBottom: 20,
        backgroundColor: '#f9f9f9'
    },
    pickerButtonText: {
        fontSize: 16,
        color: '#333'
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end'
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        maxHeight: '60%'
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333'
    },
    listContent: {
        paddingBottom: 20
    },
    option: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0'
    },
    selectedOption: {
        backgroundColor: '#f5f9ff'
    },
    optionText: {
        fontSize: 16,
        color: '#333'
    },
    selectedText: {
        fontSize: 16,
        color: '#007bff',
        fontWeight: '600'
    },
    saveButton: {
        backgroundColor: '#007bff',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold'
    }
});