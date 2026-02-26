import { type currentYear } from './../Models/WorldStage';
import type { Achievements, League, Manager, ManagerHistory, Match, NationalTeam, Player, Team, yearPlayerStats } from "../Models/WorldStage";
import type { Signal } from '@preact/signals-react';

export function createSchedule(league: League, currentYear: Signal<currentYear>): Match[] {
    const schedule: Match[] = [];
    const teams = league.teams;
    const numTeams = teams.length;

    // Generate round-robin fixtures (each team plays every other team twice: home & away)
    const rounds: { home: number; away: number }[][] = [];

    // Use a standard round-robin algorithm
    // If odd number of teams, add a "bye" slot
    const teamIndices = teams.map((_, i) => i);
    const isOdd = numTeams % 2 !== 0;
    if (isOdd) teamIndices.push(-1); // -1 represents a bye

    const n = teamIndices.length;
    const half = n / 2;

    // First half of season (home fixtures)
    for (let round = 0; round < n - 1; round++) {
        const roundMatches: { home: number; away: number }[] = [];
        for (let i = 0; i < half; i++) {
            const home = teamIndices[i];
            const away = teamIndices[n - 1 - i];
            if (home === -1 || away === -1) continue; // skip bye
            roundMatches.push({ home, away });
        }
        rounds.push(roundMatches);

        // Rotate all indices except the first one
        const last = teamIndices.pop()!;
        teamIndices.splice(1, 0, last);
    }

    // Second half of season (reverse home/away)
    const firstHalf = [...rounds];
    const secondHalf = firstHalf.map((round) =>
        round.map((m) => ({ home: m.away, away: m.home }))
    );

    // Shuffle each half independently so matchups are randomized
    for (let i = firstHalf.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [firstHalf[i], firstHalf[j]] = [firstHalf[j], firstHalf[i]];
    }
    for (let i = secondHalf.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [secondHalf[i], secondHalf[j]] = [secondHalf[j], secondHalf[i]];
    }

    rounds.length = 0;
    for (let i = 0; i < firstHalf.length; i++) {
        rounds.push(firstHalf[i]);
    }
    for (let i = 0; i < secondHalf.length; i++) {
        rounds.push(secondHalf[i]);
    }

    // Generate Saturday dates starting from Aug 2, 2025 (one game per week)
    const weekendDates: Date[] = [];
    const year = currentYear.value.year;
    // Find the first Saturday in August
    const aug1 = new Date(year, 7, 1);
    const dayOfWeek = aug1.getDay(); // 0=Sun, 6=Sat
    const firstSaturday = dayOfWeek === 6 ? 1 : 1 + ((6 - dayOfWeek + 7) % 7);
    const seasonStart = new Date(year, 7, firstSaturday);
    let current = new Date(seasonStart);

    while (weekendDates.length < rounds.length) {
        weekendDates.push(new Date(current));
        current.setDate(current.getDate() + 7); // skip to next Saturday
    }

    const formatDate = (d: Date): string => {
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const yyyy = String(d.getFullYear());
        return `${mm}/${dd}/${yyyy}`;
    };

    // Convert to Match objects, one weekend date per round
    for (let r = 0; r < rounds.length; r++) {
        const round = rounds[r];
        const matchDate = formatDate(weekendDates[r]);
        for (const fixture of round) {
            const match: Match = {
                homeTeamName: teams[fixture.home],
                awayTeamName: teams[fixture.away],
                date: matchDate,
                homeScore: 0,
                awayScore: 0,
                homeScorers: [],
                awayScorers: [],
                homeAssists: [],
                awayAssists: [],
                isLeagueMatch: true,
                isTournamentMatch: false,
                isInternationalMatch: false,
            };
            schedule.push(match);
        }
    }

    return schedule;
}

