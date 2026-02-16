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
    const userTeam = allTeams.find((t) => t.name === userManager.team);
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
    console.log(allTeams);
    return (
        <div className={styles.teamViewContainer}>
            <h4 className={styles.teamName} style={{ color: userTeam?.color }}>{userTeam?.name}</h4>

            <div className={styles.formation}>
                <Formation currentTeam={userTeam ?? allTeams[0]} setSelectedPlayer={setSelectedPlayer} />
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