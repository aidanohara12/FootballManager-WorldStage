import { useEffect } from "react";
import { InitPlayers } from "../../Initalizer/InitPlayers";
import type { InternationalTournament, League, NationalTeam, Player, Tournament, WorldCup } from "../../Models/WorldStage";
import { StartingPage } from "../StartingPage/StartingPage";
import { MainPage } from "../MainPage/MainPage";
import { CreateManager } from "../CreateManager/CreateManager";
import styles from "./LayoutPage.module.css";
import { useSignals } from "@preact/signals-react/runtime";
import { useGameContext } from "../../Context/GameContext";

export function LayoutPage() {
    useSignals();
    const {
        currentPage,
        allPlayers,
        teamsMap,
        playersMap,
        nationalTeams,
        leagues,
        tournaments,
        internationalTournaments,
        worldCup,
    } = useGameContext();

    useEffect(() => {
        handleInit();
    }, []);

    const handleInit = () => {
        const players: Player[] = [];
        const playersMapTemp = new Map<string, Player>();
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


        InitPlayers(players, teamsMap, playersMapTemp, nations, leaguesTemp, tournamentsTemp, internationalTournamentsTemp, worldCupTemp);

        allPlayers.value = players;
        playersMap.value = playersMapTemp;
        nationalTeams.value = nations;
        leagues.value = leaguesTemp;
        tournaments.value = tournamentsTemp;
        internationalTournaments.value = internationalTournamentsTemp;
        worldCup.value = worldCupTemp;

    };

    if (currentPage.value === "StartingPage") {
        return (
            <div className={styles.layoutPageContainer}>
                <StartingPage />
            </div >
        );
    } else if (currentPage.value === "CreateManager") {
        return (
            <div className={styles.layoutPageContainer}>
                <CreateManager />
            </div>
        );
    } else if (currentPage.value === "MainPage") {
        return (
            <div className={styles.layoutPageContainer}>
                <MainPage />
            </div>
        );
    }
}
