import { useState } from "react";
import type { Manager, ManagerHistory } from "../../Models/WorldStage";
import styles from "./ManagerStats.module.css";

interface ManagerStatsProps {
    manager: Manager;
    managerHistory: ManagerHistory;
    currentYear: number;
}

export function ManagerStats({ manager, managerHistory, currentYear }: ManagerStatsProps) {
    const [selectedOption, setSelectedOption] = useState<string>("Top Goal Scorers");
    const leaderBoard = ["Top Goal Scorers", "Top Assist Scorers", "Top Clean Sheets", "Top Goal Scorers By Year", "Top Assist Scorers By Year", "Top Clean Sheets By Year"];
    const [selectedYear, setSelectedYear] = useState<number>(currentYear);

    const allYears: number[] = [];
    for (let y = currentYear; y >= 2026; y--) {
        allYears.push(y);
    }

    return (
        <div className={styles.managerStatsContainer}>
            <div className={styles.managerBox}>
                <div className={styles.statBox}>
                    <h4>Career Record: {manager.careerWins}-{manager.careerLosses}-{manager.careerDraws}</h4>
                    <h4>Career Trophies: {(manager.trophiesWon.length)}</h4>
                </div>
            </div>
            <div className={styles.managerLeaders}>
                <h4>Career Leaders</h4>
                <select value={selectedOption} onChange={(e) => setSelectedOption(e.target.value)}>
                    {leaderBoard.map((leader, index) => (
                        <option key={index} value={leader}>{leader}</option>
                    ))}
                </select>
                {selectedOption === "Top Goal Scorers" && (
                    <div className={styles.leaderBoard}>
                        {managerHistory.topGoalScorrers.map((player, index) => (
                            <div key={index} className={styles.player}>
                                <div className={styles.playerName}>{player.name}</div>
                                <div className={styles.playerGoals}>{player.totalGoals}</div>
                            </div>
                        ))}
                    </div>
                )}
                {selectedOption === "Top Assist Scorers" && (
                    <div className={styles.leaderBoard}>
                        {managerHistory.topGoalScorrers.map((player, index) => (
                            <div key={index} className={styles.player}>
                                <div className={styles.playerName}>{player.name}</div>
                                <div className={styles.playerAssists}>{player.totalAssists}</div>
                            </div>
                        ))}
                    </div>
                )}
                {selectedOption === "Top Clean Sheets" && (
                    <div className={styles.leaderBoard}>
                        {managerHistory.topCleanSheets.map((player, index) => (
                            <div key={index} className={styles.player}>
                                <div className={styles.playerName}>{player.name}</div>
                                <div className={styles.playerCleanSheets}>{player.cleanSheets}</div>
                            </div>
                        ))}
                    </div>
                )}
                {selectedOption === "Top Goal Scorers By Year" && (
                    <div className={styles.leaderBoard}>
                        <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
                            {allYears.map((year, index) => (
                                <option key={index} value={year}>{year}</option>
                            ))}
                        </select>
                        <div key={managerHistory.topGoalScorersByYear[selectedYear].player.name} className={styles.player}>
                            <div className={styles.playerName}>{managerHistory.topGoalScorersByYear[selectedYear].player.name}</div>
                            <div className={styles.playerGoals}>{managerHistory.topGoalScorersByYear[selectedYear].goals}</div>
                        </div>
                    </div>
                )}
                {selectedOption === "Top Assist Scorers By Year" && (
                    <div className={styles.leaderBoard}>
                        <div key={managerHistory.topAssistScorersByYear[selectedYear].player.name} className={styles.player}>
                            <div className={styles.playerName}>{managerHistory.topAssistScorersByYear[selectedYear].player.name}</div>
                            <div className={styles.playerGoals}>{managerHistory.topAssistScorersByYear[selectedYear].assists}</div>
                        </div>
                    </div>
                )}
                {selectedOption === "Top Clean Sheets By Year" && (
                    <div className={styles.leaderBoard}>
                        <div key={managerHistory.topCleanSheetsByYear[selectedYear].player.name} className={styles.player}>
                            <div className={styles.playerName}>{managerHistory.topCleanSheetsByYear[selectedYear].player.name}</div>
                            <div className={styles.playerCleanSheets}>{managerHistory.topCleanSheetsByYear[selectedYear].cleanSheets}</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ManagerStats;