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

export interface WeekDay {
    dayNumber: number;
    dateStr: string;
}

export interface Week {
    weekDays: Record<string, WeekDay>;
}

export interface trophy {
    trophy: string;
    trophyType: string;
    trophyYear: number;
}

export interface Player {
    name: string;
    position: string;
    overall: number;
    stamina: number;
    trainingPoints: number;
    trainingUpgradePoints: number;
    trainingIntency: string;
    injured: boolean;
    weeksInjured: number;
    country: string;
    startingNational?: boolean;
    startingTeam?: boolean;
    startingTeamWithoutInjury?: boolean;
    startingNationalWithoutInjury?: boolean;
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
    seasonYellowCards: number;
    consecutiveYellowCards: number;
    seasonRedCards: number;
    gamesSuspended: number;
    careerYellowCards: number;
    careerRedCards: number;
    totalGoals: number;
    totalAssists: number;
    cleanSheets: number;
    awards: number;
    trophies: number;
    otherTrophiesThisSeason: number;
    importantTrophiesThisSeason: number;
    newPlayer: boolean;
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
    isUserManager: boolean;
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
    newlyPromoted: boolean;
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
    tournamentName?: string;
    tournamentRound?: string;
    penaltyWin?: boolean;
    leg?: number;
    played?: boolean;
    homeInjuries?: [string, number][]; // [playerName, weeksInjured]
    awayInjuries?: [string, number][];
    homeCards?: [string, string][];
    awayCards?: [string, string][]; // [playerName, cardType]
}

export interface PlayerAwards {
    ballonDorWinners: string[];
    goldenBootWinners: string[];
    bestKeeper: string[];
    premBestPlayer: string[];
    premGoldenBoot: string[];
    laLigaBestPlayer: string[];
    laLigaGoldenBoot: string[];
    serieABestPlayer: string[];
    serieAGoldenBoot: string[];
    bundesligaBestPlayer: string[];
    bundesligaGoldenBoot: string[];
    ligue1BestPlayer: string[];
    ligue1GoldenBoot: string[];
    eredivisieBestPlayer: string[];
    eredivisieGoldenBoot: string[];
    primeraDivisionBestPlayer: string[];
    primeraDivisionGoldenBoot: string[];
}

export interface League {
    name: string;
    teams: string[];
    topThree: string[];
    topSix: string[];
    topNine: string[];
    bottomThree: string[];
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

export interface InternationalGroupStanding {
    teamName: string;
    points: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
}

export interface InternationalGroup {
    name: string;
    teams: string[];
    standings: InternationalGroupStanding[];
}

export interface InternationalTournament {
    name: string;
    teams: InternationalTournamentTeam[];
    matches: Match[];
    pastChampions: InternationalTournamentTeam[];
    groups?: InternationalGroup[];
    currentPhase?: "not_started" | "qualifying" | "group" | "knockout" | "complete" | "friendly";
    currentRound?: string;
}

export interface Tournament {
    name: string;
    teams: TournamentTeam[];
    currentRound: string;
    matches: Match[];
    pastChampions: TournamentTeam[];
    seasonStartYear?: number;
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