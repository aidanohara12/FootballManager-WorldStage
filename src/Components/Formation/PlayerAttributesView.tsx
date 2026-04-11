import type { Signal } from "@preact/signals-react";
import Top50Countries from "../../Models/Countries";
import type { Player } from "../../Models/WorldStage";
import styles from "./PlayerAttributesView.module.css";

interface PlayerAttributesViewProps {
    player: Player;
    selectedPlayer?: Signal<Player | null>;
    onClose?: () => void;
}

function StatRow({ label, value, highlight }: { label: string; value: string | number; highlight?: "gold" | "blue" | "red" | "orange" }) {
    return (
        <div className={styles.statRow}>
            <span className={styles.statLabel}>{label}</span>
            <span className={`${styles.statValue} ${highlight ? styles[highlight] : ""}`}>{value}</span>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className={styles.section}>
            <div className={styles.sectionTitle}>{title}</div>
            {children}
        </div>
    );
}

export function PlayerAttributesView({ player, selectedPlayer, onClose }: PlayerAttributesViewProps) {
    const flag = Top50Countries.find(c => c.country === player.country)?.flag ?? "🌍";
    const posShort: Record<string, string> = { Forward: "FW", Midfielder: "MID", Defender: "DEF", Goalkeeper: "GK" };
    const seasonGoals = player.leagueGoals + player.countryGoals;
    const seasonAssists = player.leagueAssists + player.countryAssists;
    const staminaColor = player.stamina > 60 ? "#27ae60" : player.stamina > 30 ? "#e67e22" : "#e74c3c";
    const isGK = player.position === "Goalkeeper";

    return (
        <div className={styles.playerAttributesView} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.playerName}>{player.name}</div>
                <div className={styles.headerMeta}>
                    <span className={styles.posBadge}>{posShort[player.position] ?? player.position}</span>
                    <span className={styles.flagName}>{flag} {player.country}</span>
                </div>
                {player.team && <div className={styles.teamLabel}>{player.team}</div>}
            </div>

            {/* Status badges */}
            {(player.injured || (player.gamesSuspended ?? 0) > 0) && (
                <div className={styles.statusRow}>
                    {player.injured && <span className={styles.injuredBadge}>🤕 INJ — {player.weeksInjured}w remaining</span>}
                    {(player.gamesSuspended ?? 0) > 0 && <span className={styles.suspendedBadge}>🟥 SUSP — {player.gamesSuspended}g remaining</span>}
                </div>
            )}

            {/* Key numbers */}
            <div className={styles.keyNumbers}>
                <div className={styles.keyNum}>
                    <div className={styles.keyNumValue} style={{ color: "#f39c12" }}>{player.overall}</div>
                    <div className={styles.keyNumLabel}>OVR</div>
                </div>
                <div className={styles.keyNum}>
                    <div className={styles.keyNumValue} style={{ color: "#3498db" }}>{player.potential}</div>
                    <div className={styles.keyNumLabel}>POT</div>
                </div>
                <div className={styles.keyNum}>
                    <div className={styles.keyNumValue}>{player.age}</div>
                    <div className={styles.keyNumLabel}>Age</div>
                </div>
                <div className={styles.keyNum}>
                    <div className={styles.keyNumValue} style={{ color: "#27ae60" }}>${player.value.toFixed(1)}M</div>
                    <div className={styles.keyNumLabel}>Value</div>
                </div>
            </div>

            {/* Stamina bar */}
            <div className={styles.staminaSection}>
                <div className={styles.staminaLabel}>
                    <span>Stamina</span>
                    <span style={{ color: staminaColor }}>{player.stamina}%</span>
                </div>
                <div className={styles.staminaTrack}>
                    <div className={styles.staminaFill} style={{ width: `${player.stamina}%`, background: staminaColor }} />
                </div>
            </div>

            {/* Season stats */}
            <Section title="This Season">
                {!isGK && <StatRow label="Goals" value={seasonGoals} highlight="gold" />}
                {!isGK && <StatRow label="Assists" value={seasonAssists} highlight="blue" />}
                {!isGK && <StatRow label="G + A" value={seasonGoals + seasonAssists} />}
                {!isGK && player.leagueGoals > 0 && <StatRow label="League Goals" value={player.leagueGoals} />}
                {!isGK && player.countryGoals > 0 && <StatRow label="International Goals" value={player.countryGoals} />}
                {isGK && <StatRow label="Clean Sheets" value={player.cleanSheets} highlight="blue" />}
            </Section>

            {/* Career stats */}
            <Section title="Career">
                {!isGK && <StatRow label="Total Goals" value={player.totalGoals} highlight="gold" />}
                {!isGK && <StatRow label="Total Assists" value={player.totalAssists} highlight="blue" />}
                {isGK && <StatRow label="Career Clean Sheets" value={player.cleanSheets} highlight="blue" />}
                <StatRow label="Trophies" value={player.trophies} />
                <StatRow label="Awards" value={player.awards} />
            </Section>

            {/* Discipline */}
            <Section title="Discipline">
                <StatRow label="Season Yellows" value={player.seasonYellowCards} highlight={player.seasonYellowCards >= 4 ? "orange" : undefined} />
                <StatRow label="Season Reds" value={player.seasonRedCards} highlight={player.seasonRedCards > 0 ? "red" : undefined} />
                <StatRow label="Career Yellows" value={player.careerYellowCards} />
                <StatRow label="Career Reds" value={player.careerRedCards} />
                {(player.gamesSuspended ?? 0) > 0 && <StatRow label="Games Suspended" value={player.gamesSuspended} highlight="red" />}
            </Section>

            {/* Contract */}
            <Section title="Contract">
                <StatRow label="Years Left" value={player.contractYrs} />
                <StatRow label="Salary" value={`$${player.contractAmount.toFixed(1)}M/yr`} />
                <StatRow label="Training" value={player.trainingIntency} />
            </Section>

            <button
                className={styles.closeButton}
                onClick={() => { if (onClose) onClose(); else if (selectedPlayer) selectedPlayer.value = null; }}
            >
                Close
            </button>
        </div>
    );
}

export default PlayerAttributesView;