export function finishSeason(leagues: Signal<League[]>, manager: Signal<Manager>, currentYear: Signal<currentYear>, teamsMap: Signal<Map<string, Team>>, playerMap: Signal<Map<string, Player>>, managerHistory: Signal<ManagerHistory>, achievements: Signal<Achievements>): void {
    // Increment yearsCompleted before checking achievements so season-count checks work
    currentYear.value = {
        ...currentYear.value,
        yearsCompleted: currentYear.value.yearsCompleted + 1,
    };

    leagues.value.forEach(league => {
        league.teams.forEach(team => {
            const curTeam = teamsMap.value.get(team);
            if (curTeam) {
                if(curTeam.manager.name === manager.value.name) {
                    checkAchievements(manager, currentYear, achievements, teamsMap, playerMap);
                }
                if (curTeam.manager.name === manager.value.name) {
                    let allPlayers: Player[] = [];
                    curTeam.players.forEach(player => {
                        const curPlayer = playerMap.value.get(player);
                        if (curPlayer) {
                            allPlayers.push(curPlayer);
                        }
                    });
                    const topGoalScorer = [...allPlayers].sort((a, b) => b.totalGoals - a.totalGoals)[0];
                    const topAssistScorer = [...allPlayers].sort((a, b) => b.totalAssists - a.totalAssists)[0];
                    const topCleanSheets = [...allPlayers].sort((a, b) => b.cleanSheets - a.cleanSheets)[0];
                    const goalPlayerStats: yearPlayerStats = {
                        stat: "Goals",
                        player: topGoalScorer.name,
                        goals: topGoalScorer.totalGoals,
                        assists: 0,
                        cleanSheets: 0
                    };
                    const assistPlayerStats: yearPlayerStats = {
                        stat: "Assists",
                        player: topAssistScorer.name,
                        goals: 0,
                        assists: topAssistScorer.totalAssists,
                        cleanSheets: 0
                    };
                    const cleanSheetPlayerStats: yearPlayerStats = {
                        stat: "Clean Sheets",
                        player: topCleanSheets.name,
                        goals: 0,
                        assists: 0,
                        cleanSheets: topCleanSheets.cleanSheets
                    };
                    managerHistory.value = {
                        topGoalScorersByYear: { ...managerHistory.value.topGoalScorersByYear, [currentYear.value.year]: goalPlayerStats },
                        topAssistScorersByYear: { ...managerHistory.value.topAssistScorersByYear, [currentYear.value.year]: assistPlayerStats },
                        topCleanSheetsByYear: { ...managerHistory.value.topCleanSheetsByYear, [currentYear.value.year]: cleanSheetPlayerStats },
                    };
                }
                // Reset stats after recording history
                curTeam.points = 0;
                curTeam.wins = 0;
                curTeam.losses = 0;
                curTeam.draws = 0;
                curTeam.goalsFor = 0;
                curTeam.goalsAgainst = 0;
                curTeam.form = [];
                curTeam.Schedule = [];
            }
        });
    });

}

export function checkAchievements(manager: Signal<Manager>, currentYear: Signal<currentYear>, achievements: Signal<Achievements>, teamMap: Signal<Map<string, Team>>, playerMap: Signal<Map<string, Player>>): void {
    const updated = { ...achievements.value };

    if (currentYear.value.yearsCompleted >= 1) {
        updated.playFirstSeason = true;
        updated.playFirstTournament = true;
    }
    if (currentYear.value.yearsCompleted >= 10) {
        updated.play10Seasons = true;
    }
    if (currentYear.value.yearsCompleted >= 50) {
        updated.play50Seasons = true;
    }
    if (currentYear.value.yearsCompleted >= 100) {
        updated.play100Seasons = true;
    }
    const leaguesWon = manager.value.trophiesWon.filter(trophy => trophy.trophyType === "League").length;
    const internationalTournamentsWon = manager.value.trophiesWon.filter(trophy => trophy.trophyType === "International Tournament").length;
    if (leaguesWon >= 1) {
        updated.winTheLeague = true;
    }
    if (leaguesWon >= 10) {
        updated.win10Leagues = true;
    }
    if (leaguesWon >= 50) {
        updated.win50Leagues = true;
    }
    const managerTeam = teamMap.value.get(manager.value.team);
    if (!managerTeam) {
        achievements.value = updated;
        return;
    }
    if (managerTeam.points >= 100) {
        updated.get100Points = true;
    }
    if (managerTeam.losses === 0) {
        updated.invincibleSeason = true;
    }
    if (internationalTournamentsWon >= 1) {
        updated.winAnInternationalTournament = true;
    }
    if (manager.value.trophiesWon.length >= 1) {
        updated.winFirstTrophy = true;
    }
    const wonWorldCup = manager.value.trophiesWon.filter(trophy => trophy.trophyType === "World Cup").length;
    if (wonWorldCup >= 1) {
        updated.winTheWorldCup = true;
    }
    if (manager.value.trophiesWon.length >= 10) {
        updated.win10Trophies = true;
    }
    if (manager.value.trophiesWon.length >= 50) {
        updated.win50Trophies = true;
    }
    const managerPlayers = managerTeam.players.map(player => playerMap.value.get(player));
    if (!managerPlayers) {
        achievements.value = updated;
        return;
    }
    const overall99 = managerPlayers.filter(player => player ? player.overall >= 99 : false).length;
    const potential99 = managerPlayers.filter(player => player ? player.potential >= 99 : false).length;
    if (overall99 >= 1) {
        updated.getA99Overall = true;
    }
    if (potential99 >= 1) {
        updated.getA99Potential = true;
    }

    achievements.value = updated;
}


export function improvePlayer(player: Player): void {

}