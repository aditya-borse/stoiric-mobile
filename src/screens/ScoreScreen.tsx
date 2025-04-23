
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    StyleSheet,
    ScrollView, 
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import Slider from '@react-native-community/slider'; 
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { getDailyData, updateDailyScore, isDayCompleted, DailyScores, hasTodayTasks } from '../utils/dailyStorage';
import type { RootStackParamList } from './HomeScreen'; 


const metrics = [
    { key: "Focus", label: "Focus" },
    { key: "Creativity", label: "Creativity" },
    { key: "Energy", label: "Energy" },
    { key: "Productivity", label: "Productivity" },
    { key: "Satisfaction", label: "Satisfaction" }
];

type Props = NativeStackScreenProps<RootStackParamList, 'Score'>;

const ScoreScreen: React.FC<Props> = ({ navigation }) => {
    
    const initialScores = metrics.reduce((acc, metric) => {
        acc[metric.key] = 0;
        return acc;
    }, {} as DailyScores);

    const [scores, setScores] = useState<DailyScores>(initialScores);
    const [isFinalized, setIsFinalized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    
    useEffect(() => {
        const loadScoreData = async () => {
            
            const dayStarted = await hasTodayTasks();
            if (!dayStarted) {
                console.log("Redirecting: Day not started.");
                navigation.replace('Home'); 
                return;
            }

            setIsLoading(true);
            const data = await getDailyData();
            const finalized = await isDayCompleted(); 

            if (data?.scores) {
                
                const loadedScores = { ...initialScores, ...data.scores };
                setScores(loadedScores);
            }
            setIsFinalized(finalized);
            setIsLoading(false);
        };
        loadScoreData();
    }, [navigation]); 

    
    const debounceSave = useCallback(
        debounce(async (newScores: DailyScores) => {
            await updateDailyScore(newScores);
        }, 500), 
        []);

    const handleScoreChange = (metricKey: string, value: number) => {
        if (isFinalized) return; 

        const newScores = {
            ...scores,
            [metricKey]: Math.round(value), 
        };
        setScores(newScores); 
        debounceSave(newScores); 
    };

    const navigateToTotalScore = () => {
        
        updateDailyScore(scores).then(() => {
            navigation.navigate('TotalScore');
        });
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#f59e0b" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
                        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                {/* <View style={styles.header}>
                    <Text style={styles.headerTitle}>Rate Your Day</Text>
                </View> */}

                {metrics.map(({ key, label }) => (
                    <View key={key} style={styles.metricContainer}>
                        <View style={styles.metricLabelContainer}>
                            <Text style={styles.metricLabel}>{label}</Text>
                            <Text style={styles.metricValue}>{scores[key]}</Text>
                        </View>
                        <Slider
                            style={styles.slider}
                            value={scores[key]}
                            minimumValue={0}
                            maximumValue={10}
                            step={1}
                            minimumTrackTintColor="#f59e0b" 
                            maximumTrackTintColor="#3f3f46" 
                            thumbTintColor="#f59e0b" 
                            onValueChange={(value) => handleScoreChange(key, value)}
                            
                            
                            disabled={isFinalized}
                        />
                    </View>
                ))}

                {!isFinalized && (
                    <TouchableOpacity
                        style={styles.footerButton}
                        onPress={navigateToTotalScore}
                    >
                        <Text style={styles.footerButtonText}>CALCULATE TOTAL SCORE</Text>
                    </TouchableOpacity>
                )}
                {isFinalized && (
                    <TouchableOpacity
                        style={[styles.footerButton, styles.footerButtonDisabled]} 
                        onPress={() => navigation.navigate('TotalScore')} 
                    >
                        <Text style={styles.footerButtonText}>VIEW FINAL SCORE</Text>
                    </TouchableOpacity>
                )}

            </ScrollView>
        </SafeAreaView>
    );
};


function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;
    return (...args: Parameters<T>): void => {
        const later = () => {
            timeout = null;
            func(...args);
        };
        if (timeout !== null) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(later, wait);
    };
}



const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#18181b',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#18181b',
    },
    scrollViewContainer: {
        padding: 20,
        paddingBottom: 100, 
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#f4f4f5',
    },
    metricContainer: {
        backgroundColor: '#27272a', 
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
    },
    metricLabelContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    metricLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#d4d4d8', 
    },
    metricValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#f59e0b', 
    },
    slider: {
        width: '100%',
        height: 40, 
    },
    footerButton: { 
        backgroundColor: '#3f3f46',
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 30,
    },
    footerButtonDisabled: { 
        backgroundColor: '#27272a',
        opacity: 0.7,
    },
    footerButtonText: { 
        fontSize: 16,
        color: '#f4f4f5',
        fontWeight: '600',
    },
});

export default ScoreScreen;