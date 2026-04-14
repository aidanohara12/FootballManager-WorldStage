import { useEffect, useState } from "react";
import { showAlert } from "../../AlertModal/AlertModal";
import { signal, type Signal } from "@preact/signals-react";
import styles from "./SelectTraining.module.css";
import { useSignals } from "@preact/signals-react/runtime";
import { setTeamStartingPlayers, getTeamPlayersClub, getTeamPlayers, getTrainingPoints } from "../../../Utils/TeamPlayers.ts";
import { useGameContext } from "../../../Context/GameContext.tsx";
import type { Player } from "../../../Models/WorldStage.ts";
import { PlayerAttributesView } from "../../Formation/PlayerAttributesView.tsx";

interface SelectTrainingProps {
    currentPage?: Signal<string>;
    isFirstSeason?: Signal<boolean>;
    onComplete?: () => void;
    compact?: boolean;
    isInternational?: boolean;
    onConfirmReady?: (confirmFn: () => void) => void;
}
const selectedPlayers = signal<string[]>([]);
const currentPositionIndex = signal<number>(0);
const committedSalary = signal<number>(0);

const playersNeededByPosition: Record<string, number> = {
    "GK": 1,
    "DEF": 4,
    "MID": 4,
    "FWD": 3,
};

const positionMapping: Record<string, string> = {
    "Goalkeeper": "GK",
    "Defender": "DEF",
    "Midfielder": "MID",
    "Forward": "FWD",
};

