import { type Signal } from "@preact/signals-react";
import type { Player, PlayerAwards, Team } from "../Models/WorldStage";
import { finishSeason } from "./CreateSchedule";
import type { GameContextType } from "../Context/GameContext";
import { addTeamsToTournament } from './TournamentSchedule';

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

const topLeagues = ["Premier League", "La Liga", "Serie A", "Bundesliga", "Ligue 1", "Eredivisie", "Primeira Liga"];

export function isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

export function getDaysInMonth(month: string, year: number): number {
    if (month === "February") {
        return isLeapYear(year) ? 29 : 28;
    }
    return daysOfTheMonth[month];
}

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

export function moveToNextDay(ctx: GameContextType, isSimulated: Record<string, boolean>, isFirstSeason: Signal<boolean>, currentPage: Signal<string>, retiredPlayers: Signal<Player[]>, playerAwards: Signal<PlayerAwards>) {
    const { currentYear, leagues, teamsMap, playersMap, userManager: manager, managerHistory, achievements, nationalTeams, tournaments } = ctx;
    const cur = currentYear.value;
    const nextDayOfWeek = getNextDay(cur.currentDayOfWeek);
    const maxDays = getDaysInMonth(cur.currentMonth, cur.year);
    let nextDay = cur.currentDay + 1;
    let nextMonth = cur.currentMonth;
    let nextYear = cur.year;
    const managerTeam = teamsMap.value.get(manager.value.team);
    const managerLeague = leagues.value.find(league => league.name === managerTeam?.leagueName);
    if (currentYear.value.currentDayOfWeek === "Monday") {
        if (currentYear.value.leagueWeek === ((managerLeague?.teams.length ?? 38) * 2) - 2) {
            if (isFirstSeason.value) {
                isFirstSeason.value = false;
                tournaments.value.push({
                    name: "Champions League",
                    currentRound: "First Round",
                    teams: [],
                    matches: [],
                    pastChampions: [],
                });
                tournaments.value.push({
                    name: "Europa League",
                    currentRound: "First Round",
                    teams: [],
                    matches: [],
                    pastChampions: [],
                });
                tournaments.value.push({
                    name: "Conference League",
                    currentRound: "First Round",
                    teams: [],
                    matches: [],
                    pastChampions: [],
                });
            }
            // Clear European tournament teams before re-populating from all leagues
            const cl = tournaments.value.find(t => t.name === "Champions League")!;
            const el = tournaments.value.find(t => t.name === "Europa League")!;
            const conf = tournaments.value.find(t => t.name === "Conference League")!;

            // Get last season's winners before clearing
            const clWinner = cl.pastChampions[cl.pastChampions.length - 1]?.teamName;
            const elWinner = el.pastChampions[el.pastChampions.length - 1]?.teamName;
            const confWinner = conf.pastChampions[conf.pastChampions.length - 1]?.teamName;
            // Track teams that are locked into a European tournament via winning
            const lockedTeams = new Set<string>();

            cl.teams = [];
            el.teams = [];
            conf.teams = [];

            // CL winner stays in CL, EL winner promoted to CL, Conf winner promoted to EL
            if (clWinner) {
                const team = teamsMap.value.get(clWinner);
                if (team) { addTeamsToTournament(cl, [team]); lockedTeams.add(clWinner); }
            }
            if (elWinner) {
                const team = teamsMap.value.get(elWinner);
                if (team) { addTeamsToTournament(cl, [team]); lockedTeams.add(elWinner); }
            }
            if (confWinner) {
                const team = teamsMap.value.get(confWinner);
                if (team) { addTeamsToTournament(el, [team]); lockedTeams.add(confWinner); }
            }

            leagues.value.forEach(league => {
                if (topLeagues.includes(league.name)) {
                    const resolve = (names: string[]) => names
                        .filter(n => !lockedTeams.has(n))
                        .map(n => teamsMap.value.get(n))
                        .filter((t): t is Team => !!t);
                    addTeamsToTournament(cl, resolve(league.topThree));
                    addTeamsToTournament(el, resolve(league.topSix));
                    addTeamsToTournament(conf, resolve(league.topNine));
                }
            });

            // Adjust manager budget based on season performance
            if (managerTeam) {
                const finishedTopThree = leagues.value.some(league =>
                    topLeagues.includes(league.name) && league.topThree.includes(managerTeam.name)
                );
                const wonTrophyThisSeason = leagues.value.some(l => l.pastChampions[l.pastChampions.length - 1] === managerTeam.name) ||
                    tournaments.value.some(t => t.pastChampions[t.pastChampions.length - 1]?.teamName === managerTeam.name);

                managerTeam.moneyToSpend = (finishedTopThree || wonTrophyThisSeason) ? 315 : 250;
            }

            currentYear.value.leagueWeek = 0;
        } else if (currentYear.value.leagueWeek > 0) {
            currentYear.value.leagueWeek++;
        }
    }
    if (currentYear.value.currentMonth === "July" && currentYear.value.currentDay === 25) {
        finishSeason(leagues, manager, currentYear, teamsMap, playersMap, managerHistory, achievements, nationalTeams, retiredPlayers, playerAwards, tournaments);
        currentPage.value = "SeasonSummary";
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

    if (nextMonth === "August" && nextDayOfWeek === "Saturday" && currentYear.value.leagueWeek === 0) {
        currentYear.value.leagueWeek = 1;
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