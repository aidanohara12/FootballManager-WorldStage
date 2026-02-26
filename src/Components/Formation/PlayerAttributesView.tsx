import type { Signal } from "@preact/signals-react";
import Top50Countries from "../../Models/Countries";
import type { Player } from "../../Models/WorldStage";
import styles from "./PlayerAttributesView.module.css";

interface PlayerAttributesViewProps {
    player: Player;
    selectedPlayer?: Signal<Player | null>;
    onClose?: () => void;
}

export function PlayerAttributesView({ player, selectedPlayer, onClose }: PlayerAttributesViewProps) {
    return (
        <div className={styles.playerAttributesView}>
            <div className={styles.playerName}>{player.name}</div>

            <div className={styles.playerStats}>
                <span className={styles.statBadge}>
                    <span className={styles.statLabel}>Position:</span>
                    <span className={styles.statLabel}>{player.position}</span>
                </span>

                <span className={styles.statBadge}>
                    <span className={styles.statLabel}>Age:</span>
                    <span className={styles.statLabel}>{player.age}</span>
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
                    <span className={styles.statLabel}>{player.team}</span>
                </span>

                <span className={styles.statBadge}>
                    <span className={styles.statLabel}>Value:</span>
                    <span className={styles.statLabel}>${(player.value).toFixed(1)}M</span>
                </span>

                {player.startingNational !== undefined && (
                    <span className={styles.statBadge}>
                        <span className={styles.statLabel}>National Starter:</span>
                        <span className={styles.statLabel}>{player.startingNational ? 'Yes' : 'No'}</span>
                    </span>
                )}

                {player.startingTeam !== undefined && (
                    <span className={styles.statBadge}>
                        <span className={styles.statLabel}>Team Starter:</span>
                        <span className={styles.statLabel}>{player.startingTeam ? 'Yes' : 'No'}</span>
                    </span>
                )}

                <span className={styles.statBadge}>
                    <span className={styles.statLabel}>Season Goals:</span>
                    <span className={styles.statLabel}>{(player.leagueGoals + player.countryGoals)}</span>
                </span>

                <span className={styles.statBadge}>
                    <span className={styles.statLabel}>Season Assists:</span>
                    <span className={styles.statLabel}>{(player.leagueAssists + player.countryAssists)}</span>
                </span>

                <span className={styles.statBadge}>
                    <span className={styles.statLabel}>Season G/A:</span>
                    <span className={styles.statLabel}>{(player.leagueGoals + player.countryGoals) + (player.leagueAssists + player.countryAssists)}</span>
                </span>

                <span className={styles.statBadge}>
                    <span className={styles.statLabel}>Awards:</span>
                    <span className={styles.statLabel}>{player.awards}</span>
                </span>

                <span className={styles.statBadge}>
                    <span className={styles.statLabel}>Trophies:</span>
                    <span className={styles.statLabel}>{player.trophies}</span>
                </span>

                <span className={styles.statBadge}>
                    <span className={styles.statLabel}>Contract:</span>
                    <span>
                        <span className={styles.statLabel}>{player.contractYrs}: ${(player.contractAmount).toFixed(1)}M/yr </span>
                    </span>
                </span>
            </div>
            <button className={styles.closeButton} onClick={() => { if (onClose) onClose(); else if (selectedPlayer) selectedPlayer.value = null; }}>Close</button>
        </div>
    );
}

export default PlayerAttributesView;