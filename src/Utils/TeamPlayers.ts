import type { Signal } from "@preact/signals-react";
import type { NationalTeam, Player, Team } from "../Models/WorldStage";
import { Top50Countries } from "../Models/Countries.ts";
import { firstNames } from "../Models/Names/FirstNames";
import { lastNames } from "../Models/Names/LastNames";

const topLeagues = ["Premier League", "La Liga", "Serie A", "Bundesliga", "Ligue 1", "Eredivisie", "Primeira Liga"];

export function getTeamPlayers(playerNames: string[], playersMap: Signal<Map<string, Player>>): Player[] {
    return playerNames.map((name) => playersMap.value.get(name)!).filter(Boolean);
}

export function setNationalTeamStartingPlayers(nationalTeams: Signal<NationalTeam[]>, playersMap: Signal<Map<string, Player>>) {
    nationalTeams.value.forEach((nt) => {
        const players = getTeamPlayers(nt.team.players, playersMap);
        players.forEach((p) => p.startingNational = false);

        players
            .filter((p) => p.position === "Forward")
            .sort((a, b) => b.overall - a.overall)
            .slice(0, 3)
            .forEach((p) => p.startingNational = true);

        players
            .filter((p) => p.position === "Midfielder")
            .sort((a, b) => b.overall - a.overall)
            .slice(0, 3)
            .forEach((p) => p.startingNational = true);

        players
            .filter((p) => p.position === "Defender")
            .sort((a, b) => b.overall - a.overall)
            .slice(0, 4)
            .forEach((p) => p.startingNational = true);

        players
            .filter((p) => p.position === "Goalkeeper")
            .sort((a, b) => b.overall - a.overall)
            .slice(0, 1)
            .forEach((p) => p.startingNational = true);
    });
    nationalTeams.value = [...nationalTeams.value];
}

export function getTeamPlayersClub(team: Team, playersMap: Signal<Map<string, Player>>): Player[] {
    return team.players.map((name) => playersMap.value.get(name)!).filter(Boolean);
}

export function setTeamStartingPlayers(teamsMap: Signal<Map<string, Team>>, playersMap: Signal<Map<string, Player>>) {
    teamsMap.value.forEach((team) => {
        const players = getTeamPlayersClub(team, playersMap);

        players.forEach((p) => p.startingTeam = false);

        players
            .filter((p) => p.position === "Forward")
            .sort((a, b) => b.overall - a.overall)
            .slice(0, 3)
            .forEach((p) => p.startingTeam = true);

        players
            .filter((p) => p.position === "Midfielder")
            .sort((a, b) => b.overall - a.overall)
            .slice(0, 3)
            .forEach((p) => p.startingTeam = true);

        players
            .filter((p) => p.position === "Defender")
            .sort((a, b) => b.overall - a.overall)
            .slice(0, 4)
            .forEach((p) => p.startingTeam = true);

        players
            .filter((p) => p.position === "Goalkeeper")
            .sort((a, b) => b.overall - a.overall)
            .slice(0, 1)
            .forEach((p) => p.startingTeam = true);
    });

    teamsMap.value = new Map(teamsMap.value);
    playersMap.value = new Map(playersMap.value);
}

export function getRandomPlayerName() {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    return `${firstName} ${lastName}`;
}

