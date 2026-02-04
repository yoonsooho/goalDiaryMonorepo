import React, { useCallback, useState } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useGetQuotes } from '../hooks/api/useQuotes';
import QuoteCard from '../components/QuoteCard';

export default function QuotesScreen() {
    const { data: quotes = [], isLoading, isRefetching, refetch } = useGetQuotes();
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await refetch();
        } finally {
            setRefreshing(false);
        }
    }, [refetch]);
    const slots = Array(3)
        .fill(null)
        .map((_, i) => quotes[i] || null);

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={
                <RefreshControl refreshing={refreshing || isRefetching} onRefresh={handleRefresh} />
            }
        >
            {slots.map((quote, index) => (
                <QuoteCard key={quote?.id || `empty-${index}`} quote={quote} index={index} />
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
    },
    content: {
        padding: 16,
        gap: 16,
    },
});
