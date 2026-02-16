import type { Player } from "../../Models/WorldStage";
import styles from "./Formation.module.css";

interface PlayerAttributesViewProps {
    player: Player;
    setSelectedPlayer: (player: Player | null) => void;
}

export function PlayerAttributesView({ player, setSelectedPlayer }: PlayerAttributesViewProps) {
    return (
        <div className={styles.playerAttributesView}>
            <div className={styles.playerName}>{player.name}</div>

            <div className={styles.playerStats}>
                <span className={styles.statBadge}>
                    <span className={styles.statLabel}>Age:</span>
                    <span>{player.age}</span>
                </span>

                <span className={styles.statBadge}>
                    <span className={styles.statLabel}>OVR:</span>
                    <span className={styles.overallValue}>{player.overall}</span>
                </span>

                <span className={styles.statBadge}>
                    <span className={styles.statLabel}>POT:</span>
                    <span className={styles.potentialValue}>{player.potential}</span>
                </span>

                <span className={styles.statBadge}>
                    <span className={styles.statLabel}>Country:</span>
                    <span>{player.country}</span>
                </span>
            </div>
            <button className={styles.closeButton} onClick={() => setSelectedPlayer(null)}>Close</button>
        </div>
    );
}

export default PlayerAttributesView;