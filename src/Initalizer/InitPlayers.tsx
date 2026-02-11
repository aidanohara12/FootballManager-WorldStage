import Top50Countries from "../Models/Countries";
import AllTeams from "../Models/Teams";
import firstNames from "../Models/Names/FirstNames.ts";
import lastNames from "../Models/Names/LastNames.ts";
import { type Manager, type Player, type Team, type NationalTeam } from "../Models/WorldStage";

function getRandomPlayerName() {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    return `${firstName} ${lastName}`;
}

function createRandomPlayer(position: string, country: string, team: string) {
    const player: Player = {
        name: getRandomPlayerName(),
        position: position,
        overall: Math.floor(Math.random() * 100),
        country: country,
    };
}


const Init = () => {
    const players: Player[] = [];
    const teams: Team[] = [];
    const nationalTeams: NationalTeam[] = [];

    Top50Countries.forEach((countryData: any) => {
        nationalTeams.push({
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
    });

    AllTeams.forEach((team: any) => {
        teams.push({
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
    });
}