import type { Signal } from "@preact/signals-react";
import type { Manager, Match, Player, Team } from "../Models/WorldStage";
import { Top50Countries } from "../Models/Countries";

function getPlayerOverallWithStamina(player: Player): number {
    if (player.stamina > 40) return player.overall;
    if (player.stamina > 30) return player.overall - 1;
    if (player.stamina > 20) return player.overall - 2;
    if (player.stamina > 10) return player.overall - 3;
    return player.overall - 4;
}

function getPlayers(team: Team, playersMap: Map<string, Player>): Player[] {
    return team.players.map((name) => playersMap.get(name)!).filter(Boolean);
}

function positionAvg(teamPlayers: Player[], position: string, isNational: boolean): number {
    const group = teamPlayers?.filter((p: Player) =>
        (isNational ? p.startingNational : p.startingTeam) && p.position === position
    );
    if (!group || group.length === 0) return 0;
    return group.map((p: Player) => getPlayerOverallWithStamina(p)).reduce((a: number, b: number) => a + b, 0) / group.length;
}

// Sub in the next best non-injured, non-starting player for each injured starter
function subInjuredStarters(team: Team, playersMap: Map<string, Player>, isNational: boolean): void {
    const players = getPlayers(team, playersMap);
    const startingKey = isNational ? 'startingNational' : 'startingTeam';
    const injuredStarters = players.filter(p => p[startingKey] && p.injured);

    for (const injured of injuredStarters) {
        injured[startingKey] = false;
        // Find the best available replacement at the same position
        const replacement = players
            .filter(p => !p[startingKey] && !p.injured && p.position === injured.position)
            .sort((a, b) => b.overall - a.overall)[0];
        if (replacement) {
            replacement[startingKey] = true;
        }
    }
}

// After a game, decrement gamesInjured for all players on both teams and recover if 0
function updateInjuryStatus(team: Team, playersMap: Map<string, Player>): void {
    const players = getPlayers(team, playersMap);
    for (const player of players) {
        if (player.injured && player.gamesInjured > 0) {
            player.gamesInjured--;
            if (player.gamesInjured <= 0) {
                player.injured = false;
                player.gamesInjured = 0;
            }
        }
    }
}

