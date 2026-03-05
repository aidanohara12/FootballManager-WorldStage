import { Top50Countries } from "../Models/Countries";
import AllTeams from "../Models/Teams";
import { firstNames } from "../Models/Names/FirstNames";
import { lastNames } from "../Models/Names/LastNames";
import { type Player, type Team, type NationalTeam, type League, type Tournament, type InternationalTournament, type WorldCup } from "../Models/WorldStage";
import { addPlayer, createUniquePlayer, getRandomPlayerName } from "../Utils/TeamPlayers";

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
            topThree: [],
            bottomThree: [],
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