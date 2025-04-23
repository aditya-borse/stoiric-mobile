import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, ActivityIndicator, ScrollView
} from 'react-native';
import { RectButton } from 'react-native-gesture-handler'; 
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
    getDailyData, hasTodayTasks, getCompletedDays, calculateStreak
} from '../utils/dailyStorage';
import CalendarView from '../components/CalendarView';
import QuoteDisplay from '../components/QuoteDisplay';

export type RootStackParamList = {
    Home: undefined; NewDay: undefined; Reflect: undefined; Score: undefined;
    TotalScore: undefined; Logs: { date?: string } | undefined; LogDetail: { date: string };
};

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
    const [buttonText, setButtonText] = useState("Loading...");
    const [isLoading, setIsLoading] = useState(true);
    const [completedDays, setCompletedDays] = useState<{ [date: string]: number }>({});
    const [streak, setStreak] = useState(0);
    const [currentDateStr, setCurrentDateStr] = useState("");

    const loadHomeScreenData = useCallback(async () => {
        try {
            const today = new Date();
            const todayFormatted = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            setCurrentDateStr(todayFormatted);
            const tasksExist = await hasTodayTasks();
            const dailyData = await getDailyData();
            const dayIsCompleted = dailyData?.isDayCompleted ?? false;
            if (dayIsCompleted) { setButtonText("View Today's Log"); }
            else if (tasksExist) { setButtonText("View Today's Goals"); }
            else { setButtonText("Start Your Day"); }
            const completed = await getCompletedDays();
            const currentStreak = await calculateStreak();
            setCompletedDays(completed);
            setStreak(currentStreak);
        } catch (error) {
            console.error("Error loading home screen data:", error);
            setButtonText("Start Your Day"); setCompletedDays({}); setStreak(0);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadHomeScreenData();
        const unsubscribe = navigation.addListener('focus', loadHomeScreenData);
        return unsubscribe;
    }, [navigation, loadHomeScreenData]);

    const handleMainButtonPress = async () => {
        const dailyData = await getDailyData();
        if (dailyData?.isDayCompleted) {
            navigation.navigate('LogDetail', { date: currentDateStr });
        } else {
            navigation.navigate('NewDay');
        }
    };

    const handleCalendarDayPress = (date: string) => {
        navigation.navigate('LogDetail', { date: date });
    };

    const navigateToLogs = useCallback(() => {
        navigation.navigate('Logs');
    }, [navigation]);

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <RectButton 
                    onPress={navigateToLogs}
                    style={{ marginRight: 15, padding: 5 }} 
                >
                    <MaterialCommunityIcons name="history" size={26} color="#f4f4f5" />
                </RectButton>
            ),
        });
    }, [navigation, navigateToLogs]);

    const getStreakStyle = () => {
        if (streak >= 30) return styles.streakAmberHigh; if (streak >= 14) return styles.streakAmberMed;
        if (streak >= 7) return styles.streakAmberLow; return styles.streakDefault;
    };
    const getStreakTextStyle = () => {
        if (streak >= 30) return styles.streakTextAmberHigh; if (streak >= 14) return styles.streakTextAmberMed;
        if (streak >= 7) return styles.streakTextAmberLow; return styles.streakTextDefault;
    };
    const getStreakEmoji = () => {
        if (streak >= 30) return "🔥"; if (streak >= 14) return "⚡";
        if (streak >= 7) return "✨"; return "";
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.headerContent}>
                    <Text style={styles.title}>Stoiric</Text>
                    <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
                    {!isLoading && (
                        <View style={[styles.streakContainer, getStreakStyle()]}>
                            <Text style={[styles.streakText, getStreakTextStyle()]}>{streak} {streak === 1 ? 'day' : 'days'} streak {getStreakEmoji()}</Text>
                        </View>
                    )}
                </View>
                <QuoteDisplay />
                {isLoading ? (<ActivityIndicator size="small" color="#f59e0b" style={styles.buttonPlaceholder} />)
                    : (<RectButton style={styles.mainButton} onPress={handleMainButtonPress}><Text style={styles.mainButtonText}>{buttonText}</Text></RectButton>)}
                {isLoading ? (<View style={styles.calendarPlaceholder}><ActivityIndicator size="large" color="#f59e0b" /></View>)
                    : (<CalendarView completedDaysData={completedDays} onDayPress={handleCalendarDayPress} />)}
                <View style={{ height: 30 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#18181b', },
    scrollContainer: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10, },
    headerContent: { alignItems: 'center', width: '100%', },
    title: { fontSize: 24, fontWeight: 'bold', color: '#f59e0b', marginBottom: 5, },
    dateText: { fontSize: 14, color: '#a1a1aa', marginBottom: 15, },
    streakContainer: { paddingHorizontal: 15, paddingVertical: 6, borderRadius: 20, borderWidth: 1, marginBottom: 20, },
    streakText: { fontSize: 13, fontWeight: '600', textAlign: 'center', },
    streakDefault: { backgroundColor: '#27272a', borderColor: '#3f3f46', }, streakTextDefault: { color: '#a1a1aa', },
    streakAmberLow: { backgroundColor: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.3)', }, streakTextAmberLow: { color: '#fbbf24', },
    streakAmberMed: { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.5)', }, streakTextAmberMed: { color: '#f59e0b', },
    streakAmberHigh: { backgroundColor: 'rgba(245, 158, 11, 0.2)', borderColor: '#f59e0b', }, streakTextAmberHigh: { color: '#fcd34d', },
    buttonPlaceholder: { height: 52, marginVertical: 10, width: '90%', maxWidth: 400, },
    mainButton: { backgroundColor: '#3f3f46', paddingVertical: 15, borderRadius: 10, marginVertical: 10, width: '90%', maxWidth: 400, alignItems: 'center', alignSelf: 'center', },
    mainButtonText: { color: '#f4f4f5', fontSize: 16, fontWeight: '600', },
    calendarPlaceholder: { minWidth: 300, width: '100%', maxWidth: 350, height: 350, backgroundColor: '#27272a', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginVertical: 20, alignSelf: 'center', },
});

export default HomeScreen;