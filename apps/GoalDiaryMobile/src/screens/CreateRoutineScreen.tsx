import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CreateRoutineScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>루틴 생성 화면</Text>
            <Text style={styles.note}>구현 예정</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
    },
    text: {
        fontSize: 18,
        color: '#111827',
    },
    note: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 8,
    },
});
