import type { Signal } from "@preact/signals-react";
import type {
    currentYear,
    InternationalGroup,
    InternationalGroupStanding,
    InternationalTournament,
    InternationalTournamentTeam,
    Match,
    NationalTeam,
    Player,
    Team,
} from "../Models/WorldStage";
import { rankNationalTeams } from "./TeamPlayers";

function formatDate(d: Date): string {
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const yyyy = String(d.getFullYear());
    return `${mm}/${dd}/${yyyy}`;
}

function findDayOfWeek(year: number, month: number, weekNumber: number, targetDay: number): Date {
    // Find the Nth occurrence of targetDay (0=Sun, 3=Wed, 6=Sat) in a given month (0-indexed)
    const first = new Date(year, month, 1);
    const dayOfWeek = first.getDay();
    const firstTarget = dayOfWeek <= targetDay ? 1 + (targetDay - dayOfWeek) : 1 + (7 - dayOfWeek + targetDay);
    const day = firstTarget + (weekNumber - 1) * 7;
    return new Date(year, month, day);
}

function findSaturday(year: number, month: number, weekNumber: number): Date {
    return findDayOfWeek(year, month, weekNumber, 6); // 6 = Saturday
}

function findWednesday(year: number, month: number, weekNumber: number): Date {
    return findDayOfWeek(year, month, weekNumber, 3); // 3 = Wednesday
}

function createInternationalMatch(
    home: string,
    away: string,
    date: string,
    tournamentName: string,
    round: string,
    isFriendly: boolean = false,
): Match {
    return {
        homeTeamName: home,
        awayTeamName: away,
        date,
        homeScore: 0,
        awayScore: 0,
        homeScorers: [],
        awayScorers: [],
        homeAssists: [],
        awayAssists: [],
        isLeagueMatch: false,
        isTournamentMatch: !isFriendly,
        isInternationalMatch: true,
        tournamentName,
        tournamentRound: round,
    };
}

function addMatchToNationalTeamSchedule(match: Match, teamsMap: Signal<Map<string, Team>>) {
    const homeTeam = teamsMap.value.get(match.homeTeamName);
    const awayTeam = teamsMap.value.get(match.awayTeamName);
    if (homeTeam) {
        homeTeam.Schedule.push(match);
        homeTeam.Schedule.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
    if (awayTeam) {
        awayTeam.Schedule.push(match);
        awayTeam.Schedule.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
}

function divideIntoGroups(teamNames: string[]): string[][] {
    const n = teamNames.length;
    let numGroups: number;
    if (n >= 24) numGroups = 8;
    else if (n >= 8) numGroups = 4;
    else if (n >= 4) numGroups = 2;
    else return [teamNames];

    const shuffled = [...teamNames].sort(() => Math.random() - 0.5);
    const groups: string[][] = Array.from({ length: numGroups }, () => []);
    shuffled.forEach((team, i) => {
        groups[i % numGroups].push(team);
    });
    return groups;
}

function createGroupRoundRobin(groupTeams: string[]): [string, string][] {
    const matches: [string, string][] = [];
    for (let i = 0; i < groupTeams.length; i++) {
        for (let j = i + 1; j < groupTeams.length; j++) {
            matches.push([groupTeams[i], groupTeams[j]]);
        }
    }
    return matches;
}

function nextPowerOf2(n: number): number {
    let p = 1;
    while (p < n) p *= 2;
    return p;
}

function getKnockoutRoundName(teamsInRound: number): string {
    if (teamsInRound <= 2) return "Final";
    if (teamsInRound <= 4) return "Semi-Finals";
    if (teamsInRound <= 8) return "Quarter-Finals";
    if (teamsInRound <= 16) return "Round of 16";
    return `Round of ${teamsInRound}`;
}

// ========================
// Major Tournament (Group + Knockout)
// ========================

export function scheduleInternationalTournament(
    tournament: InternationalTournament,
    year: number,
    teamsMap: Signal<Map<string, Team>>,
): void {
    const teamNames = tournament.teams.map(t => t.teamName);
    if (teamNames.length < 4) return;

    // Reset tournament state
    tournament.matches = [];
    tournament.currentPhase = "group";
    tournament.currentRound = "Group Stage";
    tournament.teams.forEach(t => { t.nextRound = true; });

    // Create groups
    const groupArrays = divideIntoGroups(teamNames);
    const groupLabels = "ABCDEFGH";
    const groups: InternationalGroup[] = groupArrays.map((teams, i) => ({
        name: `Group ${groupLabels[i] ?? String(i + 1)}`,
        teams,
        standings: teams.map(teamName => ({
            teamName,
            points: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            goalsFor: 0,
            goalsAgainst: 0,
        })),
    }));
    tournament.groups = groups;

    // Schedule group matches across 3 matchdays in May (Saturdays)
    const matchdayDates = [
        formatDate(findSaturday(year, 4, 1)), // May 1st Saturday
        formatDate(findSaturday(year, 4, 2)), // May 2nd Saturday
        formatDate(findSaturday(year, 4, 3)), // May 3rd Saturday
    ];

    groups.forEach(group => {
        const roundRobinPairs = createGroupRoundRobin(group.teams);
        // Proper matchday assignment so no team plays twice per day
        // For 4 teams [A,B,C,D]: pairs are AB(0), AC(1), AD(2), BC(3), BD(4), CD(5)
        // MD1: AB + CD, MD2: AC + BD, MD3: AD + BC
        const matchdayMap = [0, 1, 2, 2, 1, 0];
        roundRobinPairs.forEach((pair, i) => {
            const matchday = matchdayMap[i] ?? (i % matchdayDates.length);
            const date = matchdayDates[matchday];
            const match = createInternationalMatch(
                pair[0],
                pair[1],
                date,
                tournament.name,
                `${group.name} - MD${matchday + 1}`,
            );
            tournament.matches.push(match);
            addMatchToNationalTeamSchedule(match, teamsMap);
        });
    });
}

export function updateGroupStandings(tournament: InternationalTournament): void {
    if (!tournament.groups) return;

    tournament.groups.forEach(group => {
        // Reset standings
        group.standings.forEach(s => {
            s.points = 0;
            s.wins = 0;
            s.draws = 0;
            s.losses = 0;
            s.goalsFor = 0;
            s.goalsAgainst = 0;
        });

        // Find all group matches
        const groupMatches = tournament.matches.filter(
            m => m.tournamentRound?.startsWith(group.name) && m.played
        );

        groupMatches.forEach(match => {
            const home = group.standings.find(s => s.teamName === match.homeTeamName);
            const away = group.standings.find(s => s.teamName === match.awayTeamName);
            if (!home || !away) return;

            home.goalsFor += match.homeScore;
            home.goalsAgainst += match.awayScore;
            away.goalsFor += match.awayScore;
            away.goalsAgainst += match.homeScore;

            if (match.homeScore > match.awayScore) {
                home.points += 3;
                home.wins++;
                away.losses++;
            } else if (match.awayScore > match.homeScore) {
                away.points += 3;
                away.wins++;
                home.losses++;
            } else {
                home.points += 1;
                away.points += 1;
                home.draws++;
                away.draws++;
            }
        });

        // Sort standings by points, then goal difference, then goals for
        group.standings.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            const gdA = a.goalsFor - a.goalsAgainst;
            const gdB = b.goalsFor - b.goalsAgainst;
            if (gdB !== gdA) return gdB - gdA;
            return b.goalsFor - a.goalsFor;
        });
    });
}

