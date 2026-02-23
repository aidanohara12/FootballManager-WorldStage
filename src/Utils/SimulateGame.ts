import type { Signal } from "@preact/signals-react";
import type { League, Match, Player, Team } from "../Models/WorldStage";

function positionAvg(players: Player[], position: string): number {
    const group = players?.filter((p: Player) => p.startingTeam && p.position === position);
    if (!group || group.length === 0) return 0;
    return group.map((p: Player) => p.overall).reduce((a: number, b: number) => a + b, 0) / group.length;
}

export function simulateGame(match: Signal<Match>, allTeams: Signal<Team[]>, leagues: Signal<League[]>) {
    const homeTeam = match.value.homeTeam;
    const awayTeam = match.value.awayTeam;

    //get home team info
    const homeTeamForwardAvg = positionAvg(homeTeam.players, "Forward");
    const homeTeamMidfieldAvg = positionAvg(homeTeam.players, "Midfielder");
    const homeTeamDefenderAvg = positionAvg(homeTeam.players, "Defender");
    const homeTeamGoalkeeperAvg = positionAvg(homeTeam.players, "Goalkeeper");
    const homeOverallAvg = (homeTeamForwardAvg + homeTeamMidfieldAvg + homeTeamDefenderAvg + homeTeamGoalkeeperAvg) / 4;
    const isTactitianHome: boolean = homeTeam.manager.type === "Tactitian";
    const homeForm = homeTeam.form.filter((f: string) => f === "W").length;
    let homeTotalPoints = 0;
    let homeWiner = false;

    //get away team info
    const awayTeamForwardAvg = positionAvg(awayTeam.players, "Forward");
    const awayTeamMidfieldAvg = positionAvg(awayTeam.players, "Midfielder");
    const awayTeamDefenderAvg = positionAvg(awayTeam.players, "Defender");
    const awayTeamGoalkeeperAvg = positionAvg(awayTeam.players, "Goalkeeper");
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
        let homeTeamMax = 1;
        if (homeTotalPoints >= 3) {
            homeTeamMax = 2;
        } else if (homeTotalPoints >= 5) {
            homeTeamMax = 3;
        } else if (homeTotalPoints >= 7) {
            homeTeamMax = 4;
        } else if (homeTotalPoints >= 10) {
            homeTeamMax = 5;
        }
        homeTeamScore = Math.floor(Math.random() * (homeTeamMax + 1)) + 1;
        awayTeamScore = Math.floor(Math.random() * homeTeamMax);
    } else if (awayWiner) {
        let awayTeamMax = 1;
        if (awayTotalPoints >= 3) {
            awayTeamMax = 2;
        } else if (awayTotalPoints >= 5) {
            awayTeamMax = 3;
        } else if (awayTotalPoints >= 7) {
            awayTeamMax = 4;
        } else if (awayTotalPoints >= 10) {
            awayTeamMax = 5;
        }
        awayTeamScore = Math.floor(Math.random() * (awayTeamMax + 1)) + 1;
        homeTeamScore = Math.floor(Math.random() * awayTeamMax);
    } else if (draw) {
        homeTeamScore = Math.floor(Math.random() * 6);
        awayTeamScore = homeTeamScore;
    }

    const scorers = calculateScorers(match, homeTeamScore, awayTeamScore);

    match.value = {
        ...match.value,
        homeScore: homeTeamScore,
        awayScore: awayTeamScore,
        homeScorers: scorers.homeScorers,
        awayScorers: scorers.awayScorers,
        homeAssists: scorers.homeAssists,
        awayAssists: scorers.awayAssists,
    };

    console.log(match.value);
}