export function createLowerLevelPlayer(position: string, team: string, countryName?: string): Player {
    const age = Math.floor(Math.random() * (35 - 15 + 1)) + 15;

    // Select country first to determine overall rating bias
    const countryIndex = Math.floor(Math.random() * Top50Countries.length);
    const country = countryName || Top50Countries[countryIndex].country;

    // Players from different country tiers get different rating distributions
    const chanceOfBetterPlayer = Math.floor(Math.random() * 10) + 1;
    let overall: number;

    // Determine country tier
    let countryTier: 'top10' | 'decent' | 'alright';
    if (countryIndex < 10) {
        countryTier = 'top10';
    } else if (countryIndex < 30) {
        countryTier = 'decent';
    } else {
        countryTier = 'alright';
    }

    // Base overall calculation considering country tier and age
    if (countryTier === 'top10') {
        // TOP 10 COUNTRIES - Best players
        if (age >= 15 && age <= 20) {
            // Young players: still developing
            if (chanceOfBetterPlayer >= 9) {
                overall = Math.floor(Math.random() * (80 - 70 + 1)) + 70; // 10% chance: exceptional young talent
            } else if (chanceOfBetterPlayer >= 5) {
                overall = Math.floor(Math.random() * (73 - 68 + 1)) + 68; // 40% chance: promising
            } else {
                overall = Math.floor(Math.random() * (68 - 60 + 1)) + 60; // 50% chance: developing
            }
        } else if (age >= 21 && age <= 27) {
            // Prime development years
            if (chanceOfBetterPlayer >= 8) {
                overall = Math.floor(Math.random() * (88 - 84 + 1)) + 84; // 20% chance: world class
            } else if (chanceOfBetterPlayer >= 4) {
                overall = Math.floor(Math.random() * (80 - 74 + 1)) + 74; // 40% chance: good
            } else {
                overall = Math.floor(Math.random() * (73 - 66 + 1)) + 66; // 40% chance: average
            }
        } else {
            // 28-35: mostly solid/declining
            if (chanceOfBetterPlayer >= 9) {
                overall = Math.floor(Math.random() * (83 - 80 + 1)) + 80; // 10% chance: still elite
            } else if (chanceOfBetterPlayer >= 4) {
                overall = Math.floor(Math.random() * (75 - 70 + 1)) + 70; // 50% chance: solid veteran
            } else {
                overall = Math.floor(Math.random() * (72 - 62 + 1)) + 62; // 40% chance: declining
            }
        }
    } else if (countryTier === 'decent') {
        // COUNTRIES 11-30 - Decent players
        if (age >= 15 && age <= 20) {
            // Young players: still developing
            if (chanceOfBetterPlayer >= 9) {
                overall = Math.floor(Math.random() * (76 - 72 + 1)) + 72; // 10% chance: promising
            } else if (chanceOfBetterPlayer >= 6) {
                overall = Math.floor(Math.random() * (71 - 64 + 1)) + 64; // 30% chance: developing
            } else {
                overall = Math.floor(Math.random() * (66 - 56 + 1)) + 56; // 60% chance: raw
            }
        } else if (age >= 21 && age <= 27) {
            // Prime development years
            if (chanceOfBetterPlayer >= 9) {
                overall = Math.floor(Math.random() * (83 - 80 + 1)) + 80; // 10% chance: excellent
            } else if (chanceOfBetterPlayer >= 5) {
                overall = Math.floor(Math.random() * (76 - 70 + 1)) + 70; // 40% chance: good
            } else {
                overall = Math.floor(Math.random() * (72 - 62 + 1)) + 62; // 50% chance: average
            }
        } else {
            // 28-35: mostly basic/declining
            if (chanceOfBetterPlayer >= 9) {
                overall = Math.floor(Math.random() * (80 - 74 + 1)) + 74; // 10% chance: decent veteran
            } else if (chanceOfBetterPlayer >= 5) {
                overall = Math.floor(Math.random() * (76 - 66 + 1)) + 66; // 40% chance: average veteran
            } else {
                overall = Math.floor(Math.random() * (68 - 58 + 1)) + 58; // 50% chance: declining
            }
        }
    } else {
        // COUNTRIES 31-50 - Alright players
        if (age >= 15 && age <= 20) {
            // Young players: still developing
            if (chanceOfBetterPlayer >= 9) {
                overall = Math.floor(Math.random() * (74 - 68 + 1)) + 68; // 10% chance: decent prospect
            } else if (chanceOfBetterPlayer >= 6) {
                overall = Math.floor(Math.random() * (70 - 60 + 1)) + 60; // 30% chance: developing
            } else {
                overall = Math.floor(Math.random() * (62 - 52 + 1)) + 52; // 60% chance: raw
            }
        } else if (age >= 21 && age <= 27) {
            // Prime development years
            if (chanceOfBetterPlayer >= 9) {
                overall = Math.floor(Math.random() * (81 - 76 + 1)) + 76; // 10% chance: good
            } else if (chanceOfBetterPlayer >= 5) {
                overall = Math.floor(Math.random() * (78 - 66 + 1)) + 66; // 40% chance: decent
            } else {
                overall = Math.floor(Math.random() * (68 - 58 + 1)) + 58; // 50% chance: average
            }
        } else {
            // 28-35: mostly basic/declining
            if (chanceOfBetterPlayer >= 9) {
                overall = Math.floor(Math.random() * (80 - 70 + 1)) + 70; // 10% chance: decent veteran
            } else if (chanceOfBetterPlayer >= 5) {
                overall = Math.floor(Math.random() * (72 - 62 + 1)) + 62; // 40% chance: average veteran
            } else {
                overall = Math.floor(Math.random() * (64 - 54 + 1)) + 54; // 50% chance: declining
            }
        }
    }

    let potential: number;

    if (age <= 21) {
        // Young players have high potential growth
        potential = overall + Math.floor(Math.random() * (25 - 10 + 1)) + 10;
    } else if (age <= 25) {
        // Players in their early-mid 20s still have good growth potential
        potential = overall + Math.floor(Math.random() * (15 - 5 + 1)) + 5;
    } else if (age <= 28) {
        // Players approaching their prime, smaller growth
        potential = overall + Math.floor(Math.random() * (6 - 2 + 1)) + 2;
    } else if (age <= 30) {
        // Prime age players, potential close to current overall
        potential = overall + Math.floor(Math.random() * (2 - 0 + 1)) + 0;
    } else {
        // Older players, potential equals or slightly lower than current
        potential = Math.max(overall, overall - Math.floor(Math.random() * 3));
    }

    // Ensure potential never exceeds 99
    potential = Math.min(99, potential);

    // Calculate value using exponential growth: best players ~25M, <80 overall very cheap
    const calculatedValue = Math.pow((overall - 50) / 10, 3) * 0.35;
    const playerValue = Math.max(0.1, calculatedValue);

    const player: Player = {
        name: getRandomPlayerName(),
        position: position,
        overall: overall,
        potential: potential,
        country: country,
        team: team,
        age: age,
        value: playerValue,
        contractYrs: 4,
        contractAmount: playerValue,
        startingNational: false,
        startingTeam: false,
        newPlayer: false,
        leagueGoals: 0,
        leagueAssists: 0,
        countryGoals: 0,
        countryAssists: 0,
        cleanSheets: 0,
        totalGoals: 0,
        totalAssists: 0,
        awards: 0,
        trophies: 0
    };
    return player;
}