export function isGroupStageComplete(tournament: InternationalTournament): boolean {
    if (!tournament.groups || tournament.currentPhase !== "group") return false;
    const groupMatches = tournament.matches.filter(m => m.tournamentRound?.startsWith("Group"));
    return groupMatches.length > 0 && groupMatches.every(m => m.played);
}

export function advanceToKnockout(
    tournament: InternationalTournament,
    year: number,
    teamsMap: Signal<Map<string, Team>>,
): void {
    if (!tournament.groups) return;

    updateGroupStandings(tournament);

    // Top 2 from each group advance
    const qualifiers: string[] = [];
    tournament.groups.forEach(group => {
        const top2 = group.standings.slice(0, 2).map(s => s.teamName);
        qualifiers.push(...top2);
    });

    // Mark eliminated teams
    tournament.teams.forEach(t => {
        t.nextRound = qualifiers.includes(t.teamName);
    });

    tournament.currentPhase = "knockout";

    // Shuffle qualifiers for knockout draw
    for (let i = qualifiers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [qualifiers[i], qualifiers[j]] = [qualifiers[j], qualifiers[i]];
    }

    // Create knockout bracket
    const bracketSize = nextPowerOf2(qualifiers.length);
    const numByes = bracketSize - qualifiers.length;
    const roundName = getKnockoutRoundName(bracketSize);
    tournament.currentRound = roundName;

    // Schedule first knockout round (Saturdays)
    const knockoutDate = formatDate(findSaturday(year, 5, 1)); // June 1st Saturday

    // Teams with byes advance automatically
    const byeTeams = qualifiers.slice(0, numByes);
    const matchTeams = qualifiers.slice(numByes);

    // Create matches for non-bye teams
    for (let i = 0; i < matchTeams.length; i += 2) {
        if (i + 1 >= matchTeams.length) break;
        const match = createInternationalMatch(
            matchTeams[i],
            matchTeams[i + 1],
            knockoutDate,
            tournament.name,
            roundName,
        );
        tournament.matches.push(match);
        addMatchToNationalTeamSchedule(match, teamsMap);
    }

    // Mark bye teams as already through (they'll appear in the next round)
    // We handle this in advanceInternationalKnockout
    if (byeTeams.length > 0) {
        // Store bye teams for next round by keeping them with nextRound = true
        // Non-bye teams that lose will get nextRound = false
    }
}