function calculateScorers(match: Signal<Match>, homeTeamScore: number, awayTeamScore: number): { homeScorers: Player[], awayScorers: Player[], homeAssists: Player[], awayAssists: Player[] } {
    const homeTeam = match.value.homeTeam;
    const awayTeam = match.value.awayTeam;
    const homeTeamStarters = homeTeam.players?.filter((p: Player) => p.startingTeam).sort((a: Player, b: Player) => b.overall - a.overall);
    const awayTeamStarters = awayTeam.players?.filter((p: Player) => p.startingTeam).sort((a: Player, b: Player) => b.overall - a.overall);

    const homeTeamStartingForwards = homeTeamStarters.filter((p: Player) => p.position === "Forward").sort((a: Player, b: Player) => b.overall - a.overall);
    const awayTeamStartingForwards = awayTeamStarters.filter((p: Player) => p.position === "Forward").sort((a: Player, b: Player) => b.overall - a.overall);
    const homeTeamStartingMidfielders = homeTeamStarters.filter((p: Player) => p.position === "Midfielder").sort((a: Player, b: Player) => b.overall - a.overall);
    const awayTeamStartingMidfielders = awayTeamStarters.filter((p: Player) => p.position === "Midfielder").sort((a: Player, b: Player) => b.overall - a.overall);
    const homeTeamStartingDefenders = homeTeamStarters.filter((p: Player) => p.position === "Defender").sort((a: Player, b: Player) => b.overall - a.overall);
    const awayTeamStartingDefenders = awayTeamStarters.filter((p: Player) => p.position === "Defender").sort((a: Player, b: Player) => b.overall - a.overall);

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
            return allEligible[Math.floor(Math.random() * allEligible.length)];
        }
        return eligible[Math.floor(Math.random() * eligible.length)];
    };

    const homeScorers: Player[] = [];
    const homeAssists: Player[] = [];
    const awayScorers: Player[] = [];
    const awayAssists: Player[] = [];

    for (let i = 0; i < homeTeamScore; i++) {
        const rng = Math.random();
        let scorer: Player;
        if (rng < 0.65) {
            const playerRng = Math.random();
            if (playerRng < 0.5) {
                scorer = homeTeamStartingForwards[0];
            } else if (playerRng < 0.75) {
                scorer = homeTeamStartingForwards[1];
            } else {
                scorer = homeTeamStartingForwards[2];
            }
        } else if (rng < 0.95) {
            const playerRng = Math.random();
            if (playerRng < 0.5) {
                scorer = homeTeamStartingMidfielders[0];
            } else if (playerRng < 0.75) {
                scorer = homeTeamStartingMidfielders[1];
            } else {
                scorer = homeTeamStartingMidfielders[2];
            }
        } else {
            const playerRng = Math.random();
            if (playerRng < 0.5) {
                scorer = homeTeamStartingDefenders[0];
            } else if (playerRng < 0.75) {
                scorer = homeTeamStartingDefenders[1];
            } else {
                scorer = homeTeamStartingDefenders[2];
            }
        }
        homeScorers.push(scorer);
        homeAssists.push(getAssister(scorer, homeTeamStartingForwards, homeTeamStartingMidfielders, homeTeamStartingDefenders));
    }

    for (let i = 0; i < awayTeamScore; i++) {
        const rng = Math.random();
        let scorer: Player;
        if (rng < 0.65) {
            const playerRng = Math.random();
            if (playerRng < 0.5) {
                scorer = awayTeamStartingForwards[0];
            } else if (playerRng < 0.75) {
                scorer = awayTeamStartingForwards[1];
            } else {
                scorer = awayTeamStartingForwards[2];
            }
        } else if (rng < 0.95) {
            const playerRng = Math.random();
            if (playerRng < 0.5) {
                scorer = awayTeamStartingMidfielders[0];
            } else if (playerRng < 0.75) {
                scorer = awayTeamStartingMidfielders[1];
            } else {
                scorer = awayTeamStartingMidfielders[2];
            }
        } else {
            const playerRng = Math.random();
            if (playerRng < 0.5) {
                scorer = awayTeamStartingDefenders[0];
            } else if (playerRng < 0.75) {
                scorer = awayTeamStartingDefenders[1];
            } else {
                scorer = awayTeamStartingDefenders[2];
            }
        }
        awayScorers.push(scorer);
        awayAssists.push(getAssister(scorer, awayTeamStartingForwards, awayTeamStartingMidfielders, awayTeamStartingDefenders));
    }

    return { homeScorers, awayScorers, homeAssists, awayAssists };
}