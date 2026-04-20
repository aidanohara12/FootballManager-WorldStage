import { type Signal } from "@preact/signals-react";
import type { Player, PlayerAwards, Team } from "../Models/WorldStage";
import { finishSeason } from "./CreateSchedule";
import type { GameContextType } from "../Context/GameContext";
import { addTeamsToTournament } from './TournamentSchedule';
import { getTrainingPoints } from './TeamPlayers';
import { Top50Countries } from '../Models/Countries';
import { saveGame } from './SaveLoad';
import { showTeamAlert } from '../Components/AlertModal/AlertModal';

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

const topLeagues = ["Premier Division", "La Primera", "Serie Alfa", "Deutsche Liga", "Division Première", "Dutch Premier League", "Liga Portuguesa"];

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

const countryNames = new Set(Top50Countries.map(c => c.country));

function applyAutoTraining(player: Player, type: "Medium" | "Low") {
    if (player.injured) return;
    const canUpgrade = player.potential > player.overall;
    if (type === "Medium") {
        if (Math.random() < 0.02) {
            player.injured = true;
            player.weeksInjured = 1;
        }
        if (canUpgrade) {
            const trainingGain = 6 + Math.floor(Math.random() * 5);  // 6-10 TP
            player.trainingPoints += trainingGain;
            if (player.trainingPoints >= player.trainingUpgradePoints) {
                player.trainingPoints = 0;
                player.overall++;
            }
            player.trainingUpgradePoints = getTrainingPoints(player.overall, player.potential);
        }
        const loss = 3 + Math.floor(Math.random() * 4);
        player.stamina = Math.max(0, player.stamina - loss);
    } else {
        if (canUpgrade) {
            const trainingGain = 1 + Math.floor(Math.random() * 3);  // 1-3 TP
            player.trainingPoints += trainingGain;
            if (player.trainingPoints >= player.trainingUpgradePoints) {
                player.trainingPoints = 0;
                player.overall++;
            }
            player.trainingUpgradePoints = getTrainingPoints(player.overall, player.potential);
        }
        const gain = 5 + Math.floor(Math.random() * 6);
        player.stamina = Math.min(100, player.stamina + gain);
    }
}

function trainNonManagerTeams(ctx: GameContextType) {
    const { teamsMap, playersMap, userManager: manager, currentYear } = ctx;
    const week = currentYear.value.leagueWeek;
    const type: "Medium" | "Low" = week % 2 === 0 ? "Medium" : "Low";

    teamsMap.value.forEach((team) => {
        // Skip the manager's team (they train manually) and national teams
        if (team.name === manager.value.team || countryNames.has(team.name)) return;
        for (const playerName of team.players) {
            const player = playersMap.value.get(playerName);
            if (player) applyAutoTraining(player, type);
        }
    });
}

