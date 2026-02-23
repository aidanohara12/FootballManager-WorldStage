import { use, useEffect } from "react";
import { signal, type Signal } from "@preact/signals-react";
import type { Team, League } from "../../../Models/WorldStage.ts";
import type { Manager } from "../../../Models/WorldStage.ts";
import styles from "./SelectClub.module.css";
import { Top50Countries } from "../../../Models/Countries.ts";
import { useSignals } from "@preact/signals-react/runtime";

interface SelectClubProps {
    teams: Signal<Team[]>;
    leagues: Signal<League[]>;
    manager: Signal<Manager>;
    currentPage: Signal<string>;
}
const selectedPlayers = signal<string[]>([]);
const currentPositionIndex = signal<number>(0);

export function SelectClub({ teams, leagues, manager, currentPage }: SelectClubProps) {
    useSignals();
    const positions = [
        { name: "Forward", max: 3 },
        { name: "Midfielder", max: 3 },
        { name: "Defender", max: 4 },
        { name: "Goalkeeper", max: 1 }
    ];

    const currentPosition = positions[currentPositionIndex.value];

    function syncLeagues(updatedTeams: Team[]) {
        leagues.value = leagues.value.map((l) => ({
            ...l,
            teams: l.teams.map((lt) => {
                const updated = updatedTeams.find((t) => t.name === lt.Team.name);
                return updated ? { ...lt, Team: updated } : lt;
            })
        }));
    }

    function setTeamStartingPlayers() {
        const updatedTeams = teams.value.map((team) => {
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
        teams.value = updatedTeams;
        syncLeagues(updatedTeams);
    }

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

        const updatedTeams = teams.value.map((team) => {
            if (team.name !== manager.value.team) return team;

            const updatedPlayers = team.players?.map((p) => {
                if (p.position === currentPosition.name) {
                    return { ...p, startingTeam: selectedPlayers.value.includes(p.name) };
                }
                return p;
            });

            return {
                ...team,
                players: updatedPlayers
            };
        });

        teams.value = updatedTeams;
        syncLeagues(updatedTeams);

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
        setTeamStartingPlayers();
    }, []);

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

            {teams.value.filter((team) => team.name === manager.value.team).map((team) => (
                <div key={team.name} className={styles.teamCard}>
                    <h4 style={{ color: team.color }}>{team.name}</h4>

                    <div className={styles.positionSection}>
                        <h5>{currentPosition.name}s</h5>
                        <div className={styles.playerList}>
                            {team.players
                                ?.filter((p) => p.position === currentPosition.name)
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
            ))}
        </div>
    );
}

export default SelectClub;