export function createRandomPlayer(position: string, team: string, countryName?: string): Player {
    const age = Math.floor(Math.random() * (35 - 15 + 1)) + 15;

    // Select country first to determine overall rating bias
    const countryIndex = Math.floor(Math.random() * Top50Countries.length);
    const country = countryName || Top50Countries[countryIndex].country;

    // Players from different country tiers get different rating distributions
    const chanceOfBetterPlayer = Math.floor(Math.random() * 10) + 1;
    let overall: number;

    // Determine country tier
    let countryTier: 'top10' | 'decent' | 'alright';
    if (countryIndex < 10) {
        countryTier = 'top10';
    } else if (countryIndex < 30) {
        countryTier = 'decent';
    } else {
        countryTier = 'alright';
    }

    // Base overall calculation considering country tier and age
    if (countryTier === 'top10') {
        // TOP 10 COUNTRIES - Best players
        if (age >= 15 && age <= 20) {
            // Young players: still developing
            if (chanceOfBetterPlayer >= 9) {
                overall = Math.floor(Math.random() * (86 - 76 + 1)) + 76; // 10% chance: exceptional young talent
            } else if (chanceOfBetterPlayer >= 5) {
                overall = Math.floor(Math.random() * (78 - 68 + 1)) + 68; // 40% chance: promising
            } else {
                overall = Math.floor(Math.random() * (70 - 60 + 1)) + 60; // 50% chance: developing
            }
        } else if (age >= 21 && age <= 27) {
            // Prime development years
            if (chanceOfBetterPlayer >= 8) {
                overall = Math.floor(Math.random() * (92 - 84 + 1)) + 84; // 20% chance: world class
            } else if (chanceOfBetterPlayer >= 4) {
                overall = Math.floor(Math.random() * (84 - 74 + 1)) + 74; // 40% chance: good
            } else {
                overall = Math.floor(Math.random() * (76 - 66 + 1)) + 66; // 40% chance: average
            }
        } else {
            // 28-35: mostly solid/declining
            if (chanceOfBetterPlayer >= 9) {
                overall = Math.floor(Math.random() * (88 - 80 + 1)) + 80; // 10% chance: still elite
            } else if (chanceOfBetterPlayer >= 4) {
                overall = Math.floor(Math.random() * (80 - 70 + 1)) + 70; // 50% chance: solid veteran
            } else {
                overall = Math.floor(Math.random() * (72 - 62 + 1)) + 62; // 40% chance: declining
            }
        }
    } else if (countryTier === 'decent') {
        // COUNTRIES 11-30 - Decent players
        if (age >= 15 && age <= 20) {
            // Young players: still developing
            if (chanceOfBetterPlayer >= 9) {
                overall = Math.floor(Math.random() * (82 - 72 + 1)) + 72; // 10% chance: promising
            } else if (chanceOfBetterPlayer >= 6) {
                overall = Math.floor(Math.random() * (74 - 64 + 1)) + 64; // 30% chance: developing
            } else {
                overall = Math.floor(Math.random() * (66 - 56 + 1)) + 56; // 60% chance: raw
            }
        } else if (age >= 21 && age <= 27) {
            // Prime development years
            if (chanceOfBetterPlayer >= 9) {
                overall = Math.floor(Math.random() * (88 - 80 + 1)) + 80; // 10% chance: excellent
            } else if (chanceOfBetterPlayer >= 5) {
                overall = Math.floor(Math.random() * (80 - 70 + 1)) + 70; // 40% chance: good
            } else {
                overall = Math.floor(Math.random() * (72 - 62 + 1)) + 62; // 50% chance: average
            }
        } else {
            // 28-35: mostly basic/declining
            if (chanceOfBetterPlayer >= 9) {
                overall = Math.floor(Math.random() * (84 - 74 + 1)) + 74; // 10% chance: decent veteran
            } else if (chanceOfBetterPlayer >= 5) {
                overall = Math.floor(Math.random() * (76 - 66 + 1)) + 66; // 40% chance: average veteran
            } else {
                overall = Math.floor(Math.random() * (68 - 58 + 1)) + 58; // 50% chance: declining
            }
        }
    } else {
        // COUNTRIES 31-50 - Alright players
        if (age >= 15 && age <= 20) {
            // Young players: still developing
            if (chanceOfBetterPlayer >= 9) {
                overall = Math.floor(Math.random() * (78 - 68 + 1)) + 68; // 10% chance: decent prospect
            } else if (chanceOfBetterPlayer >= 6) {
                overall = Math.floor(Math.random() * (70 - 60 + 1)) + 60; // 30% chance: developing
            } else {
                overall = Math.floor(Math.random() * (62 - 52 + 1)) + 52; // 60% chance: raw
            }
        } else if (age >= 21 && age <= 27) {
            // Prime development years
            if (chanceOfBetterPlayer >= 9) {
                overall = Math.floor(Math.random() * (85 - 76 + 1)) + 76; // 10% chance: good
            } else if (chanceOfBetterPlayer >= 5) {
                overall = Math.floor(Math.random() * (78 - 66 + 1)) + 66; // 40% chance: decent
            } else {
                overall = Math.floor(Math.random() * (68 - 58 + 1)) + 58; // 50% chance: average
            }
        } else {
            // 28-35: mostly basic/declining
            if (chanceOfBetterPlayer >= 9) {
                overall = Math.floor(Math.random() * (80 - 70 + 1)) + 70; // 10% chance: decent veteran
            } else if (chanceOfBetterPlayer >= 5) {
                overall = Math.floor(Math.random() * (72 - 62 + 1)) + 62; // 40% chance: average veteran
            } else {
                overall = Math.floor(Math.random() * (64 - 54 + 1)) + 54; // 50% chance: declining
            }
        }
    }

    let potential: number;

    if (age <= 21) {
        // Young players have high potential growth
        potential = overall + Math.floor(Math.random() * (25 - 10 + 1)) + 10;
    } else if (age <= 25) {
        // Players in their early-mid 20s still have good growth potential
        potential = overall + Math.floor(Math.random() * (15 - 5 + 1)) + 5;
    } else if (age <= 28) {
        // Players approaching their prime, smaller growth
        potential = overall + Math.floor(Math.random() * (6 - 2 + 1)) + 2;
    } else if (age <= 30) {
        // Prime age players, potential close to current overall
        potential = overall + Math.floor(Math.random() * (2 - 0 + 1)) + 0;
    } else {
        // Older players, potential equals or slightly lower than current
        potential = Math.max(overall, overall - Math.floor(Math.random() * 3));
    }

    // Ensure potential never exceeds 99
    potential = Math.min(99, potential);

    // Calculate value using exponential growth: best players ~25M, <80 overall very cheap
    const calculatedValue = Math.pow((overall - 50) / 10, 3) * 0.35;
    const playerValue = Math.max(0.1, calculatedValue);

    const player: Player = {
        name: getRandomPlayerName(),
        position: position,
        overall: overall,
        potential: potential,
        country: country,
        team: team,
        age: age,
        value: playerValue,
        contractYrs: 4,
        contractAmount: playerValue,
        startingNational: false,
        startingTeam: false,
        newPlayer: false,
        leagueGoals: 0,
        leagueAssists: 0,
        countryGoals: 0,
        countryAssists: 0,
        cleanSheets: 0,
        totalGoals: 0,
        totalAssists: 0,
        awards: 0,
        trophies: 0
    };
    return player;
}

