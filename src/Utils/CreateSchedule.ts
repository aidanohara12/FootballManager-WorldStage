import { type currentYear } from './../Models/WorldStage';
import type { Achievements, League, Manager, ManagerHistory, Match, NationalTeam, Player, PlayerAwards, Team, Tournament, yearPlayerStats } from "../Models/WorldStage";
import { resetTournaments } from "./TournamentSchedule";
import { updateClubTeams, getNationalAllTeamPlayers, updatePlayerContract } from "../Utils/TeamPlayers";
import type { Signal } from '@preact/signals-react';

const importantLeagues = new Set([
    "Premier League", "La Liga", "Serie A", "Bundesliga", "Ligue 1", "Eredivisie", "Primeira Liga"
]);

const leagueMapping: Record<string, string> = {
    "Premier League": "Championship",
    "La Liga": "La Liga 2",
    "Serie A": "Serie B",
    "Bundesliga": "2. Bundesliga",
    "Ligue 1": "Ligue 2",
    "Eredivisie": "Eerste Divisie",
    "Primeira Liga": "Segunda Liga",
    "Championship": "League One",
    "La Liga 2": "Primera Federación",
    "Serie B": "Serie C",
    "2. Bundesliga": "3. Liga",
    "Ligue 2": "National",
    "Eerste Divisie": "Tweede Divisie",
    "Segunda Liga": "Liga 3"
};

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
    const startDay = firstSaturday;

    for (let i = 0; i < rounds.length; i++) {
        weekendDates.push(new Date(year, 7, startDay + i * 7));
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

function ballonDorWeight(player: Player, isTop5: boolean): number {
    let weight = 0;
    weight = player.otherTrophiesThisSeason * 2;
    weight += player.importantTrophiesThisSeason * 5;
    if (player.position === "Goalkeeper") {
        weight += player.cleanSheets * 2;
    } else if (player.position === "Defender") {
        weight += player.cleanSheets * 1.5;
        weight += player.totalAssists * 1.5;
        weight += player.totalGoals * 1.5;
    } else {
        weight += player.totalAssists * 1.25;
        weight += player.totalGoals * 1.25;
    }
    if (isTop5) weight *= 1.3;
    return weight;
}

export function calculateAwards(leagues: Signal<League[]>, teamsMap: Signal<Map<string, Team>>, playerMap: Signal<Map<string, Player>>, playerAwards: Signal<PlayerAwards>): void {
    const leagueAwardKeys: Record<string, { bestPlayer: keyof PlayerAwards; goldenBoot: keyof PlayerAwards; }> = {
        "Premier League": { bestPlayer: "premBestPlayer", goldenBoot: "premGoldenBoot" },
        "La Liga": { bestPlayer: "laLigaBestPlayer", goldenBoot: "laLigaGoldenBoot" },
        "Serie A": { bestPlayer: "serieABestPlayer", goldenBoot: "serieAGoldenBoot" },
        "Bundesliga": { bestPlayer: "bundesligaBestPlayer", goldenBoot: "bundesligaGoldenBoot" },
        "Ligue 1": { bestPlayer: "ligue1BestPlayer", goldenBoot: "ligue1GoldenBoot" },
        "Eredivisie": { bestPlayer: "eredivisieBestPlayer", goldenBoot: "eredivisieGoldenBoot" },
        "Primeira Liga": { bestPlayer: "primeraDivisionBestPlayer", goldenBoot: "primeraDivisionGoldenBoot" },
    };

    const top5Leagues = new Set(["Premier League", "La Liga", "Serie A", "Bundesliga", "Ligue 1"]);

    // Collect all players across all leagues
    const allPlayers: Player[] = [];
    const topLeaguePlayers: Player[] = [];
    const top5PlayerNames = new Set<string>();

    leagues.value.forEach(league => {
        const leaguePlayers: Player[] = [];
        const isTopLeague = league.name in leagueAwardKeys;
        league.teams.forEach(teamName => {
            const team = teamsMap.value.get(teamName);
            if (!team) return;
            team.players.forEach(playerId => {
                const player = playerMap.value.get(playerId);
                if (player) {
                    leaguePlayers.push(player);
                    allPlayers.push(player);
                    if (isTopLeague) topLeaguePlayers.push(player);
                    if (top5Leagues.has(league.name)) top5PlayerNames.add(player.name);
                }
            });
        });

        // Per-league awards
        const keys = leagueAwardKeys[league.name];
        if (keys && leaguePlayers.length > 0) {
            const bestPlayer = [...leaguePlayers].sort((a, b) => (b.leagueGoals + b.leagueAssists) - (a.leagueGoals + a.leagueAssists))[0];
            const goldenBoot = [...leaguePlayers].sort((a, b) => b.leagueGoals - a.leagueGoals)[0];
            playerAwards.value[keys.bestPlayer].push(bestPlayer.name);
            playerAwards.value[keys.goldenBoot].push(goldenBoot.name);
            bestPlayer.awards++;
            goldenBoot.awards++;
        }
    });

    if (allPlayers.length === 0) return;

    // Ballon d'Or: most G/A across top leagues
    const ballonDor = [...topLeaguePlayers].sort((a, b) => ballonDorWeight(b, top5PlayerNames.has(b.name)) - ballonDorWeight(a, top5PlayerNames.has(a.name)))[0];
    playerAwards.value.ballonDorWinners.push(ballonDor.name);
    ballonDor.awards++;

    // Golden Boot: most goals across top leagues
    const goldenBoot = [...topLeaguePlayers].sort((a, b) => b.leagueGoals - a.leagueGoals)[0];
    playerAwards.value.goldenBootWinners.push(goldenBoot.name);
    goldenBoot.awards++;

    // Best Keeper: most clean sheets across top leagues
    const keepers = topLeaguePlayers.filter(p => p.position === "Goalkeeper");
    if (keepers.length > 0) {
        const bestKeeper = [...keepers].sort((a, b) => b.cleanSheets - a.cleanSheets)[0];
        playerAwards.value.bestKeeper.push(bestKeeper.name);
        bestKeeper.awards++;
    }
}

export function finishSeason(leagues: Signal<League[]>, manager: Signal<Manager>, currentYear: Signal<currentYear>, teamsMap: Signal<Map<string, Team>>, playerMap: Signal<Map<string, Player>>, managerHistory: Signal<ManagerHistory>, achievements: Signal<Achievements>, nationalTeams: Signal<NationalTeam[]>, retiredPlayers: Signal<Player[]>, playerAwards: Signal<PlayerAwards>, tournaments: Signal<Tournament[]>): void {
    // Increment yearsCompleted before checking achievements so season-count checks work
    currentYear.value = {
        ...currentYear.value,
        yearsCompleted: currentYear.value.yearsCompleted + 1,
    };
    manager.value.age++;
    retiredPlayers.value = [];
    // First pass: compute standings, awards, stats, and reset for all leagues
    leagues.value.forEach(league => {
        const leagueTeams = league.teams;
        const allLeagueTeams: Team[] = [];
        leagueTeams.forEach(team => {
            allLeagueTeams.push(teamsMap.value.get(team) as Team);
        });
        const winner = allLeagueTeams.sort((a, b) => (b.goalsFor - b.goalsAgainst) - (a.goalsFor) - (a.goalsAgainst)).sort((a, b) => b.points - a.points)[0];
        league.pastChampions.push(winner.name);
        winner.manager.trophiesWon.push({
            trophy: league.name,
            trophyType: "League",
            trophyYear: currentYear.value.year
        });
        winner.manager.leagueTrophies++;
        winner.players.forEach(player => {
            const playerTeam = playerMap.value.get(player);
            if (playerTeam) {
                playerTeam.trophies++;
                if (importantLeagues.has(league.name)) {
                    playerTeam.importantTrophiesThisSeason++;
                } else {
                    playerTeam.otherTrophiesThisSeason++;
                }
            }
        });
        const sorted = [...allLeagueTeams].sort((a, b) => (b.goalsFor - b.goalsAgainst) - (a.goalsFor) - (a.goalsAgainst)).sort((a, b) => b.points - a.points);
        league.topThree = sorted.slice(0, 3).map((t) => t.name);
        league.topSix = sorted.slice(3, 6).map((t) => t.name);
        league.topNine = sorted.slice(6, 9).map((t) => t.name);
        league.bottomThree = sorted.slice(-3).reverse().map((t) => t.name);
        league.teams.forEach(team => {
            const curTeam = teamsMap.value.get(team);
            if (curTeam) {
                curTeam.newlyPromoted = false;
                if (curTeam.manager.name === manager.value.name) {
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
                // Improve players based on season performance, then reset their stats
                curTeam.players.forEach(playerId => {
                    const curPlayer = playerMap.value.get(playerId);
                    if (curPlayer) {
                        improvePlayer({ value: curPlayer } as Signal<Player>, manager);
                        curPlayer.age += 1;
                        curPlayer.contractYrs--;
                        curPlayer.newPlayer = false;
                        if (curPlayer.contractYrs === 0) {
                            updatePlayerContract(curPlayer);
                        }
                        // Retirement: older + worse overall = higher chance, with luck
                        let retireChance = 0;
                        if (curPlayer.age >= 33) {
                            // Age factor: ramps up from 33 onward
                            const ageFactor = (curPlayer.age - 32) * 0.13; // 0.13 at 33, 0.26 at 34, 0.39 at 35, ...0.91 at 39
                            // Overall factor: lower overall = higher retirement chance
                            const overallFactor = curPlayer.overall < 70 ? 0.25
                                : curPlayer.overall < 75 ? 0.15
                                    : curPlayer.overall < 80 ? 0.08
                                        : 0;
                            retireChance = Math.min(ageFactor + overallFactor, 0.95);
                        }
                        // Age 42+ always retire
                        if (curPlayer.age >= 42 || Math.random() < retireChance) {
                            retiredPlayers.value.push(curPlayer);
                            playerMap.value.delete(curPlayer.name);
                            curTeam.players = curTeam.players.filter(p => p !== curPlayer.name);
                        }
                    }
                });

                // Reset team stats
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

    // Calculate awards (stats will be reset later when new season schedule is created)
    calculateAwards(leagues, teamsMap, playerMap, playerAwards);

    // Second pass: collect all promotion/relegation swaps first, then apply them
    const swaps: { upperLeague: League; lowerLeague: League; promoted: string[]; relegated: string[]; lowerName: string }[] = [];
    leagues.value.forEach(league => {
        const secondDivName = leagueMapping[league.name];
        if (secondDivName) {
            const secondDiv = leagues.value.find(l => l.name === secondDivName);
            if (secondDiv) {
                swaps.push({
                    upperLeague: league,
                    lowerLeague: secondDiv,
                    promoted: [...secondDiv.topThree],
                    relegated: [...league.bottomThree],
                    lowerName: secondDivName
                });
            }
        }
    });

    // Apply all swaps at once so no swap interferes with another
    swaps.forEach(({ upperLeague, lowerLeague, promoted, relegated, lowerName }) => {
        upperLeague.teams = upperLeague.teams.filter(t => !relegated.includes(t));
        upperLeague.teams.push(...promoted);

        lowerLeague.teams = lowerLeague.teams.filter(t => !promoted.includes(t));
        lowerLeague.teams.push(...relegated);

        promoted.forEach(teamName => {
            const t = teamsMap.value.get(teamName);
            if (t) {
                t.leagueName = upperLeague.name;
                t.newlyPromoted = true;
            }
        });
        relegated.forEach(teamName => {
            const t = teamsMap.value.get(teamName);
            if (t) {
                t.leagueName = lowerName;
                t.newlyPromoted = false;
            }
        });
    });

    // Ensure each team appears only in the league matching its leagueName
    leagues.value.forEach(league => {
        league.teams = [...new Set(league.teams)].filter(teamName => {
            const team = teamsMap.value.get(teamName);
            return team && team.leagueName === league.name;
        });
    });
    updateClubTeams(teamsMap, playerMap, manager.value.team);
    getNationalAllTeamPlayers(nationalTeams, playerMap, teamsMap);
    resetTournaments(tournaments);
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

function getTrainingPoints(overall: number, potential: number): number {
    const overallAlowed = potential - overall;
    if (overallAlowed < 0) return 0;
    else if (overallAlowed < 3) return 300;
    else if (overallAlowed < 6) return 250;
    else if (overallAlowed < 9) return 200;
    else if (overallAlowed < 12) return 150;
    else if (overallAlowed < 15) return 100;
    else if (overallAlowed < 18) return 75;
    else if (overallAlowed < 21) return 50;
    else if (overallAlowed < 24) return 30;
    else return 10;
}



export function improvePlayer(player: Signal<Player>, manager: Signal<Manager>): void {
    const isDeveloper = manager.value.type === "Developer";
    const diff = player.value.potential - player.value.overall;
    const age = player.value.age;
    const goals = player.value.leagueGoals;
    const assists = player.value.leagueAssists;
    const contributions = goals + assists;
    const cleanSheets = player.value.cleanSheets;
    const isKeeper = player.value.position === "Goalkeeper";

    // Each player has a hidden "luck" factor per season: some bloom, some stagnate
    const luck = Math.random(); // 0-1, determines if this player develops well this year

    let change = 0;

    // Under 20: growth varies a lot - some kids develop fast, others plateau
    if (age < 20) {
        if (diff >= 15 && luck > 0.3) {
            change += luck > 0.7 ? 3 : 2;
        } else if (diff >= 8 && luck > 0.4) {
            change += luck > 0.75 ? 2 : 1;
        } else if (diff > 0 && luck > 0.5) {
            change += 1;
        }

        // Performance bonuses (harder to earn)
        if (goals >= 8 && luck > 0.4) change += 1;
        if (assists >= 6 && luck > 0.5) change += 1;
        if (isKeeper && cleanSheets >= 6 && luck > 0.4) change += 1;
        if (contributions >= 18) {
            change += 1;
            player.value.potential += Math.random() > 0.5 ? 1 : 2;
        }
        if (isDeveloper && Math.random() > 0.4) change += 1;

        // Some young players just don't develop much (20% chance of no growth even with potential)
        if (luck < 0.2 && change > 1) change = 1;
    }
    // 20-24: more consistent growth but still variable
    else if (age < 25) {
        if (diff >= 10 && luck > 0.35) {
            change += luck > 0.7 ? 2 : 1;
        } else if (diff >= 5 && luck > 0.45) {
            change += 1;
        } else if (diff > 0 && luck > 0.55) {
            change += 1;
        }

        if (goals >= 12) change += 1;
        if (assists >= 10 && luck > 0.5) change += 1;
        if (isKeeper && cleanSheets >= 10) change += 1;
        if (contributions >= 22) {
            player.value.potential += 1;
        }
        if (isDeveloper && Math.random() > 0.5) change += 1;

        // 15% chance of stagnating season
        if (luck < 0.15 && change > 0) change = 0;
    }
    // 25-29: peak years, small improvements only
    else if (age < 30) {
        if (diff >= 8 && luck > 0.5) {
            change += 1;
        } else if (diff >= 3 && luck > 0.6) {
            change += 1;
        }

        // Only exceptional seasons give boosts
        if (goals >= 18) change += 1;
        if (assists >= 15 && luck > 0.6) change += 1;
        if (isKeeper && cleanSheets >= 15) change += 1;
        if (isDeveloper && diff > 0 && Math.random() > 0.6) change += 1;
    }
    // 30+: decline, but rate varies by player
    else {
        // Some 30+ players maintain, most decline
        const declineChance = age >= 34 ? 0.85 : age >= 32 ? 0.7 : 0.5;

        if (luck < declineChance) {
            change -= 1;
        }
        if (age >= 31 && age < 33) {
            change -= 2;
        }
        if (age >= 33 && Math.random() < 0.75 && age < 36) {
            change -= 3;
        }
        if (age >= 36) {
            change -= 5;
        }

        // Great seasons can offset decline
        if (contributions >= 25 && diff > 0) change += 1;
        if (isKeeper && cleanSheets >= 15) change += 1;
        if (isDeveloper && diff > 0 && Math.random() > 0.6) change += 1;
        player.value.potential -= Math.random() > 0.5 ? 1 : 0;
    }

    player.value.overall += change;

    if (player.value.overall > player.value.potential) {
        player.value.overall = player.value.potential;
    }
    if (player.value.overall > 99) player.value.overall = 99;
    if (player.value.potential > 99) player.value.potential = 99;
    if (player.value.overall < 1) player.value.overall = 1;
    if (player.value.potential < 1) player.value.potential = 1;

    //update training points
    player.value.trainingUpgradePoints = getTrainingPoints(player.value.overall, player.value.potential);
    if (player.value.trainingUpgradePoints < player.value.trainingPoints) {
        player.value.trainingPoints = 0;
        player.value.overall++;
    }
}