export function advanceInternationalKnockout(
    tournament: InternationalTournament,
    year: number,
    teamsMap: Signal<Map<string, Team>>,
    playersMap: Map<string, Player>,
    currentYearSignal: Signal<currentYear>,
): void {
    const currentRound = tournament.currentRound;
    if (!currentRound || tournament.currentPhase !== "knockout") return;

    const currentRoundMatches = tournament.matches.filter(
        m => m.tournamentRound === currentRound
    );

    // Determine losers
    currentRoundMatches.forEach(match => {
        if (!match.played) return;
        const loser = match.homeScore > match.awayScore
            ? match.awayTeamName
            : match.homeTeamName;
        const loserTeam = tournament.teams.find(t => t.teamName === loser);
        if (loserTeam) loserTeam.nextRound = false;
    });

    // Get advancing teams
    const advancingTeams = tournament.teams.filter(t => t.nextRound);

    if (advancingTeams.length <= 1) {
        // Tournament complete
        if (advancingTeams.length === 1) {
            tournament.pastChampions.push(advancingTeams[0]);
            const winnerTeam = teamsMap.value.get(advancingTeams[0].teamName);
            if (winnerTeam) {
                winnerTeam.manager.trophiesWon.push({
                    trophy: tournament.name,
                    trophyType: "International Tournament",
                    trophyYear: currentYearSignal.value.year,
                });
                winnerTeam.manager.internationalTrophies++;
            }
        }
        tournament.currentPhase = "complete";
        tournament.currentRound = "Complete";
        return;
    }

    // Schedule next round
    const roundNumber = getKnockoutRoundIndex(currentRound);
    const nextRoundName = getKnockoutRoundName(advancingTeams.length);
    tournament.currentRound = nextRoundName;

    // Schedule date: June 1st Saturday + 2 weeks per round
    const baseDate = findSaturday(year, 5, 1);
    baseDate.setDate(baseDate.getDate() + (roundNumber + 1) * 14);
    const nextDate = formatDate(baseDate);

    // Shuffle for new matchups
    for (let i = advancingTeams.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [advancingTeams[i], advancingTeams[j]] = [advancingTeams[j], advancingTeams[i]];
    }

    for (let i = 0; i < advancingTeams.length; i += 2) {
        if (i + 1 >= advancingTeams.length) break;
        const match = createInternationalMatch(
            advancingTeams[i].teamName,
            advancingTeams[i + 1].teamName,
            nextDate,
            tournament.name,
            nextRoundName,
        );
        tournament.matches.push(match);
        addMatchToNationalTeamSchedule(match, teamsMap);
    }
}

function getKnockoutRoundIndex(roundName: string): number {
    const order = ["Round of 32", "Round of 16", "Quarter-Finals", "Semi-Finals", "Final"];
    const idx = order.indexOf(roundName);
    return idx === -1 ? 0 : idx;
}

// ========================
// Friendly Tournament
// ========================

export function scheduleFriendlyTournament(
    tournament: InternationalTournament,
    year: number,
    teamsMap: Signal<Map<string, Team>>,
): void {
    const teamNames = tournament.teams.map(t => t.teamName);
    if (teamNames.length < 2) return;

    // Reset tournament state
    tournament.matches = [];
    tournament.currentPhase = "friendly";
    tournament.currentRound = "Friendlies";
    tournament.groups = undefined;
    tournament.teams.forEach(t => { t.nextRound = true; });

    // Phase 1: Friendly matches in May — alternating Wed/Sat for 5 matchdays
    const shuffled = [...teamNames].sort(() => Math.random() - 0.5);
    const friendlyDates = [
        formatDate(findWednesday(year, 4, 1)), // May Week 1 Wed
        formatDate(findSaturday(year, 4, 1)),  // May Week 1 Sat
        formatDate(findWednesday(year, 4, 2)), // May Week 2 Wed
        formatDate(findSaturday(year, 4, 2)),  // May Week 2 Sat
        formatDate(findWednesday(year, 4, 3)), // May Week 3 Wed
    ];

    // Create random friendly pairings for each matchday
    for (let md = 0; md < friendlyDates.length; md++) {
        const available = [...shuffled];
        // Shuffle for this matchday
        for (let i = available.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [available[i], available[j]] = [available[j], available[i]];
        }

        for (let i = 0; i < available.length - 1; i += 2) {
            const match = createInternationalMatch(
                available[i],
                available[i + 1],
                friendlyDates[md],
                tournament.name,
                `Friendly ${md + 1}`,
                true,
            );
            tournament.matches.push(match);
            addMatchToNationalTeamSchedule(match, teamsMap);
        }
    }

    // Phase 2: Mini tournament starting mid-June
    // Will be created after friendlies are done (see advanceFriendlyToMiniTournament)
}

export function areFriendliesComplete(tournament: InternationalTournament): boolean {
    if (tournament.currentPhase !== "friendly" || tournament.currentRound !== "Friendlies") return false;
    const friendlyMatches = tournament.matches.filter(m => m.tournamentRound?.startsWith("Friendly"));
    return friendlyMatches.length > 0 && friendlyMatches.every(m => m.played);
}

