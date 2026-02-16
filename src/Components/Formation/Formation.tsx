import type { Player, Team } from "../../Models/WorldStage";
import PlayerCard from "./PlayerCard";
import styles from "./Formation.module.css";

interface FormationProps {
    currentTeam: Team;
    setSelectedPlayer: (player: Player | null) => void;
}

export function Formation({ currentTeam, setSelectedPlayer }: FormationProps) {
    const currentTeamForwards = currentTeam.players?.filter((p) => p.position === "Forward").filter((p) => p.startingTeam);
    const currentTeamMidfielders = currentTeam.players?.filter((p) => p.position === "Midfielder").filter((p) => p.startingTeam);
    const currentTeamDefenders = currentTeam.players?.filter((p) => p.position === "Defender").filter((p) => p.startingTeam);
    const currentTeamGoalkeepers = currentTeam.players?.filter((p) => p.position === "Goalkeeper").filter((p) => p.startingTeam);
    const currentTeamBench = currentTeam.players?.filter((p) => !p.startingTeam).sort((a, b) => b.overall - a.overall);
    return (
        <div className={styles.formation}>
            <div className={styles.starters}>
                <div className={styles.forwards}>
                    {currentTeamForwards?.map((p) => (
                        <PlayerCard key={p.name} player={p} setSelectedPlayer={setSelectedPlayer} />
                    ))}
                </div>
                <div className={styles.midfielders}>
                    {currentTeamMidfielders?.map((p) => (
                        <PlayerCard key={p.name} player={p} setSelectedPlayer={setSelectedPlayer} />
                    ))}
                </div>
                <div className={styles.defenders}>
                    {currentTeamDefenders?.map((p) => (
                        <PlayerCard key={p.name} player={p} setSelectedPlayer={setSelectedPlayer} />
                    ))}
                </div>
                <div className={styles.goalkeepers}>
                    {currentTeamGoalkeepers?.map((p) => (
                        <PlayerCard key={p.name} player={p} setSelectedPlayer={setSelectedPlayer} />
                    ))}
                </div>
            </div>
            <div className={styles.bench}>
                {currentTeamBench?.map((p) => (
                    <PlayerCard key={p.name} player={p} setSelectedPlayer={setSelectedPlayer} />
                ))}
            </div>
        </div>
    );
}

export default Formation;