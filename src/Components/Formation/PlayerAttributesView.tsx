import Top50Countries from "../../Models/Countries";
import type { Player } from "../../Models/WorldStage";
import styles from "./PlayerAttributesView.module.css";

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
                    <span className={styles.statLabel}>Position:</span>
                    <span>{player.position}</span>
                </span>

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
                    <span>{player.country} {Top50Countries.find((c) => c.country === player.country)?.flag}</span>
                </span>

                <span className={styles.statBadge}>
                    <span className={styles.statLabel}>Team:</span>
                    <span>{player.team}</span>
                </span>

                <span className={styles.statBadge}>
                    <span className={styles.statLabel}>Value:</span>
                    <span>${(player.value).toFixed(1)}M</span>
                </span>

                {player.startingNational !== undefined && (
                    <span className={styles.statBadge}>
                        <span className={styles.statLabel}>National Starter:</span>
                        <span>{player.startingNational ? 'Yes' : 'No'}</span>
                    </span>
                )}

                {player.startingTeam !== undefined && (
                    <span className={styles.statBadge}>
                        <span className={styles.statLabel}>Team Starter:</span>
                        <span>{player.startingTeam ? 'Yes' : 'No'}</span>
                    </span>
                )}

                <span className={styles.statBadge}>
                    <span className={styles.statLabel}>Contract:</span>
                    <span>
                        {Object.entries(player.contract).map(([year, value]) => (
                            <span key={year}>{year}: ${(value).toFixed(1)}M/yr </span>
                        ))}
                    </span>
                </span>
            </div>
            <button className={styles.closeButton} onClick={() => setSelectedPlayer(null)}>Close</button>
        </div>
    );
}

export default PlayerAttributesView;