import type { Signal } from "@preact/signals-react";
import type { NationalTeam, Player, Team } from "../Models/WorldStage";
import { Top50Countries } from "../Models/Countries.ts";
import { firstNames } from "../Models/Names/FirstNames";
import { lastNames } from "../Models/Names/LastNames";
import { countryFirstNames, countryLastNames } from "../Models/Names/CountryNames";
const top5Leagues = ["Premier League", "La Liga", "Serie A", "Bundesliga", "Ligue 1"];
const otherDiv1Leagues = ["Eredivisie", "Primeira Liga"];
const secondDivisionLeagues = ["Championship", "La Liga 2", "Serie B", "2. Bundesliga", "Ligue 2", "Eerste Divisie", "Segunda Liga"];

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

export function getRandomPlayerName(country?: string) {
    const firsts = country && countryFirstNames[country] ? countryFirstNames[country] : firstNames;
    const lasts = country && countryLastNames[country] ? countryLastNames[country] : lastNames;
    const firstName = firsts[Math.floor(Math.random() * firsts.length)];
    const lastName = lasts[Math.floor(Math.random() * lasts.length)];

    return `${firstName} ${lastName}`;
}

// Helper: random int in [min, max]
function randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper: weighted random pick from overall ranges
// entries: [weight, min, max][] where weights should sum to ~100
function weightedOverall(entries: [number, number, number][]): number {
    const roll = Math.random() * 100;
    let cumulative = 0;
    for (const [weight, min, max] of entries) {
        cumulative += weight;
        if (roll < cumulative) return randInt(min, max);
    }
    const last = entries[entries.length - 1];
    return randInt(last[1], last[2]);
}

function buildPlayer(position: string, team: string, overall: number, potential: number, country: string, age: number): Player {
    const calculatedValue = Math.pow((overall - 50) / 10, 3) * 0.35;
    const playerValue = Math.max(0.05, calculatedValue);
    return {
        name: getRandomPlayerName(country),
        position, overall, potential, country, team, age,
        value: playerValue,
        contractYrs: 4,
        contractAmount: playerValue,
        startingNational: false,
        startingTeam: false,
        newPlayer: false,
        leagueGoals: 0, leagueAssists: 0,
        countryGoals: 0, countryAssists: 0,
        cleanSheets: 0, totalGoals: 0, totalAssists: 0,
        otherTrophiesThisSeason: 0, importantTrophiesThisSeason: 0,
        awards: 0, trophies: 0
    };
}

function calcPotential(overall: number, age: number): number {
    let potential: number;
    if (age <= 21) {
        potential = overall + randInt(8, 20);
    } else if (age <= 25) {
        potential = overall + randInt(4, 12);
    } else if (age <= 28) {
        potential = overall + randInt(1, 5);
    } else if (age <= 30) {
        potential = overall + randInt(0, 2);
    } else {
        potential = Math.max(overall, overall - randInt(0, 3));
    }
    return Math.min(99, potential);
}

// THIRD DIVISION: most players 45-65, rare standout up to 70
export function createLowestLevelPlayer(position: string, team: string, countryName?: string): Player {
    const age = randInt(17, 35);
    const countryIndex = Math.floor(Math.random() * Top50Countries.length);
    const country = countryName || Top50Countries[countryIndex].country;

    let overall: number;
    if (age <= 20) {
        overall = weightedOverall([
            [60, 38, 48],   // 60%: raw youth
            [30, 49, 55],   // 30%: developing
            [10, 56, 62],   // 10%: promising
        ]);
    } else if (age <= 27) {
        overall = weightedOverall([
            [50, 48, 58],   // 50%: average
            [35, 59, 65],   // 35%: decent
            [12, 66, 70],   // 12%: standout
            [3, 71, 74],    // 3%: rare gem
        ]);
    } else {
        overall = weightedOverall([
            [45, 44, 54],   // 45%: declining
            [40, 55, 63],   // 40%: average veteran
            [15, 64, 68],   // 15%: solid veteran
        ]);
    }

    const potential = calcPotential(overall, age);
    return buildPlayer(position, team, overall, potential, country, age);
}

