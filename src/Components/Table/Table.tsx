import type { Team } from "../../Models/WorldStage";
import styles from "./Table.module.css";

interface TableProps {
    leagueTitle: string | undefined;
    leageTeams: Team[] | undefined;
    managerTeam?: Team;
}

export function MiniTable({ leagueTitle, leageTeams, managerTeam }: TableProps) {
    function getTeamPoints(team: Team) {
        return team.points;
    }

    function getTeamGoalDiff(team: Team) {
        return team.goalsFor - team.goalsAgainst;
    }

    function isManagerTeam(team: Team) {
        return managerTeam && team.name === managerTeam.name;
    }

    return (
        <div className={styles.tableContainer}>
            <div className={styles.table}>
                <div className={styles.tableHeader}>
                    <div className={styles.tableHeaderRow}>
                        <div className={styles.tableHeaderCell}>Team</div>
                        <div className={styles.tableHeaderCell}>PTS</div>
                        <div className={styles.tableHeaderCell}>W</div>
                        <div className={styles.tableHeaderCell}>L</div>
                        <div className={styles.tableHeaderCell}>D</div>
                        <div className={styles.tableHeaderCell}>GD</div>
                    </div>
                </div>
                <div className={styles.tableBody}>
                    {leageTeams?.sort((a, b) => getTeamGoalDiff(b) - getTeamGoalDiff(a)).sort((a, b) => getTeamPoints(b) - getTeamPoints(a)).map((team) => {
                        const goalDiff = team.goalsFor - team.goalsAgainst;
                        const goalDiffClass = goalDiff > 0 ? styles.positive : goalDiff < 0 ? styles.negative : styles.neutral;

                        return (
                            <div key={team.name} className={`${styles.tableRow} ${isManagerTeam(team) ? styles.managerTeam : ''}`}>
                                <div className={`${styles.teamName} ${isManagerTeam(team) ? styles.managerText : ''}`}>{team.name}</div>
                                <div className={`${styles.statCell} ${isManagerTeam(team) ? styles.managerText : ''}`}>{team.points}</div>
                                <div className={`${styles.statCell} ${isManagerTeam(team) ? styles.managerText : ''}`}>{team.wins}</div>
                                <div className={`${styles.statCell} ${isManagerTeam(team) ? styles.managerText : ''}`}>{team.losses}</div>
                                <div className={`${styles.statCell} ${isManagerTeam(team) ? styles.managerText : ''}`}>{team.draws}</div>
                                <div className={`${styles.goalDifference} ${goalDiffClass} ${isManagerTeam(team) ? styles.managerText : ''}`}>
                                    {goalDiff > 0 ? `+${goalDiff}` : goalDiff}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default MiniTable;