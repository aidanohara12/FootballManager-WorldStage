import { useEffect, useRef } from "react";
import { signal, type Signal } from "@preact/signals-react";
import Top50Countries from "../../../Models/Countries.ts";
import styles from "./SelectNational.module.css";
import { useSignals } from "@preact/signals-react/runtime";
import { setNationalTeamStartingPlayers, getTeamPlayers } from "../../../Utils/TeamPlayers";
import { useGameContext } from "../../../Context/GameContext.tsx";

interface SelectNationalProps {
    currentPage: Signal<string>;
    isFirstSeason: Signal<boolean>;
}

const selectedPlayers = signal<string[]>([]);
const allSelectedPlayers = signal<string[]>([]);
const currentPositionIndex = signal<number>(0);

export function SelectNational({ currentPage, isFirstSeason }: SelectNationalProps) {
    useSignals();
    const { nationalTeams, playersMap, userManager: manager } = useGameContext();

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

        const updatedAllSelected = [...allSelectedPlayers.value, ...selectedPlayers.value];
        allSelectedPlayers.value = updatedAllSelected;

        if (currentPositionIndex.value < positions.length - 1) {
            currentPositionIndex.value = currentPositionIndex.value + 1;
            selectedPlayers.value = [];
        } else {
            // Set startingNational on player objects in playersMap
            const managerNT = nationalTeams.value.find((nt) => nt.country === manager.value.country);
            if (managerNT) {
                const players = getTeamPlayers(managerNT.team.players, playersMap);
                players.forEach((p) => {
                    const isStarter = updatedAllSelected.includes(p.name);
                    p.startingNational = isStarter;
                    p.startingNationalWithoutInjury = isStarter;
                });
            }
            nationalTeams.value = [...nationalTeams.value];
            currentPage.value = "SelectClub";
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
        allSelectedPlayers.value = [];
        if (isFirstSeason.value) {
            setNationalTeamStartingPlayers(nationalTeams, playersMap);
        }
    }, []);

    const playerListRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (playerListRef.current) {
            playerListRef.current.scrollTop = 0;
        }
    }, [currentPositionIndex.value]);

    const managerNT = nationalTeams.value.find((nt) => nt.country === manager.value.country);
    const managerNTPlayers = managerNT ? getTeamPlayers(managerNT.team.players, playersMap) : [];

    return (
        <div className={styles.selectNationalContainer}>
            <h3>Select Your National Team Starters for this Season!</h3>
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

            {managerNT && (
                <div key={managerNT.country} className={styles.teamCard}>
                    <h4>{Top50Countries.find((c) => c.country === managerNT.country)?.flag} {managerNT.country} {Top50Countries.find((c) => c.country === managerNT.country)?.flag}</h4>

                    <div className={styles.positionSection}>
                        <h5>{currentPosition.name}s</h5>
                        <div ref={playerListRef} className={styles.playerList}>
                            {managerNTPlayers
                                .filter((p) => p.position === currentPosition.name)
                                .sort((a, b) => b.overall - a.overall)
                                .map((p) => (
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
                                                    <h5 className={styles.statLabel}>Team: {p.team}</h5>
                                                </span>
                                                {p.newPlayer && (
                                                    <span className={styles.statBadge}>
                                                        <h5 className={styles.statLabel}>New Call Up!</h5>
                                                    </span>
                                                )}
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

export default SelectNational;
