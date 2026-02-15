import { useEffect } from "react";
import type { Manager, NationalTeam, Team } from "../../Models/WorldStage.ts";
import SelectNational from "../../Components/SelectNational/SelectNational.tsx";
import styles from "./MainPage.module.css";

interface MainPageProps {
    allTeams: Team[];
    setAllTeams: (teams: Team[]) => void;
    nationalTeams: NationalTeam[];
    setNationalTeams: (teams: NationalTeam[]) => void;
    userManager: Manager;
    setUserManager: (manager: Manager) => void;
}

export function MainPage({ allTeams, setAllTeams, nationalTeams, setNationalTeams, userManager, setUserManager }: MainPageProps) {

    return (
        <div className={styles.mainPageContainer}>
            <SelectNational
                nationalTeams={nationalTeams}
                setNationalTeams={setNationalTeams}
                manager={userManager}
            />
        </div>
    );
}

export default MainPage;