import { useGameContext } from "../../Context/GameContext";
import styles from "./MiniSeasonSumamry.module.css";

function ordinal(n: number): string {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
}

export function MiniSeasonSummary() {
    const { leagues, userManager, currentYear, teamsMap, tournaments } = useGameContext();
    const managerTeam = teamsMap.value.get(userManager.value.team);
    const managerLeague = leagues.value.find((league) => league.teams?.includes(userManager.value.team));
    const leagueWinner = managerLeague?.teams
        .map((name) => teamsMap.value.get(name))
        .filter(Boolean)
        .sort((a, b) => (b!.goalsFor - b!.goalsAgainst) - (a!.goalsFor - a!.goalsAgainst))
        .sort((a, b) => b!.points - a!.points)[0];
    const sortedLeague = managerLeague?.teams
        .map((name) => teamsMap.value.get(name))
        .filter((t): t is NonNullable<typeof t> => !!t)
        .sort((a, b) => (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst))
        .sort((a, b) => b.points - a.points);
    const usersPlace = managerTeam && sortedLeague ? sortedLeague.indexOf(managerTeam) + 1 : undefined;
    const europeanTournaments = ["Champions League", "Europa League", "Conference League"];
    const usersTournaments = tournaments.value
        .filter((t) => t.teams.some((team) => team.teamName === userManager.value.team))
        .filter((t) => !(currentYear.value.yearsCompleted < 1 && europeanTournaments.includes(t.name)))
        .map((t) => ({
            tournament: t,
            winner: t.pastChampions[t.pastChampions.length - 1]?.teamName ?? null,
        }));
    return (
        <div className={styles.miniSeasonSummary}>
            <div className={styles.winnersContainer}>
                <div className={styles.leagueWinners}>
                    <h3>{userManager.value.team}: Summary</h3>
                    <div className={styles.leagueResults}>
                        <div className={styles.leagueResult}>
                            <div className={styles.leagueResultLabel}>Winner: {leagueWinner?.name}</div>
                            <div className={styles.leagueResultLabel}>{leagueWinner?.points} pts</div>
                        </div>
                        <div className={styles.userResult}>
                            <div className={styles.userResultLabel}>Users's Results</div>
                            <div className={styles.leagueResultLabel}>{managerTeam?.points} pts — {usersPlace ? `${usersPlace}${ordinal(usersPlace)} place` : ""}</div>
                        </div>
                    </div>
                </div>
                <div className={styles.tournamentResults}>
                    {usersTournaments.map(({ tournament, winner }, index) => (
                        <div key={index} className={styles.tournamentResult}>
                            <div className={styles.tournamentName}>{tournament.name} Winner:</div>
                            <div className={styles.tournamentWinner}>{winner ?? "TBD"}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default MiniSeasonSummary;