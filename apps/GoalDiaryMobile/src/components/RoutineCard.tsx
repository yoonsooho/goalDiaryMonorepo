import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface RoutineCardProps {
    routine: {
        id: number;
        title: string;
        description?: string;
        isActive: boolean;
        streak?: number;
    };
}

export default function RoutineCard({ routine }: RoutineCardProps) {
    return (
        <TouchableOpacity style={[styles.card, routine.isActive ? styles.activeCard : styles.inactiveCard]}>
            <View style={styles.header}>
                <Text style={styles.title} numberOfLines={2}>
                    {routine.title}
                </Text>
                {routine.isActive && <MaterialIcons name="power" size={20} color="#10b981" />}
            </View>
            {routine.description && (
                <Text style={styles.description} numberOfLines={2}>
                    {routine.description}
                </Text>
            )}
            {routine.streak && routine.streak > 0 && (
                <View style={styles.streakContainer}>
                    <MaterialIcons name="local-fire-department" size={16} color="#f97316" />
                    <Text style={styles.streak}>{routine.streak}일</Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        margin: 8,
        minHeight: 120,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    activeCard: {
        borderLeftWidth: 4,
        borderLeftColor: '#3b82f6',
    },
    inactiveCard: {
        opacity: 0.6,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        flex: 1,
        marginRight: 8,
    },
    description: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 8,
    },
    streakContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    streak: {
        fontSize: 12,
        color: '#f97316',
        marginLeft: 4,
        fontWeight: '600',
    },
});