export function advanceFriendlyToMiniTournament(
    tournament: InternationalTournament,
    year: number,
    teamsMap: Signal<Map<string, Team>>,
): void {
    const teamNames = tournament.teams.map(t => t.teamName);
    if (teamNames.length < 2) return;

    // Rank teams by friendly results: 3pts win, 1pt draw, then GD, then GF
    const friendlyMatches = tournament.matches.filter(m => m.tournamentRound?.startsWith("Friendly") && m.played);
    const stats = new Map<string, { pts: number; gd: number; gf: number }>();
    for (const name of teamNames) {
        stats.set(name, { pts: 0, gd: 0, gf: 0 });
    }
    for (const m of friendlyMatches) {
        const home = stats.get(m.homeTeamName);
        const away = stats.get(m.awayTeamName);
        if (home) {
            home.gf += m.homeScore;
            home.gd += m.homeScore - m.awayScore;
            if (m.homeScore > m.awayScore) home.pts += 3;
            else if (m.homeScore === m.awayScore) home.pts += 1;
        }
        if (away) {
            away.gf += m.awayScore;
            away.gd += m.awayScore - m.homeScore;
            if (m.awayScore > m.homeScore) away.pts += 3;
            else if (m.homeScore === m.awayScore) away.pts += 1;
        }
    }

    const ranked = [...teamNames].sort((a, b) => {
        const sa = stats.get(a)!;
        const sb = stats.get(b)!;
        if (sb.pts !== sa.pts) return sb.pts - sa.pts;
        if (sb.gd !== sa.gd) return sb.gd - sa.gd;
        return sb.gf - sa.gf;
    });

    // Take top 16 (or fewer if not enough teams)
    const miniTeams = ranked.slice(0, Math.min(16, ranked.length));
    const bracketSize = nextPowerOf2(miniTeams.length);
    const roundName = getKnockoutRoundName(bracketSize);

    tournament.currentRound = roundName;

    // Schedule from 3rd Saturday of June
    const knockoutDate = formatDate(findSaturday(year, 5, 3));

    // Pad with byes if needed
    const numByes = bracketSize - miniTeams.length;
    const matchTeams = miniTeams.slice(numByes);

    for (let i = 0; i < matchTeams.length; i += 2) {
        if (i + 1 >= matchTeams.length) break;
        const match = createInternationalMatch(
            matchTeams[i],
            matchTeams[i + 1],
            knockoutDate,
            tournament.name,
            roundName,
        );
        tournament.matches.push(match);
        addMatchToNationalTeamSchedule(match, teamsMap);
    }
}

export function advanceFriendlyKnockout(
    tournament: InternationalTournament,
    year: number,
    teamsMap: Signal<Map<string, Team>>,
    playersMap: Map<string, Player>,
    currentYearSignal: Signal<currentYear>,
): void {
    const currentRound = tournament.currentRound;
    if (!currentRound || tournament.currentPhase !== "friendly" || currentRound === "Friendlies") return;

    const currentRoundMatches = tournament.matches.filter(
        m => m.tournamentRound === currentRound && !m.tournamentRound.startsWith("Friendly")
    );

    currentRoundMatches.forEach(match => {
        if (!match.played) return;
        const loser = match.homeScore > match.awayScore
            ? match.awayTeamName
            : match.homeTeamName;
        const loserTeam = tournament.teams.find(t => t.teamName === loser);
        if (loserTeam) loserTeam.nextRound = false;
    });

    // Count teams still in knockout (not eliminated in knockout rounds)
    const knockoutMatches = tournament.matches.filter(
        m => !m.tournamentRound?.startsWith("Friendly")
    );
    const knockoutLosers = new Set<string>();
    knockoutMatches.forEach(m => {
        if (!m.played) return;
        const loser = m.homeScore > m.awayScore ? m.awayTeamName : m.homeTeamName;
        knockoutLosers.add(loser);
    });

    const knockoutParticipants = new Set<string>();
    knockoutMatches.forEach(m => {
        knockoutParticipants.add(m.homeTeamName);
        knockoutParticipants.add(m.awayTeamName);
    });

    const stillIn = [...knockoutParticipants].filter(t => !knockoutLosers.has(t));

    if (stillIn.length <= 1) {
        if (stillIn.length === 1) {
            const winner = tournament.teams.find(t => t.teamName === stillIn[0]);
            if (winner) {
                tournament.pastChampions.push(winner);
                const winnerTeam = teamsMap.value.get(winner.teamName);
                if (winnerTeam) {
                    winnerTeam.manager.trophiesWon.push({
                        trophy: tournament.name,
                        trophyType: "International Tournament",
                        trophyYear: currentYearSignal.value.year,
                    });
                    winnerTeam.manager.internationalTrophies++;
                }
            }
        }
        tournament.currentPhase = "complete";
        tournament.currentRound = "Complete";
        return;
    }

    // Schedule next round — +7 days from latest played knockout match
    const nextRoundName = getKnockoutRoundName(stillIn.length);
    tournament.currentRound = nextRoundName;

    // Find the date of the most recently played knockout match
    const playedKnockout = knockoutMatches.filter(m => m.played);
    let latestDate: Date;
    if (playedKnockout.length > 0) {
        latestDate = new Date(Math.max(...playedKnockout.map(m => new Date(m.date).getTime())));
    } else {
        latestDate = findSaturday(year, 5, 3);
    }
    latestDate.setDate(latestDate.getDate() + 7); // next Saturday
    const nextDate = formatDate(latestDate);

    // Shuffle
    for (let i = stillIn.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [stillIn[i], stillIn[j]] = [stillIn[j], stillIn[i]];
    }

    for (let i = 0; i < stillIn.length; i += 2) {
        if (i + 1 >= stillIn.length) break;
        const match = createInternationalMatch(
            stillIn[i],
            stillIn[i + 1],
            nextDate,
            tournament.name,
            nextRoundName,
        );
        tournament.matches.push(match);
        addMatchToNationalTeamSchedule(match, teamsMap);
    }
}

