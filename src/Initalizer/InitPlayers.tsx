import Top50Countries from "../Models/Countries";
import AllTeams from "../Models/Teams";
import firstNames from "../Models/Names/FirstNames.ts";
import lastNames from "../Models/Names/LastNames.ts";
import { type Player, type Team, type NationalTeam } from "../Models/WorldStage";

function getRandomPlayerName() {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    return `${firstName} ${lastName}`;
}

function createRandomPlayer(position: string, team: string, countryName?: string): Player {
    const age = Math.floor(Math.random() * (35 - 15 + 1)) + 15;

    // Select country first to determine overall rating bias
    const countryIndex = Math.floor(Math.random() * Top50Countries.length);
    const country = countryName || Top50Countries[countryIndex];

    // Players from top 25 countries get a bonus to their overall rating
    const chanceOfBetterPlayer = Math.floor(Math.random() * 10) + 1;
    let overall: number;

    // Base overall calculation considering both country and age
    if (countryIndex < 25) {
        // Top 25 countries
        if (age >= 15 && age <= 20) {
            // Young players: higher chance of low overall
            if (chanceOfBetterPlayer >= 9) {
                overall = Math.floor(Math.random() * (90 - 70 + 1)) + 70; // 10% chance: decent young talent
            } else if (chanceOfBetterPlayer >= 5) {
                overall = Math.floor(Math.random() * (75 - 60 + 1)) + 60; // 40% chance: developing
            } else {
                overall = Math.floor(Math.random() * (59 - 55 + 1)) + 55; // 50% chance: raw talent
            }
        } else if (age >= 21 && age <= 27) {
            // Prime development years: higher chance at high overall
            if (chanceOfBetterPlayer >= 8) {
                overall = Math.floor(Math.random() * (99 - 85 + 1)) + 85; // 20% chance: elite
            } else if (chanceOfBetterPlayer >= 3) {
                overall = Math.floor(Math.random() * (84 - 75 + 1)) + 75; // 30% chance: very good
            } else {
                overall = Math.floor(Math.random() * (74 - 65 + 1)) + 65; // 20% chance: good
            }
        } else {
            // 28-35: higher chance at basic/declining overall
            if (chanceOfBetterPlayer >= 8) {
                overall = Math.floor(Math.random() * (90 - 75 + 1)) + 75; // 20% chance: still strong
            } else if (chanceOfBetterPlayer >= 4) {
                overall = Math.floor(Math.random() * (80 - 65 + 1)) + 65; // 40% chance: solid veteran
            } else {
                overall = Math.floor(Math.random() * (70 - 55 + 1)) + 55; // 40% chance: declining
            }
        }
    } else {
        // Bottom 25 countries
        if (age >= 15 && age <= 20) {
            // Young players: higher chance of low overall
            if (chanceOfBetterPlayer >= 9) {
                overall = Math.floor(Math.random() * (90 - 65 + 1)) + 65; // 10% chance: promising
            } else if (chanceOfBetterPlayer >= 6) {
                overall = Math.floor(Math.random() * (75 - 58 + 1)) + 58; // 30% chance: developing
            } else {
                overall = Math.floor(Math.random() * (70 - 55 + 1)) + 55; // 60% chance: raw
            }
        } else if (age >= 21 && age <= 27) {
            // Prime development years: higher chance at high overall
            if (chanceOfBetterPlayer >= 8) {
                overall = Math.floor(Math.random() * (99 - 80 + 1)) + 80; // 20% chance: excellent
            } else if (chanceOfBetterPlayer >= 5) {
                overall = Math.floor(Math.random() * (85 - 70 + 1)) + 70; // 30% chance: good
            } else {
                overall = Math.floor(Math.random() * (75 - 60 + 1)) + 60; // 50% chance: average
            }
        } else {
            // 28-35: higher chance at basic/declining overall
            if (chanceOfBetterPlayer >= 9) {
                overall = Math.floor(Math.random() * (90 - 68 + 1)) + 68; // 10% chance: decent veteran
            } else if (chanceOfBetterPlayer >= 5) {
                overall = Math.floor(Math.random() * (75 - 60 + 1)) + 60; // 40% chance: average veteran
            } else {
                overall = Math.floor(Math.random() * (70 - 55 + 1)) + 55; // 50% chance: declining
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
        potential = overall + Math.floor(Math.random() * (8 - 2 + 1)) + 2;
    } else if (age <= 30) {
        // Prime age players, potential close to current overall
        potential = overall + Math.floor(Math.random() * (5 - 0 + 1)) + 0;
    } else {
        // Older players, potential equals or slightly lower than current
        potential = Math.max(overall, overall - Math.floor(Math.random() * 3));
    }

    // Ensure potential never exceeds 99
    potential = Math.min(99, potential);

    const player: Player = {
        name: getRandomPlayerName(),
        position: position,
        overall: overall,
        potential: potential,
        country: country,
        team: team,
        age: age,
        value: overall * 0.25,
        contract: {
            4: overall * 0.25,
        }
    };
    return player;
}

function createPlayersForTeam(team: Team, AllPlayers: Player[]) {
    const players: Player[] = [];

    //create forwards
    for (let i = 0; i < 5; i++) {
        players.push(createRandomPlayer("Forward", team.name));
    }
    //create midfielders
    for (let i = 0; i < 5; i++) {
        players.push(createRandomPlayer("Midfielder", team.name));
    }
    //create defenders
    for (let i = 0; i < 6; i++) {
        players.push(createRandomPlayer("Defender", team.name));
    }
    //create goalkeepers
    for (let i = 0; i < 2; i++) {
        players.push(createRandomPlayer("Goalkeeper", team.name));
    }

    // Assign players to THIS team object
    team.players = players;

    // Add all players to the global player list
    AllPlayers.push(...players);
}

function getNationalTeamPlayers(nation: string, AllPlayers: Player[]) {
    const nationalTeamPlayers = AllPlayers.filter((player: Player) => player.country === nation);

    let forwardCount = 0;
    let midfielderCount = 0;
    let defenderCount = 0;
    let goalkeeperCount = 0;

    // Count existing players by position
    for (let i = 0; i < nationalTeamPlayers.length; i++) {
        if (nationalTeamPlayers[i].position === "Forward") {
            forwardCount++;
        } else if (nationalTeamPlayers[i].position === "Midfielder") {
            midfielderCount++;
        } else if (nationalTeamPlayers[i].position === "Defender") {
            defenderCount++;
        } else if (nationalTeamPlayers[i].position === "Goalkeeper") {
            goalkeeperCount++;
        }
    }

    // Fill in missing positions
    while (forwardCount < 5) {
        const player = createRandomPlayer("Forward", "Free Agent", nation);
        nationalTeamPlayers.push(player);
        AllPlayers.push(player);
        forwardCount++;
    }

    while (midfielderCount < 5) {
        const player = createRandomPlayer("Midfielder", "Free Agent", nation);
        nationalTeamPlayers.push(player);
        AllPlayers.push(player);
        midfielderCount++;
    }

    while (defenderCount < 6) {
        const player = createRandomPlayer("Defender", "Free Agent", nation);
        nationalTeamPlayers.push(player);
        AllPlayers.push(player);
        defenderCount++;
    }

    while (goalkeeperCount < 2) {
        const player = createRandomPlayer("Goalkeeper", "Free Agent", nation);
        nationalTeamPlayers.push(player);
        AllPlayers.push(player);
        goalkeeperCount++;
    }

    return nationalTeamPlayers;
}

export function InitPlayers(AllPlayers: Player[], ClubTeams: Team[], NationalTeams: NationalTeam[]) {
    // Initialize Club Teams
    AllTeams.forEach((teamData: any) => {
        // Create the new team object
        const newTeam: Team = {
            name: teamData.name,
            league: teamData.league,
            manager: {
                name: getRandomPlayerName(),
                country: Top50Countries[Math.floor(Math.random() * Top50Countries.length)],
                team: teamData.name,
                age: Math.floor(Math.random() * (60 - 25 + 1)) + 25,
                type: "Club"
            },
            color: teamData.color,
            players: [],
            moneyToSpend: 250
        };

        // Add to ClubTeams array
        ClubTeams.push(newTeam);

        // Create players for this team (will update newTeam.players)
        createPlayersForTeam(newTeam, AllPlayers);
    });

    // Initialize National Teams
    Top50Countries.forEach((countryData: any) => {
        const nationalTeam: NationalTeam = {
            team: {
                name: countryData,
                league: "National",
                manager: {
                    name: getRandomPlayerName(),
                    country: countryData,
                    team: countryData,
                    age: Math.floor(Math.random() * (60 - 25 + 1)) + 25,
                    type: "National"
                },
                color: countryData.color,
                players: [],
                moneyToSpend: 0
            },
            country: countryData
        };

        // Get players for this national team
        const players = getNationalTeamPlayers(countryData, AllPlayers);
        nationalTeam.team.players = players;

        // Add to NationalTeams array
        NationalTeams.push(nationalTeam);
    });
}

export default InitPlayers;