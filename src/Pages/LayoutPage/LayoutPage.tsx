import { useState, useEffect } from "react";
import { InitPlayers } from "../../Initalizer/InitPlayers";
import type { NationalTeam, Player, Team } from "../../Models/WorldStage";
import { StartingPage } from "../StartingPage/StartingPage";
import { CreateManager } from "../CreateManager/CreateManager";
import styles from "./LayoutPage.module.css";

export function LayoutPage() {
    const [currentPage, setCurrentPage] = useState<string>("StartingPage");
    const [allPlayers, setAllPlayers] = useState<Player[]>([]);
    const [clubTeams, setClubTeams] = useState<Team[]>([]);
    const [nationalTeams, setNationalTeams] = useState<NationalTeam[]>([]);

    useEffect(() => {
        handleInit();
    }, []);

    const handleInit = () => {
        const players: Player[] = [];
        const clubs: Team[] = [];
        const nations: NationalTeam[] = [];

        InitPlayers(players, clubs, nations);

        setAllPlayers(players);
        setClubTeams(clubs);
        setNationalTeams(nations);

        console.log("Club Teams:", clubs);
        console.log("National Teams:", nations);
    };

    const handlePageChange = (page: string) => {
        setCurrentPage(page);
    };

    if (currentPage === "StartingPage") {
        return (
            <div className={styles.layoutPageContainer}>
                <StartingPage
                    setCurrentPage={handlePageChange}
                />
            </div >
        );
    } else if (currentPage === "CreateManager") {
        return (
            <div className={styles.layoutPageContainer}>
                <CreateManager />
            </div>
        );
    }
}