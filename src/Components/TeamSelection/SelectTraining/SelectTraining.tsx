import { useEffect, useState } from "react";
import { signal, type Signal } from "@preact/signals-react";
import styles from "./SelectTraining.module.css";
import { useSignals } from "@preact/signals-react/runtime";
import { setTeamStartingPlayers, getTeamPlayersClub, getTeamPlayers } from "../../../Utils/TeamPlayers.ts";
import { useGameContext } from "../../../Context/GameContext.tsx";
import type { Player } from "../../../Models/WorldStage.ts";

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

    const managerTeam = teamsMap.value.get(manager.value.team);
    const managerNT = nationalTeams.value.find((nt) => nt.country === manager.value.country);
    const trainingTeamPlayers = isInternational && managerNT
        ? getTeamPlayers(managerNT.team.players, playersMap)
        : managerTeam ? getTeamPlayersClub(managerTeam, playersMap) : [];
    const trainingTeamName = isInternational ? manager.value.country : managerTeam?.name;
    const trainingTeamColor = isInternational ? undefined : managerTeam?.color;

    function applyTraining(player: Player) {
        const type = player.trainingIntency || "Medium";
        let peopleInjured = [];
        if (type === "High") {
            if (Math.random() < 0.1) {
                player.injured = true;
                player.gamesInjured = 3;
                peopleInjured.push(`${player.name} - ${player.overall} OVR got injured! They will be out for the next 3 games.`);
            }
            const loss = 8 + Math.floor(Math.random() * 5);
            player.stamina = Math.max(0, player.stamina - loss);
        } else if (type === "Medium") {
            if (Math.random() < 0.02) {
                player.injured = true;
                player.gamesInjured = 3;
                peopleInjured.push(`${player.name} - ${player.overall} OVR got injured! They will be out for the next 3 games.`);
            }
            const loss = 3 + Math.floor(Math.random() * 3);
            player.stamina = Math.max(0, player.stamina - loss);
        } else if (type === "Low") {
            const gain = 5 + Math.floor(Math.random() * 6);
            player.stamina = Math.min(100, player.stamina + gain);
        }
        if (peopleInjured.length > 0) {
            alert(`${peopleInjured.join(", ")}`);
        }
    }

    function setAllToType(trainingType: string) {
        trainingTeamPlayers.forEach(p => {
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
                <p><strong>High:</strong> +0.3–0.5 OVR | -8 to -12 stamina | 10% injury</p>
                <p><strong>Medium:</strong> +0.1–0.2 OVR | -3 to -5 stamina | 2% injury</p>
                <p><strong>Low:</strong> No OVR gain | +5 to +10 stamina | No injury</p>
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
                                <div key={p.name} className={styles.playerRow}>
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
                                    <span className={styles.playerName}>{p.name} -- {p.position}</span>
                                    <span className={styles.playerOvr}>{p.overall}</span>
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
        </div>
    );
}

export default SelectTraining;
