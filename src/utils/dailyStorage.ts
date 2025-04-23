import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Task {
    id: number;
    text: string;
    important: boolean;
    completed: boolean;
}

export interface DailyScores {
    [metric: string]: number; 
}

export interface DailyData {
    tasks?: Task[];
    totalTasks?: number;
    completedTasks?: number;
    reflectionAnswers?: string[];
    scores?: DailyScores;
    totalRating?: number;
    finalScore?: number;
    isDayCompleted?: boolean;
}


const formatDate = (date: Date): string => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const getCurrentDateKey = (): string => {
    return `stoiric_${formatDate(new Date())}`;
};


export const storeDailyData = async (data: DailyData): Promise<void> => {
    const key = getCurrentDateKey();
    try {
        const jsonValue = JSON.stringify(data);
        await AsyncStorage.setItem(key, jsonValue);
        console.log(`Data stored successfully for key: ${key}`);
    } catch (e) {
        console.error("Failed to save data to AsyncStorage", e);
    }
};

export const getDailyData = async (): Promise<DailyData | null> => {
    const key = getCurrentDateKey();
    try {
        const jsonValue = await AsyncStorage.getItem(key);
        console.log(`Raw data fetched for key ${key}:`, jsonValue); 
        if (jsonValue != null) {
            const parsedData = JSON.parse(jsonValue) as DailyData;
            console.log(`Parsed data for key ${key}:`, parsedData); 
            return parsedData;
        } else {
            console.log(`No data found for key: ${key}`);
            return null;
        }
    } catch (e) {
        console.error("Failed to fetch data from AsyncStorage", e);
        return null;
    }
};

export const updateDailyData = async (updates: Partial<DailyData>): Promise<DailyData | null> => {
    try {
        const currentData = await getDailyData() || {};
        const updatedData: DailyData = {
            tasks: updates.tasks !== undefined ? updates.tasks : currentData.tasks,
            totalTasks: updates.totalTasks !== undefined ? updates.totalTasks : currentData.totalTasks,
            completedTasks: updates.completedTasks !== undefined ? updates.completedTasks : currentData.completedTasks,
            reflectionAnswers: updates.reflectionAnswers !== undefined ? updates.reflectionAnswers : currentData.reflectionAnswers,
            scores: updates.scores !== undefined ? updates.scores : currentData.scores,
            totalRating: updates.totalRating !== undefined ? updates.totalRating : currentData.totalRating,
            finalScore: updates.finalScore !== undefined ? updates.finalScore : currentData.finalScore,
            isDayCompleted: updates.isDayCompleted !== undefined ? updates.isDayCompleted : currentData.isDayCompleted,
        };

        if (updates.tasks) {
            updatedData.totalTasks = updates.tasks.length;
            updatedData.completedTasks = updates.tasks.filter(task => task.completed).length;
        }

        if (updates.scores) {
            updatedData.totalRating = Object.values(updates.scores).reduce((sum, score) => sum + score, 0);
        }

        await storeDailyData(updatedData);
        console.log("Daily data updated:", updatedData); 
        return updatedData;
    } catch (e) {
        console.error("Failed to update data", e);
        return null;
    }
};



export const updateTasks = async (tasks: Task[]): Promise<DailyData | null> => {
    return await updateDailyData({
        tasks: tasks, 
    });
};

export const updateReflectionAnswers = async (answers: string[]): Promise<DailyData | null> => {
    return await updateDailyData({ reflectionAnswers: answers });
};

export const updateDailyScore = async (scores: DailyScores): Promise<DailyData | null> => {
    return await updateDailyData({ scores });
};

export const updateFinalScore = async (finalScore: number): Promise<DailyData | null> => {
    return await updateDailyData({
        finalScore,
        isDayCompleted: true
    });
};


export const isDayCompleted = async (): Promise<boolean> => {
    const dailyData = await getDailyData();
    return dailyData?.isDayCompleted || false;
};

export const hasTodayTasks = async (): Promise<boolean> => {
    const dailyData = await getDailyData();
    return !!dailyData?.tasks && dailyData.tasks.length > 0;
};



export const getAllDailyLogs = async (): Promise<{ date: string; data: DailyData }[]> => {
    const logs: { date: string; data: DailyData }[] = [];
    const keyPrefix = 'stoiric_';
    try {
        const keys = await AsyncStorage.getAllKeys();
        if (!keys) return [];

        const stoiricKeys = keys.filter(key => key?.startsWith(keyPrefix));
        if (stoiricKeys.length === 0) return [];

        const dataPairs = await AsyncStorage.multiGet(stoiricKeys);

        for (const [key, value] of dataPairs) {
            if (key && value) {
                try {
                    const data = JSON.parse(value) as DailyData;
                    const date = key.replace(keyPrefix, '');
                    logs.push({ date, data });
                } catch (parseError) {
                    console.error(`Failed to parse data for key ${key}:`, parseError);
                }
            }
        }

        return logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    } catch (e) {
        console.error("Failed to get all logs", e);
        return [];
    }
};

export const getCompletedDays = async (): Promise<{ [date: string]: number }> => {
    const logs: { [date: string]: number } = {};
    const keyPrefix = 'stoiric_';
    try {
        const keys = await AsyncStorage.getAllKeys();
        if (!keys) return {};

        const stoiricKeys = keys.filter(key => key?.startsWith(keyPrefix));
        if (stoiricKeys.length === 0) return {};

        const dataPairs = await AsyncStorage.multiGet(stoiricKeys);

        for (const [key, value] of dataPairs) {
            if (key && value) {
                try {
                    const data = JSON.parse(value) as DailyData;
                    if (data.isDayCompleted) {
                        const date = key.replace(keyPrefix, '');
                        logs[date] = data.finalScore ?? 0;
                    }
                } catch (parseError) {
                    console.error(`Failed to parse completed day data for key ${key}:`, parseError);
                }
            }
        }
        return logs;
    } catch (e) {
        console.error("Failed to get completed days", e);
        return {};
    }
};


export const calculateStreak = async (): Promise<number> => {
    try {
        const completedDays = await getCompletedDays();
        const dates = Object.keys(completedDays).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

        if (dates.length === 0) return 0;

        const today = new Date();
        const todayStr = formatDate(today);

        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        const yesterdayStr = formatDate(yesterday);

        if (!completedDays[todayStr] && !completedDays[yesterdayStr]) {
            if (dates[0] !== yesterdayStr) {
                console.log("Streak broken: Neither today nor yesterday completed. Last completed:", dates[0]);
                return 0;
            }
        }


        let currentStreak = 0;
        let checkDate = new Date(dates[0]);

        while (true) {
            const dateStr = formatDate(checkDate);
            if (completedDays[dateStr] !== undefined) { 
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                
                break; 
            }
        }

        console.log("Calculated streak:", currentStreak);
        return currentStreak;
    } catch (e) {
        console.error("Failed to calculate streak", e);
        return 0;
    }
};

export const clearAllData = async (): Promise<void> => {
    try {
        await AsyncStorage.clear();
        console.log('AsyncStorage cleared successfully.');
    } catch (e) {
        console.error('Failed to clear AsyncStorage.', e);
    }
};

export const getSpecificDateData = async (dateStr: string): Promise<DailyData | null> => {
    const key = `stoiric_${dateStr}`;
    try {
        const jsonValue = await AsyncStorage.getItem(key);
        if (jsonValue != null) {
            return JSON.parse(jsonValue) as DailyData;
        } else {
            console.log(`No data found for specific date key: ${key}`);
            return null;
        }
    } catch (e) {
        console.error(`Failed to fetch data for key ${key}`, e);
        return null;
    }
};
