import { useState } from "react";
import type { Manager, ManagerHistory } from "../../Models/WorldStage";
import styles from "./ManagerStats.module.css";

interface ManagerStatsProps {
    manager: Manager;
    managerHistory: ManagerHistory;
    currentYear: number;
}

export function ManagerStats({ manager, managerHistory, currentYear }: ManagerStatsProps) {
    const [selectedOption, setSelectedOption] = useState<string>("Select Stat");
    const leaderBoard = ["Select Stat", "Top Goal Scorers By Year", "Top Assist Scorers By Year", "Top Clean Sheets By Year"];
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
                {selectedOption !== "Select Stat" && (
                    <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
                        {allYears.map((year, index) => (
                            <option key={index} value={year}>{year}</option>
                        ))}
                    </select>
                )}
                {selectedOption === "Top Goal Scorers By Year" && (
                    <div className={styles.leaderBoard}>
                        {managerHistory.topGoalScorersByYear[selectedYear] ? (
                            <div key={managerHistory.topGoalScorersByYear[selectedYear].player} className={styles.player}>
                                <div className={styles.playerName}>{managerHistory.topGoalScorersByYear[selectedYear].player}</div>
                                <div className={styles.playerGoals}>{managerHistory.topGoalScorersByYear[selectedYear].goals}</div>
                            </div>
                        ) : (
                            <div className={styles.player}>No data for this year</div>
                        )}
                    </div>
                )}
                {selectedOption === "Top Assist Scorers By Year" && (
                    <div className={styles.leaderBoard}>
                        {managerHistory.topAssistScorersByYear[selectedYear] ? (
                            <div key={managerHistory.topAssistScorersByYear[selectedYear].player} className={styles.player}>
                                <div className={styles.playerName}>{managerHistory.topAssistScorersByYear[selectedYear].player}</div>
                                <div className={styles.playerGoals}>{managerHistory.topAssistScorersByYear[selectedYear].assists}</div>
                            </div>
                        ) : (
                            <div className={styles.player}>No data for this year</div>
                        )}
                    </div>
                )}
                {selectedOption === "Top Clean Sheets By Year" && (
                    <div className={styles.leaderBoard}>
                        {managerHistory.topCleanSheetsByYear[selectedYear] ? (
                            <div key={managerHistory.topCleanSheetsByYear[selectedYear].player} className={styles.player}>
                                <div className={styles.playerName}>{managerHistory.topCleanSheetsByYear[selectedYear].player}</div>
                                <div className={styles.playerCleanSheets}>{managerHistory.topCleanSheetsByYear[selectedYear].cleanSheets}</div>
                            </div>
                        ) : (
                            <div className={styles.player}>No data for this year</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ManagerStats;