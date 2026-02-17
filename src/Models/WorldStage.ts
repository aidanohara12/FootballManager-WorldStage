export interface Player {
    name: string;
    position: string;
    overall: number;
    country: string;
    startingNational?: boolean;
    startingTeam?: boolean;
    team: string;
    age: number;
    potential: number;
    value: number;
    contract: Record<number, number>;
    leagueGoals?: number;
    leagueAssists?: number;
    countryGoals?: number;
    countryAssists?: number;
    totalGoals?: number;
    totalAssists?: number;
    awards?: number;
    trophies?: number;
}

export interface Manager {
    name: string;
    country: string;
    team: string;
    age: number;
    type: string;
    leagueTrophies?: number;
    tournamentTrophies?: number;
    internationalTrophies?: number;
}

export interface Team {
    name: string;
    league?: string;
    manager: Manager;
    color: string;
    players?: Player[];
    moneyToSpend: number;
}

export interface NationalTeam {
    team: Team;
    country: string;
}

export interface LeagueTeam {
    Team: Team;
    League: League;
    points: number;
    wins: number;
    losses: number;
    draws: number;
    goalsFor: number;
    goalsAgainst: number;
}

export interface Match {
    homeTeam: Team;
    awayTeam: Team;
    date: string;
    homeScore: number;
    awayScore: number;
    homeScorers: Player[];
    awayScorers: Player[];
    homeAssists: Player[];
    awayAssists: Player[];
    league: League;
    tournament: Tournament;
}

export interface League {
    name: string;
    teams: LeagueTeam[];
    matches: Match[];
    pastChampions: LeagueTeam[];
}

export interface InternationalFriendly {
    name: string;
    match: Match;
}

export interface TournamentTeam {
    Team: Team;
    Tournament: Tournament;
    points: number;
    wins: number;
    losses: number;
    draws: number;
    goalsFor: number;
    goalsAgainst: number;
}

export interface InternationalTournament {
    name: string;
    teams: TournamentTeam[];
    matches: Match[];
    pastChampions: TournamentTeam[];
}

export interface Tournament {
    name: string;
    teams: TournamentTeam[];
    matches: Match[];
    pastChampions: TournamentTeam[];
}