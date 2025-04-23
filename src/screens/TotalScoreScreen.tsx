
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ConfettiCannon from 'react-native-confetti-cannon'; 

import { getDailyData, updateFinalScore, hasTodayTasks } from '../utils/dailyStorage';
import type { RootStackParamList } from './HomeScreen'; 

type Props = NativeStackScreenProps<RootStackParamList, 'TotalScore'>;

const TotalScoreScreen: React.FC<Props> = ({ navigation }) => {
    const [score, setScore] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showConfetti, setShowConfetti] = useState(false);
    const confettiRef = useRef<ConfettiCannon>(null);

    useEffect(() => {
        const calculateAndSaveScore = async () => {
            
            const dayStarted = await hasTodayTasks();
            if (!dayStarted) {
                console.log("Redirecting: Day not started.");
                navigation.replace('Home'); 
                return;
            }

            setIsLoading(true);
            const dailyData = await getDailyData();

            if (dailyData) {
                const { completedTasks = 0, totalTasks = 0, totalRating = 0 } = dailyData;

                let finalScore = 0;
                if (totalTasks > 0) { 
                    const taskRatio = completedTasks / totalTasks;
                    
                    const ratingRatio = totalRating / 50;
                    finalScore = taskRatio * ratingRatio * 100;
                }

                const finalScoreRounded = parseFloat(finalScore.toFixed(1));
                setScore(finalScoreRounded.toString());

                
                if (!dailyData.isDayCompleted) {
                    await updateFinalScore(finalScoreRounded);
                    
                    if (finalScoreRounded > 0) { 
                        setTimeout(() => {
                            setShowConfetti(true);
                            
                            
                        }, 300);
                    }
                }
            } else {
                setScore('N/A'); 
            }
            setIsLoading(false);
        };

        calculateAndSaveScore();
    }, [navigation]); 

    const goHome = () => {
        navigation.popToTop(); 
        
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
            <View style={styles.container}>
                <View style={styles.scoreCard}>
                    <Text style={styles.scoreLabel}>Your Total Score</Text>
                    <Text style={styles.scoreValue}>{score !== null ? score : '--'}</Text>
                    <Text style={styles.scoreUnit}>out of 100</Text>
                                    </View>

                <TouchableOpacity
                    style={styles.footerButton}
                    onPress={goHome}
                >
                    <Text style={styles.footerButtonText}>GO HOME</Text>
                </TouchableOpacity>

                                {showConfetti && (
                    <ConfettiCannon
                        ref={confettiRef}
                        count={150} 
                        origin={{ x: -10, y: 0 }} 
                        fallSpeed={3000}
                        fadeOut={true}
                        autoStart={true} 
                    
                    
                    />
                )}
            </View>
        </SafeAreaView>
    );
};


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
    container: {
        flex: 1,
        justifyContent: 'center', 
        alignItems: 'center',
        padding: 20,
    },
    scoreCard: {
        backgroundColor: 'rgba(39, 39, 42, 0.7)', 
        borderRadius: 15,
        padding: 30,
        alignItems: 'center',
        marginBottom: 40, 
        width: '90%', 
    },
    scoreLabel: {
        fontSize: 20,
        fontWeight: '600',
        color: '#d4d4d8', 
        marginBottom: 15,
    },
    scoreValue: {
        fontSize: 64,
        fontWeight: 'bold',
        color: '#f59e0b', 
        marginBottom: 5,
    },
    scoreUnit: {
        fontSize: 14,
        color: '#a1a1aa', 
    },
    footerButton: { 
        backgroundColor: '#3f3f46',
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: 'center',
        width: '90%', 
    },
    footerButtonText: { 
        fontSize: 16,
        color: '#f4f4f5',
        fontWeight: '600',
    },
});

export default TotalScoreScreen;