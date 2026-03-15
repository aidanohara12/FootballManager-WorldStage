import { type Signal } from "@preact/signals-react";
import type { Achievements, currentYear, League, Manager, ManagerHistory, Match, NationalTeam, Player, PlayerAwards, Team } from "../Models/WorldStage";
import { createSchedule, finishSeason } from "./CreateSchedule";

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

export function moveToNextDay(currentYear: Signal<currentYear>, isSimulated: Record<string, boolean>, leagues: Signal<League[]>, teamsMap: Signal<Map<string, Team>>, playerMap: Signal<Map<string, Player>>, manager: Signal<Manager>, managerHistory: Signal<ManagerHistory>, achievements: Signal<Achievements>, nationalTeams: Signal<NationalTeam[]>, isFirstSeason: Signal<boolean>, currentPage: Signal<string>, retiredPlayers: Signal<Player[]>, playerAwards: Signal<PlayerAwards>) {
    const cur = currentYear.value;
    const nextDayOfWeek = getNextDay(cur.currentDayOfWeek);
    const maxDays = daysOfTheMonth[cur.currentMonth];
    let nextDay = cur.currentDay + 1;
    let nextMonth = cur.currentMonth;
    let nextYear = cur.year;
    const managerLeague = leagues.value.find(league => league.name === manager.value.team);
    if (currentYear.value.currentDayOfWeek === "Monday") {
        if (currentYear.value.leagueWeek === (managerLeague?.teams.length ?? 38 * 2) - 2) {
            finishSeason(leagues, manager, currentYear, teamsMap, playerMap, managerHistory, achievements, nationalTeams, retiredPlayers, playerAwards);
            isFirstSeason.value = false;
            currentPage.value = "SeasonSummary";
            currentYear.value.leagueWeek = 0;
        } else if (currentYear.value.leagueWeek > 0) {
            currentYear.value.leagueWeek++;
        }
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
        currentYear.value.leagueWeek = 1;
        leagues.value.forEach((league: League) => {
            retiredPlayers.value = [];
            const fullSchedule = createSchedule(league, currentYear);
            league.teams.forEach((teamName: string) => {
                const team = teamsMap.value.get(teamName);
                if (team) {
                    team.Schedule = fullSchedule.filter(
                        (m: Match) => m.homeTeamName === teamName || m.awayTeamName === teamName
                    ).sort((a: Match, b: Match) => new Date(a.date).getTime() - new Date(b.date).getTime());
                }
            });
        });
    }

    currentYear.value = {
        ...currentYear.value,
        currentDay: nextDay,
        currentDayOfWeek: nextDayOfWeek,
        currentMonth: nextMonth,
        year: nextYear,
    };

    const nextMonthNumber = months.indexOf(nextMonth) + 1;
    const nextDayString = `${String(nextMonthNumber).padStart(2, "0")}/${String(nextDay).padStart(2, "0")}/${nextYear}`;

    isSimulated[nextDayString] = false;
}