// ========================
// World Cup
// ========================

function scheduleWorldCup(
    tournament: InternationalTournament,
    year: number,
    teamsMap: Signal<Map<string, Team>>,
    playersMap: Signal<Map<string, Player>>,
    nationalTeams: NationalTeam[],
): void {
    // Reset tournament state
    tournament.matches = [];
    tournament.groups = undefined;
    tournament.teams.forEach(t => { t.nextRound = true; });

    // Rank all national teams by average starting 11 overall
    const ranked = rankNationalTeams(nationalTeams, playersMap, teamsMap);

    // Top 44 auto-qualify, next 32 go to qualifying (worst 4 eliminated)
    const autoQualified = ranked.slice(0, 44).map(r => r.country);
    const qualifyingTeams = ranked.slice(44, 76).map(r => r.country); // 32 teams, trim worst 4

    // Store auto-qualified teams for later (after qualifying completes)
    (tournament as any)._autoQualified = autoQualified;

    if (qualifyingTeams.length < 4) {
        // Not enough teams for qualifying, just go straight to groups
        const allQualified = [...autoQualified, ...qualifyingTeams];
        scheduleWorldCupGroupStage(tournament, year, teamsMap, allQualified);
        return;
    }

    // Split 32 qualifying teams into 4 brackets of 8 (clean single elimination, no byes)
    const shuffled = [...qualifyingTeams].sort(() => Math.random() - 0.5);
    const brackets: string[][] = [[], [], [], []];
    shuffled.forEach((team, i) => {
        brackets[i % 4].push(team);
    });

    // Store brackets for advancement logic
    (tournament as any)._qualifyingBrackets = brackets;

    tournament.currentPhase = "qualifying";

    // Schedule qualifying matches for all 4 brackets
    scheduleWorldCupQualifyingRound(tournament, year, teamsMap, brackets, 0);
}

function getWorldCupQualifyingDates(year: number): string[] {
    // 3 rounds (QF, SF, Final) — start from first Wednesday in May, alternate Wed/Sat
    const start = findWednesday(year, 4, 1); // May Week 1 Wednesday
    const d1 = new Date(start);
    const d2 = new Date(d1); d2.setDate(d2.getDate() + 3); // Saturday
    const d3 = new Date(d2); d3.setDate(d3.getDate() + 4); // Wednesday
    return [formatDate(d1), formatDate(d2), formatDate(d3)];
}

function scheduleWorldCupQualifyingRound(
    tournament: InternationalTournament,
    year: number,
    teamsMap: Signal<Map<string, Team>>,
    brackets: string[][],
    roundIndex: number,
): void {
    const qualDates = getWorldCupQualifyingDates(year);

    const roundNames = ["Quarter-Finals", "Semi-Finals", "Final"];
    const roundName = roundNames[roundIndex] || `Round ${roundIndex + 1}`;
    const date = qualDates[roundIndex];

    tournament.currentRound = `WCQ ${roundName}`;

    for (let b = 0; b < brackets.length; b++) {
        const teams = brackets[b];
        if (teams.length <= 1) continue;

        if (teams.length % 2 === 1) {
            // Odd number: one team gets a bye (last team)
            // Only match the rest
            for (let i = 0; i < teams.length - 1; i += 2) {
                const match = createInternationalMatch(
                    teams[i],
                    teams[i + 1],
                    date,
                    tournament.name,
                    `WCQ-${b + 1} ${roundName}`,
                );
                tournament.matches.push(match);
                addMatchToNationalTeamSchedule(match, teamsMap);
            }
        } else {
            for (let i = 0; i < teams.length; i += 2) {
                const match = createInternationalMatch(
                    teams[i],
                    teams[i + 1],
                    date,
                    tournament.name,
                    `WCQ-${b + 1} ${roundName}`,
                );
                tournament.matches.push(match);
                addMatchToNationalTeamSchedule(match, teamsMap);
            }
        }
    }
}

