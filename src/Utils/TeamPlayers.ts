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

const countryNames = new Set(Top50Countries.map(c => c.country));

export function setTeamStartingPlayers(teamsMap: Signal<Map<string, Team>>, playersMap: Signal<Map<string, Player>>) {
    teamsMap.value.forEach((team) => {
        // Skip national teams — they use startingNational, not startingTeam
        if (countryNames.has(team.name)) return;
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

// Country tier based on FIFA ranking position in Top50Countries array
// Returns tier 1-8 (1 = elite, 8 = weakest)
export function getCountryTier(country: string): number {
    const index = Top50Countries.findIndex(c => c.country === country);
    if (index === -1) return 8;
    if (index < 10) return 1;  // 1-10: Elite
    if (index < 20) return 2;  // 11-20: Very Good
    if (index < 30) return 3;  // 21-30: Good
    if (index < 40) return 4;  // 31-40: Decent
    if (index < 50) return 5;  // 41-50: Average
    if (index < 60) return 6;  // 51-60: Below Average
    if (index < 70) return 7;  // 61-70: Weak
    return 8;                   // 71+: Weakest
}

// Weighted country picker: top-tier countries appear more in better leagues
function getWeightedCountry(leagueLevel: "top5" | "otherDiv1" | "lower"): string {
    const weighted: string[] = [];
    for (const c of Top50Countries) {
        const tier = getCountryTier(c.country);
        let copies: number;
        if (leagueLevel === "top5") {
            // Top 5 leagues: heavily favor elite countries
            copies = tier <= 2 ? 8 : tier <= 4 ? 4 : tier <= 6 ? 2 : 1;
        } else if (leagueLevel === "otherDiv1") {
            copies = tier <= 3 ? 5 : tier <= 5 ? 3 : tier <= 7 ? 2 : 1;
        } else {
            copies = tier <= 4 ? 3 : tier <= 6 ? 2 : 1;
        }
        for (let i = 0; i < copies; i++) {
            weighted.push(c.country);
        }
    }
    return weighted[Math.floor(Math.random() * weighted.length)];
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

export function getTrainingPoints(overall: number, potential: number): number {
    const gap = potential - overall;
    if (gap <= 0) return 0;
    if (gap < 3)  return 200;
    if (gap < 6)  return 160;
    if (gap < 9)  return 120;
    if (gap < 12) return 90;
    if (gap < 15) return 70;
    if (gap < 18) return 50;
    if (gap < 21) return 35;
    return 20;
}

function buildPlayer(position: string, team: string, overall: number, potential: number, country: string, age: number): Player {
    const calculatedValue = Math.pow((overall - 50) / 10, 3) * 0.35;
    const playerValue = Math.max(0.05, calculatedValue);
    const trainingsPointMax = getTrainingPoints(overall, potential);
    return {
        name: getRandomPlayerName(country),
        position, overall, potential, country, team, age,
        value: playerValue,
        contractYrs: 4,
        contractAmount: playerValue,
        startingNational: false,
        startingTeam: false,
        startingNationalWithoutInjury: false,
        startingTeamWithoutInjury: false,
        newPlayer: false,
        leagueGoals: 0, leagueAssists: 0,
        countryGoals: 0, countryAssists: 0,
        cleanSheets: 0, totalGoals: 0, totalAssists: 0,
        otherTrophiesThisSeason: 0, importantTrophiesThisSeason: 0,
        awards: 0, trophies: 0, stamina: 100, trainingIntency: "Medium", trainingPoints: 0, trainingUpgradePoints: trainingsPointMax, injured: false, weeksInjured: 0,
        
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
    const country = countryName || getWeightedCountry("lower");

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
    const country = countryName || getWeightedCountry("lower");

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
    const country = countryName || getWeightedCountry("otherDiv1");

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
    const country = countryName || getWeightedCountry("top5");

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

// National team player: quality based on country FIFA ranking tier
export function createNationalPlayer(position: string, countryName: string, youngOnly: boolean = false): Player {
    const age = youngOnly ? randInt(17, 21) : randInt(17, 35);
    const tier = getCountryTier(countryName);

    let overall: number;
    if (tier === 1) {
        // Elite (Spain, Argentina, France, etc.) — world-class squads
        if (age <= 20) {
            overall = weightedOverall([[30, 60, 68], [40, 69, 75], [20, 76, 80], [8, 81, 84], [2, 85, 88]]);
        } else if (age <= 27) {
            overall = weightedOverall([[15, 72, 78], [35, 79, 84], [30, 85, 89], [15, 90, 93], [5, 94, 96]]);
        } else {
            overall = weightedOverall([[20, 70, 76], [35, 77, 83], [25, 84, 88], [15, 89, 92], [5, 93, 95]]);
        }
    } else if (tier === 2) {
        // Very Good (Croatia, Italy, Uruguay, etc.)
        if (age <= 20) {
            overall = weightedOverall([[35, 56, 64], [35, 65, 72], [20, 73, 78], [8, 79, 82], [2, 83, 86]]);
        } else if (age <= 27) {
            overall = weightedOverall([[20, 68, 75], [40, 76, 82], [25, 83, 87], [12, 88, 91], [3, 92, 94]]);
        } else {
            overall = weightedOverall([[25, 66, 73], [35, 74, 80], [25, 81, 85], [12, 86, 89], [3, 90, 92]]);
        }
    } else if (tier === 3) {
        // Good (Denmark, South Korea, Austria, etc.)
        if (age <= 20) {
            overall = weightedOverall([[40, 52, 60], [35, 61, 68], [18, 69, 74], [5, 75, 78], [2, 79, 82]]);
        } else if (age <= 27) {
            overall = weightedOverall([[25, 64, 72], [40, 73, 79], [25, 80, 84], [8, 85, 88], [2, 89, 91]]);
        } else {
            overall = weightedOverall([[30, 62, 69], [35, 70, 77], [25, 78, 82], [8, 83, 86], [2, 87, 89]]);
        }
    } else if (tier === 4) {
        // Decent (Egypt, Norway, Poland, etc.)
        if (age <= 20) {
            overall = weightedOverall([[45, 48, 56], [35, 57, 64], [15, 65, 70], [4, 71, 75], [1, 76, 79]]);
        } else if (age <= 27) {
            overall = weightedOverall([[30, 60, 68], [40, 69, 76], [20, 77, 81], [8, 82, 85], [2, 86, 88]]);
        } else {
            overall = weightedOverall([[35, 58, 65], [35, 66, 73], [20, 74, 79], [8, 80, 83], [2, 84, 86]]);
        }
    } else if (tier === 5) {
        // Average (Hungary, Sweden, Greece, etc.)
        if (age <= 20) {
            overall = weightedOverall([[50, 44, 52], [30, 53, 60], [15, 61, 66], [4, 67, 71], [1, 72, 75]]);
        } else if (age <= 27) {
            overall = weightedOverall([[30, 56, 64], [40, 65, 72], [20, 73, 78], [8, 79, 82], [2, 83, 85]]);
        } else {
            overall = weightedOverall([[35, 54, 62], [35, 63, 70], [20, 71, 76], [8, 77, 80], [2, 81, 83]]);
        }
    } else if (tier === 6) {
        // Below Average (Costa Rica, Peru, Chile, etc.)
        if (age <= 20) {
            overall = weightedOverall([[55, 40, 48], [30, 49, 56], [12, 57, 62], [3, 63, 67]]);
        } else if (age <= 27) {
            overall = weightedOverall([[35, 52, 60], [40, 61, 68], [18, 69, 74], [5, 75, 78], [2, 79, 82]]);
        } else {
            overall = weightedOverall([[40, 50, 58], [35, 59, 66], [18, 67, 72], [5, 73, 76], [2, 77, 80]]);
        }
    } else if (tier === 7) {
        // Weak (Burkina Faso, Albania, Honduras, etc.)
        if (age <= 20) {
            overall = weightedOverall([[60, 36, 44], [28, 45, 52], [10, 53, 58], [2, 59, 63]]);
        } else if (age <= 27) {
            overall = weightedOverall([[35, 48, 56], [40, 57, 64], [18, 65, 70], [5, 71, 74], [2, 75, 78]]);
        } else {
            overall = weightedOverall([[40, 46, 54], [35, 55, 62], [18, 63, 68], [5, 69, 72], [2, 73, 76]]);
        }
    } else {
        // Weakest (Finland, Bolivia, India, etc.)
        if (age <= 20) {
            overall = weightedOverall([[65, 32, 40], [25, 41, 48], [8, 49, 54], [2, 55, 59]]);
        } else if (age <= 27) {
            overall = weightedOverall([[40, 44, 52], [35, 53, 60], [18, 61, 66], [5, 67, 70], [2, 71, 74]]);
        } else {
            overall = weightedOverall([[45, 42, 50], [35, 51, 58], [15, 59, 64], [4, 65, 68], [1, 69, 72]]);
        }
    }

    const potential = calcPotential(overall, age);
    return buildPlayer(position, "", overall, potential, countryName, age);
}

export function createUniquePlayer(position: string, teamName: string, PlayersMap: Map<string, Player>, teamMap: Signal<Map<string, Team>>, countryName?: string): Player {
    const curTeam = teamMap.value.get(teamName);
    const league = curTeam?.leagueName || curTeam?.league || "";
    const upOne = curTeam?.manager.isUserManager

    let createFn: (pos: string, team: string, country?: string) => Player;
    if (top5Leagues.includes(league) || (otherDiv1Leagues.includes(league) && upOne)) {
        createFn = createRandomPlayer;
    } else if (otherDiv1Leagues.includes(league) || (secondDivisionLeagues.includes(league) && upOne)) {
        createFn = createOtherDiv1Player;
    } else if (secondDivisionLeagues.includes(league) || upOne) {
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
                let newPlayer = createNationalPlayer(pos, countryName, true);
                while (playersMap.value.has(newPlayer.name)) {
                    newPlayer = createNationalPlayer(pos, countryName, true);
                }
                playersMap.value.set(newPlayer.name, newPlayer);
                newPlayer.newPlayer = true;
                countryPlayers.push(newPlayer);
            }
        }

        // Remove national-only callups (no club team) aged 22+ and replace with young callups
        for (let i = countryPlayers.length - 1; i >= 0; i--) {
            const p = countryPlayers[i];
            if (p.team === "" && p.age >= 22) {
                playersMap.value.delete(p.name);
                countryPlayers.splice(i, 1);
            }
        }

        // Refill if we removed old callups
        for (const { pos, needed } of positions) {
            const existing = countryPlayers.filter((p) => p.position === pos);
            for (let i = existing.length; i < needed; i++) {
                let newPlayer = createNationalPlayer(pos, countryName, true);
                while (playersMap.value.has(newPlayer.name)) {
                    newPlayer = createNationalPlayer(pos, countryName, true);
                }
                playersMap.value.set(newPlayer.name, newPlayer);
                newPlayer.newPlayer = true;
                countryPlayers.push(newPlayer);
            }
        }

        const forwards = countryPlayers.filter((p) => p.position === "Forward").sort((a, b) => b.overall - a.overall).slice(0, 5);
        const midfielders = countryPlayers.filter((p) => p.position === "Midfielder").sort((a, b) => b.overall - a.overall).slice(0, 5);
        const defenders = countryPlayers.filter((p) => p.position === "Defender").sort((a, b) => b.overall - a.overall).slice(0, 6);
        const goalkeepers = countryPlayers.filter((p) => p.position === "Goalkeeper").sort((a, b) => b.overall - a.overall).slice(0, 2);

        // Top 20: 18 positional picks + 2 best remaining
        const picked = new Set([...forwards, ...midfielders, ...defenders, ...goalkeepers].map(p => p.name));
        const remaining = countryPlayers.filter(p => !picked.has(p.name)).sort((a, b) => b.overall - a.overall).slice(0, 2);

        nt.team.players = [...forwards, ...midfielders, ...defenders, ...goalkeepers, ...remaining].map((p) => p.name);
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

export function getNationalTeamOverall(
    countryName: string,
    playersMap: Signal<Map<string, Player>>,
    _teamsMap: Signal<Map<string, Team>>,
): number {
    // Compute best starting 11 from ALL players of this country (club + national)
    const countryPlayers = Array.from(playersMap.value.values()).filter(p => p.country === countryName);
    if (countryPlayers.length === 0) return 0;

    const forwards = countryPlayers.filter(p => p.position === "Forward").sort((a, b) => b.overall - a.overall).slice(0, 3);
    const midfielders = countryPlayers.filter(p => p.position === "Midfielder").sort((a, b) => b.overall - a.overall).slice(0, 3);
    const defenders = countryPlayers.filter(p => p.position === "Defender").sort((a, b) => b.overall - a.overall).slice(0, 4);
    const goalkeepers = countryPlayers.filter(p => p.position === "Goalkeeper").sort((a, b) => b.overall - a.overall).slice(0, 1);

    const starters = [...forwards, ...midfielders, ...defenders, ...goalkeepers];
    if (starters.length === 0) return 0;
    return starters.reduce((sum, p) => sum + p.overall, 0) / starters.length;
}

export function rankNationalTeams(
    nationalTeams: NationalTeam[],
    playersMap: Signal<Map<string, Player>>,
    teamsMap: Signal<Map<string, Team>>,
): { country: string; rating: number }[] {
    return nationalTeams
        .map(nt => ({
            country: nt.country,
            rating: getNationalTeamOverall(nt.country, playersMap, teamsMap),
        }))
        .sort((a, b) => b.rating - a.rating);
}