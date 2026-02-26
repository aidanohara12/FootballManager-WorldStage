import { useEffect } from "react";
import { signal, type Signal } from "@preact/signals-react";
import type { Team, Player } from "../../../Models/WorldStage.ts";
import type { Manager } from "../../../Models/WorldStage.ts";
import styles from "./SelectClub.module.css";
import { Top50Countries } from "../../../Models/Countries.ts";
import { useSignals } from "@preact/signals-react/runtime";
import { setTeamStartingPlayers, getTeamPlayersClub } from "../../../Utils/TeamPlayers";

interface SelectClubProps {
    teamsMap: Signal<Map<string, Team>>;
    playersMap: Signal<Map<string, Player>>;
    leagues: Signal<import("../../../Models/WorldStage.ts").League[]>;
    manager: Signal<Manager>;
    currentPage: Signal<string>;
}
const selectedPlayers = signal<string[]>([]);
const currentPositionIndex = signal<number>(0);

export function SelectClub({ teamsMap, playersMap, manager, currentPage }: SelectClubProps) {
    useSignals();
    const positions = [
        { name: "Forward", max: 3 },
        { name: "Midfielder", max: 3 },
        { name: "Defender", max: 4 },
        { name: "Goalkeeper", max: 1 }
    ];

    const currentPosition = positions[currentPositionIndex.value];

    function handlePlayerToggle(playerName: string) {
        if (selectedPlayers.value.includes(playerName)) {
            selectedPlayers.value = selectedPlayers.value.filter((p) => p !== playerName);
        } else if (selectedPlayers.value.length < currentPosition.max) {
            selectedPlayers.value = [...selectedPlayers.value, playerName];
        } else {
            alert(`You can only select ${currentPosition.max} ${currentPosition.name}(s)`);
        }
    }

    function handleNext() {
        if (selectedPlayers.value.length !== currentPosition.max) {
            alert(`Please select exactly ${currentPosition.max} ${currentPosition.name}(s)`);
            return;
        }

        const team = teamsMap.value.get(manager.value.team);
        if (team) {
            const players = getTeamPlayersClub(team, playersMap);
            players.forEach((p) => {
                if (p.position === currentPosition.name) {
                    p.startingTeam = selectedPlayers.value.includes(p.name);
                }
            });
            teamsMap.value = new Map(teamsMap.value);
        }

        if (currentPositionIndex.value < positions.length - 1) {
            currentPositionIndex.value = currentPositionIndex.value + 1;
            selectedPlayers.value = [];
        } else {
            currentPage.value = "MainPage";
        }
    }

    function handleBack() {
        if (currentPositionIndex.value > 0) {
            currentPositionIndex.value = currentPositionIndex.value - 1;
            selectedPlayers.value = [];
        }
    }

    useEffect(() => {
        currentPositionIndex.value = 0;
        selectedPlayers.value = [];
        setTeamStartingPlayers(teamsMap, playersMap);
    }, []);

    const managerTeam = teamsMap.value.get(manager.value.team);
    const managerTeamPlayers = managerTeam ? getTeamPlayersClub(managerTeam, playersMap) : [];

    return (
        <div className={styles.selectNationalContainer}>
            <h3>Select Your Club Team Starters!</h3>
            <h4>Select {currentPosition.name}s ({selectedPlayers.value.length}/{currentPosition.max})</h4>

            {/* Progress indicator */}
            <div className={styles.progressIndicator}>
                {positions.map((_, index) => (
                    <div
                        key={index}
                        className={`${styles.progressDot} ${index === currentPositionIndex.value ? styles.active :
                            index < currentPositionIndex.value ? styles.completed : ''
                            }`}
                    />
                ))}
            </div>

            {managerTeam && (
                <div key={managerTeam.name} className={styles.teamCard}>
                    <h4 style={{ color: managerTeam.color }}>{managerTeam.name}</h4>

                    <div className={styles.positionSection}>
                        <h5>{currentPosition.name}s</h5>
                        <div className={styles.playerList}>
                            {managerTeamPlayers
                                .filter((p: any) => p.position === currentPosition.name)
                                .sort((a: any, b: any) => b.overall - a.overall)
                                .map((p: any) => (
                                    <div key={p.name} className={`${styles.playerItem} ${selectedPlayers.value.includes(p.name) ? styles.selected : ''}`} onClick={() => handlePlayerToggle(p.name)} style={{ cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            id={p.name}
                                            value={p.name}
                                            checked={selectedPlayers.value.includes(p.name)}
                                            readOnly
                                        />
                                        <div className={styles.playerInfo}>
                                            <div className={styles.playerName}>{p.name}</div>
                                            <div className={styles.playerStats}>
                                                <span className={styles.statBadge}>
                                                    <h5 className={styles.statLabel}>Age: {p.age}</h5>
                                                </span>
                                                <span className={styles.statBadge}>
                                                    <h5 className={styles.statLabel}>OVR: {p.overall}</h5>
                                                </span>
                                                <span className={styles.statBadge}>
                                                    <h5 className={styles.statLabel}>POT: {p.potential}</h5>
                                                </span>
                                                <span className={styles.statBadge}>
                                                    <h5 className={styles.statLabel}>Country: {p.country} {Top50Countries.find((c) => c.country === p.country)?.flag}</h5>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>

                    <div className={styles.buttonContainer}>
                        {currentPositionIndex.value > 0 && (
                            <button className={styles.backButton} onClick={handleBack}>
                                Back
                            </button>
                        )}
                        <button className={styles.nextButton} onClick={handleNext}>
                            {currentPositionIndex.value < positions.length - 1 ? "Next" : "Finish"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SelectClub;