export function advanceWorldCupQualifying(
    tournament: InternationalTournament,
    year: number,
    teamsMap: Signal<Map<string, Team>>,
): void {
    const currentRound = tournament.currentRound;
    if (!currentRound || tournament.currentPhase !== "qualifying") return;

    const brackets: string[][] = (tournament as any)._qualifyingBrackets || [];
    const autoQualified: string[] = (tournament as any)._autoQualified || [];

    // Get current round matches
    const currentRoundMatches = tournament.matches.filter(
        m => m.tournamentRound?.startsWith("WCQ-") &&
            m.tournamentRound.endsWith(currentRound.replace("WCQ ", ""))
    );

    // Determine winners for each bracket
    const newBrackets: string[][] = [[], [], [], []];
    for (let b = 0; b < brackets.length; b++) {
        const bracketMatches = currentRoundMatches.filter(
            m => m.tournamentRound?.startsWith(`WCQ-${b + 1}`)
        );
        const teams = brackets[b];

        // Find teams that played
        const playedTeams = new Set<string>();
        const winners = new Set<string>();
        bracketMatches.forEach(m => {
            playedTeams.add(m.homeTeamName);
            playedTeams.add(m.awayTeamName);
            if (m.homeScore > m.awayScore) {
                winners.add(m.homeTeamName);
            } else {
                winners.add(m.awayTeamName);
            }
        });

        // Bye teams (didn't play) advance automatically
        const byeTeams = teams.filter(t => !playedTeams.has(t));
        newBrackets[b] = [...winners, ...byeTeams];
    }

    // Update brackets
    (tournament as any)._qualifyingBrackets = newBrackets;

    // Check if all brackets have exactly 1 team (qualifying complete)
    const allDone = newBrackets.every(b => b.length <= 1);
    if (allDone) {
        // Qualifying complete - 4 winners join auto-qualified
        const qualifyingWinners = newBrackets.map(b => b[0]).filter(Boolean);
        const allQualified = [...autoQualified, ...qualifyingWinners];

        // Mark eliminated teams
        tournament.teams.forEach(t => {
            t.nextRound = allQualified.includes(t.teamName);
        });

        // Move to group stage
        scheduleWorldCupGroupStage(tournament, year, teamsMap, allQualified);
        return;
    }

    // Schedule next qualifying round
    const roundNames = ["Quarter-Finals", "Semi-Finals", "Final"];
    const currentRoundName = currentRound.replace("WCQ ", "");
    const currentIdx = roundNames.indexOf(currentRoundName);
    const nextIdx = currentIdx + 1;

    if (nextIdx < roundNames.length) {
        scheduleWorldCupQualifyingRound(tournament, year, teamsMap, newBrackets, nextIdx);
    }
}

function scheduleWorldCupGroupStage(
    tournament: InternationalTournament,
    year: number,
    teamsMap: Signal<Map<string, Team>>,
    qualified: string[],
): void {
    // Divide 48 teams into 12 groups of 4
    const shuffled = [...qualified].sort(() => Math.random() - 0.5);
    const numGroups = 12;
    const groupArrays: string[][] = Array.from({ length: numGroups }, () => []);
    shuffled.forEach((team, i) => {
        groupArrays[i % numGroups].push(team);
    });

    const groupLabels = "ABCDEFGHIJKL";
    const groups: InternationalGroup[] = groupArrays.map((teams, i) => ({
        name: `Group ${groupLabels[i]}`,
        teams,
        standings: teams.map(teamName => ({
            teamName,
            points: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            goalsFor: 0,
            goalsAgainst: 0,
        })),
    }));
    tournament.groups = groups;
    tournament.currentPhase = "group";
    tournament.currentRound = "Group Stage";

    // Schedule group matches: 3 matchdays (after qualifying finishes)
    // Start from the day after the last qualifying date to ensure chronological order
    const qualDates = getWorldCupQualifyingDates(year);
    const lastQualDate = new Date(qualDates[qualDates.length - 1]);
    // Next Wednesday after last qualifying date
    // Weekly Saturdays for group stage
    const gd1 = new Date(lastQualDate);
    gd1.setDate(gd1.getDate() + ((6 - gd1.getDay() + 7) % 7 || 7)); // next Saturday
    const gd2 = new Date(gd1); gd2.setDate(gd2.getDate() + 7); // +1 week
    const gd3 = new Date(gd2); gd3.setDate(gd3.getDate() + 7); // +1 week
    const matchdayDates = [formatDate(gd1), formatDate(gd2), formatDate(gd3)];

    // Proper matchday assignment so no team plays twice per day
    const matchdayMap = [0, 1, 2, 2, 1, 0];
    groups.forEach(group => {
        const roundRobinPairs = createGroupRoundRobin(group.teams);
        roundRobinPairs.forEach((pair, i) => {
            const matchday = matchdayMap[i] ?? (i % matchdayDates.length);
            const date = matchdayDates[matchday];
            const match = createInternationalMatch(
                pair[0],
                pair[1],
                date,
                tournament.name,
                `${group.name} - MD${matchday + 1}`,
            );
            tournament.matches.push(match);
            addMatchToNationalTeamSchedule(match, teamsMap);
        });
    });
}