export function createUniquePlayer(position: string, teamName: string, PlayersMap: Map<string, Player>, teamMap: Signal<Map<string, Team>>, countryName?: string): Player {
    const curTeam = teamMap.value.get(teamName);
    if (topLeagues.includes(curTeam?.league || "")) {
        let player = createRandomPlayer(position, teamName, countryName);
        while (PlayersMap.has(player.name)) {
            player = createRandomPlayer(position, teamName, countryName);
            player.name = getRandomPlayerName();
        }
        return player;
    } else {
        let player = createLowerLevelPlayer(position, teamName, countryName);
        while (PlayersMap.has(player.name)) {
            player = createLowerLevelPlayer(position, teamName, countryName);
            player.name = getRandomPlayerName();
        }
        return player;
    }
}

export function createUniqueYoungPlayer(position: string, teamName: string, PlayersMap: Map<string, Player>, teamMap: Signal<Map<string,Team>>,countryName?: string): Player {
    let player: Player;
    do {
        player = createUniquePlayer(position, teamName, PlayersMap, teamMap, countryName);
    } while (player.age > 20);
    return player;
}

export function addPlayer(position: string, teamName: string, players: Player[], AllPlayers: Player[], PlayersMap: Map<string, Player>, teamMap: Signal<Map<string,Team>>, countryName?: string) {
    const player = createUniquePlayer(position, teamName, PlayersMap, teamMap, countryName);
    players.push(player);
    AllPlayers.push(player);
    PlayersMap.set(player.name, player);
}

