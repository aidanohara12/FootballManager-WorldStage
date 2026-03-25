import type { Signal } from "@preact/signals-react";
import type { currentYear, Match, Player, Team, Tournament, TournamentTeam } from "../Models/WorldStage";

function nextPowerOf2(n: number): number {
    let p = 1;
    while (p < n) p *= 2;
    return p;
}

function getRoundName(teamsInRound: number): string {
    if (teamsInRound <= 2) return "Final";
    if (teamsInRound <= 4) return "Semi-Finals";
    if (teamsInRound <= 8) return "Quarter-Finals";
    if (teamsInRound <= 16) return "Round of 16";
    return `Round of ${teamsInRound}`;
}

function formatDate(d: Date): string {
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const yyyy = String(d.getFullYear());
    return `${mm}/${dd}/${yyyy}`;
}

// Secondary (league cup) tournaments play on Tuesdays every 4 weeks
const secondaryTournamentNames = new Set([
    "Carabao Cup",
    "Supercopa de España",
    "Supercoppa Italiana",
    "DFL-Supercup",
    "Coupe de la Ligue",
    "Johan Cruyff Shield",
    "Taça da Liga",
]);

// European tournaments play on Thursdays with two-legged ties
const europeanTournamentNames = new Set([
    "Champions League",
    "Europa League",
    "Conference League",
]);

export function isEuropeanTournament(name: string): boolean {
    return europeanTournamentNames.has(name);
}

// Primary tournaments (FA Cup, Copa del Rey, etc.) play on Wednesdays
// Start at league week 10 (~October), every 3 weeks so they finish in the next year
function getTournamentWednesday(year: number, roundNumber: number): string {
    const aug1 = new Date(year, 7, 1);
    const dayOfWeek = aug1.getDay();
    const firstSaturday = dayOfWeek === 6 ? 1 : 1 + ((6 - dayOfWeek + 7) % 7);
    // Wednesday of league week 10: Saturday - 3
    const firstTournamentWednesday = firstSaturday + (9 * 7) - 3;
    const tournamentDay = firstTournamentWednesday + (roundNumber * 21);
    const date = new Date(year, 7, tournamentDay);
    return formatDate(date);
}

// Secondary tournaments (Carabao Cup, Supercopa, etc.) play on Tuesdays
// Start at league week 12 (~November), every 3 weeks, offset from primary
function getTournamentTuesday(year: number, roundNumber: number): string {
    const aug1 = new Date(year, 7, 1);
    const dayOfWeek = aug1.getDay();
    const firstSaturday = dayOfWeek === 6 ? 1 : 1 + ((6 - dayOfWeek + 7) % 7);
    // Tuesday of league week 12: Saturday - 4
    const firstTournamentTuesday = firstSaturday + (11 * 7) - 4;
    const tournamentDay = firstTournamentTuesday + (roundNumber * 21);
    const date = new Date(year, 7, tournamentDay);
    return formatDate(date);
}

// European tournaments play on Thursdays
// Two legs per round: Leg 1 at weekOffset R*4, Leg 2 at R*4+1
// This gives back-to-back Thursdays per round, 3-week gap between rounds
// Start at league week 11 (~late October), offset from primary/secondary
function getEuropeanThursday(year: number, weekOffset: number): string {
    const aug1 = new Date(year, 7, 1);
    const dayOfWeek = aug1.getDay();
    const firstSaturday = dayOfWeek === 6 ? 1 : 1 + ((6 - dayOfWeek + 7) % 7);
    // Thursday of league week 11: Saturday - 2
    const firstThursday = firstSaturday + (10 * 7) - 2;
    const tournamentDay = firstThursday + (weekOffset * 7);
    const date = new Date(year, 7, tournamentDay);
    return formatDate(date);
}

function getTournamentDate(year: number, roundNumber: number, tournamentName: string): string {
    if (europeanTournamentNames.has(tournamentName)) {
        // For European tournaments, roundNumber is the week offset
        return getEuropeanThursday(year, roundNumber);
    }
    if (secondaryTournamentNames.has(tournamentName)) {
        return getTournamentTuesday(year, roundNumber);
    }
    return getTournamentWednesday(year, roundNumber);
}

