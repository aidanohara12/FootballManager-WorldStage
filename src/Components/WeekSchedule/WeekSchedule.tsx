import type { Signal } from "@preact/signals-react";
import type { currentYear, Manager, Match, Week } from "../../Models/WorldStage";
import styles from "./WeekSchedule.module.css";
import getCurrentWeek from "./GetCurrentWeek";

interface WeekScheduleProps {
    matches: Signal<Match[]>;
    currentYear: Signal<currentYear>;
    manager: Signal<Manager>;
    trainingDayDate?: string | null;
    seasonSummaryDate?: string | null;
}

export function WeekSchedule({ matches, currentYear, trainingDayDate, seasonSummaryDate }: WeekScheduleProps) {
    const currentWeekDays: Week = getCurrentWeek(currentYear.value.currentMonth, currentYear.value.currentDay, currentYear.value.currentDayOfWeek, currentYear.value.year);
    const isToday = (day: string) => day === currentYear.value.currentDayOfWeek;

    // Build a set of dates that have manager matches for quick lookup
    const matchDateSet = new Set(matches.value.map(m => m.date));

    // Build a map of date -> match for tooltip info
    const matchByDate = new Map<string, Match>();
    matches.value.forEach(m => { matchByDate.set(m.date, m); });

    return (
        <div className={styles.weekScheduleContainer}>
            <div className={styles.monthLabel}>{currentYear.value.currentMonth} {currentYear.value.year}</div>
            <div className={styles.weekGrid}>
                {Object.entries(currentWeekDays.weekDays).map(([day, { dayNumber, dateStr }]) => {
                    const hasMatch = matchDateSet.has(dateStr);
                    const match = matchByDate.get(dateStr);
                    const isTraining = trainingDayDate === dateStr;
                    const isSummary = seasonSummaryDate === dateStr;

                    return (
                        <div key={day} className={`${styles.weekDay} ${isToday(day) ? styles.today : ''} ${hasMatch ? styles.matchDay : ''} ${isTraining ? styles.trainingDay : ''} ${isSummary ? styles.summaryDay : ''}`}>
                            <div className={styles.dayName}>{day.slice(0, 3)}</div>
                            <div className={styles.dayNumber}>{dayNumber}</div>
                            {hasMatch && match && (
                                <div className={styles.matchIndicator}>
                                    {match.isTournamentMatch
                                        ? match.tournamentName?.split(' ').map(w => w[0]).join('')
                                        : 'League'}
                                </div>
                            )}
                            {isTraining && !hasMatch && (
                                <div className={styles.trainingIndicator}>Train</div>
                            )}
                            {isSummary && !hasMatch && !isTraining && (
                                <div className={styles.summaryIndicator}>Summary</div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default WeekSchedule;
