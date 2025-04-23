import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    Alert,
    TouchableOpacity, 
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RectButton } from 'react-native-gesture-handler'; 

import { getAllDailyLogs, DailyData, clearAllData } from '../utils/dailyStorage';
import type { RootStackParamList } from './HomeScreen';


interface LogEntry {
    date: string;
    data: DailyData;
}


type Props = NativeStackScreenProps<RootStackParamList, 'Logs'>;

const LogsScreen: React.FC<Props> = ({ navigation, route }) => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const flatListRef = React.useRef<FlatList>(null);


    const loadLogs = useCallback(async () => {

        if (!refreshing) {
            setIsLoading(true);
        }
        const fetchedLogs = await getAllDailyLogs();
        setLogs(fetchedLogs);
        setIsLoading(false);
    }, [refreshing]);


    useEffect(() => {
        loadLogs().then(() => {

            const initialDate = route.params?.date;
            if (initialDate && logs.length > 0) {
                const index = logs.findIndex(log => log.date === initialDate);
                if (index !== -1 && flatListRef.current) {
                    console.log(`Scrolling to index ${index} for date ${initialDate}`);

                    setTimeout(() => {
                        flatListRef.current?.scrollToIndex({ animated: true, index: index, viewPosition: 0.5 });
                    }, 500);
                } else {
                    console.log(`Date ${initialDate} not found in logs or ref not ready.`);
                }
            }
        });
    }, [loadLogs, route.params?.date]);



    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadLogs();
        setRefreshing(false);
    }, [loadLogs]);


    const handleClearData = () => {
        Alert.alert(
            "Delete All Logs",
            "Are you sure you want to delete ALL journal entries? This action cannot be undone.",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Delete All",
                    onPress: async () => {
                        console.log("Deleting all data...");
                        await clearAllData();
                        setLogs([]);

                        Alert.alert("Data Cleared", "All your logs have been deleted.");
                        navigation.goBack();
                    },
                    style: "destructive"
                }
            ],
            { cancelable: true }
        );
    };


    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <RectButton onPress={handleClearData} style={{ marginRight: 15, padding: 5, borderRadius: 5 }}> 
                    <MaterialCommunityIcons name="delete-sweep-outline" size={24} color="#ef4444" />
                </RectButton>
            ),


        });
    }, [navigation, handleClearData]); 


    const renderLogItem = ({ item }: { item: LogEntry }) => {

        const dateParts = item.date.split('-').map(Number);
        const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);

        const formattedDate = date.toLocaleDateString(undefined, {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        const score = item.data.finalScore?.toFixed(1) ?? '--';

        return (

            <TouchableOpacity
                style={styles.logItemContainer}
                onPress={() => navigation.navigate('LogDetail', { date: item.date })}
            >
                <View style={styles.logItemHeader}>
                    <Text style={styles.logItemDate}>{formattedDate}</Text>
                    {item.data.isDayCompleted && (
                        <View style={styles.logItemScoreContainer}>
                            <MaterialCommunityIcons name="star-circle" size={16} color="#f59e0b" />
                            <Text style={styles.logItemScore}>{score}</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.logItemDetails}>
                    Tasks Completed: {item.data.completedTasks ?? '-'}/{item.data.totalTasks ?? '-'}
                </Text>
            </TouchableOpacity>
        );
    };


    return (
        <SafeAreaView style={styles.safeArea}>
            {isLoading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#f59e0b" />
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={logs}
                    renderItem={renderLogItem}
                    keyExtractor={(item) => item.date}
                    style={styles.list}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ListEmptyComponent={(
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No logs yet. Start journaling!</Text>
                        </View>
                    )}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#f59e0b"
                            colors={["#f59e0b"]}
                        />
                    }




                />
            )}
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
    list: {
        flex: 1,
        paddingHorizontal: 15,
        paddingTop: 10,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '40%',
    },
    emptyText: {
        color: '#71717a',
        fontSize: 16,
        textAlign: 'center',
    },
    logItemContainer: {
        backgroundColor: '#27272a',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 15,
        marginBottom: 12,
    },
    logItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    logItemDate: {
        fontSize: 14,
        fontWeight: '600',
        color: '#e4e4e7',
        flexShrink: 1,
        marginRight: 8,
    },
    logItemScoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.3)',
    },
    logItemScore: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#60a5fa',
        marginLeft: 4,
    },
    logItemDetails: {
        fontSize: 13,
        color: '#a1a1aa',
        marginTop: 4,
    },







});

export default LogsScreen;