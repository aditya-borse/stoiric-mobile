import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    SafeAreaView,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Keyboard,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { getDailyData, updateReflectionAnswers, hasTodayTasks } from '../utils/dailyStorage';
import type { RootStackParamList } from './HomeScreen';


interface Message {
    id: string;
    type: 'bot' | 'user';
    content: string;
}


const questions = [
    "Did you achieve your priority of the day?",
    "What worked well?",
    "What went wrong?",
    "What did you learn today?",
    "Great job reflecting! Tap below to rate your day.",
];

type Props = NativeStackScreenProps<RootStackParamList, 'Reflect'>;

const DailyReflectionScreen: React.FC<Props> = ({ navigation }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [inputValue, setInputValue] = useState("");
    const [reflectionAnswers, setReflectionAnswers] = useState<string[]>([]);
    const [isBotTyping, setIsBotTyping] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isFinished, setIsFinished] = useState(false);

    const flatListRef = useRef<FlatList>(null);
    const inputRef = useRef<TextInput>(null);


    const addMessage = useCallback((type: 'bot' | 'user', content: string) => {
        setMessages(prev => [...prev, { id: Date.now().toString() + Math.random(), type, content }]);
    }, []);


    useEffect(() => {
        const initializeReflection = async () => {

            const dayStarted = await hasTodayTasks();
            if (!dayStarted) {
                console.log("Redirecting: Day not started.");
                navigation.replace('Home');
                return;
            }

            setIsLoading(true);
            const data = await getDailyData();

            if (data?.reflectionAnswers && data.reflectionAnswers.length > 0) {
                const answers = data.reflectionAnswers;
                setReflectionAnswers(answers);
                const reconstructedMessages: Message[] = [];
                answers.forEach((answer, index) => {
                    if (questions[index]) {
                        reconstructedMessages.push({ id: `q${index}`, type: 'bot', content: questions[index] });
                    }
                    reconstructedMessages.push({ id: `a${index}`, type: 'user', content: answer });
                });


                if (answers.length >= questions.length - 1) {
                    reconstructedMessages.push({ id: 'final', type: 'bot', content: questions[questions.length - 1] });
                    setIsFinished(true);
                    setCurrentQuestionIndex(questions.length - 1);
                } else {

                    if (questions[answers.length]) {
                        reconstructedMessages.push({ id: `q${answers.length}`, type: 'bot', content: questions[answers.length] });
                    }
                    setCurrentQuestionIndex(answers.length);
                }
                setMessages(reconstructedMessages);

            } else {

                setIsBotTyping(true);
                setTimeout(() => {
                    addMessage('bot', questions[0]);
                    setIsBotTyping(false);

                    setTimeout(() => inputRef.current?.focus(), 100);
                }, 800);
            }
            setIsLoading(false);
        };

        initializeReflection();
    }, [addMessage, navigation]);


    useEffect(() => {
        if (messages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: true });
        }
    }, [messages]);


    const handleSend = async () => {
        const text = inputValue.trim();
        if (!text || isBotTyping || isFinished) return;


        addMessage('user', text);


        const newAnswers = [...reflectionAnswers, text];
        setReflectionAnswers(newAnswers);
        await updateReflectionAnswers(newAnswers);


        setInputValue("");


        const nextQuestionIndex = currentQuestionIndex + 1;

        if (nextQuestionIndex < questions.length) {
            setIsBotTyping(true);
            setTimeout(() => {
                addMessage('bot', questions[nextQuestionIndex]);
                setCurrentQuestionIndex(nextQuestionIndex);
                setIsBotTyping(false);
                if (nextQuestionIndex === questions.length - 1) {

                    setIsFinished(true);
                    Keyboard.dismiss();
                } else {

                    setTimeout(() => inputRef.current?.focus(), 100);
                }
            }, 1000);
        }

        Keyboard.dismiss();
    };

    const navigateToScore = () => {
        navigation.navigate('Score');
    };


    const renderMessageItem = ({ item }: { item: Message }) => (
        <View style={[styles.messageRow, item.type === 'user' ? styles.userMessageRow : styles.botMessageRow]}>
            {item.type === 'bot' && (
                <View style={styles.avatar}>
                    <MaterialCommunityIcons name="robot-outline" size={20} color="#a1a1aa" />
                </View>
            )}
            <View style={[styles.messageBubble, item.type === 'user' ? styles.userMessageBubble : styles.botMessageBubble]}>
                <Text style={styles.messageText}>{item.content}</Text>
            </View>
            {item.type === 'user' && (
                <View style={styles.avatar}>
                    <MaterialCommunityIcons name="account-circle-outline" size={20} color="#a1a1aa" />
                </View>
            )}
        </View>
    );

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
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "padding"} 
                
                style={styles.container}
                keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0} 
                
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessageItem}
                    keyExtractor={(item) => item.id}
                    style={styles.messageList}
                    contentContainerStyle={{ paddingVertical: 10 }}

                    keyboardShouldPersistTaps="handled"
                />

                {isBotTyping && (
                    <View style={styles.typingIndicatorContainer}>
                        <MaterialCommunityIcons name="robot-outline" size={20} color="#a1a1aa" />
                        <Text style={styles.typingIndicatorText}>Stoiric is typing...</Text>
                    </View>
                )}

                {isFinished ? (
                    <TouchableOpacity
                        style={styles.footerButton}
                        onPress={navigateToScore}
                    >
                        <Text style={styles.footerButtonText}>Rate Your Day</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.inputContainer}>
                        <TextInput
                            ref={inputRef}
                            style={styles.input}
                            placeholder="Chat with Stoiric..."
                            placeholderTextColor="#666"
                            value={inputValue}
                            onChangeText={setInputValue}
                            onSubmitEditing={handleSend}
                            returnKeyType="send"
                            editable={!isBotTyping}
                            multiline
                        />
                        <TouchableOpacity
                            onPress={handleSend}
                            disabled={!inputValue.trim() || isBotTyping}
                            style={[styles.sendButton, (!inputValue.trim() || isBotTyping) && styles.sendButtonDisabled]}
                        >
                            <MaterialCommunityIcons
                                name={isBotTyping ? "dots-horizontal" : "send"}
                                size={24}
                                color="#f4f4f5"
                            />
                        </TouchableOpacity>
                    </View>
                )}
            </KeyboardAvoidingView>
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

    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#18181b',
    },
    messageList: {
        flex: 1,
        paddingHorizontal: 10,
    },
    messageRow: {
        flexDirection: 'row',
        marginVertical: 8,
        alignItems: 'flex-end',
    },
    botMessageRow: {
        justifyContent: 'flex-start',
    },
    userMessageRow: {
        justifyContent: 'flex-end',
    },
    avatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#27272a',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 5,
        marginBottom: 2,
    },
    messageBubble: {
        maxWidth: '75%',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 18,
    },
    botMessageBubble: {
        backgroundColor: '#27272a',
        borderBottomLeftRadius: 4,
    },
    userMessageBubble: {
        backgroundColor: '#3f3f46',
        borderBottomRightRadius: 4,
    },
    messageText: {
        color: '#f4f4f5',
        fontSize: 15,
    },
    typingIndicatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    typingIndicatorText: {
        color: '#a1a1aa',
        marginLeft: 8,
        fontSize: 14,
        fontStyle: 'italic',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: '#27272a',
        backgroundColor: '#18181b',
    },
    input: {
        flex: 1,
        minHeight: 40,
        maxHeight: 100,
        backgroundColor: '#27272a',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        fontSize: 15,
        color: '#f4f4f5',
        marginRight: 10,
    },
    sendButton: {
        backgroundColor: '#f59e0b',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#52525b',
    },
    footerButton: {
        backgroundColor: '#3f3f46',
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: 'center',
        margin: 10,
    },
    footerButtonText: {
        fontSize: 16,
        color: '#f4f4f5',
        fontWeight: '600',
    },
});

export default DailyReflectionScreen;