export function updateClubTeams(teamsMap: Signal<Map<string, Team>>, playersMap: Signal<Map<string, Player>>) {
    const allCountries = Top50Countries.map((c) => c.country);
    teamsMap.value.forEach((team) => {
        const curTeam = teamsMap.value.get(team.name);
        if (!curTeam) return;
        if (!allCountries.includes(curTeam.name)) {
            const players = getTeamPlayersClub(curTeam, playersMap);
            const newPositions: string[] = ["Forward", "Forward", "Midfielder", "Midfielder", "Defender", "Defender", "Goalkeeper"];
            for (const pos of newPositions) {
                const newPlayer = createUniquePlayer(pos, team.name, playersMap.value, teamsMap);
                if (curTeam.manager.type === "Scout") {
                    newPlayer.overall += 2;
                    newPlayer.potential += 3;
                    if (newPlayer.overall > 99) newPlayer.overall = 99;
                    if (newPlayer.potential > 99) newPlayer.potential = 99;
                }
                newPlayer.newPlayer = true;
                playersMap.value.set(newPlayer.name, newPlayer);
                players.push(newPlayer);
            }
            const allForwards = players.filter((p) => p.position === "Forward").sort((a, b) => b.overall - a.overall).slice(0, 5);
            const allMidfielders = players.filter((p) => p.position === "Midfielder").sort((a, b) => b.overall - a.overall).slice(0, 5);
            const allDefenders = players.filter((p) => p.position === "Defender").sort((a, b) => b.overall - a.overall).slice(0, 6);
            const allGoalkeepers = players.filter((p) => p.position === "Goalkeeper").sort((a, b) => b.overall - a.overall).slice(0, 2);
            const newTeam: Player[] = [...allForwards, ...allMidfielders, ...allDefenders, ...allGoalkeepers];
            const bootedNames = new Set(curTeam.players.filter((name) => !newTeam.some((p) => p.name === name)));
            bootedNames.forEach((name) => playersMap.value.delete(name));
            curTeam.players = newTeam.map((p) => p.name);
        };
    });
    setTeamStartingPlayers(teamsMap, playersMap);
}