export function moveToNextDay(ctx: GameContextType, isSimulated: Record<string, boolean>, isFirstSeason: Signal<boolean>, currentPage: Signal<string>, retiredPlayers: Signal<Player[]>, playerAwards: Signal<PlayerAwards>, preGameSuspended?: Set<string>) {
    const { currentYear, leagues, teamsMap, playersMap, userManager: manager, managerHistory, achievements, nationalTeams, tournaments, internationalTournaments } = ctx;
    const cur = currentYear.value;
    const nextDayOfWeek = getNextDay(cur.currentDayOfWeek);
    const maxDays = getDaysInMonth(cur.currentMonth, cur.year);
    let nextDay = cur.currentDay + 1;
    let nextMonth = cur.currentMonth;
    let nextYear = cur.year;
    // Auto-train all non-manager club teams on Mondays
    if (cur.currentDayOfWeek === "Monday") {
        trainNonManagerTeams(ctx);
    }

    // Decrement injury weeks every Sunday and alert manager about recoveries
    if (cur.currentDayOfWeek === "Sunday") {
        const recovered: Player[] = [];
        playersMap.value.forEach((player) => {
            if (player.injured && player.weeksInjured > 0) {
                player.weeksInjured--;
                if (player.weeksInjured <= 0) {
                    player.injured = false;
                    player.weeksInjured = 0;
                    player.trainingIntency = "Low";
                    recovered.push(player);
                }
            }
        });

        // For non-manager teams: auto-restore recovered players if they're better than current starter
        const managerTeamName = manager.value.team;
        const managerCountry = manager.value.country;
        for (const player of recovered) {
            // Club team auto-restore
            if (player.team && player.team !== managerTeamName && player.team !== "Free Agent") {
                const team = teamsMap.value.get(player.team);
                if (team && !countryNames.has(team.name)) {
                    const teamPlayers = team.players.map(n => playersMap.value.get(n)).filter(Boolean) as Player[];
                    const samePosCurrent = teamPlayers.find(p => p.startingTeam && p.position === player.position && p.overall < player.overall);
                    if (samePosCurrent) {
                        samePosCurrent.startingTeam = false;
                        player.startingTeam = true;
                    }
                }
            }
            // National team auto-restore
            if (player.country !== managerCountry) {
                const nt = nationalTeams.value.find(n => n.country === player.country);
                if (nt) {
                    const ntPlayers = nt.team.players.map(n => playersMap.value.get(n)).filter(Boolean) as Player[];
                    const samePosCurrent = ntPlayers.find(p => p.startingNational && p.position === player.position && p.overall < player.overall);
                    if (samePosCurrent) {
                        samePosCurrent.startingNational = false;
                        player.startingNational = true;
                    }
                }
            }
        }

        // Alert manager about recovered players who were originally starters
        // Only show club alerts during club season, international alerts during international period
        const isInternationalPeriod = ["May", "June", "July"].includes(cur.currentMonth);
        const managerRecovered = recovered.filter(p => {
            if (isInternationalPeriod) {
                return p.country === managerCountry && p.startingNationalWithoutInjury;
            } else {
                return p.team === managerTeamName && p.startingTeamWithoutInjury;
            }
        });
        if (managerRecovered.length > 0) {
            const names = managerRecovered.map(p => `${p.name} (${p.overall} OVR)`).join(", ");
            showTeamAlert(`${names} recovered from injury and can be put back in the starting lineup!`);
        }
    }

    const managerTeam = teamsMap.value.get(manager.value.team);
    const managerLeague = leagues.value.find(league => league.name === managerTeam?.leagueName);
    if (currentYear.value.currentDayOfWeek === "Monday") {
        if (currentYear.value.leagueWeek === ((managerLeague?.teams.length ?? 38) * 2) - 2) {
            if (isFirstSeason.value) {
                isFirstSeason.value = false;
                tournaments.value.push({
                    name: "Champions Cup",
                    currentRound: "First Round",
                    teams: [],
                    matches: [],
                    pastChampions: [],
                });
                tournaments.value.push({
                    name: "Europa Cup",
                    currentRound: "First Round",
                    teams: [],
                    matches: [],
                    pastChampions: [],
                });
                tournaments.value.push({
                    name: "Conference Cup",
                    currentRound: "First Round",
                    teams: [],
                    matches: [],
                    pastChampions: [],
                });
            }
            // Clear European tournament teams before re-populating from all leagues
            const cl = tournaments.value.find(t => t.name === "Champions Cup")!;
            const el = tournaments.value.find(t => t.name === "Europa Cup")!;
            const conf = tournaments.value.find(t => t.name === "Conference Cup")!;

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
                    // Compute current standings directly (league.topThree may not be set yet on first season)
                    const leagueTeams = league.teams
                        .map(t => teamsMap.value.get(t))
                        .filter((t): t is Team => !!t);
                    const sorted = [...leagueTeams].sort((a, b) =>
                        (b.points - a.points) || ((b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst))
                    );
                    const resolve = (names: string[]) => names
                        .filter(n => !lockedTeams.has(n))
                        .map(n => teamsMap.value.get(n))
                        .filter((t): t is Team => !!t);
                    addTeamsToTournament(cl, resolve(sorted.slice(0, 3).map(t => t.name)));
                    addTeamsToTournament(el, resolve(sorted.slice(3, 6).map(t => t.name)));
                    addTeamsToTournament(conf, resolve(sorted.slice(6, 9).map(t => t.name)));
                }
            });

            // Adjust manager budget based on season performance
            if (managerTeam) {
                const managerLeagueObj = leagues.value.find(l => l.name === managerTeam.leagueName);
                const finishedTopThree = managerLeagueObj ? (() => {
                    const lt = managerLeagueObj.teams.map(t => teamsMap.value.get(t)).filter((t): t is Team => !!t);
                    const s = [...lt].sort((a, b) => (b.points - a.points) || ((b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst)));
                    return s.slice(0, 3).some(t => t.name === managerTeam.name);
                })() : false;
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

    //check if it is matchday
    if (preGameSuspended && preGameSuspended.size > 0) {
        const curMonthNumber = months.indexOf(cur.currentMonth) + 1;
        const todayString = `${String(curMonthNumber).padStart(2, "0")}/${String(cur.currentDay).padStart(2, "0")}/${cur.year}`;

        const teamsPlayedToday = new Set<string>();
        leagues.value.forEach(league => {
            league.teams.forEach(teamName => {
                const team = teamsMap.value.get(teamName);
                const match = team?.Schedule.find(m => m.date === todayString && m.played);
                if (match) {
                    teamsPlayedToday.add(match.homeTeamName);
                    teamsPlayedToday.add(match.awayTeamName);
                }
            });
        });
        tournaments.value.forEach(t => {
            t.matches.forEach(m => {
                if (m.date === todayString && m.played) {
                    teamsPlayedToday.add(m.homeTeamName);
                    teamsPlayedToday.add(m.awayTeamName);
                }
            });
        });
        internationalTournaments.value.forEach(t => {
            t.matches.forEach(m => {
                if (m.date === todayString && m.played) {
                    teamsPlayedToday.add(m.homeTeamName);
                    teamsPlayedToday.add(m.awayTeamName);
                }
            });
        });

        if (teamsPlayedToday.size > 0) {
            const isInternationalPeriod = ["May", "June", "July"].includes(cur.currentMonth);
            const managerTeamName = manager.value.team;
            const managerCountry = manager.value.country;
            const returned: string[] = [];

            playersMap.value.forEach(player => {
                if (!preGameSuspended.has(player.name)) return;
                if (!teamsPlayedToday.has(player.team) && !teamsPlayedToday.has(player.country)) return;
                if (player.gamesSuspended <= 0) return;
                player.gamesSuspended--;
                if (player.gamesSuspended === 0) {
                    const isStarter = isInternationalPeriod
                        ? player.country === managerCountry && player.startingNationalWithoutInjury
                        : player.team === managerTeamName && player.startingTeamWithoutInjury;
                    if (isStarter) returned.push(`${player.name} (${player.overall} OVR)`);
                }
            });

            if (returned.length > 0) {
                showTeamAlert(`Back from suspension and available for selection: ${returned.join(', ')}`);
            }
        }
    }

    saveGame();
}