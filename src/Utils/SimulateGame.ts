import type { Signal } from "@preact/signals-react";
import type { Manager, Match, Player, Team } from "../Models/WorldStage";

function getPlayers(team: Team, playersMap: Map<string, Player>): Player[] {
    return team.players.map((name) => playersMap.get(name)!).filter(Boolean);
}

function positionAvg(teamPlayers: Player[], position: string): number {
    const group = teamPlayers?.filter((p: Player) => p.startingTeam && p.position === position);
    if (!group || group.length === 0) return 0;
    return group.map((p: Player) => p.overall).reduce((a: number, b: number) => a + b, 0) / group.length;
}

function autoAssignStarters(team: Team, playersMap: Map<string, Player>): void {
    const players = getPlayers(team, playersMap);
    const hasStarters = players.some((p) => p.startingTeam);
    if (hasStarters) return;

    // Pick best players by position: 3 FW, 3 MF, 4 DF, 1 GK = 11
    const byPos = (pos: string) => players
        .filter((p) => p.position === pos)
        .sort((a, b) => b.overall - a.overall);

    byPos("Forward").slice(0, 3).forEach((p) => p.startingTeam = true);
    byPos("Midfielder").slice(0, 3).forEach((p) => p.startingTeam = true);
    byPos("Defender").slice(0, 4).forEach((p) => p.startingTeam = true);
    byPos("Goalkeeper").slice(0, 1).forEach((p) => p.startingTeam = true);
}

export function simulateGame(match: Signal<Match>, teamsMap: Map<string, Team>, playersMap: Map<string, Player>, manager: Signal<Manager>): void {
    const homeTeam = teamsMap.get(match.value.homeTeamName)!;
    const awayTeam = teamsMap.get(match.value.awayTeamName)!;

    autoAssignStarters(homeTeam, playersMap);
    autoAssignStarters(awayTeam, playersMap);

    const homePlayers = getPlayers(homeTeam, playersMap);
    const awayPlayers = getPlayers(awayTeam, playersMap);

    //get home team info
    const homeTeamForwardAvg = positionAvg(homePlayers, "Forward");
    const homeTeamMidfieldAvg = positionAvg(homePlayers, "Midfielder");
    const homeTeamDefenderAvg = positionAvg(homePlayers, "Defender");
    const homeTeamGoalkeeperAvg = positionAvg(homePlayers, "Goalkeeper");
    const homeOverallAvg = (homeTeamForwardAvg + homeTeamMidfieldAvg + homeTeamDefenderAvg + homeTeamGoalkeeperAvg) / 4;
    const isTactitianHome: boolean = homeTeam.manager.type === "Tactitian";
    const homeForm = homeTeam.form.filter((f: string) => f === "W").length;
    let homeTotalPoints = 0;
    let homeWiner = false;

    //get away team info
    const awayTeamForwardAvg = positionAvg(awayPlayers, "Forward");
    const awayTeamMidfieldAvg = positionAvg(awayPlayers, "Midfielder");
    const awayTeamDefenderAvg = positionAvg(awayPlayers, "Defender");
    const awayTeamGoalkeeperAvg = positionAvg(awayPlayers, "Goalkeeper");
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
        awayTotalPoints++;
    } else if (isTactitianHome) {
        homeTotalPoints++;
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

    if (homeWiner) {
        homeTeam.wins++;
        awayTeam.losses++;
        homeTeam.manager.careerWins++;
        awayTeam.manager.careerLosses++;
        if (homeTeam.form.length >= 5) homeTeam.form.shift();
        homeTeam.form.push("W");
        if (awayTeam.form.length >= 5) awayTeam.form.shift();
        awayTeam.form.push("L");
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
        homeTeam.losses++;
        awayTeam.wins++;
        if (homeTeam.form.length >= 5) homeTeam.form.shift();
        homeTeam.form.push("L");
        if (awayTeam.form.length >= 5) awayTeam.form.shift();
        awayTeam.form.push("W");
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
        homeTeam.draws++;
        awayTeam.draws++;
        homeTeam.manager.careerDraws++;
        awayTeam.manager.careerDraws++;
        if (homeTeam.form.length >= 5) homeTeam.form.shift();
        homeTeam.form.push("D");
        if (awayTeam.form.length >= 5) awayTeam.form.shift();
        awayTeam.form.push("D");
        homeTeamScore = Math.floor(Math.random() * 6);
        awayTeamScore = homeTeamScore;
    }

    const isLeague = match.value.isLeagueMatch;
    const scorers = calculateScorers(homePlayers, awayPlayers, homeTeamScore, awayTeamScore, isLeague);

    // Update team goals for/against
    homeTeam.goalsFor += homeTeamScore;
    homeTeam.goalsAgainst += awayTeamScore;
    awayTeam.goalsFor += awayTeamScore;
    awayTeam.goalsAgainst += homeTeamScore;

    // Update team points
    if (homeWiner) {
        homeTeam.points += 3;
    } else if (awayWiner) {
        awayTeam.points += 3;
    } else if (draw) {
        homeTeam.points += 1;
        awayTeam.points += 1;
    }

    // Update goalkeeper clean sheets
    if (awayTeamScore === 0) {
        const homeGK = homePlayers.find((p: Player) => p.startingTeam && p.position === "Goalkeeper");
        if (homeGK) homeGK.cleanSheets++;
    }
    if (homeTeamScore === 0) {
        const awayGK = awayPlayers.find((p: Player) => p.startingTeam && p.position === "Goalkeeper");
        if (awayGK) awayGK.cleanSheets++;
    }

    // Mutate the original match object in-place so Schedule arrays stay in sync
    const m = match.value;
    m.homeScore = homeTeamScore;
    m.awayScore = awayTeamScore;
    m.homeScorers = scorers.homeScorers;
    m.awayScorers = scorers.awayScorers;
    m.homeAssists = scorers.homeAssists;
    m.awayAssists = scorers.awayAssists;

    // Also trigger signal update for any signal subscribers
    match.value = { ...m };
}