export function getNationalAllTeamPlayers(nationalTeams: Signal<NationalTeam[]>, playersMap: Signal<Map<string, Player>>, teamMap: Signal<Map<string, Team>>) {
    nationalTeams.value.forEach((nt) => {
        const countryName = nt.country;
        const countryPlayers = Array.from(playersMap.value.values()).filter((p) => p.country === countryName);

        const positions: { pos: string; needed: number }[] = [
            { pos: "Forward", needed: 5 },
            { pos: "Midfielder", needed: 5 },
            { pos: "Defender", needed: 6 },
            { pos: "Goalkeeper", needed: 2 },
        ];

        for (const { pos, needed } of positions) {
            const existing = countryPlayers.filter((p) => p.position === pos);
            for (let i = existing.length; i < needed; i++) {
                const newPlayer = createUniqueYoungPlayer(pos, "", playersMap.value, teamMap, countryName);
                playersMap.value.set(newPlayer.name, newPlayer);
                newPlayer.newPlayer = true;
                countryPlayers.push(newPlayer);
            }
        }

        const forwards = countryPlayers.filter((p) => p.position === "Forward").sort((a, b) => b.overall - a.overall).slice(0, 5);
        const midfielders = countryPlayers.filter((p) => p.position === "Midfielder").sort((a, b) => b.overall - a.overall).slice(0, 5);
        const defenders = countryPlayers.filter((p) => p.position === "Defender").sort((a, b) => b.overall - a.overall).slice(0, 6);
        const goalkeepers = countryPlayers.filter((p) => p.position === "Goalkeeper").sort((a, b) => b.overall - a.overall).slice(0, 2);

        nt.team.players = [...forwards, ...midfielders, ...defenders, ...goalkeepers].map((p) => p.name);
    });

    playersMap.value = new Map(playersMap.value);
    nationalTeams.value = [...nationalTeams.value];
    setNationalTeamStartingPlayers(nationalTeams, playersMap);
}

export function updatePlayerContract(player: Player) {
    const calculatedValue = Math.pow((player.overall - 50) / 10, 3) * 0.35;
    const playerValue = Math.max(0.1, calculatedValue);

    player.contractAmount = playerValue;
    player.contractYrs = 4;
}