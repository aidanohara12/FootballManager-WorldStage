export interface currentYear {
    year: number;
    yearsCompleted: number;
}

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
    leagueGoals: number;
    leagueAssists: number;
    countryGoals: number;
    countryAssists: number;
    totalGoals: number;
    totalAssists: number;
    cleanSheets: number;
    awards: number;
    trophies: number;
}

export interface Manager {
    name: string;
    country: string;
    team: string;
    age: number;
    type: string;
    leagueTrophies: number;
    tournamentTrophies: number;
    internationalTrophies: number;
    careerWins: number;
    careerLosses: number;
    careerDraws: number;
    trophiesWon: string[];
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
    nextRound: boolean;
}

export interface InternationalTournamentTeam {
    Team: NationalTeam;
    Tournament: InternationalTournament;
    nextRound: boolean;
}

export interface InternationalTournament {
    name: string;
    teams: InternationalTournamentTeam[];
    matches: Match[];
    pastChampions: InternationalTournamentTeam[];
}

export interface Tournament {
    name: string;
    teams: TournamentTeam[];
    currentRound: string;
    matches: Match[];
    pastChampions: TournamentTeam[];
}

export interface WorldCupTeam {
    Team: NationalTeam;
    Tournament: WorldCup;
    nextRound: boolean;
}

export interface WorldCupGroup {
    name: string;
    teams: InternationalTournamentTeam[];
}

export interface WorldCup {
    teams: WorldCupTeam[];
    matches: Match[];
    pastChampions: WorldCupTeam[];
    currentRound: string;
    groups: WorldCupGroup[];
}

export interface Achievements {
    playFirstSeason: boolean;
    play10Seasons: boolean;
    play50Seasons: boolean;
    play100Seasons: boolean;
    playFirstTournament: boolean;
    winTheLeague: boolean;
    win10Leagues: boolean;
    win50Leagues: boolean;
    get100Points: boolean;
    invincibleSeason: boolean;
    winAnInternationalTournament: boolean;
    winFirstTrophy: boolean;
    winTheWorldCup: boolean;
    win10Trophies: boolean;
    win50Trophies: boolean;
    win100Trophies: boolean;
    getA99Overall: boolean;
    getA99Potential: boolean;

}

export interface yearPlayerStats {
    player: Player;
    goals: number;
    assists: number;
    cleanSheets: number;
}

export interface ManagerHistory {
    topGoalScorrers: Player[];
    topAssistScorrers: Player[];
    topCleanSheets: Player[];
    topGoalScorersByYear: Record<number, yearPlayerStats>;
    topAssistScorersByYear: Record<number, yearPlayerStats>;
    topCleanSheetsByYear: Record<number, yearPlayerStats>;
}