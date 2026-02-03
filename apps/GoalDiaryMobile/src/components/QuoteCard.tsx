import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface QuoteCardProps {
    quote: {
        id: number;
        content: string;
        author?: string;
        link?: string;
    } | null;
    index: number;
}

export default function QuoteCard({ quote, index }: QuoteCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!quote) {
        return (
            <TouchableOpacity style={styles.emptyCard}>
                <MaterialIcons name="add" size={32} color="#9ca3af" />
                <Text style={styles.emptyText}>명언 추가하기</Text>
            </TouchableOpacity>
        );
    }

    const shouldShowExpand = quote.content.length > 80;
    const displayContent = isExpanded ? quote.content : quote.content.substring(0, 80);

    return (
        <View style={styles.card}>
            <Text style={styles.content} numberOfLines={isExpanded ? undefined : 5}>
                &ldquo;{displayContent}
                {!isExpanded && shouldShowExpand && '...'}&rdquo;
            </Text>
            {shouldShowExpand && (
                <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
                    <Text style={styles.expandButton}>{isExpanded ? '접기' : '더 보기'}</Text>
                </TouchableOpacity>
            )}
            {quote.author && <Text style={styles.author}>- {quote.author}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        minHeight: 160,
    },
    emptyCard: {
        backgroundColor: 'white',
        padding: 40,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#d1d5db',
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 160,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 14,
        color: '#9ca3af',
        fontWeight: '500',
    },
    content: {
        fontSize: 16,
        color: '#111827',
        lineHeight: 24,
        marginBottom: 12,
    },
    expandButton: {
        fontSize: 12,
        color: '#2563eb',
        marginBottom: 12,
    },
    author: {
        fontSize: 14,
        color: '#6b7280',
        fontStyle: 'italic',
        marginTop: 8,
    },
});