function generateMinute(usedMinutes: Set<number>): string {
    let minute = Math.floor(Math.random() * 90) + 1;
    // Avoid duplicate exact minutes
    while (usedMinutes.has(minute)) minute++;
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

function calculateScorers(homePlayers: Player[], awayPlayers: Player[], homeTeamScore: number, awayTeamScore: number, isLeague: boolean): { homeScorers: [string, string][], awayScorers: [string, string][], homeAssists: [string, string][], awayAssists: [string, string][] } {
    const homeTeamStarters = homePlayers.filter((p: Player) => p.startingTeam).sort((a: Player, b: Player) => b.overall - a.overall);
    const awayTeamStarters = awayPlayers.filter((p: Player) => p.startingTeam).sort((a: Player, b: Player) => b.overall - a.overall);

    const homeTeamStartingForwards = homeTeamStarters.filter((p: Player) => p.position === "Forward").sort((a: Player, b: Player) => b.overall - a.overall);
    const awayTeamStartingForwards = awayTeamStarters.filter((p: Player) => p.position === "Forward").sort((a: Player, b: Player) => b.overall - a.overall);
    const homeTeamStartingMidfielders = homeTeamStarters.filter((p: Player) => p.position === "Midfielder").sort((a: Player, b: Player) => b.overall - a.overall);
    const awayTeamStartingMidfielders = awayTeamStarters.filter((p: Player) => p.position === "Midfielder").sort((a: Player, b: Player) => b.overall - a.overall);
    const homeTeamStartingDefenders = homeTeamStarters.filter((p: Player) => p.position === "Defender").sort((a: Player, b: Player) => b.overall - a.overall);
    const awayTeamStartingDefenders = awayTeamStarters.filter((p: Player) => p.position === "Defender").sort((a: Player, b: Player) => b.overall - a.overall);

    const pickFromGroup = (group: Player[], fallbackStarters: Player[]): Player => {
        if (group.length === 0) return fallbackStarters[0]; // fallback to correct team
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
            scorer = pickFromGroup(homeTeamStartingForwards, homeTeamStarters);
        } else if (rng < 0.95) {
            scorer = pickFromGroup(homeTeamStartingMidfielders, homeTeamStarters);
        } else {
            scorer = pickFromGroup(homeTeamStartingDefenders, homeTeamStarters);
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
            scorer = pickFromGroup(awayTeamStartingForwards, awayTeamStarters);
        } else if (rng < 0.95) {
            scorer = pickFromGroup(awayTeamStartingMidfielders, awayTeamStarters);
        } else {
            scorer = pickFromGroup(awayTeamStartingDefenders, awayTeamStarters);
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
