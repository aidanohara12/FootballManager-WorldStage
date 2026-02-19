import { useState, useEffect } from "react";
import { InitPlayers } from "../../Initalizer/InitPlayers";
import type { Achievements, InternationalTournament, League, Manager, ManagerHistory, NationalTeam, Player, Team, Tournament, WorldCup, currentYear } from "../../Models/WorldStage";
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
        type: "",
        leagueTrophies: 0,
        tournamentTrophies: 0,
        internationalTrophies: 0,
        careerWins: 0,
        careerLosses: 0,
        careerDraws: 0,
        trophiesWon: []
    });
    const [leagues, setLeagues] = useState<League[]>([]);
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [internationalTournaments, setInternationalTournaments] = useState<InternationalTournament[]>([]);
    const [worldCup, setWorldCup] = useState<WorldCup>({
        teams: [],
        matches: [],
        pastChampions: [],
        currentRound: "",
        groups: []
    });
    const [currentYear, setCurrentYear] = useState<currentYear>({
        year: 2026,
        yearsCompleted: 0
    });
    const [achievements, setAchievements] = useState<Achievements>({
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
    const [managerHistory, setManagerHistory] = useState<ManagerHistory>({
        topGoalScorrers: [],
        topAssistScorrers: [],
        topCleanSheets: [],
        topGoalScorersByYear: {},
        topAssistScorersByYear: {},
        topCleanSheetsByYear: {}
    });

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
        const worldCup: WorldCup = {
            teams: [],
            matches: [],
            pastChampions: [],
            currentRound: "",
            groups: []
        };


        InitPlayers(players, clubs, nations, leagues, tournaments, internationalTournaments, worldCup);

        setAllPlayers(players);
        setClubTeams(clubs);
        setNationalTeams(nations);
        setLeagues(leagues);
        setTournaments(tournaments);
        setInternationalTournaments(internationalTournaments);
        setWorldCup(worldCup);
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
                    allPlayers={allPlayers}
                    allTeams={clubTeams}
                    setAllTeams={setClubTeams}
                    nationalTeams={nationalTeams}
                    setNationalTeams={setNationalTeams}
                    userManager={userManager}
                    setUserManager={setUserManager}
                    leagues={leagues}
                    setLeagues={setLeagues}
                    tournaments={tournaments}
                    setTournaments={setTournaments}
                    internationalTournaments={internationalTournaments}
                    setInternationalTournaments={setInternationalTournaments}
                    worldCup={worldCup}
                    setWorldCup={setWorldCup}
                    currentYear={currentYear}
                    setCurrentYear={setCurrentYear}
                    achievements={achievements}
                    setAchievements={setAchievements}
                    managerHistory={managerHistory}
                    setManagerHistory={setManagerHistory}
                />
            </div>
        );
    }
}