function createMatch(home: string, away: string, date: string, tournamentName: string, roundName: string, leg?: number): Match {
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
        isTournamentMatch: true,
        isInternationalMatch: false,
        tournamentName,
        tournamentRound: roundName,
        leg,
    };
}

function addMatchToTeamSchedule(match: Match, teamsMap: Signal<Map<string, Team>>) {
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

function scheduleRoundMatches(
    teams: { teamName: string }[],
    year: number,
    roundNumber: number,
    roundName: string,
    tournament: Tournament,
    teamsMap: Signal<Map<string, Team>>
): void {
    const european = isEuropeanTournament(tournament.name);
    const isFinal = roundName === "Final";

    for (let i = 0; i < teams.length / 2; i++) {
        const home = teams[i].teamName;
        const away = teams[teams.length - 1 - i].teamName;

        if (european && !isFinal) {
            // Two-legged tie: leg 1 and leg 2 on back-to-back Thursdays
            const leg1Offset = roundNumber * 4;
            const leg2Offset = roundNumber * 4 + 1;
            const leg1Date = getEuropeanThursday(year, leg1Offset);
            const leg2Date = getEuropeanThursday(year, leg2Offset);

            const leg1 = createMatch(home, away, leg1Date, tournament.name, roundName, 1);
            const leg2 = createMatch(away, home, leg2Date, tournament.name, roundName, 2);

            tournament.matches.push(leg1);
            tournament.matches.push(leg2);
            addMatchToTeamSchedule(leg1, teamsMap);
            addMatchToTeamSchedule(leg2, teamsMap);
        } else {
            // Single match (non-European tournaments or Final)
            const date = european
                ? getEuropeanThursday(year, roundNumber * 4)
                : getTournamentDate(year, roundNumber, tournament.name);
            const match = createMatch(home, away, date, tournament.name, roundName);
            tournament.matches.push(match);
            addMatchToTeamSchedule(match, teamsMap);
        }
    }
}

export function createTournamentSchedule(
    tournament: Tournament,
    currentYear: Signal<currentYear>,
    teamsMap: Signal<Map<string, Team>>
): void {
    // Deduplicate teams (same team can appear in multiple leagues/divisions)
    const seenNames = new Set<string>();
    const dedupedTeams: TournamentTeam[] = [];
    for (const t of tournament.teams) {
        if (!seenNames.has(t.teamName)) {
            seenNames.add(t.teamName);
            dedupedTeams.push(t);
        }
    }
    tournament.teams = dedupedTeams;
    const teams = [...dedupedTeams];
    const totalTeams = teams.length;
    if (totalTeams < 2) return;

    // Shuffle teams randomly for seeding
    for (let i = teams.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [teams[i], teams[j]] = [teams[j], teams[i]];
    }

    const bracketSize = nextPowerOf2(totalTeams);
    const numPlayInMatches = totalTeams - bracketSize / 2;
    const year = currentYear.value.year;
    tournament.seasonStartYear = year;
    const roundNumber = 0;

    if (numPlayInMatches > 0) {
        const playInTeams = teams.slice(totalTeams - numPlayInMatches * 2);
        const roundName = "Play-In";
        scheduleRoundMatches(playInTeams, year, roundNumber, roundName, tournament, teamsMap);
        tournament.currentRound = roundName;
    } else {
        const roundName = getRoundName(totalTeams);
        scheduleRoundMatches(teams, year, roundNumber, roundName, tournament, teamsMap);
        tournament.currentRound = roundName;
    }
}

export function advanceTournamentRound(
    tournament: Tournament,
    currentYear: Signal<currentYear>,
    teamsMap: Signal<Map<string, Team>>,
    playersMap: Map<string, Player>
): void {
    const currentRound = tournament.currentRound;
    const currentRoundMatches = tournament.matches.filter(m => m.tournamentRound === currentRound);
    const european = isEuropeanTournament(tournament.name);
    const isFinal = currentRound === "Final";

    if (european && !isFinal) {
        // Two-legged: group leg 1 and leg 2 matches by pairing
        const leg1Matches = currentRoundMatches.filter(m => m.leg === 1);
        const leg2Matches = currentRoundMatches.filter(m => m.leg === 2);

        leg1Matches.forEach(leg1 => {
            // Leg 2 has reversed home/away
            const leg2 = leg2Matches.find(m =>
                m.homeTeamName === leg1.awayTeamName && m.awayTeamName === leg1.homeTeamName
            );
            if (!leg2) return;

            // Aggregate: leg1 home goals + leg2 away goals for team A
            const teamAName = leg1.homeTeamName;
            const teamBName = leg1.awayTeamName;
            const teamAAgg = leg1.homeScore + leg2.awayScore;
            const teamBAgg = leg1.awayScore + leg2.homeScore;

            let loser: string;

            if (teamAAgg > teamBAgg) {
                loser = teamBName;
            } else if (teamBAgg > teamAAgg) {
                loser = teamAName;
            } else {
                // Aggregate tied — penalties on leg 2
                leg2.penaltyWin = true;
                if (Math.random() < 0.5) {
                    leg2.homeScore++;
                    loser = leg2.awayTeamName;
                } else {
                    leg2.awayScore++;
                    loser = leg2.homeTeamName;
                }
            }

            const loserTeam = tournament.teams.find(t => t.teamName === loser);
            if (loserTeam) loserTeam.nextRound = false;
        });
    } else {
        // Single-match knockout (non-European, or European Final)
        currentRoundMatches.forEach(match => {
            const loser = match.homeScore > match.awayScore
                ? match.awayTeamName
                : match.homeTeamName;
            const loserTeam = tournament.teams.find(t => t.teamName === loser);
            if (loserTeam) loserTeam.nextRound = false;
        });
    }

    // Get all teams still in
    const advancingTeams = tournament.teams.filter(t => t.nextRound);

    if (advancingTeams.length <= 1) {
        // Tournament is over
        if (advancingTeams.length === 1) {
            tournament.pastChampions.push(advancingTeams[0]);
            const winnerTeam = teamsMap.value.get(advancingTeams[0].teamName);
            if (winnerTeam) {
                winnerTeam.manager.trophiesWon.push({
                    trophy: tournament.name,
                    trophyType: "Tournament",
                    trophyYear: currentYear.value.year
                });
                winnerTeam.manager.tournamentTrophies++;
                winnerTeam.players.forEach(playerName => {
                    const player = playersMap.get(playerName);
                    if (player) {
                        player.trophies++;
                        if (tournament.name === "Champions League") {
                            player.importantTrophiesThisSeason++;
                        } else {
                            player.otherTrophiesThisSeason++;
                        }
                    }
                });
            }
        }
        tournament.currentRound = "Complete";
        return;
    }

    // Find what round number we're on by counting distinct rounds so far
    const pastRounds = new Set(tournament.matches.map(m => m.tournamentRound));
    const roundNumber = pastRounds.size;

    // Shuffle advancing teams so matchups are randomized each round
    for (let i = advancingTeams.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [advancingTeams[i], advancingTeams[j]] = [advancingTeams[j], advancingTeams[i]];
    }

    const roundName = getRoundName(advancingTeams.length);
    tournament.currentRound = roundName;

    const year = tournament.seasonStartYear ?? currentYear.value.year;
    scheduleRoundMatches(advancingTeams, year, roundNumber, roundName, tournament, teamsMap);
}

export function resetTournaments(tournaments: Signal<Tournament[]>): void {
    tournaments.value.forEach(tournament => {
        tournament.matches = [];
        tournament.currentRound = "First Round";
        tournament.teams.forEach(team => {
            team.nextRound = true;
        });
    });
}

export function addTeamsToTournament(tournament: Tournament, teams: Team[]): void {
    teams.forEach(team => {
        const alreadyIn = tournament.teams.some(t => t.teamName === team.name);
        if (!alreadyIn) {
            tournament.teams.push({
                teamName: team.name,
                tournamentName: tournament.name,
                nextRound: true,
            });
        }
    });
}

export function finalizeEuropeanTournament(tournament: Tournament): void {
    // If there's a past champion, ensure they're included
    const lastWinner = tournament.pastChampions[tournament.pastChampions.length - 1];
    if (lastWinner) {
        const alreadyIn = tournament.teams.some(t => t.teamName === lastWinner.teamName);
        if (!alreadyIn) {
            tournament.teams.push({
                teamName: lastWinner.teamName,
                tournamentName: tournament.name,
                nextRound: true,
            });
        }
    }
}
