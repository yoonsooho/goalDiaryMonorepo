export type RootStackParamList = {
    Login: undefined;
    MainTabs: undefined;
    ScheduleDetail: { id: number };
    CreateSchedule: undefined;
    CreateRoutine: undefined;
    DiaryDetail: { id: number };
};

export type TabParamList = {
    Schedules: undefined;
    Routines: undefined;
    Quotes: undefined;
    Diary: undefined;
    Settings: undefined;
};

declare global {
    namespace ReactNavigation {
        interface RootParamList extends RootStackParamList {}
    }
}
