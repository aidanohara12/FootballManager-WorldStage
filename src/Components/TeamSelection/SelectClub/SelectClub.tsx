import { useEffect, useRef } from "react";
import { signal, type Signal } from "@preact/signals-react";
import styles from "./SelectClub.module.css";
import { Top50Countries } from "../../../Models/Countries.ts";
import { useSignals } from "@preact/signals-react/runtime";
import { setTeamStartingPlayers, getTeamPlayersClub } from "../../../Utils/TeamPlayers";
import { useGameContext } from "../../../Context/GameContext.tsx";

interface SelectClubProps {
    currentPage?: Signal<string>;
    isFirstSeason?: Signal<boolean>;
    onComplete?: () => void;
    wasClicked?: boolean;
}
const selectedPlayers = signal<string[]>([]);
const currentPositionIndex = signal<number>(0);
const committedSalary = signal<number>(0);

export function SelectClub({ currentPage, isFirstSeason, onComplete, wasClicked }: SelectClubProps) {
    useSignals();
    const { teamsMap, playersMap, userManager: manager } = useGameContext();
    const positions = [
        { name: "Forward", max: 3 },
        { name: "Midfielder", max: 3 },
        { name: "Defender", max: 4 },
        { name: "Goalkeeper", max: 1 }
    ];

    const currentPosition = positions[currentPositionIndex.value];
    const managerTeam = teamsMap.value.get(manager.value.team);
    const budget = managerTeam?.moneyToSpend ?? 0;

    // Calculate salary of currently selected players in this step
    const currentStepSalary = selectedPlayers.value.reduce((sum, name) => {
        const p = playersMap.value.get(name);
        return sum + (p?.contractAmount ?? 0);
    }, 0);
    const totalSpent = committedSalary.value + currentStepSalary;
    const remaining = budget - totalSpent;

    function handlePlayerToggle(playerName: string) {
        if (selectedPlayers.value.includes(playerName)) {
            selectedPlayers.value = selectedPlayers.value.filter((p) => p !== playerName);
        } else if (selectedPlayers.value.length < currentPosition.max) {
            const player = playersMap.value.get(playerName);
            const playerSalary = player?.contractAmount ?? 0;
            if (playerSalary > remaining) {
                alert(`Not enough budget! Need $${playerSalary.toFixed(1)}M but only $${remaining.toFixed(1)}M remaining.`);
                return;
            }
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
                    const isStarter = selectedPlayers.value.includes(p.name);
                    p.startingTeam = isStarter;
                    if (!onComplete) p.startingTeamWithoutInjury = isStarter;
                }
            });
            teamsMap.value = new Map(teamsMap.value);
        }

        if (currentPositionIndex.value < positions.length - 1) {
            committedSalary.value += currentStepSalary;
            currentPositionIndex.value = currentPositionIndex.value + 1;
            selectedPlayers.value = [];
        } else {
            teamsMap.value.forEach((team) => {
                team.players.forEach((player) => {
                    const curPlayer = playersMap.value.get(player);
                    if (!curPlayer) return;
                    curPlayer.leagueGoals = 0;
                    curPlayer.leagueAssists = 0;
                    curPlayer.countryGoals = 0;
                    curPlayer.countryAssists = 0;
                    curPlayer.totalGoals = 0;
                    curPlayer.totalAssists = 0;
                    curPlayer.cleanSheets = 0;
                });
            });
            if (onComplete) {
                onComplete();
            } else if (currentPage) {
                currentPage.value = "MainPage";
            }
        }
    }

    function handleBack() {
        if (currentPositionIndex.value > 0) {
            // Recalculate committed salary by removing the previous step's starters
            const team = teamsMap.value.get(manager.value.team);
            if (team) {
                const prevPosition = positions[currentPositionIndex.value - 1];
                const players = getTeamPlayersClub(team, playersMap);
                const prevStarters = players.filter((p) => p.position === prevPosition.name && p.startingTeam);
                const prevSalary = prevStarters.reduce((sum, p) => sum + p.contractAmount, 0);
                committedSalary.value = Math.max(0, committedSalary.value - prevSalary);
            }
            currentPositionIndex.value = currentPositionIndex.value - 1;
            selectedPlayers.value = [];
        }
    }

    useEffect(() => {
        currentPositionIndex.value = 0;
        selectedPlayers.value = [];
        committedSalary.value = 0;
        if (isFirstSeason?.value) {
            setTeamStartingPlayers(teamsMap, playersMap);
        }
    }, []);

    // TEMP: auto-select top players by overall for each position
    useEffect(() => {
        const pos = positions[currentPositionIndex.value];
        const team = teamsMap.value.get(manager.value.team);
        if (!team) return;
        const players = getTeamPlayersClub(team, playersMap);
        const top = players
            .filter((p) => p.position === pos.name && !p.injured)
            .sort((a, b) => b.overall - a.overall)
            .slice(0, pos.max)
            .map((p) => p.name);
        selectedPlayers.value = top;
    }, [currentPositionIndex.value]);

    const playerListRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (playerListRef.current) {
            playerListRef.current.scrollTop = 0;
        }
    }, [currentPositionIndex.value]);

    const managerTeamPlayers = managerTeam ? getTeamPlayersClub(managerTeam, playersMap) : [];

    return (
        <div className={styles.selectNationalContainer}>
            {!wasClicked && <h3>Select Your Club Team Starters for this Season!</h3>}
            <h4>Select {currentPosition.name}s ({selectedPlayers.value.length}/{currentPosition.max})</h4>
            <div className={styles.budgetBar}>
                <span>Budget: ${budget.toFixed(1)}M</span>
                <span>Spent: ${totalSpent.toFixed(1)}M</span>
                <span>Remaining: ${remaining.toFixed(1)}M</span>
            </div>

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
                        <div ref={playerListRef} className={styles.playerList}>
                            {managerTeamPlayers
                                .filter((p: any) => p.position === currentPosition.name)
                                .sort((a: any, b: any) => b.overall - a.overall)
                                .map((p: any) => (
                                    <div
                                        key={p.name}
                                        className={`${styles.playerItem} ${selectedPlayers.value.includes(p.name) ? styles.selected : ''} ${p.injured ? styles.playerItemInjured : ''}`}
                                        onClick={() => !p.injured && handlePlayerToggle(p.name)}
                                        style={{ cursor: p.injured ? 'not-allowed' : 'pointer' }}
                                    >
                                        <input
                                            type="checkbox"
                                            id={p.name}
                                            value={p.name}
                                            checked={selectedPlayers.value.includes(p.name)}
                                            disabled={p.injured}
                                            readOnly
                                        />
                                        <div className={styles.playerInfo}>
                                            <div className={styles.playerName}>
                                                {p.name}
                                                {p.injured && <span className={styles.injuredBadge}>INJ ({p.weeksInjured}w)</span>}
                                            </div>
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
                                                <span className={styles.statBadge}>
                                                    <h5 className={styles.statLabel}>Contract: {p.contractYrs}yr/${p.contractAmount.toFixed(1)}M</h5>
                                                </span>
                                                {p.newPlayer && (
                                                    <span className={styles.newSigning}>
                                                        <h5 className={styles.newSigningLabel}>New Signing!</h5>
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

export default SelectClub;
