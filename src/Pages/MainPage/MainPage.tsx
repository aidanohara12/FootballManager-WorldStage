import { useEffect, useState } from "react";
import type { Manager, NationalTeam, Team } from "../../Models/WorldStage.ts";
import SelectNational from "../../Components/SelectNational/SelectNational.tsx";
import styles from "./MainPage.module.css";
import { SelectClub } from "../../Components/SelectClub/SelectClub.tsx";
import { Schedule } from "../../Tabs/Schedule/Schedule.tsx";
import { Stats } from "../../Tabs/Stats/Stats.tsx";
import { TeamView } from "../../Tabs/Team/TeamView.tsx";
import { History } from "../../Tabs/History/History.tsx";
import { Table } from "../../Tabs/Table/Table.tsx";

interface MainPageProps {
    allTeams: Team[];
    setAllTeams: (teams: Team[]) => void;
    nationalTeams: NationalTeam[];
    setNationalTeams: (teams: NationalTeam[]) => void;
    userManager: Manager;
    setUserManager: (manager: Manager) => void;
}

export function MainPage({ allTeams, setAllTeams, nationalTeams, setNationalTeams, userManager, setUserManager }: MainPageProps) {
    const [currentPage, setCurrentPage] = useState<string>("SelectNational");
    const [activeTab, setActiveTab] = useState<string>("Schedule");
    return (
        <div className={styles.mainPageContainer}>
            {currentPage === "SelectNational" && (
                <SelectNational
                    nationalTeams={nationalTeams}
                    setNationalTeams={setNationalTeams}
                    manager={userManager}
                    setCurrentPage={setCurrentPage}
                />
            )}
            {currentPage === "SelectClub" && (
                <SelectClub
                    teams={allTeams}
                    setTeams={setAllTeams}
                    manager={userManager}
                    setCurrentPage={setCurrentPage}
                />
            )}
            {currentPage === "MainPage" && (
                <div>
                    {activeTab === "Schedule" && <Schedule />}
                    {activeTab === "Stats" && <Stats />}
                    {activeTab === "Team" && <TeamView />}
                    {activeTab === "History" && <History />}
                    {activeTab === "Table" && <Table />}
                    <div>
                        <button onClick={() => setActiveTab("Schedule")}>Schedule</button>
                        <button onClick={() => setActiveTab("Team")}>Team</button>
                        <button onClick={() => setActiveTab("Table")}>Table</button>
                        <button onClick={() => setActiveTab("Stats")}>Stats</button>
                        <button onClick={() => setActiveTab("History")}>History</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MainPage;