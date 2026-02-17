import type { InternationalTournamentTeam, Match } from "../../../Models/WorldStage";
import styles from "./Show.module.css";

interface ShowInternationalTournamentTableProps {
    tournamentTitle: string | undefined;
    tournamentTeams: InternationalTournamentTeam[] | undefined;
    tournamentMatches: Match[] | undefined;
}

interface Matchup {
    home: string;
    away: string;
    homeScore: number | null;
    awayScore: number | null;
}

function getRoundName(teamCount: number): string {
    if (teamCount <= 2) return "Final";
    if (teamCount <= 4) return "Semi-Finals";
    if (teamCount <= 8) return "Quarter-Finals";
    if (teamCount <= 16) return "Round of 16";
    return `Round of ${teamCount}`;
}

function getWinner(matchup: Matchup): string {
    if (matchup.homeScore === null || matchup.awayScore === null) return "TBD";
    if (matchup.homeScore > matchup.awayScore) return matchup.home;
    if (matchup.awayScore > matchup.homeScore) return matchup.away;
    return "TBD";
}

function buildBracket(teams: InternationalTournamentTeam[], matches: Match[]): Matchup[][] {
    const rounds: Matchup[][] = [];
    const teamNames = teams.map(t => t.Team.team.name);
    const totalTeams = teamNames.length;

    if (totalTeams < 2) return rounds;

    // Seed first round: 1 vs last, 2 vs second-last, etc.
    const firstRound: Matchup[] = [];
    const half = Math.floor(totalTeams / 2);
    for (let i = 0; i < half; i++) {
        const home = teamNames[i];
        const away = teamNames[totalTeams - 1 - i];

        const match = matches.find(
            m =>
                (m.homeTeam.name === home && m.awayTeam.name === away) ||
                (m.homeTeam.name === away && m.awayTeam.name === home)
        );

        if (match) {
            firstRound.push({
                home: match.homeTeam.name,
                away: match.awayTeam.name,
                homeScore: match.homeScore,
                awayScore: match.awayScore,
            });
        } else {
            firstRound.push({ home, away, homeScore: null, awayScore: null });
        }
    }
    rounds.push(firstRound);

    // Build subsequent rounds from winners
    let prevRound = firstRound;
    while (prevRound.length > 1) {
        const nextRound: Matchup[] = [];
        for (let i = 0; i < prevRound.length; i += 2) {
            const winner1 = getWinner(prevRound[i]);
            const winner2 = i + 1 < prevRound.length ? getWinner(prevRound[i + 1]) : "TBD";

            const home = winner1;
            const away = winner2;

            const match = matches.find(
                m =>
                    (m.homeTeam.name === home && m.awayTeam.name === away) ||
                    (m.homeTeam.name === away && m.awayTeam.name === home)
            );

            if (match) {
                nextRound.push({
                    home: match.homeTeam.name,
                    away: match.awayTeam.name,
                    homeScore: match.homeScore,
                    awayScore: match.awayScore,
                });
            } else {
                nextRound.push({ home, away, homeScore: null, awayScore: null });
            }
        }
        rounds.push(nextRound);
        prevRound = nextRound;
    }

    return rounds;
}

export function ShowInternationalTournamentTable({
    tournamentTeams,
    tournamentMatches,
}: ShowInternationalTournamentTableProps) {
    const teams = tournamentTeams ?? [];
    const matches = tournamentMatches ?? [];
    const rounds = buildBracket(teams, matches);

    if (teams.length === 0) {
        return <div className={styles.tableContainer}>No teams in this tournament.</div>;
    }

    return (
        <div className={styles.bracketContainer}>
            <div className={styles.bracket}>
                {rounds.map((round, roundIndex) => {
                    const teamsInRound = round.length * 2;
                    const roundName = getRoundName(teamsInRound);
                    return (
                        <div key={roundIndex} className={styles.roundColumn}>
                            <div className={styles.roundTitle}>{roundName}</div>
                            {round.map((matchup, matchIndex) => {
                                const homeWon =
                                    matchup.homeScore !== null &&
                                    matchup.awayScore !== null &&
                                    matchup.homeScore > matchup.awayScore;
                                const awayWon =
                                    matchup.homeScore !== null &&
                                    matchup.awayScore !== null &&
                                    matchup.awayScore > matchup.homeScore;

                                return (
                                    <div key={matchIndex} className={styles.matchup}>
                                        <div className={`${styles.matchupTeam} ${homeWon ? styles.winner : ""}`}>
                                            <span className={`${styles.matchupTeamName} ${matchup.home === "TBD" ? styles.tbd : ""}`}>
                                                {matchup.home}
                                            </span>
                                            <span className={styles.matchupScore}>
                                                {matchup.homeScore ?? "-"}
                                            </span>
                                        </div>
                                        <div className={`${styles.matchupTeam} ${awayWon ? styles.winner : ""}`}>
                                            <span className={`${styles.matchupTeamName} ${matchup.away === "TBD" ? styles.tbd : ""}`}>
                                                {matchup.away}
                                            </span>
                                            <span className={styles.matchupScore}>
                                                {matchup.awayScore ?? "-"}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default ShowInternationalTournamentTable;