function staminaColor(stamina: number): string {
    const clamped = Math.max(0, Math.min(100, stamina));
    if (clamped <= 50) {
        const ratio = clamped / 50;
        const r = 220;
        const g = Math.round(60 + ratio * 140);
        return `rgb(${r}, ${g}, 30)`;
    }
    const ratio = (clamped - 50) / 50;
    const r = Math.round(200 - ratio * 170);
    const g = Math.round(200);
    return `rgb(${r}, ${g}, 30)`;
}
export function SelectTraining({ currentPage, isFirstSeason, onComplete, compact, isInternational, onConfirmReady }: SelectTrainingProps) {
    useSignals();
    const { teamsMap, playersMap, userManager: manager, nationalTeams } = useGameContext();
    const [, forceUpdate] = useState(0);
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

    const managerTeam = teamsMap.value.get(manager.value.team);
    const managerNT = nationalTeams.value.find((nt) => nt.country === manager.value.country);
    const trainingTeamPlayers = isInternational && managerNT
        ? getTeamPlayers(managerNT.team.players, playersMap).splice(0, 20) //top 20 players
        : managerTeam ? getTeamPlayersClub(managerTeam, playersMap) : [];
    const trainingTeamName = isInternational ? manager.value.country : managerTeam?.name;
    const trainingTeamColor = isInternational ? undefined : managerTeam?.color;

    function applyTraining(player: Player) {
        const playerPositionInjuredAmount = playersNeededByPosition[positionMapping[player.position]];
        const playerTeam = teamsMap.value.get(player.team);
        if (player.injured) return; // injured players cannot train
        const type = player.trainingIntency || "Medium";
        const canUpgrade = player.potential > player.overall;
        let peopleInjured = [];
        if (type === "High") {
            if (Math.random() < 0.1) {
                const healthyOfPosition = playerTeam?.players.map(id => playersMap.value.get(id)).filter(p => p && !p.injured && p.position === player.position && p.name !== player.name).length ?? 0;
                if (healthyOfPosition >= playerPositionInjuredAmount) {
                    player.injured = true;
                    const injuryChance = Math.random();
                    let weeks = 0;
                    if (injuryChance < 0.65) {
                        weeks = Math.floor(Math.random() * 2) + 2;  // 2-3 weeks
                    } else if (injuryChance < 0.90) {
                        weeks = Math.floor(Math.random() * 4) + 2;  // 2-5 weeks
                    } else {
                        weeks = Math.floor(Math.random() * 6) + 5;  // 5-10 weeks
                    }
                    player.weeksInjured = weeks;
                    peopleInjured.push(`${player.name} - ${player.overall} OVR got injured! They will be out for the next ${weeks} week(s).`);
                }
            }
            if (canUpgrade) {
                const trainingGain = 10 + Math.floor(Math.random() * 6);  // 10-15 TP
                player.trainingPoints += trainingGain;
                if (player.trainingPoints >= player.trainingUpgradePoints) {
                    player.trainingPoints = 0;
                    player.overall++;
                }
                player.trainingUpgradePoints = getTrainingPoints(player.overall, player.potential);
            }
            const loss = 8 + Math.floor(Math.random() * 5);
            player.stamina = Math.max(0, player.stamina - loss);
        } else if (type === "Medium") {
            if (Math.random() < 0.02) {
                const healthyOfPosition = playerTeam?.players.map(id => playersMap.value.get(id)).filter(p => p && !p.injured && p.position === player.position && p.name !== player.name).length ?? 0;
                if (healthyOfPosition >= playerPositionInjuredAmount) {
                    player.injured = true;
                    const injuryChance = Math.random();
                    let weeks = 0;
                    if (injuryChance < 0.65) {
                        weeks = Math.floor(Math.random() * 2) + 2;  // 2-3 weeks
                    } else if (injuryChance < 0.90) {
                        weeks = Math.floor(Math.random() * 4) + 2;  // 2-5 weeks
                    } else {
                        weeks = Math.floor(Math.random() * 6) + 5;  // 5-10 weeks
                    }
                    player.weeksInjured = weeks;
                    peopleInjured.push(`${player.name} - ${player.overall} OVR got injured! They will be out for the next ${weeks} week(s).`);
                }
            }
            if (canUpgrade) {
                const trainingGain = 6 + Math.floor(Math.random() * 5);  // 6-10 TP
                player.trainingPoints += trainingGain;
                if (player.trainingPoints >= player.trainingUpgradePoints) {
                    player.trainingPoints = 0;
                    player.overall++;
                }
                player.trainingUpgradePoints = getTrainingPoints(player.overall, player.potential);
            }
            const loss = 3 + Math.floor(Math.random() * 4);
            player.stamina = Math.max(0, player.stamina - loss);
        } else if (type === "Low") {
            if (canUpgrade) {
                const trainingGain = 1 + Math.floor(Math.random() * 3);  // 1-3 TP
                player.trainingPoints += trainingGain;
                if (player.trainingPoints >= player.trainingUpgradePoints) {
                    player.trainingPoints = 0;
                    player.overall++;
                }
                player.trainingUpgradePoints = getTrainingPoints(player.overall, player.potential);
            }
            const gain = 5 + Math.floor(Math.random() * 6);
            player.stamina = Math.min(100, player.stamina + gain);
        }
        if (peopleInjured.length > 0) {
            const injuredList = peopleInjured.join(", ");
            showAlert(`${injuredList}`);
        }
    }

    function setAllToType(trainingType: string) {
        trainingTeamPlayers.forEach(p => {
            if (p.injured) return;
            p.trainingIntency = trainingType;
        });
        forceUpdate(n => n + 1);
    }

    function handleConfirm() {
        trainingTeamPlayers.forEach(p => {
            applyTraining(p);
        });
        playersMap.value = new Map(playersMap.value);
        if (onComplete) {
            onComplete();
        } else if (currentPage) {
            currentPage.value = "MainPage";
        }
    }

    useEffect(() => {
        trainingTeamPlayers.forEach(p => {
            p.trainingIntency = p.trainingIntency || "Medium";
        });
    }, [isInternational]);

    useEffect(() => {
        if (onConfirmReady) {
            onConfirmReady(handleConfirm);
        }
    }, [isInternational]);

    useEffect(() => {
        currentPositionIndex.value = 0;
        selectedPlayers.value = [];
        committedSalary.value = 0;
        if (isFirstSeason?.value) {
            setTeamStartingPlayers(teamsMap, playersMap);
        }
    }, []);

    return (
        <div className={compact ? styles.compactContainer : styles.selectNationalContainer}>
            {!compact && <h3>Select Your {isInternational ? 'National' : 'Club'} Team Training!</h3>}
            <h4>Select Training Intensity</h4>
            <h3 className={styles.scrollHint}>Scroll To View</h3>
            <div className={styles.trainingRules}>
                <p><strong>Training Points</strong> Once Training Points Reach Max -- The Player Gains +1 OVR</p>
                <p><strong>High:</strong> +10-15 TP | -8 to -12 stamina | 10% injury risk</p>
                <p><strong>Medium:</strong> +6-10 TP | -3 to -6 stamina | 2% injury risk</p>
                <p><strong>Low:</strong> +1-3 TP | +5 to +10 stamina | No injury risk</p>
            </div>

            {trainingTeamPlayers.length > 0 && (
                <div className={styles.teamCard}>
                    <h4 style={{ color: trainingTeamColor }}>{trainingTeamName}</h4>

                    <div className={styles.bulkButtons}>
                        <button onClick={() => setAllToType("High")}>All High</button>
                        <button onClick={() => setAllToType("Medium")}>All Medium</button>
                        <button onClick={() => setAllToType("Low")}>All Low</button>
                    </div>

                    <div className={styles.playerList}>
                        {trainingTeamPlayers
                            .sort((a, b) => b.overall - a.overall)
                            .map((p) => (
                                <div key={p.name} className={`${styles.playerRow} ${p.injured ? styles.playerRowInjured : ''}`}>
                                    {p.injured ? (
                                        <span className={styles.injuredLabel}>INJ ({p.weeksInjured}w)</span>
                                    ) : (
                                        <select
                                            className={styles.trainingSelect}
                                            value={p.trainingIntency || "Medium"}
                                            onChange={(e) => {
                                                p.trainingIntency = e.target.value;
                                                forceUpdate(n => n + 1);
                                            }}
                                        >
                                            <option value="High">High</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Low">Low</option>
                                        </select>
                                    )}
                                    <span className={styles.playerName} onClick={() => setSelectedPlayer(p)} style={{ cursor: "pointer" }}>{p.name} -- {p.position}</span>
                                    <div className={styles.tpBarContainer}>
                                        <div
                                            className={styles.tpBarFill}
                                            style={{
                                                width: `${Math.min(100, (p.trainingPoints / (p.trainingUpgradePoints || 1)) * 100)}%`,
                                            }}
                                        />
                                        <span className={styles.tpLabel}>{p.trainingPoints}/{p.trainingUpgradePoints} TP</span>
                                    </div>
                                    <span className={styles.playerOvr}>{p.overall} OVR</span>
                                    <div className={styles.staminaBarContainer}>
                                        <div
                                            className={styles.staminaBarFill}
                                            style={{
                                                width: `${Math.max(0, Math.min(100, p.stamina))}%`,
                                                backgroundColor: staminaColor(p.stamina),
                                            }}
                                        />
                                        <span className={styles.staminaLabel}>{Math.round(p.stamina)}</span>
                                    </div>
                                </div>
                            ))}
                    </div>

                    {!compact && (
                        <div className={styles.confirmContainer}>
                            <button className={styles.nextButton} onClick={handleConfirm}>
                                Set Training Plan
                            </button>
                        </div>
                    )}
                </div>
            )}
            {selectedPlayer && (
                <div className={styles.overlay} onClick={() => setSelectedPlayer(null)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <PlayerAttributesView player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default SelectTraining;
