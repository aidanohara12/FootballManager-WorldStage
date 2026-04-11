import type { Team } from "../../../Models/WorldStage";
import styles from "./Show.module.css";

interface ShowLeagueTableProps {
    leagueTitle: string | undefined;
    leageTeams: Team[] | undefined;
    managerTeam: Team;
}

export function ShowLeagueTable({ leageTeams, managerTeam }: ShowLeagueTableProps) {
    function getTeamPoints(team: Team) {
        return team.points;
    }

    function getTeamGoalDiff(team: Team) {
        return team.goalsFor - team.goalsAgainst;
    }
    function isManagerTeam(team: Team) {
        return team.name === managerTeam.name;
    }

    return (
        <div className={styles.tableContainer}>
            <div className={styles.table}>
                <div className={styles.tableHeader}>
                    <div className={styles.tableHeaderRow}>
                        <div className={styles.tableHeaderCell}>Team</div>
                        <div className={styles.tableHeaderCell}>Games</div>
                        <div className={styles.tableHeaderCell}>Points⬇️</div>
                        <div className={styles.tableHeaderCell}>Wins</div>
                        <div className={styles.tableHeaderCell}>Losses</div>
                        <div className={styles.tableHeaderCell}>Draws</div>
                        <div className={styles.tableHeaderCell}>Goal Diff</div>
                        <div className={styles.tableHeaderCell}>Form</div>
                    </div>
                </div>
                <div className={styles.tableBody}>
                    {leageTeams?.sort((a, b) => getTeamGoalDiff(b) - getTeamGoalDiff(a)).sort((a, b) => getTeamPoints(b) - getTeamPoints(a)).map((team, index) => {
                        const goalDiff = team.goalsFor - team.goalsAgainst;
                        const goalDiffClass = goalDiff > 0 ? styles.positive : goalDiff < 0 ? styles.negative : styles.neutral;
                        const gamesPlayed = team.wins + team.losses + team.draws;

                        return (
                            <div key={team.name} className={`${styles.tableRow} ${isManagerTeam(team) ? styles.managerTeam : ''}`}>
                                <div className={`${styles.teamName} ${isManagerTeam(team) ? styles.managerText : ''}`}>{index + 1}. {team.name}</div>
                                <div className={`${styles.statCell} ${isManagerTeam(team) ? styles.managerText : ''}`}>{gamesPlayed}</div>
                                <div className={`${styles.statCell} ${isManagerTeam(team) ? styles.managerText : ''}`}>{team.points}</div>
                                <div className={`${styles.statCell} ${isManagerTeam(team) ? styles.managerText : ''}`}>{team.wins}</div>
                                <div className={`${styles.statCell} ${isManagerTeam(team) ? styles.managerText : ''}`}>{team.losses}</div>
                                <div className={`${styles.statCell} ${isManagerTeam(team) ? styles.managerText : ''}`}>{team.draws}</div>
                                <div className={`${styles.goalDifference} ${goalDiffClass} ${isManagerTeam(team) ? styles.managerText : ''}`}>
                                    {goalDiff > 0 ? `+${goalDiff}` : goalDiff}
                                </div>
                                <div className={`${styles.form} ${isManagerTeam(team) ? styles.managerText : ''}`}>{team.form.join(' - ')}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default ShowLeagueTable;