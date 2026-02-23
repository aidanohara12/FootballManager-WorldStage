import type { Week } from "../../Models/WorldStage";
import { getNextDay, daysOfTheWeek, daysOfTheMonth, months } from "../../Utils/Calendar";

function wrapDay(currentDay: number, offset: number, currentMonth: string): number {
    const maxDays = daysOfTheMonth[currentMonth];
    const prevMonthIndex = (months.indexOf(currentMonth) - 1 + 12) % 12;
    const prevMaxDays = daysOfTheMonth[months[prevMonthIndex]];
    const day = currentDay + offset;
    if (day > maxDays) return day - maxDays;
    if (day < 1) return prevMaxDays + day;
    return day;
}

export function getCurrentWeek(currentMonth: string, currentDay: number, currentDayOfWeek: string): Week {
    switch (currentDayOfWeek) {
        case "Sunday":
            return {
                weekDays: {
                    "Sunday": currentDay,
                    "Monday": wrapDay(currentDay, 1, currentMonth),
                    "Tuesday": wrapDay(currentDay, 2, currentMonth),
                    "Wednesday": wrapDay(currentDay, 3, currentMonth),
                    "Thursday": wrapDay(currentDay, 4, currentMonth),
                    "Friday": wrapDay(currentDay, 5, currentMonth),
                    "Saturday": wrapDay(currentDay, 6, currentMonth)
                }
            };
        case "Monday":
            return {
                weekDays: {
                    "Sunday": wrapDay(currentDay, -1, currentMonth),
                    "Monday": currentDay,
                    "Tuesday": wrapDay(currentDay, 1, currentMonth),
                    "Wednesday": wrapDay(currentDay, 2, currentMonth),
                    "Thursday": wrapDay(currentDay, 3, currentMonth),
                    "Friday": wrapDay(currentDay, 4, currentMonth),
                    "Saturday": wrapDay(currentDay, 5, currentMonth)
                }
            };
        case "Tuesday":
            return {
                weekDays: {
                    "Sunday": wrapDay(currentDay, -2, currentMonth),
                    "Monday": wrapDay(currentDay, -1, currentMonth),
                    "Tuesday": currentDay,
                    "Wednesday": wrapDay(currentDay, 1, currentMonth),
                    "Thursday": wrapDay(currentDay, 2, currentMonth),
                    "Friday": wrapDay(currentDay, 3, currentMonth),
                    "Saturday": wrapDay(currentDay, 4, currentMonth)
                }
            };
        case "Wednesday":
            return {
                weekDays: {
                    "Sunday": wrapDay(currentDay, -3, currentMonth),
                    "Monday": wrapDay(currentDay, -2, currentMonth),
                    "Tuesday": wrapDay(currentDay, -1, currentMonth),
                    "Wednesday": currentDay,
                    "Thursday": wrapDay(currentDay, 1, currentMonth),
                    "Friday": wrapDay(currentDay, 2, currentMonth),
                    "Saturday": wrapDay(currentDay, 3, currentMonth)
                }
            };
        case "Thursday":
            return {
                weekDays: {
                    "Sunday": wrapDay(currentDay, -4, currentMonth),
                    "Monday": wrapDay(currentDay, -3, currentMonth),
                    "Tuesday": wrapDay(currentDay, -2, currentMonth),
                    "Wednesday": wrapDay(currentDay, -1, currentMonth),
                    "Thursday": currentDay,
                    "Friday": wrapDay(currentDay, 1, currentMonth),
                    "Saturday": wrapDay(currentDay, 2, currentMonth)
                }
            };
        case "Friday":
            return {
                weekDays: {
                    "Sunday": wrapDay(currentDay, -5, currentMonth),
                    "Monday": wrapDay(currentDay, -4, currentMonth),
                    "Tuesday": wrapDay(currentDay, -3, currentMonth),
                    "Wednesday": wrapDay(currentDay, -2, currentMonth),
                    "Thursday": wrapDay(currentDay, -1, currentMonth),
                    "Friday": currentDay,
                    "Saturday": wrapDay(currentDay, 1, currentMonth)
                }
            };
        case "Saturday":
            return {
                weekDays: {
                    "Sunday": wrapDay(currentDay, -6, currentMonth),
                    "Monday": wrapDay(currentDay, -5, currentMonth),
                    "Tuesday": wrapDay(currentDay, -4, currentMonth),
                    "Wednesday": wrapDay(currentDay, -3, currentMonth),
                    "Thursday": wrapDay(currentDay, -2, currentMonth),
                    "Friday": wrapDay(currentDay, -1, currentMonth),
                    "Saturday": currentDay
                }
            };
        default:
            return {
                weekDays: {
                    "Sunday": currentDay,
                    "Monday": wrapDay(currentDay, 1, currentMonth),
                    "Tuesday": wrapDay(currentDay, 2, currentMonth),
                    "Wednesday": wrapDay(currentDay, 3, currentMonth),
                    "Thursday": wrapDay(currentDay, 4, currentMonth),
                    "Friday": wrapDay(currentDay, 5, currentMonth),
                    "Saturday": wrapDay(currentDay, 6, currentMonth)
                }
            };
    }
}
export default getCurrentWeek;