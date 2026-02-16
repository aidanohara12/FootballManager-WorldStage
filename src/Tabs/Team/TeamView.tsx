import type { Manager, NationalTeam, Player, Team } from "../../Models/WorldStage";
import { Formation } from "../../Components/Formation/Formation";
import styles from "./TeamView.module.css";
import { useState } from "react";
import { PlayerAttributesView } from "../../Components/Formation/PlayerAttributesView";

interface TeamViewProps {
    allTeams: Team[];
    setAllTeams: (teams: Team[]) => void;
    nationalTeams: NationalTeam[];
    setNationalTeams: (teams: NationalTeam[]) => void;
    userManager: Manager;
}

export function TeamView({ allTeams, setAllTeams, nationalTeams, setNationalTeams, userManager }: TeamViewProps) {
    const [clubTeam, setClubTeam] = useState<Team>(allTeams.find((t) => t.name === userManager.team)!);
    const [nationalTeam, setNationalTeam] = useState<Team>(nationalTeams.find((nt) => nt.country === userManager.country)?.team ?? allTeams[0]);
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
    const [currentTeam, setCurrentTeam] = useState<string>("Club");

    function switchTeam() {
        setCurrentTeam(currentTeam === "Club" ? "National" : "Club");
    }

    return (
        <div className={styles.teamViewContainer}>
            <div className={styles.teamInfo}>
                <h4 className={styles.teamName} style={{ color: currentTeam === "Club" ? clubTeam?.color : nationalTeam?.color }}>
                    {currentTeam === "Club" ? clubTeam?.name : nationalTeam?.name}
                </h4>
                <div>
                    <button onClick={switchTeam}>
                        {currentTeam === "Club" ? "Switch to National Team" : "Switch to Club Team"}
                    </button>
                </div>
            </div>
            <div className={styles.formation}>
                <Formation currentTeam={currentTeam === "Club" ? clubTeam : nationalTeam} setSelectedPlayer={setSelectedPlayer} clubTeam={currentTeam === "Club"} />
            </div>

            {selectedPlayer && (
                <div className={styles.selectedPlayer}>
                    <PlayerAttributesView player={selectedPlayer} setSelectedPlayer={setSelectedPlayer} />
                </div>
            )}
        </div>
    );
}

export default TeamView;