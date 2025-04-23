import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Calendar, CalendarProps } from 'react-native-calendars';
import { MarkingProps } from 'react-native-calendars/src/calendar/day/marking';

interface CalendarViewProps {
    completedDaysData: { [date: string]: number };
    onDayPress?: (date: string) => void;
}

const getMarkingStyle = (score: number): MarkingProps['customStyles'] => {
    let backgroundColor = '#3f3f46';
    let textColor = '#a1a1aa';
    if (score >= 80) { backgroundColor = '#22c55e'; textColor = '#ffffff'; }
    else if (score >= 50) { backgroundColor = '#15803d'; textColor = '#f0fdf4'; }
    else if (score > 0) { backgroundColor = '#166534'; textColor = '#dcfce7'; }
    return {
        container: { backgroundColor, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
        text: { color: textColor, fontWeight: 'bold' },
    };
};

const CalendarView: React.FC<CalendarViewProps> = ({ completedDaysData, onDayPress }) => {
    const markedDates = useMemo(() => {
        const marks: { [key: string]: MarkingProps } = {};
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        for (const dateStr in completedDaysData) {
            marks[dateStr] = { customStyles: getMarkingStyle(completedDaysData[dateStr]) };
        }

        if (!marks[todayStr]) {
            marks[todayStr] = {
                customStyles: {
                    container: { backgroundColor: 'transparent', borderRadius: 6, borderWidth: 1.5, borderColor: '#f59e0b' },
                    text: { color: '#f59e0b', fontWeight: 'bold' },
                }
            };
        }
        return marks;
    }, [completedDaysData]);

    const handleLibraryDayPress: CalendarProps['onDayPress'] = (day) => {
        
        if (onDayPress && completedDaysData[day.dateString] !== undefined) {
            onDayPress(day.dateString);
        }
    };

    return (
        <View style={styles.calendarContainer}>
            <Calendar
                current={new Date().toISOString().split('T')[0]}
                onMonthChange={(month: { dateString: any; }) => { console.log('Month changed to', month.dateString); }}
                onDayPress={handleLibraryDayPress}
                markingType={'custom'}
                markedDates={markedDates}
                theme={{
                    backgroundColor: '#27272a', calendarBackground: '#27272a', textSectionTitleColor: '#a1a1aa',
                    selectedDayBackgroundColor: '#f59e0b', selectedDayTextColor: '#ffffff', todayTextColor: '#f59e0b',
                    dayTextColor: '#d4d4d8', textDisabledColor: '#52525b', dotColor: '#f59e0b',
                    selectedDotColor: '#ffffff', arrowColor: '#f59e0b', disabledArrowColor: '#52525b',
                    monthTextColor: '#f4f4f5', indicatorColor: '#f59e0b', textDayFontWeight: '400',
                    textMonthFontWeight: 'bold', textDayHeaderFontWeight: '500', textDayFontSize: 14,
                    textMonthFontSize: 16, textDayHeaderFontSize: 12,
                    'stylesheet.calendar.header': { week: { marginTop: 5, flexDirection: 'row', justifyContent: 'space-around', borderBottomWidth: 1, borderColor: '#3f3f46', paddingBottom: 8, marginBottom: 5 } },
                    'stylesheet.day.basic': { base: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }, text: { color: '#d4d4d8' } },
                    'stylesheet.day.custom': { container: { alignItems: 'center', justifyContent: 'center', width: 30, height: 30 }, text: { fontSize: 14 } },
                }}
                style={styles.calendarStyle}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    calendarContainer: { backgroundColor: '#27272a', borderRadius: 10, marginVertical: 30, width: '100%', maxWidth: 350, alignSelf: 'center', overflow: 'hidden' },
    calendarStyle: {}
});

export default CalendarView;