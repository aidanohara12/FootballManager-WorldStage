import { Top50Countries } from "../Models/Countries";
import AllTeams from "../Models/Teams";
import { firstNames } from "../Models/Names/FirstNames";
import { lastNames } from "../Models/Names/LastNames";
import { type Player, type Team, type NationalTeam, type League, type Tournament, type InternationalTournament, type WorldCup } from "../Models/WorldStage";

function getRandomPlayerName() {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    return `${firstName} ${lastName}`;
}

function createRandomPlayer(position: string, team: string, countryName?: string): Player {
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
            // Young players: higher chance of low overall
            if (chanceOfBetterPlayer >= 9) {
                overall = Math.floor(Math.random() * (93 - 75 + 1)) + 75; // 10% chance: exceptional young talent
            } else if (chanceOfBetterPlayer >= 5) {
                overall = Math.floor(Math.random() * (80 - 65 + 1)) + 65; // 40% chance: promising
            } else {
                overall = Math.floor(Math.random() * (70 - 58 + 1)) + 58; // 50% chance: developing
            }
        } else if (age >= 21 && age <= 27) {
            // Prime development years: higher chance at high overall
            if (chanceOfBetterPlayer >= 7) {
                overall = Math.floor(Math.random() * (99 - 88 + 1)) + 88; // 30% chance: world class
            } else if (chanceOfBetterPlayer >= 3) {
                overall = Math.floor(Math.random() * (90 - 78 + 1)) + 78; // 40% chance: elite
            } else {
                overall = Math.floor(Math.random() * (80 - 68 + 1)) + 68; // 30% chance: very good
            }
        } else {
            // 28-35: higher chance at solid/declining overall
            if (chanceOfBetterPlayer >= 8) {
                overall = Math.floor(Math.random() * (92 - 80 + 1)) + 80; // 20% chance: still elite
            } else if (chanceOfBetterPlayer >= 4) {
                overall = Math.floor(Math.random() * (85 - 70 + 1)) + 70; // 40% chance: solid veteran
            } else {
                overall = Math.floor(Math.random() * (75 - 60 + 1)) + 60; // 40% chance: declining
            }
        }
    } else if (countryTier === 'decent') {
        // COUNTRIES 11-30 - Decent players
        if (age >= 15 && age <= 20) {
            // Young players: higher chance of low overall
            if (chanceOfBetterPlayer >= 9) {
                overall = Math.floor(Math.random() * (85 - 70 + 1)) + 70; // 10% chance: promising
            } else if (chanceOfBetterPlayer >= 6) {
                overall = Math.floor(Math.random() * (74 - 60 + 1)) + 60; // 30% chance: developing
            } else {
                overall = Math.floor(Math.random() * (59 - 55 + 1)) + 55; // 60% chance: raw
            }
        } else if (age >= 21 && age <= 27) {
            // Prime development years: higher chance at high overall
            if (chanceOfBetterPlayer >= 8) {
                overall = Math.floor(Math.random() * (97 - 80 + 1)) + 80; // 20% chance: excellent
            } else if (chanceOfBetterPlayer >= 5) {
                overall = Math.floor(Math.random() * (84 - 70 + 1)) + 70; // 30% chance: good
            } else {
                overall = Math.floor(Math.random() * (73 - 60 + 1)) + 60; // 50% chance: average
            }
        } else {
            // 28-35: higher chance at basic/declining overall
            if (chanceOfBetterPlayer >= 9) {
                overall = Math.floor(Math.random() * (85 - 72 + 1)) + 72; // 10% chance: decent veteran
            } else if (chanceOfBetterPlayer >= 5) {
                overall = Math.floor(Math.random() * (76 - 62 + 1)) + 62; // 40% chance: average veteran
            } else {
                overall = Math.floor(Math.random() * (61 - 55 + 1)) + 55; // 50% chance: declining
            }
        }
    } else {
        // COUNTRIES 31-50 - Alright players
        if (age >= 15 && age <= 20) {
            // Young players: higher chance of low overall
            if (chanceOfBetterPlayer >= 9) {
                overall = Math.floor(Math.random() * (84 - 65 + 1)) + 65; // 10% chance: decent prospect
            } else if (chanceOfBetterPlayer >= 6) {
                overall = Math.floor(Math.random() * (70 - 58 + 1)) + 58; // 30% chance: developing
            } else {
                overall = Math.floor(Math.random() * (57 - 55 + 1)) + 55; // 60% chance: raw
            }
        } else if (age >= 21 && age <= 27) {
            // Prime development years: higher chance at decent overall
            if (chanceOfBetterPlayer >= 8) {
                overall = Math.floor(Math.random() * (92 - 75 + 1)) + 75; // 20% chance: good
            } else if (chanceOfBetterPlayer >= 5) {
                overall = Math.floor(Math.random() * (81 - 65 + 1)) + 65; // 30% chance: decent
            } else {
                overall = Math.floor(Math.random() * (70 - 58 + 1)) + 58; // 50% chance: average
            }
        } else {
            // 28-35: higher chance at basic/declining overall
            if (chanceOfBetterPlayer >= 9) {
                overall = Math.floor(Math.random() * (80 - 68 + 1)) + 68; // 10% chance: decent veteran
            } else if (chanceOfBetterPlayer >= 5) {
                overall = Math.floor(Math.random() * (73 - 60 + 1)) + 60; // 40% chance: average veteran
            } else {
                overall = Math.floor(Math.random() * (59 - 55 + 1)) + 55; // 50% chance: declining
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
    const calculatedValue = Math.pow((overall - 50) / 10, 3) * 0.22;
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
        contract: {
            4: playerValue,
        },
        startingNational: false,
        startingTeam: false,
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

function createUniquePlayer(position: string, teamName: string, PlayersMap: Map<string, Player>, countryName?: string): Player {
    let player = createRandomPlayer(position, teamName, countryName);
    while (PlayersMap.has(player.name)) {
        player = createRandomPlayer(position, teamName, countryName);
        player.name = getRandomPlayerName();
    }
    return player;
}

function addPlayer(position: string, teamName: string, players: Player[], AllPlayers: Player[], PlayersMap: Map<string, Player>, countryName?: string) {
    const player = createUniquePlayer(position, teamName, PlayersMap, countryName);
    players.push(player);
    AllPlayers.push(player);
    PlayersMap.set(player.name, player);
}

function createPlayersForTeam(team: Team, AllPlayers: Player[], PlayersMap: Map<string, Player>) {
    const players: Player[] = [];

    //create forwards
    for (let i = 0; i < 5; i++) {
        addPlayer("Forward", team.name, players, AllPlayers, PlayersMap);
    }
    //create midfielders
    for (let i = 0; i < 5; i++) {
        addPlayer("Midfielder", team.name, players, AllPlayers, PlayersMap);
    }
    //create defenders
    for (let i = 0; i < 6; i++) {
        addPlayer("Defender", team.name, players, AllPlayers, PlayersMap);
    }
    //create goalkeepers
    for (let i = 0; i < 2; i++) {
        addPlayer("Goalkeeper", team.name, players, AllPlayers, PlayersMap);
    }

    // Assign player names to team
    team.players = players.map((p) => p.name);
}

function getNationalTeamPlayers(nation: string, AllPlayers: Player[], PlayersMap: Map<string, Player>): string[] {
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
        const player = createUniquePlayer("Forward", "Free Agent", PlayersMap, nation);
        nationalTeamPlayers.push(player);
        AllPlayers.push(player);
        PlayersMap.set(player.name, player);
        forwardCount++;
    }

    while (midfielderCount < 5) {
        const player = createUniquePlayer("Midfielder", "Free Agent", PlayersMap, nation);
        nationalTeamPlayers.push(player);
        AllPlayers.push(player);
        PlayersMap.set(player.name, player);
        midfielderCount++;
    }

    while (defenderCount < 6) {
        const player = createUniquePlayer("Defender", "Free Agent", PlayersMap, nation);
        nationalTeamPlayers.push(player);
        AllPlayers.push(player);
        PlayersMap.set(player.name, player);
        defenderCount++;
    }

    while (goalkeeperCount < 2) {
        const player = createUniquePlayer("Goalkeeper", "Free Agent", PlayersMap, nation);
        nationalTeamPlayers.push(player);
        AllPlayers.push(player);
        PlayersMap.set(player.name, player);
        goalkeeperCount++;
    }

    return nationalTeamPlayers.map((p) => p.name);
}

export function InitPlayers(AllPlayers: Player[], TeamsMap: Map<string, Team>, PlayersMap: Map<string, Player>, NationalTeams: NationalTeam[], Leagues: League[], Tournaments: Tournament[], InternationalTournaments: InternationalTournament[], WorldCup: WorldCup) {
    // Initialize leagues - get unique league names and create league objects
    const uniqueLeagues = [...new Set(AllTeams.map((t) => t.league))];

    uniqueLeagues.forEach((leagueName: string) => {
        const league: League = {
            name: leagueName,
            teams: [],
            matches: [],
            pastChampions: []
        };

        Leagues.push(league);
    });

    const uniqueClubTournaments = [...new Set(AllTeams.map((t) => t.tournament))];

    uniqueClubTournaments.forEach((tournamentName: string) => {
        const tournament: Tournament = {
            name: tournamentName,
            currentRound: "First Round",
            teams: [],
            matches: [],
            pastChampions: []
        };

        Tournaments.push(tournament);
    });

    // Initialize International Tournaments - flatten the tournament arrays and get unique values
    const uniqueInternationalTournaments = [...new Set(Top50Countries.flatMap((t) => t.tournaments))];

    uniqueInternationalTournaments.forEach((tournamentName: string) => {
        const tournament: InternationalTournament = {
            name: tournamentName,
            teams: [],
            matches: [],
            pastChampions: []
        };

        InternationalTournaments.push(tournament);
    });

    // Initialize Club Teams
    AllTeams.forEach((teamData: any) => {
        // Create the new team object
        const newTeam: Team = {
            name: teamData.name,
            league: teamData.league,
            manager: {
                name: getRandomPlayerName(),
                country: Top50Countries[Math.floor(Math.random() * Top50Countries.length)].country,
                team: teamData.name,
                age: Math.floor(Math.random() * (60 - 25 + 1)) + 25,
                type: "Club",
                leagueTrophies: 0,
                tournamentTrophies: 0,
                internationalTrophies: 0,
                careerWins: 0,
                careerLosses: 0,
                careerDraws: 0,
                trophiesWon: []
            },
            color: teamData.color,
            players: [],
            form: [],
            moneyToSpend: 250,
            leagueName: teamData.league,
            Schedule: [],
            points: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            goalsFor: 0,
            goalsAgainst: 0,
        };

        // Add to TeamsMap
        TeamsMap.set(newTeam.name, newTeam);

        // Add team name to Leagues array
        Leagues.forEach((league: League) => {
            if (league.name === teamData.league) {
                league?.teams?.push(newTeam.name);
            }
        });

        // Add to Tournaments array as TournamentTeam
        Tournaments.forEach((tournament: Tournament) => {
            if (tournament.name === teamData.tournament) {
                tournament?.teams?.push({
                    teamName: newTeam.name,
                    tournamentName: tournament.name,
                    nextRound: true,
                });
            }
        });

        // Create players for this team (will update newTeam.players)
        createPlayersForTeam(newTeam, AllPlayers, PlayersMap);
    });

    // Initialize National Teams
    Top50Countries.forEach((countryData: any) => {
        const nationalTeam: NationalTeam = {
            team: {
                name: countryData.country,
                league: "National",
                manager: {
                    name: getRandomPlayerName(),
                    country: countryData.country,
                    team: countryData.country,
                    age: Math.floor(Math.random() * (60 - 25 + 1)) + 25,
                    type: "National",
                    leagueTrophies: 0,
                    tournamentTrophies: 0,
                    internationalTrophies: 0,
                    careerWins: 0,
                    careerLosses: 0,
                    careerDraws: 0,
                    trophiesWon: []
                },
                color: '',
                players: [],
                moneyToSpend: 0,
                form: [],
                leagueName: '',
                Schedule: [],
                points: 0,
                wins: 0,
                losses: 0,
                draws: 0,
                goalsFor: 0,
                goalsAgainst: 0,
            },
            country: countryData.country
        };

        // Get players for this national team
        const playerNames = getNationalTeamPlayers(countryData.country, AllPlayers, PlayersMap);
        nationalTeam.team.players = playerNames;

        // Add national team to TeamsMap
        TeamsMap.set(nationalTeam.team.name, nationalTeam.team);

        // Add to International Tournaments array
        InternationalTournaments.forEach((tournament: InternationalTournament) => {
            if (countryData.tournaments.includes(tournament.name)) {
                tournament?.teams?.push({
                    teamName: nationalTeam.country,
                    tournamentName: tournament.name,
                    nextRound: true,
                });
            }
        });

        // Add to WorldCup array
        WorldCup.teams.push({
            teamName: nationalTeam.country,
            nextRound: true,
        });

        // Add to NationalTeams array
        NationalTeams.push(nationalTeam);
    });
}

export default InitPlayers;