import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    SafeAreaView,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Keyboard,
    ActivityIndicator,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { getDailyData, updateTasks, isDayCompleted, Task } from '../utils/dailyStorage';
import { RootStackParamList } from './HomeScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'NewDay'>;

interface GoalItemProps {
    goal: Task;
    onToggleComplete: (id: number) => void;
    onToggleImportant: (id: number) => void;
    onStartEdit: (goal: Task) => void;
    isEditingThis: boolean;
    dayCompleted: boolean;
}

const GoalItem: React.FC<GoalItemProps> = ({
    goal,
    onToggleComplete,
    onToggleImportant,
    onStartEdit,
    dayCompleted,
}) => {
    return (
        <View style={[
            styles.goalItemContainer,
            goal.completed ? styles.goalItemCompleted : styles.goalItemActive
        ]}>
            <TouchableOpacity
                onPress={() => onToggleComplete(goal.id)}
                disabled={dayCompleted}
                style={styles.checkboxTouchable}
            >
                <MaterialCommunityIcons
                    name={goal.completed ? "checkbox-marked-circle-outline" : "checkbox-blank-circle-outline"}
                    size={24}
                    color={goal.completed ? '#666' : goal.important ? '#f59e0b' : '#aaa'}
                />
            </TouchableOpacity>

            <Text style={[
                styles.goalText,
                goal.completed && styles.goalTextCompleted,
                goal.important && !goal.completed && styles.goalTextImportant
            ]}>
                {goal.text}
            </Text>

            <View style={styles.goalActions}>
                {!goal.completed && (
                    <TouchableOpacity
                        onPress={() => onToggleImportant(goal.id)}
                        disabled={dayCompleted}
                        style={styles.actionIcon}
                    >
                        <MaterialCommunityIcons
                            name={goal.important ? "star" : "star-outline"}
                            size={20}
                            color={goal.important ? '#f59e0b' : '#aaa'}
                        />
                    </TouchableOpacity>
                )}

                {!goal.completed && !dayCompleted && (
                    <TouchableOpacity
                        onPress={() => onStartEdit(goal)}
                        style={styles.actionIcon}
                    >
                        <MaterialCommunityIcons name="pencil-outline" size={20} color="#aaa" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};


const NewDayScreen: React.FC<Props> = ({ navigation }) => {
    const [goals, setGoals] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showNewGoal, setShowNewGoal] = useState(false);
    const [newGoalText, setNewGoalText] = useState("");
    const [isNewGoalImportant, setIsNewGoalImportant] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Task | null>(null);
    const [dayCompletedStatus, setDayCompletedStatus] = useState(false);

    const newGoalInputRef = useRef<TextInput>(null);
    const editGoalInputRef = useRef<TextInput>(null);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const data = await getDailyData();
            const isComplete = await isDayCompleted();
            if (data?.tasks) {
                setGoals(data.tasks);
            } else {
                setGoals([]);
            }
            setDayCompletedStatus(isComplete);
            setIsLoading(false);
            if (!data?.tasks || data.tasks.length === 0) {
                setShowNewGoal(true);
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        if (showNewGoal && newGoalInputRef.current) {
            setTimeout(() => newGoalInputRef.current?.focus(), 100);
        }
        if (editingGoal && editGoalInputRef.current) {
            setTimeout(() => editGoalInputRef.current?.focus(), 100);
        }
    }, [showNewGoal, editingGoal]);

    const handleUpdateTasks = async (updatedGoals: Task[]) => {

        const sortedGoals = [...updatedGoals].sort((a, b) => {

            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }

            if (a.important !== b.important) {
                return a.important ? -1 : 1;
            }

            return 0;
        });

        setGoals(sortedGoals);
        await updateTasks(sortedGoals);
    };

    const handleAddGoal = () => {
        const text = newGoalText.trim();
        if (text) {
            const newGoal: Task = {
                id: Date.now(),
                text: text,
                important: isNewGoalImportant,
                completed: false
            };
            const updatedGoals = [...goals, newGoal];
            handleUpdateTasks(updatedGoals);
            setNewGoalText("");
            setIsNewGoalImportant(false);
            setShowNewGoal(false);
            Keyboard.dismiss();
        }
    };

    const handleToggleComplete = (id: number) => {
        const updatedGoals = goals.map(goal =>
            goal.id === id ? { ...goal, completed: !goal.completed } : goal
        );
        handleUpdateTasks(updatedGoals);
    };

    const handleToggleImportant = (id: number) => {
        const updatedGoals = goals.map(goal =>
            goal.id === id ? { ...goal, important: !goal.important } : goal
        );
        handleUpdateTasks(updatedGoals);
    };

    const handleStartEdit = (goal: Task) => {
        setEditingGoal(goal);
    };

    const handleSaveEdit = (newText: string) => {
        if (!editingGoal) return;
        const text = newText.trim();
        if (text) {
            const updatedGoals = goals.map(goal =>
                goal.id === editingGoal.id ? { ...goal, text: text } : goal
            );
            handleUpdateTasks(updatedGoals);
        }
        setEditingGoal(null);
        Keyboard.dismiss();
    };

    const handleCancelEdit = () => {
        setEditingGoal(null);
        Keyboard.dismiss();
    }

    const renderGoalItem = ({ item }: { item: Task }) => {
        if (editingGoal && editingGoal.id === item.id) {
            return null;
        }
        return (
            <GoalItem
                goal={item}
                onToggleComplete={handleToggleComplete}
                onToggleImportant={handleToggleImportant}
                onStartEdit={handleStartEdit}
                isEditingThis={false}
                dayCompleted={dayCompletedStatus}
            />
        );
    };

    const navigateToReflect = () => {
        navigation.navigate('Reflect');
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
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Today's Goals</Text>
                    {goals.length > 0 && !editingGoal && !showNewGoal && (
                        <TouchableOpacity
                            style={[styles.headerButton, dayCompletedStatus && styles.footerButtonDisabled]}
                            onPress={navigateToReflect}
                            disabled={dayCompletedStatus}
                        >
                            <Text style={styles.headerButtonText}>
                                {dayCompletedStatus ? "Day Completed" : "Call It A Day"}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {showNewGoal && !editingGoal && (
                    <View style={styles.newGoalContainer}>
                        <TextInput
                            ref={newGoalInputRef}
                            style={styles.input}
                            placeholder="What's your goal for today?"
                            placeholderTextColor="#666"
                            value={newGoalText}
                            onChangeText={setNewGoalText}
                            onSubmitEditing={handleAddGoal}
                            returnKeyType="done"
                            autoFocus={true}
                        />
                        <View style={styles.newGoalActions}>
                            <TouchableOpacity
                                onPress={() => setIsNewGoalImportant(!isNewGoalImportant)}
                                style={styles.newGoalActionButton}
                            >
                                <MaterialCommunityIcons
                                    name={isNewGoalImportant ? "star" : "star-outline"}
                                    size={20}
                                    color={isNewGoalImportant ? '#f59e0b' : '#aaa'}
                                />
                                <Text style={styles.newGoalActionText}>
                                    {isNewGoalImportant ? 'Important' : 'Mark Important'}
                                </Text>
                            </TouchableOpacity>
                            <View style={styles.newGoalButtons}>
                                <TouchableOpacity
                                    onPress={() => { setShowNewGoal(false); setNewGoalText(""); setIsNewGoalImportant(false); }}
                                    style={[styles.newGoalButton, styles.cancelButton]}
                                >
                                    <Text style={styles.newGoalButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleAddGoal}
                                    style={[styles.newGoalButton, styles.addConfirmButton]}
                                    disabled={!newGoalText.trim()}
                                >
                                    <Text style={styles.newGoalButtonText}>Add</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}

                {editingGoal && (
                    <View style={styles.editGoalContainer}>
                        <TextInput
                            ref={editGoalInputRef}
                            style={styles.input}
                            placeholder="Edit your goal"
                            placeholderTextColor="#666"
                            defaultValue={editingGoal.text}
                            onChangeText={(text) => {

                            }}
                            onSubmitEditing={(event) => handleSaveEdit(event.nativeEvent.text)}
                            returnKeyType="done"
                            autoFocus={true}
                            onBlur={(event) => handleSaveEdit(event.nativeEvent.text)}
                        />
                        <View style={styles.editGoalActions}>
                            <TouchableOpacity
                                onPress={handleCancelEdit}
                                style={[styles.newGoalButton, styles.cancelButton]}
                            >
                                <Text style={styles.newGoalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}


                <FlatList
                    data={goals.sort((a, b) => {

                        if (a.completed !== b.completed) {
                            return a.completed ? 1 : -1;
                        }

                        if (a.important !== b.important) {
                            return a.important ? -1 : 1;
                        }

                        return 0;
                    })}
                    renderItem={renderGoalItem}
                    keyExtractor={(item) => item.id.toString()}
                    style={styles.list}
                    ListEmptyComponent={!showNewGoal && !editingGoal ? (
                        <View style={styles.emptyListContainer}>
                            <Text style={styles.emptyListText}>No goals added yet. Tap 'Add Goal'!</Text>
                        </View>
                    ) : null}
                    ListFooterComponent={<View style={{ height: 100 }} />}
                />

                {!showNewGoal && !editingGoal && !dayCompletedStatus && (
                    <TouchableOpacity
                        onPress={() => setShowNewGoal(true)}
                        style={styles.footerButton}
                    >
                        
                        
                        <Text style={styles.footerButtonText}>Add Goal</Text>
                    </TouchableOpacity>
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
    container: {
        flex: 1,
        padding: 15,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#18181b',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#f4f4f5',
    },
    headerButton: {
        backgroundColor: '#27272a',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 15,
    },
    headerButtonText: {
        color: '#f4f4f5',
        fontSize: 16,
        fontWeight: '500',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#27272a',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 15,
    },
    newGoalContainer: {
        backgroundColor: '#27272a',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
    },
    editGoalContainer: {
        backgroundColor: '#27272a',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
    },
    input: {
        color: '#f4f4f5',
        fontSize: 15,
        marginBottom: 10,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#3f3f46',
    },
    newGoalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 5,
    },
    editGoalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 5,
    },
    newGoalActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5,
    },
    newGoalActionText: {
        color: '#a1a1aa',
        fontSize: 13,
        marginLeft: 5,
    },
    newGoalButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    newGoalButton: {
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 8,
        minWidth: 60,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#3f3f46',
    },
    addConfirmButton: {
        backgroundColor: '#52525b',
    },
    newGoalButtonText: {
        color: '#f4f4f5',
        fontSize: 13,
        fontWeight: '500',
    },


    list: {
        flex: 1,
    },
    emptyListContainer: {
        marginTop: 50,
        alignItems: 'center',
    },
    emptyListText: {
        color: '#71717a',
        fontSize: 14,
    },
    goalItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
    },
    goalItemActive: {
        backgroundColor: 'rgba(39, 39, 42, 0.7)',
    },
    goalItemCompleted: {
        backgroundColor: 'rgba(39, 39, 42, 0.2)',
    },
    checkboxTouchable: {
        marginRight: 12,
        padding: 5,
    },
    goalText: {
        flex: 1,
        fontSize: 15,
        color: '#d4d4d8',
    },
    goalTextCompleted: {
        textDecorationLine: 'line-through',
        color: '#71717a',
    },
    goalTextImportant: {
        fontWeight: '600',
        color: '#f4f4f5',
    },
    goalActions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
    },
    actionIcon: {
        padding: 6,
        marginLeft: 5,
    },


    footerButton: {
        backgroundColor: '#3f3f46',
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 15,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    footerButtonDisabled: {
        backgroundColor: '#27272a',
        opacity: 0.6,
    },
    footerButtonText: {
        fontSize: 16,
        color: '#f4f4f5',
        fontWeight: '600',
    },
});

export default NewDayScreen;