import type { Player, Team } from "../../Models/WorldStage";
import PlayerCard from "./PlayerCard";
import styles from "./Formation.module.css";
import type { Signal } from "@preact/signals-react";

interface FormationProps {
    currentTeam: Team;
    selectedPlayer: Signal<Player | null>;
    clubTeam: boolean;
}

export function Formation({ currentTeam, selectedPlayer, clubTeam }: FormationProps) {
    const currentTeamForwards = currentTeam.players?.filter((p) => p.position === "Forward").filter((p) => clubTeam ? p.startingTeam : p.startingNational);
    const currentTeamMidfielders = currentTeam.players?.filter((p) => p.position === "Midfielder").filter((p) => clubTeam ? p.startingTeam : p.startingNational);
    const currentTeamDefenders = currentTeam.players?.filter((p) => p.position === "Defender").filter((p) => clubTeam ? p.startingTeam : p.startingNational);
    const currentTeamGoalkeepers = currentTeam.players?.filter((p) => p.position === "Goalkeeper").filter((p) => clubTeam ? p.startingTeam : p.startingNational);
    const currentTeamBench = currentTeam.players?.filter((p) => clubTeam ? !p.startingTeam : !p.startingNational).sort((a, b) => b.overall - a.overall);
    return (
        <div className={styles.formation}>
            <div className={styles.starters}>
                <div className={styles.forwards}>
                    {currentTeamForwards?.map((p) => (
                        <PlayerCard key={p.name} player={p} selectedPlayer={selectedPlayer} />
                    ))}
                </div>
                <div className={styles.midfielders}>
                    {currentTeamMidfielders?.map((p) => (
                        <PlayerCard key={p.name} player={p} selectedPlayer={selectedPlayer} />
                    ))}
                </div>
                <div className={styles.defenders}>
                    {currentTeamDefenders?.map((p) => (
                        <PlayerCard key={p.name} player={p} selectedPlayer={selectedPlayer} />
                    ))}
                </div>
                <div className={styles.goalkeepers}>
                    {currentTeamGoalkeepers?.map((p) => (
                        <PlayerCard key={p.name} player={p} selectedPlayer={selectedPlayer} />
                    ))}
                </div>
            </div>
            <div className={styles.bench}>
                {currentTeamBench?.map((p) => (
                    <PlayerCard key={p.name} player={p} selectedPlayer={selectedPlayer} />
                ))}
            </div>
        </div>
    );
}

export default Formation;