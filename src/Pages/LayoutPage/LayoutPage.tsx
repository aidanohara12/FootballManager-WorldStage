import { useState, useEffect } from "react";
import { signal } from "@preact/signals-react"
import { InitPlayers } from "../../Initalizer/InitPlayers";
import type { Achievements, InternationalTournament, League, Manager, ManagerHistory, NationalTeam, Player, Team, Tournament, WorldCup, currentYear } from "../../Models/WorldStage";
import { StartingPage } from "../StartingPage/StartingPage";
import { MainPage } from "../MainPage/MainPage";
import { CreateManager } from "../CreateManager/CreateManager";
import styles from "./LayoutPage.module.css";
import { useSignals } from "@preact/signals-react/runtime";

const currentPage = signal<string>("StartingPage");
const allPlayers = signal<Player[]>([]);
const clubTeams = signal<Team[]>([]);
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
    year: 2026,
    yearsCompleted: 0
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
    topGoalScorrers: [],
    topAssistScorrers: [],
    topCleanSheets: [],
    topGoalScorersByYear: {},
    topAssistScorersByYear: {},
    topCleanSheetsByYear: {}
});

export function LayoutPage() {
    useSignals();

    useEffect(() => {
        handleInit();
    }, []);

    const handleInit = () => {
        const players: Player[] = [];
        const clubs: Team[] = [];
        const nations: NationalTeam[] = [];
        const leaguesTemp: League[] = [];
        const tournamentsTemp: Tournament[] = [];
        const internationalTournamentsTemp: InternationalTournament[] = [];
        const worldCupTemp: WorldCup = {
            teams: [],
            matches: [],
            pastChampions: [],
            currentRound: "",
            groups: []
        };


        InitPlayers(players, clubs, nations, leaguesTemp, tournamentsTemp, internationalTournamentsTemp, worldCupTemp);

        allPlayers.value = players;
        clubTeams.value = clubs;
        nationalTeams.value = nations;
        leagues.value = leaguesTemp;
        tournaments.value = tournamentsTemp;
        internationalTournaments.value = internationalTournamentsTemp;
        worldCup.value = worldCupTemp;
    };

    if (currentPage.value === "StartingPage") {
        return (
            <div className={styles.layoutPageContainer}>
                <StartingPage
                    currentPage={currentPage}
                />
            </div >
        );
    } else if (currentPage.value === "CreateManager") {
        return (
            <div className={styles.layoutPageContainer}>
                <CreateManager
                    allTeams={clubTeams}
                    nationalTeams={nationalTeams}
                    userManager={userManager}
                    currentPage={currentPage}
                />
            </div>
        );
    } else if (currentPage.value === "MainPage") {
        return (
            <div className={styles.layoutPageContainer}>
                <MainPage
                    allPlayers={allPlayers}
                    allTeams={clubTeams}
                    nationalTeams={nationalTeams}
                    userManager={userManager}
                    leagues={leagues}
                    tournaments={tournaments}
                    internationalTournaments={internationalTournaments}
                    worldCup={worldCup}
                    currentYear={currentYear}
                    achievements={achievements}
                    managerHistory={managerHistory}
                />
            </div>
        );
    }
}