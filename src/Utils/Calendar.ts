import { type Signal } from "@preact/signals-react";
import type { currentYear } from "../Models/WorldStage";

export const daysOfTheWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const daysOfTheMonth: Record<string, number> = {
    "January": 31,
    "February": 28,
    "March": 31,
    "April": 30,
    "May": 31,
    "June": 30,
    "July": 31,
    "August": 31,
    "September": 30,
    "October": 31,
    "November": 30,
    "December": 31
};
export const months: string[] = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function getNextDay(currentDay: string): string {
    switch (currentDay) {
        case "Sunday":
            return "Monday";
        case "Monday":
            return "Tuesday";
        case "Tuesday":
            return "Wednesday";
        case "Wednesday":
            return "Thursday";
        case "Thursday":
            return "Friday";
        case "Friday":
            return "Saturday";
        case "Saturday":
            return "Sunday";
        default:
            return "Sunday";
    }
}

export function moveToNextDay(currentYear: Signal<currentYear>) {
    const cur = currentYear.value;
    const nextDayOfWeek = getNextDay(cur.currentDayOfWeek);
    const maxDays = daysOfTheMonth[cur.currentMonth];
    let nextDay = cur.currentDay + 1;
    let nextMonth = cur.currentMonth;
    let nextYear = cur.year;
    let yearsCompleted = cur.yearsCompleted;
    if (currentYear.value.currentDayOfWeek === "Monday") {
        if (currentYear.value.leagueWeek === 38) {
            currentYear.value.leagueWeek = 0;
        }
        currentYear.value.leagueWeek++;
    }

    if (nextDay > maxDays) {
        nextDay = 1;
        const monthIndex = months.indexOf(cur.currentMonth);
        if (monthIndex === 11) {
            nextMonth = months[0];
            nextYear = cur.year + 1;
        } else {
            nextMonth = months[monthIndex + 1];
        }
    }

    if (nextMonth === "August" && nextDay === 1) {
        yearsCompleted = cur.yearsCompleted + 1;
    }

    currentYear.value = {
        ...cur,
        currentDay: nextDay,
        currentDayOfWeek: nextDayOfWeek,
        currentMonth: nextMonth,
        year: nextYear,
        yearsCompleted,
    };
}