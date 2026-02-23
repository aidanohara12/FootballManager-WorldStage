import type { Signal } from "@preact/signals-react";
import type { currentYear, Manager, Match, Week } from "../../Models/WorldStage";
import styles from "./WeekSchedule.module.css";
import getCurrentWeek from "./GetCurrentWeek";

interface WeekScheduleProps {
    matches: Signal<Match[]>;
    currentYear: Signal<currentYear>;
    manager: Signal<Manager>;
}

export function WeekSchedule({ matches, currentYear, manager }: WeekScheduleProps) {
    const currentWeekDays: Week = getCurrentWeek(currentYear.value.currentMonth, currentYear.value.currentDay, currentYear.value.currentDayOfWeek);
    const isToday = (day: string) => day === currentYear.value.currentDayOfWeek;

    return (
        <div className={styles.weekScheduleContainer}>
            <div className={styles.monthLabel}>{currentYear.value.currentMonth} {currentYear.value.year}</div>
            <div className={styles.weekGrid}>
                {Object.entries(currentWeekDays.weekDays).map(([day, dayNumber]) => (
                    <div key={day} className={`${styles.weekDay} ${isToday(day) ? styles.today : ''}`}>
                        <div className={styles.dayName}>{day.slice(0, 3)}</div>
                        <div className={styles.dayNumber}>{dayNumber}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default WeekSchedule;