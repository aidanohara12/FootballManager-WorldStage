import { useState, useEffect } from "react";
import type { NationalTeam, Player } from "../../Models/WorldStage.ts";
import Top50Countries from "../../Models/Countries.ts";
import type { Manager } from "../../Models/WorldStage.ts";
import styles from "./SelectNational.module.css";

interface SelectNationalProps {
    nationalTeams: NationalTeam[];
    setNationalTeams: (teams: NationalTeam[]) => void;
    manager: Manager;
    setCurrentPage: (page: string) => void;
}

export function SelectNational({ nationalTeams, setNationalTeams, manager, setCurrentPage }: SelectNationalProps) {
    const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
    const [currentPositionIndex, setCurrentPositionIndex] = useState<number>(0);

    const positions = [
        { name: "Forward", max: 3 },
        { name: "Midfielder", max: 3 },
        { name: "Defender", max: 4 },
        { name: "Goalkeeper", max: 1 }
    ];

    const currentPosition = positions[currentPositionIndex];

    function setNationalTeamStartingPlayers() {
        const updatedTeams = nationalTeams.map((nt) => {
            const updatedPlayers = nt.team.players?.map((p) => ({
                ...p,
                startingNational: false
            }));

            updatedPlayers
                ?.filter((p) => p.position === "Forward")
                .sort((a, b) => b.overall - a.overall)
                .slice(0, 3)
                .forEach((p) => p.startingNational = true);

            updatedPlayers
                ?.filter((p) => p.position === "Midfielder")
                .sort((a, b) => b.overall - a.overall)
                .slice(0, 3)
                .forEach((p) => p.startingNational = true);

            updatedPlayers
                ?.filter((p) => p.position === "Defender")
                .sort((a, b) => b.overall - a.overall)
                .slice(0, 4)
                .forEach((p) => p.startingNational = true);

            updatedPlayers
                ?.filter((p) => p.position === "Goalkeeper")
                .sort((a, b) => b.overall - a.overall)
                .slice(0, 1)
                .forEach((p) => p.startingNational = true);

            return {
                ...nt,
                team: {
                    ...nt.team,
                    players: updatedPlayers
                }
            };
        });
        setNationalTeams(updatedTeams);
    }

    function handlePlayerCheck(e: React.ChangeEvent<HTMLInputElement>) {
        const playerName = e.target.value;
        const isChecked = e.target.checked;

        if (isChecked) {
            if (selectedPlayers.length < currentPosition.max) {
                setSelectedPlayers([...selectedPlayers, playerName]);
            } else {
                e.target.checked = false;
                alert(`You can only select ${currentPosition.max} ${currentPosition.name}(s)`);
            }
        } else {
            setSelectedPlayers(selectedPlayers.filter((p) => p !== playerName));
        }
    }

    function handleNext() {
        if (selectedPlayers.length !== currentPosition.max) {
            alert(`Please select exactly ${currentPosition.max} ${currentPosition.name}(s)`);
            return;
        }

        if (currentPositionIndex < positions.length - 1) {
            setCurrentPositionIndex(currentPositionIndex + 1);
            setSelectedPlayers([]);
        } else {
            setCurrentPage("SelectClub");
        }
    }

    function handleBack() {
        if (currentPositionIndex > 0) {
            setCurrentPositionIndex(currentPositionIndex - 1);
            setSelectedPlayers([]);
        }
    }

    useEffect(() => {
        setNationalTeamStartingPlayers();
    }, []);

    return (
        <div className={styles.selectNationalContainer}>
            <h3>Select Your National Team Starters!</h3>
            <h4>Select {currentPosition.name}s ({selectedPlayers.length}/{currentPosition.max})</h4>

            {/* Progress indicator */}
            <div className={styles.progressIndicator}>
                {positions.map((_, index) => (
                    <div
                        key={index}
                        className={`${styles.progressDot} ${index === currentPositionIndex ? styles.active :
                            index < currentPositionIndex ? styles.completed : ''
                            }`}
                    />
                ))}
            </div>

            {nationalTeams.filter((nt) => nt.country === manager.country).map((nt) => (
                <div key={nt.country} className={styles.teamCard}>
                    <h4>{Top50Countries.find((c) => c.country === nt.country)?.flag} {nt.country} {Top50Countries.find((c) => c.country === nt.country)?.flag}</h4>

                    <div className={styles.positionSection}>
                        <h5>{currentPosition.name}s</h5>
                        <div className={styles.playerList}>
                            {nt.team.players
                                ?.filter((p) => p.position === currentPosition.name)
                                .sort((a, b) => b.overall - a.overall)
                                .map((p) => (
                                    <div key={p.name} className={styles.playerItem}>
                                        <input
                                            type="checkbox"
                                            id={p.name}
                                            value={p.name}
                                            checked={selectedPlayers.includes(p.name)}
                                            onChange={(e) => handlePlayerCheck(e)}
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
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>

                    <div className={styles.buttonContainer}>
                        {currentPositionIndex > 0 && (
                            <button className={styles.backButton} onClick={handleBack}>
                                Back
                            </button>
                        )}
                        <button className={styles.nextButton} onClick={handleNext}>
                            {currentPositionIndex < positions.length - 1 ? "Next" : "Finish"}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default SelectNational;