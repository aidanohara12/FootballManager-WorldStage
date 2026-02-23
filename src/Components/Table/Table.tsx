import type { LeagueTeam } from "../../Models/WorldStage";
import styles from "./Table.module.css";

interface TableProps {
    leagueTitle: string | undefined;
    leageTeams: LeagueTeam[] | undefined;
}

export function MiniTable({ leagueTitle, leageTeams }: TableProps) {
    function getTeamPoints(team: LeagueTeam) {
        return team.points * 3 + team.draws;
    }

    function getTeamGoalDiff(team: LeagueTeam) {
        return team.goalsFor - team.goalsAgainst;
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
                    {leageTeams?.sort((a, b) => getTeamPoints(b) - getTeamPoints(a)).sort((a, b) => getTeamGoalDiff(b) - getTeamGoalDiff(a)).map((team) => {
                        const goalDiff = team.goalsFor - team.goalsAgainst;
                        const goalDiffClass = goalDiff > 0 ? styles.positive : goalDiff < 0 ? styles.negative : styles.neutral;

                        return (
                            <div key={team.Team.name} className={styles.tableRow}>
                                <div className={styles.teamName}>{team.Team.name}</div>
                                <div className={styles.statCell}>{team.points}</div>
                                <div className={styles.statCell}>{team.wins}</div>
                                <div className={styles.statCell}>{team.losses}</div>
                                <div className={styles.statCell}>{team.draws}</div>
                                <div className={`${styles.goalDifference} ${goalDiffClass}`}>
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