function getBestThirdPlaceTeams(groups: InternationalGroup[], count: number): string[] {
    const thirdPlaceTeams = groups
        .map(g => g.standings[2])
        .filter(Boolean);

    thirdPlaceTeams.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        const gdA = a.goalsFor - a.goalsAgainst;
        const gdB = b.goalsFor - b.goalsAgainst;
        if (gdB !== gdA) return gdB - gdA;
        return b.goalsFor - a.goalsFor;
    });

    return thirdPlaceTeams.slice(0, count).map(s => s.teamName);
}

export function advanceWorldCupToKnockout(
    tournament: InternationalTournament,
    year: number,
    teamsMap: Signal<Map<string, Team>>,
): void {
    if (!tournament.groups) return;

    updateGroupStandings(tournament);

    // Top 2 from each group (24 teams)
    const top2: string[] = [];
    tournament.groups.forEach(group => {
        const groupTop2 = group.standings.slice(0, 2).map(s => s.teamName);
        top2.push(...groupTop2);
    });

    // Best 8 third-place teams
    const bestThird = getBestThirdPlaceTeams(tournament.groups, 8);

    const qualifiers = [...top2, ...bestThird]; // 32 teams

    // Mark eliminated teams
    tournament.teams.forEach(t => {
        t.nextRound = qualifiers.includes(t.teamName);
    });

    tournament.currentPhase = "knockout";

    // Shuffle for knockout draw
    for (let i = qualifiers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [qualifiers[i], qualifiers[j]] = [qualifiers[j], qualifiers[i]];
    }

    const roundName = "Round of 32";
    tournament.currentRound = roundName;

    // World Cup knockout date: Saturday after last group matchday (groups are now weekly Sat)
    const qualDatesForKO = getWorldCupQualifyingDates(year);
    const lastQualForKO = new Date(qualDatesForKO[qualDatesForKO.length - 1]);
    const gd1KO = new Date(lastQualForKO);
    gd1KO.setDate(gd1KO.getDate() + ((6 - gd1KO.getDay() + 7) % 7 || 7)); // next Sat (MD1)
    const gd3KO = new Date(gd1KO); gd3KO.setDate(gd3KO.getDate() + 14); // MD3 = +2 weeks
    const koStart = new Date(gd3KO); koStart.setDate(koStart.getDate() + 7); // next Saturday
    const knockoutDate = formatDate(koStart);

    for (let i = 0; i < qualifiers.length; i += 2) {
        if (i + 1 >= qualifiers.length) break;
        const match = createInternationalMatch(
            qualifiers[i],
            qualifiers[i + 1],
            knockoutDate,
            tournament.name,
            roundName,
        );
        tournament.matches.push(match);
        addMatchToNationalTeamSchedule(match, teamsMap);
    }
}

