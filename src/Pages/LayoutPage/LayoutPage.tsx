import { useState, useEffect } from "react";
import { InitPlayers } from "../../Initalizer/InitPlayers";
import type { InternationalTournament, League, Manager, NationalTeam, Player, Team, Tournament } from "../../Models/WorldStage";
import { StartingPage } from "../StartingPage/StartingPage";
import { MainPage } from "../MainPage/MainPage";
import { CreateManager } from "../CreateManager/CreateManager";
import styles from "./LayoutPage.module.css";

export function LayoutPage() {
    const [currentPage, setCurrentPage] = useState<string>("StartingPage");
    const [allPlayers, setAllPlayers] = useState<Player[]>([]);
    const [clubTeams, setClubTeams] = useState<Team[]>([]);
    const [nationalTeams, setNationalTeams] = useState<NationalTeam[]>([]);
    const [userManager, setUserManager] = useState<Manager>({
        name: "",
        country: "",
        team: "",
        age: 0,
        type: ""
    });
    const [leagues, setLeagues] = useState<League[]>([]);
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [internationalTournaments, setInternationalTournaments] = useState<InternationalTournament[]>([]);

    useEffect(() => {
        handleInit();
    }, []);

    const handleInit = () => {
        const players: Player[] = [];
        const clubs: Team[] = [];
        const nations: NationalTeam[] = [];
        const leagues: League[] = [];
        const tournaments: Tournament[] = [];
        const internationalTournaments: InternationalTournament[] = [];


        InitPlayers(players, clubs, nations, leagues, tournaments, internationalTournaments);

        setAllPlayers(players);
        setClubTeams(clubs);
        setNationalTeams(nations);
        setLeagues(leagues);
        setTournaments(tournaments);
        setInternationalTournaments(internationalTournaments);
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
                <CreateManager
                    setCurrentPage={handlePageChange}
                    allTeams={clubTeams}
                    nationalTeams={nationalTeams}
                    setAllTeams={setClubTeams}
                    setNationalTeams={setNationalTeams}
                    setUserManager={setUserManager}
                />
            </div>
        );
    } else if (currentPage === "MainPage") {
        return (
            <div className={styles.layoutPageContainer}>
                <MainPage
                    allTeams={clubTeams}
                    setAllTeams={setClubTeams}
                    nationalTeams={nationalTeams}
                    setNationalTeams={setNationalTeams}
                    userManager={userManager}
                    setUserManager={setUserManager}
                    leagues={leagues}
                    tournaments={tournaments}
                    internationalTournaments={internationalTournaments}
                />
            </div>
        );
    }
}