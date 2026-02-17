import type { LeagueTeam } from "../../../Models/WorldStage";
import styles from "./Show.module.css";

interface ShowLeagueTableProps {
    leagueTitle: string | undefined;
    leageTeams: LeagueTeam[] | undefined;
}

export function ShowLeagueTable({ leagueTitle, leageTeams }: ShowLeagueTableProps) {
    return (
        <div className={styles.tableContainer}>
            <div className={styles.table}>
                <div className={styles.tableHeader}>
                    <div className={styles.tableHeaderRow}>
                        <div className={styles.tableHeaderCell}>Team</div>
                        <div className={styles.tableHeaderCell}>Points</div>
                        <div className={styles.tableHeaderCell}>Wins</div>
                        <div className={styles.tableHeaderCell}>Losses</div>
                        <div className={styles.tableHeaderCell}>Draws</div>
                        <div className={styles.tableHeaderCell}>Goal Diff</div>
                    </div>
                </div>
                <div className={styles.tableBody}>
                    {leageTeams?.map((team) => {
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

export default ShowLeagueTable;