// SECOND DIVISION: most players 55-72, occasional standout up to 76
export function createLowerLevelPlayer(position: string, team: string, countryName?: string): Player {
    const age = randInt(17, 35);
    const countryIndex = Math.floor(Math.random() * Top50Countries.length);
    const country = countryName || Top50Countries[countryIndex].country;

    let overall: number;
    if (age <= 20) {
        overall = weightedOverall([
            [55, 42, 52],   // 55%: raw youth
            [30, 53, 60],   // 30%: developing
            [12, 61, 67],   // 12%: promising
            [3, 68, 72],    // 3%: rare talent
        ]);
    } else if (age <= 27) {
        overall = weightedOverall([
            [40, 55, 64],   // 40%: average
            [35, 65, 72],   // 35%: decent
            [18, 73, 76],   // 18%: good
            [7, 77, 80],    // 7%: standout
        ]);
    } else {
        overall = weightedOverall([
            [40, 50, 60],   // 40%: declining
            [35, 61, 68],   // 35%: average veteran
            [18, 69, 73],   // 18%: solid veteran
            [7, 74, 77],    // 7%: quality veteran
        ]);
    }

    const potential = calcPotential(overall, age);
    return buildPlayer(position, team, overall, potential, country, age);
}

// OTHER DIV 1 (Eredivisie, Primeira Liga): most players 65-78, occasional 79-84, rare 85+
export function createOtherDiv1Player(position: string, team: string, countryName?: string): Player {
    const age = randInt(17, 35);
    const countryIndex = Math.floor(Math.random() * Top50Countries.length);
    const country = countryName || Top50Countries[countryIndex].country;

    let overall: number;
    if (age <= 20) {
        overall = weightedOverall([
            [50, 48, 58],   // 50%: developing youth
            [30, 59, 65],   // 30%: decent prospect
            [15, 66, 71],   // 15%: promising
            [5, 72, 76],    // 5%: rare talent
        ]);
    } else if (age <= 27) {
        overall = weightedOverall([
            [30, 62, 70],   // 30%: average
            [40, 71, 78],   // 40%: decent
            [20, 79, 83],   // 20%: good
            [8, 84, 86],    // 8%: very good
            [2, 87, 89],    // 2%: rare star
        ]);
    } else {
        overall = weightedOverall([
            [35, 58, 66],   // 35%: declining
            [35, 67, 74],   // 35%: average veteran
            [20, 75, 80],   // 20%: solid veteran
            [10, 81, 84],   // 10%: quality veteran
        ]);
    }

    const potential = calcPotential(overall, age);
    return buildPlayer(position, team, overall, potential, country, age);
}

// TOP 5 LEAGUES (Prem, La Liga, Serie A, Bundesliga, Ligue 1):
// Bulk of players 72-82, some stars 83-88, very rare 89-92
export function createRandomPlayer(position: string, team: string, countryName?: string): Player {
    const age = randInt(17, 35);
    const countryIndex = Math.floor(Math.random() * Top50Countries.length);
    const country = countryName || Top50Countries[countryIndex].country;

    let overall: number;
    if (age <= 20) {
        overall = weightedOverall([
            [40, 52, 62],   // 40%: developing youth
            [30, 63, 70],   // 30%: decent prospect
            [20, 71, 76],   // 20%: promising
            [8, 77, 80],    // 8%: very promising
            [2, 81, 84],    // 2%: exceptional youth (Mbappe-type)
        ]);
    } else if (age <= 27) {
        overall = weightedOverall([
            [20, 66, 73],   // 20%: squad depth / rotation
            [40, 74, 80],   // 40%: solid starter (bulk of top league players)
            [25, 81, 85],   // 25%: quality player
            [10, 86, 88],   // 10%: star player
            [4, 89, 91],    // 4%: world class
            [1, 92, 94],    // 1%: generational
        ]);
    } else {
        overall = weightedOverall([
            [30, 64, 72],   // 30%: declining
            [35, 73, 79],   // 35%: solid veteran
            [20, 80, 84],   // 20%: quality veteran
            [10, 85, 87],   // 10%: elite veteran
            [5, 88, 91],    // 5%: still world class
        ]);
    }

    const potential = calcPotential(overall, age);
    return buildPlayer(position, team, overall, potential, country, age);
}

