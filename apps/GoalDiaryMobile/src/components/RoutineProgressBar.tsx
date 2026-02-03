import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function RoutineProgressBar() {
    // TODO: 실제 데이터 연동
    const completedRoutines = 2;
    const totalRoutines = 5;
    const completionRate = totalRoutines > 0 ? (completedRoutines / totalRoutines) * 100 : 0;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <MaterialIcons name="track-changes" size={20} color="#9333ea" />
                    <Text style={styles.headerText}>오늘의 루틴</Text>
                </View>
                <View style={styles.headerRight}>
                    <MaterialIcons name="check-circle" size={20} color="#10b981" />
                    <Text style={styles.countText}>
                        {completedRoutines}/{totalRoutines}
                    </Text>
                </View>
            </View>

            <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${completionRate}%` }]} />
            </View>

            <View style={styles.footer}>
                <Text style={styles.percentageText}>
                    {completionRate === 100 ? '🎉 모든 루틴 완료!' : `${Math.round(completionRate)}% 완료`}
                </Text>
                {completionRate > 0 && completionRate < 100 && (
                    <Text style={styles.remainingText}>{totalRoutines - completedRoutines}개 남음</Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        padding: 16,
        margin: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginLeft: 8,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    countText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginLeft: 4,
    },
    progressBar: {
        width: '100%',
        height: 8,
        backgroundColor: '#e5e7eb',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#9333ea',
        borderRadius: 4,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    percentageText: {
        fontSize: 14,
        color: '#6b7280',
    },
    remainingText: {
        fontSize: 14,
        color: '#9333ea',
        fontWeight: '600',
    },
});
