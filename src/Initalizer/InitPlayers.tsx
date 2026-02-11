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

function createRandomPlayer(position: string, team: string): Player {
    const age = Math.floor(Math.random() * (35 - 15 + 1)) + 15;
    const overall = Math.floor(Math.random() * (99 - 55 + 1)) + 55;

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
        country: Top50Countries[Math.floor(Math.random() * Top50Countries.length)],
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
    team.players = players;

    AllPlayers.push(...players);
}

function getNationalTeamPlayers(nation: String, AllPlayers: Player[]) {
    const nationalTeamPlayers = AllPlayers.filter((player: Player) => player.country === nation);
    let forwardCount = 0;
    let midfielderCount = 0;
    let defenderCount = 0;
    let goalkeeperCount = 0;
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
    while (forwardCount < 5) {
        const player = createRandomPlayer("Forward", "None");
        nationalTeamPlayers.push(player);
        AllPlayers.push(player);
        forwardCount++;
    } while (midfielderCount < 5) {
        const player = createRandomPlayer("Midfielder", "None");
        nationalTeamPlayers.push(player);
        AllPlayers.push(player);
        midfielderCount++;
    } while (defenderCount < 6) {
        const player = createRandomPlayer("Defender", "None");
        nationalTeamPlayers.push(player);
        AllPlayers.push(player);
        defenderCount++;
    } while (goalkeeperCount < 2) {
        const player = createRandomPlayer("Goalkeeper", "None");
        nationalTeamPlayers.push(player);
        AllPlayers.push(player);
        goalkeeperCount++;
    }
    return nationalTeamPlayers;
}



export function InitPlayers(AllPlayers: Player[], ClubTeams: Team[], NationalTeams: NationalTeam[]) {
    AllTeams.forEach((team: any) => {
        ClubTeams.push({
            name: team.name,
            league: team.league,
            manager: {
                name: getRandomPlayerName(),
                country: team.country,
                team: team.name,
                age: Math.floor(Math.random() * (60 - 25 + 1)) + 25,
                type: "Club"
            },
            color: team.color,
            players: [],
            moneyToSpend: 250
        });
        createPlayersForTeam(team, AllPlayers);
    });

    Top50Countries.forEach((countryData: any) => {
        NationalTeams.push({
            team: {
                name: countryData.country,
                league: "National",
                manager: {
                    name: getRandomPlayerName(),
                    country: countryData.country,
                    team: countryData.country,
                    age: Math.floor(Math.random() * (60 - 25 + 1)) + 25,
                    type: "National"
                },
                color: countryData.color,
                players: [],
                moneyToSpend: 0
            },
            country: countryData.country
        });
        countryData.players = getNationalTeamPlayers(countryData.country, AllPlayers);
    });
}