export function simulateGame(match: Signal<Match>, teamsMap: Map<string, Team>, playersMap: Map<string, Player>, manager: Signal<Manager>): void {
    const homeTeam = teamsMap.get(match.value.homeTeamName)!;
    const awayTeam = teamsMap.get(match.value.awayTeamName)!;

    const isNational: boolean = Top50Countries.some(c => c.country === homeTeam.name);

    subInjuredStarters(homeTeam, playersMap, isNational);
    subInjuredStarters(awayTeam, playersMap, isNational);

    const homePlayers = getPlayers(homeTeam, playersMap);
    const awayPlayers = getPlayers(awayTeam, playersMap);

    //get home team info
    const homeTeamForwardAvg = positionAvg(homePlayers, "Forward", isNational);
    const homeTeamMidfieldAvg = positionAvg(homePlayers, "Midfielder", isNational);
    const homeTeamDefenderAvg = positionAvg(homePlayers, "Defender", isNational);
    const homeTeamGoalkeeperAvg = positionAvg(homePlayers, "Goalkeeper", isNational);
    const homeOverallAvg = (homeTeamForwardAvg + homeTeamMidfieldAvg + homeTeamDefenderAvg + homeTeamGoalkeeperAvg) / 4;
    const isTactitianHome: boolean = homeTeam.manager.type === "Tactitian";
    const homeForm = homeTeam.form.filter((f: string) => f === "W").length;
    let homeTotalPoints = 0;
    let homeWiner = false;

    //get away team info
    const awayTeamForwardAvg = positionAvg(awayPlayers, "Forward", isNational);
    const awayTeamMidfieldAvg = positionAvg(awayPlayers, "Midfielder", isNational);
    const awayTeamDefenderAvg = positionAvg(awayPlayers, "Defender", isNational);
    const awayTeamGoalkeeperAvg = positionAvg(awayPlayers, "Goalkeeper", isNational);
    const awayOverallAvg = (awayTeamForwardAvg + awayTeamMidfieldAvg + awayTeamDefenderAvg + awayTeamGoalkeeperAvg) / 4;
    const isTactitianAway: boolean = awayTeam.manager.type === "Tactitian";
    const awayForm = awayTeam.form.filter((f: string) => f === "W").length;
    let awayTotalPoints = 0;
    let awayWiner = false;

    //draw
    let draw = false;

    const totalOverallDiff = Math.abs(homeOverallAvg - awayOverallAvg);

    //compare the two teams
    if (isTactitianAway) {
        awayTotalPoints += 3;
    } else if (isTactitianHome) {
        homeTotalPoints += 3;
    }

    if (homeOverallAvg > awayOverallAvg) {
        homeTotalPoints++;
        if (totalOverallDiff >= 3) {
            homeTotalPoints++;
        } else if (totalOverallDiff >= 5) {
            homeTotalPoints = homeTotalPoints + 2;
        } else if (totalOverallDiff >= 7) {
            homeTotalPoints = homeTotalPoints + 3;
        }
    } else if (homeOverallAvg < awayOverallAvg) {
        awayTotalPoints++;
        if (totalOverallDiff >= 3) {
            awayTotalPoints++;
        } else if (totalOverallDiff >= 5) {
            awayTotalPoints = awayTotalPoints + 2;
        } else if (totalOverallDiff >= 7) {
            awayTotalPoints = awayTotalPoints + 3;
        }
    } else {
        homeTotalPoints++;
    }

    if (homeForm > 3) {
        homeTotalPoints++;
    } else if (awayForm > 3) {
        awayTotalPoints++;
    }

    if (homeTeamForwardAvg > awayTeamDefenderAvg) {
        homeTotalPoints++;
    } else if (homeTeamForwardAvg < awayTeamDefenderAvg) {
        awayTotalPoints++;
    }

    if (awayTeamForwardAvg > homeTeamDefenderAvg) {
        awayTotalPoints++;
    } else if (awayTeamForwardAvg < homeTeamDefenderAvg) {
        homeTotalPoints++;
    }

    if (homeTeamMidfieldAvg > awayTeamMidfieldAvg) {
        homeTotalPoints++;
    } else if (homeTeamMidfieldAvg < awayTeamMidfieldAvg) {
        awayTotalPoints++;
    }

    if (homeTeamGoalkeeperAvg >= 90) {
        homeTotalPoints++;
    } else if (homeTeamGoalkeeperAvg < 70) {
        awayTotalPoints++;
    }

    if (awayTeamGoalkeeperAvg >= 90) {
        awayTotalPoints++;
    } else if (awayTeamGoalkeeperAvg < 70) {
        homeTotalPoints++;
    }

    const totalPoints = homeTotalPoints + awayTotalPoints;

    // Draw chance: closer the teams are in points, higher the draw chance
    const pointDiff = Math.abs(homeTotalPoints - awayTotalPoints);
    let drawChance = 0.25; // 25% base draw chance
    if (pointDiff <= 1) drawChance = 0.35;
    else if (pointDiff >= 4) drawChance = 0.10;

    const drawRng = Math.random();
    if (drawRng < drawChance) {
        draw = true;
    } else {
        const rng = Math.floor(Math.random() * totalPoints) + 1;
        if (rng <= homeTotalPoints) {
            homeWiner = true;
        } else {
            awayWiner = true;
        }
    }

    let homeTeamScore = 0;
    let awayTeamScore = 0;

    const isLeague = match.value.isLeagueMatch;

    if (homeWiner) {
        if (isLeague) {
            homeTeam.wins++;
            awayTeam.losses++;
            if (homeTeam.form.length >= 5) homeTeam.form.shift();
            homeTeam.form.push("W");
            if (awayTeam.form.length >= 5) awayTeam.form.shift();
            awayTeam.form.push("L");
        }
        homeTeam.manager.careerWins++;
        awayTeam.manager.careerLosses++;
        if (homeTeam.name === manager.value.team) {
            manager.value.careerWins++;
        }
        if (awayTeam.name === manager.value.team) {
            manager.value.careerLosses++;
        }
        let homeTeamMax = 1;
        if (homeTotalPoints >= 10) {
            homeTeamMax = 5;
        } else if (homeTotalPoints >= 7) {
            homeTeamMax = 4;
        } else if (homeTotalPoints >= 5) {
            homeTeamMax = 3;
        } else if (homeTotalPoints >= 3) {
            homeTeamMax = 2;
        }
        homeTeamScore = Math.floor(Math.random() * (homeTeamMax + 1)) + 1;
        awayTeamScore = Math.floor(Math.random() * homeTeamScore);
    } else if (awayWiner) {
        if (isLeague) {
            homeTeam.losses++;
            awayTeam.wins++;
            if (homeTeam.form.length >= 5) homeTeam.form.shift();
            homeTeam.form.push("L");
            if (awayTeam.form.length >= 5) awayTeam.form.shift();
            awayTeam.form.push("W");
        }
        if (homeTeam.name === manager.value.team) {
            manager.value.careerLosses++;
        }
        if (awayTeam.name === manager.value.team) {
            manager.value.careerWins++;
        }
        awayTeam.manager.careerWins++;
        homeTeam.manager.careerLosses++;
        let awayTeamMax = 1;
        if (awayTotalPoints >= 10) {
            awayTeamMax = 5;
        } else if (awayTotalPoints >= 7) {
            awayTeamMax = 4;
        } else if (awayTotalPoints >= 5) {
            awayTeamMax = 3;
        } else if (awayTotalPoints >= 3) {
            awayTeamMax = 2;
        }
        awayTeamScore = Math.floor(Math.random() * (awayTeamMax + 1)) + 1;
        homeTeamScore = Math.floor(Math.random() * awayTeamScore);
    } else if (draw) {
        if (isLeague) {
            homeTeam.draws++;
            awayTeam.draws++;
            if (homeTeam.form.length >= 5) homeTeam.form.shift();
            homeTeam.form.push("D");
            if (awayTeam.form.length >= 5) awayTeam.form.shift();
            awayTeam.form.push("D");
        }
        homeTeam.manager.careerDraws++;
        awayTeam.manager.careerDraws++;
        if (homeTeam.name === manager.value.team) {
            manager.value.careerDraws++;
        }
        if (awayTeam.name === manager.value.team) {
            manager.value.careerDraws++;
        }
        // Weighted draw scores: 0-0 and 1-1 most common, 4-4+ very rare
        const drawRoll = Math.random();
        if (drawRoll < 0.25) homeTeamScore = 0;
        else if (drawRoll < 0.55) homeTeamScore = 1;
        else if (drawRoll < 0.80) homeTeamScore = 2;
        else if (drawRoll < 0.93) homeTeamScore = 3;
        else if (drawRoll < 0.98) homeTeamScore = 4;
        else homeTeamScore = 5;
        awayTeamScore = homeTeamScore;
    }

    const scorers = calculateScorers(homePlayers, awayPlayers, homeTeamScore, awayTeamScore, isLeague, isNational);

    // Update team goals for/against (league only)
    if (isLeague) {
        homeTeam.goalsFor += homeTeamScore;
        homeTeam.goalsAgainst += awayTeamScore;
        awayTeam.goalsFor += awayTeamScore;
        awayTeam.goalsAgainst += homeTeamScore;
    }

    // Update team points (league only)
    if (isLeague) {
        if (homeWiner) {
            homeTeam.points += 3;
        } else if (awayWiner) {
            awayTeam.points += 3;
        } else if (draw) {
            homeTeam.points += 1;
            awayTeam.points += 1;
        }
    }

    // Update goalkeeper clean sheets (league only)
    if (isLeague) {
        if (awayTeamScore === 0) {
            const homeGK = homePlayers.find((p: Player) => p.startingTeam && p.position === "Goalkeeper");
            if (homeGK) homeGK.cleanSheets++;
        }
        if (homeTeamScore === 0) {
            const awayGK = awayPlayers.find((p: Player) => p.startingTeam && p.position === "Goalkeeper");
            if (awayGK) awayGK.cleanSheets++;
        }
    }

    // Mutate the original match object in-place so Schedule arrays stay in sync
    const m = match.value;
    m.homeScore = homeTeamScore;
    m.awayScore = awayTeamScore;
    m.homeScorers = scorers.homeScorers;
    m.awayScorers = scorers.awayScorers;
    m.homeAssists = scorers.homeAssists;
    m.awayAssists = scorers.awayAssists;

    // Decrement injury counters for both teams after the game
    updateInjuryStatus(homeTeam, playersMap);
    updateInjuryStatus(awayTeam, playersMap);

    // Also trigger signal update for any signal subscribers
    match.value = { ...m };
}

