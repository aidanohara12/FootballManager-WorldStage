import type { Player } from "../../Models/WorldStage";
import { Top50Countries } from "../../Models/Countries.ts";
import styles from "./Formation.module.css";
import type { Signal } from "@preact/signals-react";

interface PlayerCardProps {
    player: Player;
    selectedPlayer: Signal<Player | null>;
}

export function PlayerCard({ player, selectedPlayer }: PlayerCardProps) {
    const countryFlag = Top50Countries.find((c) => c.country === player.country)?.flag || "🌍";

    const positionMapping: Record<"Forward" | "Midfielder" | "Defender" | "Goalkeeper", string> = {
        Forward: "FW",
        Midfielder: "MID",
        Defender: "DEF",
        Goalkeeper: "GK"
    };

    return (
        <div className={styles.playerCard} onClick={(e) => { e.stopPropagation(); selectedPlayer.value = player; }}>
            <div className={styles.playerName}>{player.name}: {positionMapping[player.position as "Forward" | "Midfielder" | "Defender" | "Goalkeeper"]}</div>

            <div className={styles.playerStats}>
                <span className={styles.statBadge}>
                    <span className={styles.statLabel}>Country:</span>
                    <span>{countryFlag}</span>
                </span>

                {(player.startingTeam || player.startingNational) && (
                    <>
                        <span className={styles.statBadge}>
                            <span className={styles.statLabel}>OVR:</span>
                            <span className={styles.overallValue}>{player.overall}</span>
                        </span>

                        <span className={styles.statBadge}>
                            <span className={styles.statLabel}>Age:</span>
                            <span>{player.age}</span>
                        </span>
                    </>
                )}

            </div>
        </div>
    );
}

export default PlayerCard;