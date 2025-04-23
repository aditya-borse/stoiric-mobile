import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Button } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
    Home: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.title}>Welcome to Stoiric!</Text>
                <Text style={styles.subtitle}>Your Daily Stoic Companion</Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1, 
        backgroundColor: '#18181b',
    },
    container: {
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#f4f4f5', 
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#a1a1aa',
    },
});

export default HomeScreen;