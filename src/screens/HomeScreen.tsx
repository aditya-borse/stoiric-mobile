
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Button, ActivityIndicator, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { hasTodayTasks, getDailyData } from '../utils/dailyStorage';

export type RootStackParamList = {
    Home: undefined;
    NewDay: undefined;


};

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
    const [buttonText, setButtonText] = useState("Loading...");
    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', async () => {
            setIsLoading(true);
            try {

                const tasksExist = await hasTodayTasks();

                const dailyData = await getDailyData();
                const dayIsCompleted = dailyData?.isDayCompleted ?? false;

                if (dayIsCompleted) {
                    setButtonText("VIEW TODAY'S LOG");
                } else if (tasksExist) {
                    setButtonText("VIEW TODAY'S GOALS");
                } else {
                    setButtonText("START YOUR DAY");
                }
            } catch (error) {
                console.error("Error checking tasks:", error);
                setButtonText("START YOUR DAY");
            } finally {
                setIsLoading(false);
            }
        });


        return unsubscribe;
    }, [navigation]);

    const handlePress = async () => {


        const dailyData = await getDailyData();
        if (dailyData?.isDayCompleted) {


            navigation.navigate('NewDay');
        } else {
            navigation.navigate('NewDay');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.introText}>
                    <Text style={styles.title}>Welcome to Stoiric!</Text>
                    <Text style={styles.subtitle}>Your Daily Stoic Companion</Text>
                </View>

                { }
                {isLoading ? (
                    <ActivityIndicator size="small" color="#f59e0b" style={styles.buttonPlaceholder} />
                ) : (
                    <TouchableOpacity style={styles.mainButton} onPress={handlePress}>
                        <Text style={styles.mainButtonText}>{buttonText}</Text>
                    </TouchableOpacity>
                )}

                { }
                <View style={styles.calendarPlaceholder}>
                    <Text style={styles.placeholderText}>Calendar View Here Later</Text>
                </View>
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
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: 20,
    },
    introText: {
        justifyContent: 'center',
        alignItems: 'center',
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
    buttonPlaceholder: {
        height: 50,
        marginVertical: 20,
    },
    mainButton: {
        backgroundColor: '#3f3f46',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 10,
        marginVertical: 20,
    },
    mainButtonText: {
        color: '#f4f4f5',
        fontSize: 16,
        fontWeight: '600',
    },
    calendarPlaceholder: {
        minWidth: 300,
        maxWidth: 350,
        height: 300,
        backgroundColor: '#27272a',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 20,
    },
    placeholderText: {
        color: '#71717a',
    }
});

export default HomeScreen;