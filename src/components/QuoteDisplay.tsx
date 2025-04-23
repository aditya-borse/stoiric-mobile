
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Quote {
    text: string;
    author: string;
}

const QUOTE_STORAGE_KEY = 'dailyQuote';
const QUOTE_DATE_KEY = 'quoteDate';

const QuoteDisplay: React.FC = () => {
    const [quote, setQuote] = useState<Quote | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchQuote = async () => {
            setIsLoading(true);
            setError(null);
            const today = new Date().toDateString(); 

            try {
                
                const savedQuoteJson = await AsyncStorage.getItem(QUOTE_STORAGE_KEY);
                const savedDate = await AsyncStorage.getItem(QUOTE_DATE_KEY);

                if (savedQuoteJson && savedDate === today) {
                    console.log("Using cached quote.");
                    setQuote(JSON.parse(savedQuoteJson));
                } else {
                    console.log("Fetching new quote...");
                    
                    const response = await fetch('https://stoic-quotes.com/api/quote');
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data: Quote = await response.json();

                    
                    if (data && data.text && data.author) {
                        setQuote(data);
                        
                        await AsyncStorage.setItem(QUOTE_STORAGE_KEY, JSON.stringify(data));
                        await AsyncStorage.setItem(QUOTE_DATE_KEY, today);
                    } else {
                        throw new Error("Invalid quote data received from API.");
                    }
                }
            } catch (err: any) {
                console.error('Error fetching or reading quote:', err);
                setError("Couldn't load quote. Try again later.");
                
                setQuote({
                    text: "You have power over your mind - not outside events. Realize this, and you will find strength.",
                    author: "Marcus Aurelius"
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuote();
    }, []); 

    return (
        <View style={styles.container}>
            {isLoading ? (
                <ActivityIndicator color="#a1a1aa" />
            ) : error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : quote ? (
                <>
                    <Text style={styles.quoteText}>"{quote.text}"</Text>
                    <Text style={styles.authorText}>- {quote.author}</Text>
                </>
            ) : null }
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 15,
        paddingHorizontal: 25,
        marginVertical: 15,
        alignItems: 'center',
        width: '100%',
        minHeight: 100, 
        justifyContent: 'center',
    },
    quoteText: {
        fontSize: 16, 
        color: '#e4e4e7', 
        fontStyle: 'italic',
        textAlign: 'center',
        marginBottom: 10,
        lineHeight: 24, 
    },
    authorText: {
        fontSize: 14,
        color: '#a1a1aa', 
        textAlign: 'center',
    },
    errorText: {
        fontSize: 14,
        color: '#f87171', 
        textAlign: 'center',
    },
});

export default QuoteDisplay;