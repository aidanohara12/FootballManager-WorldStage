import { Top50Countries } from "../Models/Countries";
import AllTeams from "../Models/Teams";
import { type Player, type Team, type NationalTeam, type League, type Tournament, type InternationalTournament, type WorldCup } from "../Models/WorldStage";
import { addPlayer, createUniquePlayer, getRandomPlayerName } from "../Utils/TeamPlayers";
import type { Signal } from "@preact/signals-react";

function createPlayersForTeam(team: Team, AllPlayers: Player[], PlayersMap: Map<string, Player>, teamMap: Signal<Map<string, Team>>) {
    const players: Player[] = [];

    //create forwards
    for (let i = 0; i < 5; i++) {
        addPlayer("Forward", team.name, players, AllPlayers, PlayersMap, teamMap);
    }
    //create midfielders
    for (let i = 0; i < 5; i++) {
        addPlayer("Midfielder", team.name, players, AllPlayers, PlayersMap, teamMap);
    }
    //create defenders
    for (let i = 0; i < 6; i++) {
        addPlayer("Defender", team.name, players, AllPlayers, PlayersMap, teamMap);
    }
    //create goalkeepers
    for (let i = 0; i < 2; i++) {
        addPlayer("Goalkeeper", team.name, players, AllPlayers, PlayersMap, teamMap);
    }

    // Assign player names to team
    team.players = players.map((p) => p.name);
}

function getNationalTeamPlayers(nation: string, AllPlayers: Player[], PlayersMap: Map<string, Player>, teamMap: Signal<Map<string, Team>>): string[] {
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
        const player = createUniquePlayer("Forward", "Free Agent", PlayersMap, teamMap, nation);
        nationalTeamPlayers.push(player);
        AllPlayers.push(player);
        PlayersMap.set(player.name, player);
        forwardCount++;
    }

    while (midfielderCount < 5) {
        const player = createUniquePlayer("Midfielder", "Free Agent", PlayersMap, teamMap, nation);
        nationalTeamPlayers.push(player);
        AllPlayers.push(player);
        PlayersMap.set(player.name, player);
        midfielderCount++;
    }

    while (defenderCount < 6) {
        const player = createUniquePlayer("Defender", "Free Agent", PlayersMap, teamMap, nation);
        nationalTeamPlayers.push(player);
        AllPlayers.push(player);
        PlayersMap.set(player.name, player);
        defenderCount++;
    }

    while (goalkeeperCount < 2) {
        const player = createUniquePlayer("Goalkeeper", "Free Agent", PlayersMap, teamMap, nation);
        nationalTeamPlayers.push(player);
        AllPlayers.push(player);
        PlayersMap.set(player.name, player);
        goalkeeperCount++;
    }

    // Build squad positionally to guarantee minimum counts per position
    const forwards = nationalTeamPlayers.filter(p => p.position === "Forward").sort((a, b) => b.overall - a.overall).slice(0, 5);
    const midfielders = nationalTeamPlayers.filter(p => p.position === "Midfielder").sort((a, b) => b.overall - a.overall).slice(0, 5);
    const defenders = nationalTeamPlayers.filter(p => p.position === "Defender").sort((a, b) => b.overall - a.overall).slice(0, 6);
    const goalkeepers = nationalTeamPlayers.filter(p => p.position === "Goalkeeper").sort((a, b) => b.overall - a.overall).slice(0, 2);
    return [...forwards, ...midfielders, ...defenders, ...goalkeepers].map((p) => p.name);
}

export function InitPlayers(AllPlayers: Player[], TeamsMap: Signal<Map<string, Team>>, PlayersMap: Map<string, Player>, NationalTeams: NationalTeam[], Leagues: League[], Tournaments: Tournament[], InternationalTournaments: InternationalTournament[], WorldCup: WorldCup) {
    // Initialize leagues - get unique league names and create league objects
    const uniqueLeagues = [...new Set(AllTeams.map((t) => t.league))];

    uniqueLeagues.forEach((leagueName: string) => {
        const league: League = {
            name: leagueName,
            teams: [],
            matches: [],
            topThree: [],
            bottomThree: [],
            pastChampions: [],
            topNine: [],
            topSix: [],
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

    // Initialize secondary (league cup) tournaments
    const uniqueSecondaryTournaments = [...new Set(AllTeams.map((t) => t.tournament2))];

    uniqueSecondaryTournaments.forEach((tournamentName: string) => {
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
        const managerCountry = Top50Countries[Math.floor(Math.random() * Top50Countries.length)].country;
        const newTeam: Team = {
            name: teamData.name,
            league: teamData.league,
            manager: {
                name: getRandomPlayerName(managerCountry),
                country: managerCountry,
                team: teamData.name,
                age: Math.floor(Math.random() * (60 - 25 + 1)) + 25,
                type: "Club",
                leagueTrophies: 0,
                tournamentTrophies: 0,
                internationalTrophies: 0,
                careerWins: 0,
                careerLosses: 0,
                careerDraws: 0,
                trophiesWon: [],
                isUserManager: false
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
            newlyPromoted: false,
        };

        // Add to TeamsMap
        TeamsMap.value.set(newTeam.name, newTeam);

        // Add team name to Leagues array
        Leagues.forEach((league: League) => {
            if (league.name === teamData.league) {
                league?.teams?.push(newTeam.name);
            }
        });

        // Add to Tournaments array as TournamentTeam
        Tournaments.forEach((tournament: Tournament) => {
            if (tournament.name === teamData.tournament || tournament.name === teamData.tournament2) {
                tournament?.teams?.push({
                    teamName: newTeam.name,
                    tournamentName: tournament.name,
                    nextRound: true,
                });
            }
        });

        // Create players for this team (will update newTeam.players)
        createPlayersForTeam(newTeam, AllPlayers, PlayersMap, TeamsMap);
    });

    // Initialize National Teams
    Top50Countries.forEach((countryData: any) => {
        const nationalTeam: NationalTeam = {
            team: {
                name: countryData.country,
                league: "National",
                manager: {
                    name: getRandomPlayerName(countryData.country),
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
                    trophiesWon: [],
                    isUserManager: false
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
                newlyPromoted: false,
            },
            country: countryData.country
        };

        // Get players for this national team
        const playerNames = getNationalTeamPlayers(countryData.country, AllPlayers, PlayersMap, TeamsMap);
        nationalTeam.team.players = playerNames;

        // Add national team to TeamsMap
        TeamsMap.value.set(nationalTeam.team.name, nationalTeam.team);
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