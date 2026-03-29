import { createContext, useContext } from "react";
import { signal } from "@preact/signals-react";
import type {
    Achievements,
    InternationalTournament,
    League,
    Manager,
    ManagerHistory,
    NationalTeam,
    Player,
    Team,
    Tournament,
    WorldCup,
    currentYear,
} from "../Models/WorldStage";

const currentPage = signal<string>("StartingPage");
const allPlayers = signal<Player[]>([]);
const teamsMap = signal<Map<string, Team>>(new Map());
const playersMap = signal<Map<string, Player>>(new Map());
const nationalTeams = signal<NationalTeam[]>([]);
const userManager = signal<Manager>({
    name: "",
    country: "",
    team: "",
    age: 0,
    type: "",
    leagueTrophies: 0,
    tournamentTrophies: 0,
    internationalTrophies: 0,
    careerWins: 0,
    careerLosses: 0,
    careerDraws: 0,
    trophiesWon: []
});
const leagues = signal<League[]>([]);
const tournaments = signal<Tournament[]>([]);
const internationalTournaments = signal<InternationalTournament[]>([]);
const worldCup = signal<WorldCup>({
    teams: [],
    matches: [],
    pastChampions: [],
    currentRound: "",
    groups: []
});
const currentYear = signal<currentYear>({
    year: 2025,
    yearsCompleted: 0,
    leagueWeek: 1,
    currentMonth: "August",
    currentDay: 1,
    currentDayOfWeek: "Friday",
    isInternationalBreak: false,
    yearMatches: []
});
const achievements = signal<Achievements>({
    playFirstSeason: false,
    play10Seasons: false,
    play50Seasons: false,
    play100Seasons: false,
    playFirstTournament: false,
    winTheLeague: false,
    win10Leagues: false,
    win50Leagues: false,
    get100Points: false,
    invincibleSeason: false,
    winAnInternationalTournament: false,
    winFirstTrophy: false,
    winTheWorldCup: false,
    win10Trophies: false,
    win50Trophies: false,
    win100Trophies: false,
    getA99Overall: false,
    getA99Potential: false
});
const managerHistory = signal<ManagerHistory>({
    topGoalScorersByYear: {},
    topAssistScorersByYear: {},
    topCleanSheetsByYear: {}
});

const currentTournament = signal<string | null>("");

const currentInternationalTournament = signal<string | null>("");

const gameContext = {
    currentPage,
    allPlayers,
    teamsMap,
    playersMap,
    nationalTeams,
    userManager,
    leagues,
    tournaments,
    internationalTournaments,
    worldCup,
    currentYear,
    achievements,
    managerHistory,
    currentTournament,
    currentInternationalTournament,
};


export type GameContextType = typeof gameContext;

const GameContext = createContext<GameContextType>(gameContext);

export function useGameContext() {
    return useContext(GameContext);
}

export { GameContext, gameContext };
