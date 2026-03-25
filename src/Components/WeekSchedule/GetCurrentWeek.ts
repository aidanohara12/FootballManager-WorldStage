import type { Week } from "../../Models/WorldStage";
import { months } from "../../Utils/Calendar";

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatDate(d: Date): string {
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const yyyy = String(d.getFullYear());
    return `${mm}/${dd}/${yyyy}`;
}

export function getCurrentWeek(currentMonth: string, currentDay: number, currentDayOfWeek: string, year: number = 2026): Week {
    const monthIndex = months.indexOf(currentMonth);
    const today = new Date(year, monthIndex, currentDay);
    const todayDowIndex = dayNames.indexOf(currentDayOfWeek);

    // Sunday is the start of the week (index 0)
    const sundayOffset = -todayDowIndex;

    const weekDays: Week["weekDays"] = {};
    for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + sundayOffset + i);
        weekDays[dayNames[i]] = {
            dayNumber: d.getDate(),
            dateStr: formatDate(d),
        };
    }

    return { weekDays };
}

export default getCurrentWeek;
