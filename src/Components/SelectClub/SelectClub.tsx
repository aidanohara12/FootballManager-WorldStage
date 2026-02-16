import { useState, useEffect } from "react";
import type { Team, Player, NationalTeam } from "../../Models/WorldStage.ts";
import type { Manager } from "../../Models/WorldStage.ts";
import styles from "./SelectClub.module.css";
import { Top50Countries } from "../../Models/Countries.ts";

interface SelectClubProps {
    teams: Team[];
    setTeams: (teams: Team[]) => void;
    manager: Manager;
    setCurrentPage: (page: string) => void;
}

export function SelectClub({ teams, setTeams, manager, setCurrentPage }: SelectClubProps) {
    const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
    const [currentPositionIndex, setCurrentPositionIndex] = useState<number>(0);

    const positions = [
        { name: "Forward", max: 3 },
        { name: "Midfielder", max: 3 },
        { name: "Defender", max: 4 },
        { name: "Goalkeeper", max: 1 }
    ];

    const currentPosition = positions[currentPositionIndex];

    function setTeamStartingPlayers() {
        const updatedTeams = teams.map((team) => {
            const updatedPlayers = team.players?.map((p) => ({
                ...p,
                startingTeam: false
            }));

            updatedPlayers
                ?.filter((p) => p.position === "Forward")
                .sort((a, b) => b.overall - a.overall)
                .slice(0, 3)
                .forEach((p) => p.startingTeam = true);

            updatedPlayers
                ?.filter((p) => p.position === "Midfielder")
                .sort((a, b) => b.overall - a.overall)
                .slice(0, 3)
                .forEach((p) => p.startingTeam = true);

            updatedPlayers
                ?.filter((p) => p.position === "Defender")
                .sort((a, b) => b.overall - a.overall)
                .slice(0, 4)
                .forEach((p) => p.startingTeam = true);

            updatedPlayers
                ?.filter((p) => p.position === "Goalkeeper")
                .sort((a, b) => b.overall - a.overall)
                .slice(0, 1)
                .forEach((p) => p.startingTeam = true);

            return {
                ...team,
                players: updatedPlayers
            };
        });
        setTeams(updatedTeams);
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

        const updatedTeams = teams.map((team) => {
            if (team.name !== manager.team) return team;

            const updatedPlayers = team.players?.map((p) => {
                if (selectedPlayers.includes(p.name)) {
                    return { ...p, startingTeam: true };
                }
                return p;
            });

            return {
                ...team,
                players: updatedPlayers
            };
        });

        setTeams(updatedTeams);

        if (currentPositionIndex < positions.length - 1) {
            setCurrentPositionIndex(currentPositionIndex + 1);
            setSelectedPlayers([]);
        } else {
            // All positions selected, finalize
            setCurrentPage("MainPage");
        }
    }

    function handleBack() {
        if (currentPositionIndex > 0) {
            setCurrentPositionIndex(currentPositionIndex - 1);
            setSelectedPlayers([]);
        }
    }

    useEffect(() => {
        setTeamStartingPlayers();
    }, []);

    return (
        <div className={styles.selectNationalContainer}>
            <h3>Select Your Club Team Starters!</h3>
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

            {teams.filter((team) => team.name === manager.team).map((team) => (
                <div key={team.name} className={styles.teamCard}>
                    <h4 style={{ color: team.color }}>{team.name}</h4>

                    <div className={styles.positionSection}>
                        <h5>{currentPosition.name}s</h5>
                        <div className={styles.playerList}>
                            {team.players
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
                                                    <h5 className={styles.statLabel}>Country: {p.country} {Top50Countries.find((c) => c.country === p.country)?.flag}</h5>
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

export default SelectClub;