export function createUniquePlayer(position: string, teamName: string, PlayersMap: Map<string, Player>, teamMap: Signal<Map<string, Team>>, countryName?: string): Player {
    const curTeam = teamMap.value.get(teamName);
    const league = curTeam?.league || "";

    let createFn: (pos: string, team: string, country?: string) => Player;
    if (top5Leagues.includes(league)) {
        createFn = createRandomPlayer;
    } else if (otherDiv1Leagues.includes(league)) {
        createFn = createOtherDiv1Player;
    } else if (secondDivisionLeagues.includes(league)) {
        createFn = createLowerLevelPlayer;
    } else {
        createFn = createLowestLevelPlayer;
    }

    let player = createFn(position, teamName, countryName);
    while (PlayersMap.has(player.name)) {
        player = createFn(position, teamName, countryName);
        player.name = getRandomPlayerName();
    }
    return player;
}

export function createUniqueYoungPlayer(position: string, teamName: string, PlayersMap: Map<string, Player>, teamMap: Signal<Map<string, Team>>, countryName?: string): Player {
    let player: Player;
    do {
        player = createUniquePlayer(position, teamName, PlayersMap, teamMap, countryName);
    } while (player.age > 20);
    return player;
}

export function addPlayer(position: string, teamName: string, players: Player[], AllPlayers: Player[], PlayersMap: Map<string, Player>, teamMap: Signal<Map<string, Team>>, countryName?: string) {
    const player = createUniquePlayer(position, teamName, PlayersMap, teamMap, countryName);
    players.push(player);
    AllPlayers.push(player);
    PlayersMap.set(player.name, player);
}

export function updateClubTeams(teamsMap: Signal<Map<string, Team>>, playersMap: Signal<Map<string, Player>>, managerTeamName?: string) {
    const allCountries = Top50Countries.map((c) => c.country);
    const managerTeam = managerTeamName ? teamsMap.value.get(managerTeamName) : undefined;
    teamsMap.value.forEach((team) => {
        const curTeam = teamsMap.value.get(team.name);
        if (!curTeam) return;
        if (!allCountries.includes(curTeam.name)) {
            const players = getTeamPlayersClub(curTeam, playersMap);
            const newPositions: string[] = curTeam.name === managerTeam?.name || curTeam.newlyPromoted ? ["Forward", "Forward", "Midfielder", "Midfielder", "Defender", "Defender", "Goalkeeper"] : ["Forward", "Midfielder", "Defender"];
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
            if (players.filter(p => p.position === "Forward").length < 5) {
                while (players.filter(p => p.position === "Forward").length < 5) {
                    const newPlayer = createUniquePlayer("Forward", curTeam.name, playersMap.value, teamsMap);
                    playersMap.value.set(newPlayer.name, newPlayer);
                    players.push(newPlayer);
                }
            }
            if (players.filter(p => p.position === "Midfielder").length < 5) {
                while (players.filter(p => p.position === "Midfielder").length < 5) {
                    const newPlayer = createUniquePlayer("Midfielder", curTeam.name, playersMap.value, teamsMap);
                    playersMap.value.set(newPlayer.name, newPlayer);
                    players.push(newPlayer);
                }
            }
            if (players.filter(p => p.position === "Defender").length < 6) {
                while (players.filter(p => p.position === "Defender").length < 6) {
                    const newPlayer = createUniquePlayer("Defender", curTeam.name, playersMap.value, teamsMap);
                    playersMap.value.set(newPlayer.name, newPlayer);
                    players.push(newPlayer);
                }
            }
            if (players.filter(p => p.position === "Goalkeeper").length < 2) {
                while (players.filter(p => p.position === "Goalkeeper").length < 2) {
                    const newPlayer = createUniquePlayer("Goalkeeper", curTeam.name, playersMap.value, teamsMap);
                    playersMap.value.set(newPlayer.name, newPlayer);
                    players.push(newPlayer);
                }
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