function generateMinute(usedMinutes: Set<number>): string {
    let minute = Math.floor(Math.random() * 90) + 1;
    // Avoid duplicate exact minutes
    while (usedMinutes.has(minute)) minute += 3; // shift by 2 minutes to reduce chance of another conflict, ensures goals aren't within 1 minute of each other
    usedMinutes.add(minute);

    // Add stoppage time for goals at 45 or 90
    if (minute === 45) {
        const stoppage = Math.floor(Math.random() * 5) + 1;
        return `45+${stoppage}`;
    }
    if (minute >= 90) {
        const stoppage = Math.floor(Math.random() * 6) + 1;
        return `90+${stoppage}`;
    }
    return `${minute}`;
}

function calculateScorers(homePlayers: Player[], awayPlayers: Player[], homeTeamScore: number, awayTeamScore: number, isLeague: boolean, isNational: boolean): { homeScorers: [string, string][], awayScorers: [string, string][], homeAssists: [string, string][], awayAssists: [string, string][] } {
    const startingKey = isNational ? 'startingNational' : 'startingTeam';
    // Use starters if available, otherwise fall back to full roster sorted by overall
    const homeTeamStarters = homePlayers.filter((p: Player) => p[startingKey]).sort((a: Player, b: Player) => b.overall - a.overall);
    const awayTeamStarters = awayPlayers.filter((p: Player) => p[startingKey]).sort((a: Player, b: Player) => b.overall - a.overall);
    const homeFallback = homeTeamStarters.length > 0 ? homeTeamStarters : [...homePlayers].sort((a, b) => b.overall - a.overall);
    const awayFallback = awayTeamStarters.length > 0 ? awayTeamStarters : [...awayPlayers].sort((a, b) => b.overall - a.overall);

    const homeTeamStartingForwards = homeFallback.filter((p: Player) => p.position === "Forward").sort((a: Player, b: Player) => b.overall - a.overall);
    const awayTeamStartingForwards = awayFallback.filter((p: Player) => p.position === "Forward").sort((a: Player, b: Player) => b.overall - a.overall);
    const homeTeamStartingMidfielders = homeFallback.filter((p: Player) => p.position === "Midfielder").sort((a: Player, b: Player) => b.overall - a.overall);
    const awayTeamStartingMidfielders = awayFallback.filter((p: Player) => p.position === "Midfielder").sort((a: Player, b: Player) => b.overall - a.overall);
    const homeTeamStartingDefenders = homeFallback.filter((p: Player) => p.position === "Defender").sort((a: Player, b: Player) => b.overall - a.overall);
    const awayTeamStartingDefenders = awayFallback.filter((p: Player) => p.position === "Defender").sort((a: Player, b: Player) => b.overall - a.overall);

    const pickFromGroup = (group: Player[], fallbackStarters: Player[]): Player => {
        if (group.length === 0) {
            if (fallbackStarters.length > 0) return fallbackStarters[0];
            return homePlayers[0] ?? awayPlayers[0]; // ultimate fallback
        }
        const rng = Math.random();
        if (rng < 0.5) return group[0];
        if (rng < 0.75) return group[Math.min(1, group.length - 1)];
        return group[Math.min(2, group.length - 1)];
    };

    const getAssister = (scorer: Player, forwards: Player[], midfielders: Player[], defenders: Player[]): Player => {
        const assistRng = Math.random();
        let assistPool: Player[];
        if (assistRng < 0.5) {
            assistPool = midfielders;
        } else if (assistRng < 0.9) {
            assistPool = forwards;
        } else {
            assistPool = defenders;
        }
        const eligible = assistPool.filter((p: Player) => p.name !== scorer.name);
        if (eligible.length === 0) {
            const allEligible = [...forwards, ...midfielders, ...defenders].filter((p: Player) => p.name !== scorer.name);
            if (allEligible.length === 0) return scorer;
            return allEligible[Math.floor(Math.random() * allEligible.length)];
        }
        return eligible[Math.floor(Math.random() * eligible.length)];
    };

    const usedMinutes = new Set<number>();
    const homeScorers: [string, string][] = [];
    const homeAssists: [string, string][] = [];
    const awayScorers: [string, string][] = [];
    const awayAssists: [string, string][] = [];

    for (let i = 0; i < homeTeamScore; i++) {
        const rng = Math.random();
        let scorer: Player;
        if (rng < 0.65) {
            scorer = pickFromGroup(homeTeamStartingForwards, homeFallback);
        } else if (rng < 0.95) {
            scorer = pickFromGroup(homeTeamStartingMidfielders, homeFallback);
        } else {
            scorer = pickFromGroup(homeTeamStartingDefenders, homeFallback);
        }
        scorer.totalGoals++;
        if (isLeague) scorer.leagueGoals++;
        else scorer.countryGoals++;

        const assister = getAssister(scorer, homeTeamStartingForwards, homeTeamStartingMidfielders, homeTeamStartingDefenders);
        assister.totalAssists++;
        if (isLeague) assister.leagueAssists++;
        else assister.countryAssists++;

        const minute = generateMinute(usedMinutes);
        homeScorers.push([scorer.name, minute]);
        homeAssists.push([assister.name, minute]);
    }

    for (let i = 0; i < awayTeamScore; i++) {
        const rng = Math.random();
        let scorer: Player;
        if (rng < 0.65) {
            scorer = pickFromGroup(awayTeamStartingForwards, awayFallback);
        } else if (rng < 0.95) {
            scorer = pickFromGroup(awayTeamStartingMidfielders, awayFallback);
        } else {
            scorer = pickFromGroup(awayTeamStartingDefenders, awayFallback);
        }
        scorer.totalGoals++;
        if (isLeague) scorer.leagueGoals++;
        else scorer.countryGoals++;

        const assister = getAssister(scorer, awayTeamStartingForwards, awayTeamStartingMidfielders, awayTeamStartingDefenders);
        assister.totalAssists++;
        if (isLeague) assister.leagueAssists++;
        else assister.countryAssists++;

        const minute = generateMinute(usedMinutes);
        awayScorers.push([scorer.name, minute]);
        awayAssists.push([assister.name, minute]);
    }

    // Sort by minute
    const parseMinute = (m: string) => {
        const parts = m.split("+");
        return parseInt(parts[0]) + (parts[1] ? parseInt(parts[1]) * 0.1 : 0);
    };
    homeScorers.sort((a, b) => parseMinute(a[1]) - parseMinute(b[1]));
    homeAssists.sort((a, b) => parseMinute(a[1]) - parseMinute(b[1]));
    awayScorers.sort((a, b) => parseMinute(a[1]) - parseMinute(b[1]));
    awayAssists.sort((a, b) => parseMinute(a[1]) - parseMinute(b[1]));

    return { homeScorers, awayScorers, homeAssists, awayAssists };
}
