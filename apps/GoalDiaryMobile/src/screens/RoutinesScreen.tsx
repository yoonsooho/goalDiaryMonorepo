import React, { useCallback, useState } from "react";
import { View, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import { useGetRoutines } from "../hooks/api/useRoutines";
import RoutineCard from "../components/RoutineCard";
import RoutineProgressBar from "../components/RoutineProgressBar";

export default function RoutinesScreen() {
    const { data: routines, isLoading, isRefetching, refetch } = useGetRoutines();
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await refetch();
        } finally {
            setRefreshing(false);
        }
    }, [refetch]);

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <RoutineProgressBar />
            <FlatList
                data={routines || []}
                refreshControl={<RefreshControl refreshing={refreshing || isRefetching} onRefresh={handleRefresh} />}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <RoutineCard routine={item} />}
                contentContainerStyle={styles.listContent}
                numColumns={2}
                columnWrapperStyle={styles.row}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
    },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f9fafb",
    },
    listContent: {
        padding: 16,
    },
    row: {
        justifyContent: "space-between",
    },
});
