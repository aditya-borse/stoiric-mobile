import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { getSpecificDateData, DailyData, Task } from '../utils/dailyStorage';
import type { RootStackParamList } from './HomeScreen';


export type LogDetailScreenRouteParams = {
    date: string;
};

type Props = NativeStackScreenProps<RootStackParamList, 'LogDetail'>;

const TaskItemDisplay: React.FC<{ task: Task }> = ({ task }) => (
    <View style={styles.taskItem}>
        <MaterialCommunityIcons
            name={task.completed ? "checkbox-marked-outline" : "checkbox-blank-outline"}
            size={18}
            color={task.completed ? '#4ade80' : '#71717a'}
            style={styles.taskIcon}
        />
        <Text style={[styles.taskText, task.completed && styles.taskTextCompleted]}>
            {task.text}
        </Text>
    </View>
);

const ReflectionItemDisplay: React.FC<{ question: string; answer?: string }> = ({ question, answer }) => (
    <View style={styles.reflectionItem}>
        <Text style={styles.reflectionQuestion}>{question}</Text>
        <Text style={styles.reflectionAnswer}>{answer || '-'}</Text>
    </View>
);

const LogDetailScreen: React.FC<Props> = ({ route, navigation }) => {
    const { date } = route.params;
    const [logData, setLogData] = useState<DailyData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const reflectionQuestions = [
        "Did you achieve your priority of the day?",
        "What worked well?",
        "What went wrong?",
        "What did you learn today?",
    ];

    useEffect(() => {
        const loadLogDetail = async () => {
            setIsLoading(true);
            const data = await getSpecificDateData(date);
            setLogData(data);
            setIsLoading(false);

            if (data) {
                const dateObj = new Date(date + 'T00:00:00');
                const formattedTitle = dateObj.toLocaleDateString(undefined, {
                    month: 'short', day: 'numeric', year: 'numeric'
                });
                navigation.setOptions({ title: `Log: ${formattedTitle}` });
            } else {
                navigation.setOptions({ title: "Log Detail" });
            }
        };

        loadLogDetail();
    }, [date, navigation]);

    const totalTasks = logData?.totalTasks ?? 0;
    const completedTasks = logData?.completedTasks ?? 0;
    const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const getProgressColor = (percentage: number): string => {
        if (percentage >= 80) return '#22c55e';
        if (percentage >= 50) return '#f59e0b';
        if (percentage > 0) return '#f87171';
        return '#3f3f46';
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

    if (!logData) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.errorText}>Log data not found for {date}.</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                                <View style={[styles.card, styles.scoreCard]}>
                    <Text style={styles.cardTitle}>Daily Score</Text>
                    <Text style={styles.scoreText}>
                        {logData.finalScore?.toFixed(1) ?? '--'}
                    </Text>
                </View>

                                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Tasks</Text>
                        <Text style={styles.cardSubtitle}>({completedTasks}/{totalTasks})</Text>
                    </View>
                    <View style={styles.progressBarBackground}>
                        <View style={[
                            styles.progressBarForeground,
                            { width: `${progressPercentage}%`, backgroundColor: getProgressColor(progressPercentage) }
                        ]} />
                    </View>
                    <View style={styles.taskList}>
                        {logData.tasks && logData.tasks.length > 0 ? (
                            logData.tasks.map(task => <TaskItemDisplay key={task.id} task={task} />)
                        ) : (
                            <Text style={styles.noDataText}>No tasks logged.</Text>
                        )}
                    </View>
                </View>

                                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Reflections</Text>
                    {logData.reflectionAnswers && logData.reflectionAnswers.length > 0 ? (
                        reflectionQuestions.map((question, index) => (
                            <ReflectionItemDisplay
                                key={index}
                                question={question}
                                answer={logData.reflectionAnswers ? logData.reflectionAnswers[index] : undefined}
                            />
                        ))
                    ) : (
                        <Text style={styles.noDataText}>No reflections logged.</Text>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#18181b' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#18181b' },
    errorText: { color: '#f87171', fontSize: 16, textAlign: 'center', paddingHorizontal: 20 },
    scrollContainer: { padding: 20, paddingBottom: 60 },
    card: {
        backgroundColor: '#27272a',
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.18,
        shadowRadius: 1.00,
        elevation: 1,
        marginBottom: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#f4f4f5',
        marginBottom: 10,
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#a1a1aa',
    },

    progressBarBackground: {
        height: 8,
        backgroundColor: '#3f3f46',
        borderRadius: 4,
        overflow: 'hidden',
        marginVertical: 15,
    },
    progressBarForeground: {
        height: '100%',
        borderRadius: 4,
    },

    taskList: {
        marginTop: 15,
    },
    taskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    taskIcon: {
        marginRight: 12,
    },
    taskText: {
        fontSize: 15,
        color: '#e4e4e7',
        flexShrink: 1,
        lineHeight: 22,
    },
    taskTextCompleted: {
        textDecorationLine: 'line-through',
        color: '#71717a',
    },

    scoreCard: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    scoreText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#f59e0b',
        marginTop: 10,
    },

    reflectionItem: {
        marginTop: 20,
    },
    reflectionQuestion: {
        fontSize: 14,
        fontWeight: '600',
        color: '#a1a1aa',
        marginBottom: 8,
    },
    reflectionAnswer: {
        fontSize: 15,
        color: '#e4e4e7',
        lineHeight: 22,
    },
    noDataText: {
        fontSize: 14,
        color: '#a1a1aa',
        textAlign: 'center',
        paddingVertical: 20,
    }
});

export default LogDetailScreen;