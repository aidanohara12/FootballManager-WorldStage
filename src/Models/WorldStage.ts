export interface currentYear {
    year: number;
    currentMonth: string;
    currentDay: number;
    currentDayOfWeek: string;
    yearsCompleted: number;
    isInternationalBreak: boolean;
    leagueWeek: number;
    yearMatches: Match[];
}

export interface Week {
    weekDays: Record<string, number>;
}

export interface trophy {
    trophy: string;
    trophyType: string;
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
    contractYrs: number;
    contractAmount: number;
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
    trophiesWon: trophy[];
}

export interface Team {
    name: string;
    league?: string;
    manager: Manager;
    color: string;
    players: string[];
    moneyToSpend: number;
    form: string[];
    leagueName: string;
    Schedule: Match[];
    points: number;
    wins: number;
    losses: number;
    draws: number;
    goalsFor: number;
    goalsAgainst: number;
}

export interface NationalTeam {
    team: Team;
    country: string;
}

export interface Match {
    homeTeamName: string;
    awayTeamName: string;
    date: string;
    homeScore: number;
    awayScore: number;
    homeScorers: [string, string][];
    awayScorers: [string, string][];
    homeAssists: [string, string][];
    awayAssists: [string, string][];
    isLeagueMatch: boolean;
    isTournamentMatch: boolean;
    isInternationalMatch: boolean;
}

export interface League {
    name: string;
    teams: string[];
    topFour: string[];
    matches: Match[];
    pastChampions: string[];
}

export interface InternationalFriendly {
    name: string;
    match: Match;
}

export interface TournamentTeam {
    teamName: string;
    tournamentName: string;
    nextRound: boolean;
}

export interface InternationalTournamentTeam {
    teamName: string;
    tournamentName: string;
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
    teamName: string;
    nextRound: boolean;
}

export interface WorldCupGroup {
    name: string;
    teams: WorldCupTeam[];
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
    stat: string;
    player: string;
    goals: number;
    assists: number;
    cleanSheets: number;
}

export interface ManagerHistory {
    topGoalScorersByYear: Record<number, yearPlayerStats>;
    topAssistScorersByYear: Record<number, yearPlayerStats>;
    topCleanSheetsByYear: Record<number, yearPlayerStats>;
}