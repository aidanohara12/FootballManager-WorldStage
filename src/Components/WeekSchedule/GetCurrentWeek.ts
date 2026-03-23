import type { Week } from "../../Models/WorldStage";
import { getDaysInMonth, months } from "../../Utils/Calendar";

function wrapDay(currentDay: number, offset: number, currentMonth: string, year: number = 2026): number {
    const maxDays = getDaysInMonth(currentMonth, year);
    const prevMonthIndex = (months.indexOf(currentMonth) - 1 + 12) % 12;
    const prevMaxDays = getDaysInMonth(months[prevMonthIndex], currentMonth === "January" ? year - 1 : year);
    const day = currentDay + offset;
    if (day > maxDays) return day - maxDays;
    if (day < 1) return prevMaxDays + day;
    return day;
}

export function getCurrentWeek(currentMonth: string, currentDay: number, currentDayOfWeek: string, year: number = 2026): Week {
    switch (currentDayOfWeek) {
        case "Sunday":
            return {
                weekDays: {
                    "Sunday": currentDay,
                    "Monday": wrapDay(currentDay, 1, currentMonth, year),
                    "Tuesday": wrapDay(currentDay, 2, currentMonth, year),
                    "Wednesday": wrapDay(currentDay, 3, currentMonth, year),
                    "Thursday": wrapDay(currentDay, 4, currentMonth, year),
                    "Friday": wrapDay(currentDay, 5, currentMonth, year),
                    "Saturday": wrapDay(currentDay, 6, currentMonth, year)
                }
            };
        case "Monday":
            return {
                weekDays: {
                    "Sunday": wrapDay(currentDay, -1, currentMonth, year),
                    "Monday": currentDay,
                    "Tuesday": wrapDay(currentDay, 1, currentMonth, year),
                    "Wednesday": wrapDay(currentDay, 2, currentMonth, year),
                    "Thursday": wrapDay(currentDay, 3, currentMonth, year),
                    "Friday": wrapDay(currentDay, 4, currentMonth, year),
                    "Saturday": wrapDay(currentDay, 5, currentMonth, year)
                }
            };
        case "Tuesday":
            return {
                weekDays: {
                    "Sunday": wrapDay(currentDay, -2, currentMonth, year),
                    "Monday": wrapDay(currentDay, -1, currentMonth, year),
                    "Tuesday": currentDay,
                    "Wednesday": wrapDay(currentDay, 1, currentMonth, year),
                    "Thursday": wrapDay(currentDay, 2, currentMonth, year),
                    "Friday": wrapDay(currentDay, 3, currentMonth, year),
                    "Saturday": wrapDay(currentDay, 4, currentMonth, year)
                }
            };
        case "Wednesday":
            return {
                weekDays: {
                    "Sunday": wrapDay(currentDay, -3, currentMonth, year),
                    "Monday": wrapDay(currentDay, -2, currentMonth, year),
                    "Tuesday": wrapDay(currentDay, -1, currentMonth, year),
                    "Wednesday": currentDay,
                    "Thursday": wrapDay(currentDay, 1, currentMonth, year),
                    "Friday": wrapDay(currentDay, 2, currentMonth, year),
                    "Saturday": wrapDay(currentDay, 3, currentMonth, year)
                }
            };
        case "Thursday":
            return {
                weekDays: {
                    "Sunday": wrapDay(currentDay, -4, currentMonth, year),
                    "Monday": wrapDay(currentDay, -3, currentMonth, year),
                    "Tuesday": wrapDay(currentDay, -2, currentMonth, year),
                    "Wednesday": wrapDay(currentDay, -1, currentMonth, year),
                    "Thursday": currentDay,
                    "Friday": wrapDay(currentDay, 1, currentMonth, year),
                    "Saturday": wrapDay(currentDay, 2, currentMonth, year)
                }
            };
        case "Friday":
            return {
                weekDays: {
                    "Sunday": wrapDay(currentDay, -5, currentMonth, year),
                    "Monday": wrapDay(currentDay, -4, currentMonth, year),
                    "Tuesday": wrapDay(currentDay, -3, currentMonth, year),
                    "Wednesday": wrapDay(currentDay, -2, currentMonth, year),
                    "Thursday": wrapDay(currentDay, -1, currentMonth, year),
                    "Friday": currentDay,
                    "Saturday": wrapDay(currentDay, 1, currentMonth, year)
                }
            };
        case "Saturday":
            return {
                weekDays: {
                    "Sunday": wrapDay(currentDay, -6, currentMonth, year),
                    "Monday": wrapDay(currentDay, -5, currentMonth, year),
                    "Tuesday": wrapDay(currentDay, -4, currentMonth, year),
                    "Wednesday": wrapDay(currentDay, -3, currentMonth, year),
                    "Thursday": wrapDay(currentDay, -2, currentMonth, year),
                    "Friday": wrapDay(currentDay, -1, currentMonth, year),
                    "Saturday": currentDay
                }
            };
        default:
            return {
                weekDays: {
                    "Sunday": currentDay,
                    "Monday": wrapDay(currentDay, 1, currentMonth, year),
                    "Tuesday": wrapDay(currentDay, 2, currentMonth, year),
                    "Wednesday": wrapDay(currentDay, 3, currentMonth, year),
                    "Thursday": wrapDay(currentDay, 4, currentMonth, year),
                    "Friday": wrapDay(currentDay, 5, currentMonth, year),
                    "Saturday": wrapDay(currentDay, 6, currentMonth, year)
                }
            };
    }
}
export default getCurrentWeek;