export function advanceWorldCupKnockout(
    tournament: InternationalTournament,
    year: number,
    teamsMap: Signal<Map<string, Team>>,
    playersMap: Map<string, Player>,
    currentYearSignal: Signal<currentYear>,
): void {
    const currentRound = tournament.currentRound;
    if (!currentRound || tournament.currentPhase !== "knockout") return;

    const currentRoundMatches = tournament.matches.filter(
        m => m.tournamentRound === currentRound && !m.tournamentRound?.startsWith("WCQ") && !m.tournamentRound?.startsWith("Group")
    );

    // Determine losers
    currentRoundMatches.forEach(match => {
        if (!match.played) return;
        const loser = match.homeScore > match.awayScore
            ? match.awayTeamName
            : match.homeTeamName;
        const loserTeam = tournament.teams.find(t => t.teamName === loser);
        if (loserTeam) loserTeam.nextRound = false;
    });

    // Get advancing teams (still in knockout, not eliminated)
    const knockoutMatches = tournament.matches.filter(
        m => !m.tournamentRound?.startsWith("WCQ") && !m.tournamentRound?.startsWith("Group")
    );
    const knockoutLosers = new Set<string>();
    knockoutMatches.forEach(m => {
        if (!m.played) return;
        const loser = m.homeScore > m.awayScore ? m.awayTeamName : m.homeTeamName;
        knockoutLosers.add(loser);
    });
    const knockoutParticipants = new Set<string>();
    knockoutMatches.forEach(m => {
        knockoutParticipants.add(m.homeTeamName);
        knockoutParticipants.add(m.awayTeamName);
    });
    const advancingTeams = [...knockoutParticipants].filter(t => !knockoutLosers.has(t));

    if (advancingTeams.length <= 1) {
        // Tournament complete
        if (advancingTeams.length === 1) {
            const winner = tournament.teams.find(t => t.teamName === advancingTeams[0]);
            if (winner) {
                tournament.pastChampions.push(winner);
                const winnerTeam = teamsMap.value.get(winner.teamName);
                if (winnerTeam) {
                    winnerTeam.manager.trophiesWon.push({
                        trophy: "World Cup",
                        trophyType: "World Cup",
                        trophyYear: currentYearSignal.value.year,
                    });
                    winnerTeam.manager.internationalTrophies++;
                }
            }
        }
        tournament.currentPhase = "complete";
        tournament.currentRound = "Complete";
        return;
    }

    // Compute knockout start date (same as advanceWorldCupToKnockout)
    const qualDatesForAdv = getWorldCupQualifyingDates(year);
    const lastQualForAdv = new Date(qualDatesForAdv[qualDatesForAdv.length - 1]);
    const gd1Adv = new Date(lastQualForAdv);
    gd1Adv.setDate(gd1Adv.getDate() + ((6 - gd1Adv.getDay() + 7) % 7 || 7)); // next Sat (MD1)
    const gd3Adv = new Date(gd1Adv); gd3Adv.setDate(gd3Adv.getDate() + 14); // MD3
    const koStartAdv = new Date(gd3Adv); koStartAdv.setDate(koStartAdv.getDate() + 7);

    // Each subsequent round is +7 days (weekly Saturdays)
    const roundIdx = getKnockoutRoundIndex(currentRound);
    const nextRoundName = getKnockoutRoundName(advancingTeams.length);
    tournament.currentRound = nextRoundName;

    const d = new Date(koStartAdv);
    d.setDate(d.getDate() + (roundIdx + 1) * 7); // +7 per round from knockout start
    const nextDate = formatDate(d);

    // Shuffle for new matchups
    for (let i = advancingTeams.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [advancingTeams[i], advancingTeams[j]] = [advancingTeams[j], advancingTeams[i]];
    }

    for (let i = 0; i < advancingTeams.length; i += 2) {
        if (i + 1 >= advancingTeams.length) break;
        const match = createInternationalMatch(
            advancingTeams[i],
            advancingTeams[i + 1],
            nextDate,
            tournament.name,
            nextRoundName,
        );
        tournament.matches.push(match);
        addMatchToNationalTeamSchedule(match, teamsMap);
    }
}

// ========================
// Determine tournament type for a given year
// ========================

export function isMajorTournamentYear(year: number): boolean {
    return year >= 2028 && year % 4 === 0;
}

export function isWorldCupYear(year: number): boolean {
    return year >= 2026 && year % 4 === 2; // 2026, 2030, 2034...
}

export function isFriendlyTournamentYear(year: number): boolean {
    return !isMajorTournamentYear(year) && !isWorldCupYear(year);
}

// Map friendly tournament name to major tournament name
const friendlyToMajorMap: Record<string, string> = {
    "Euros Friendly": "Euros",
    "American Friendly": "Copa America",
    "Africa Friendly": "AFCON",
    "Asian Friendly": "Asian Cup",
};

const majorToFriendlyMap: Record<string, string> = {
    "Euros": "Euros Friendly",
    "Copa America": "American Friendly",
    "AFCON": "Africa Friendly",
    "Asian Cup": "Asian Friendly",
};

export function isMajorTournament(name: string): boolean {
    return ["Euros", "Copa America", "AFCON", "Asian Cup"].includes(name);
}

export function isFriendlyTournament(name: string): boolean {
    return ["Euros Friendly", "American Friendly", "Africa Friendly", "Asian Friendly"].includes(name);
}

export function scheduleAllInternationalTournaments(
    internationalTournaments: Signal<InternationalTournament[]>,
    year: number,
    teamsMap: Signal<Map<string, Team>>,
    playersMap?: Signal<Map<string, Player>>,
    nationalTeams?: NationalTeam[],
): void {
    const major = isMajorTournamentYear(year);
    const friendly = isFriendlyTournamentYear(year);
    const worldCup = isWorldCupYear(year);

    internationalTournaments.value.forEach(tournament => {
        if (tournament.name === "World Cup") {
            if (worldCup && playersMap && nationalTeams) {
                scheduleWorldCup(tournament, year, teamsMap, playersMap, nationalTeams);
            } else {
                tournament.matches = [];
                tournament.currentPhase = "not_started";
                tournament.currentRound = undefined;
                tournament.groups = undefined;
            }
            return;
        }

        if (major && isMajorTournament(tournament.name)) {
            scheduleInternationalTournament(tournament, year, teamsMap);
        } else if (friendly && isFriendlyTournament(tournament.name)) {
            scheduleFriendlyTournament(tournament, year, teamsMap);
        } else {
            // Not this tournament's year - reset it
            tournament.matches = [];
            tournament.currentPhase = "not_started";
            tournament.currentRound = undefined;
            tournament.groups = undefined;
        }
    });

    // Trigger re-render
    internationalTournaments.value = [...internationalTournaments.value];
}
