import type { TournamentTeam, Match } from "../../../Models/WorldStage";
import { isEuropeanTournament } from "../../../Utils/TournamentSchedule";
import styles from "./Show.module.css";

interface ShowTournamentTableProps {
    tournamentTitle: string | undefined;
    tournamentTeams: TournamentTeam[] | undefined;
    tournamentMatches: Match[] | undefined;
    onMatchClick?: (match: Match) => void;
    managerTeam?: string;
}

const roundOrder = [
    "Play-In",
    "Round of 128",
    "Round of 64",
    "Round of 32",
    "Round of 16",
    "Quarter-Finals",
    "Semi-Finals",
    "Final",
];

interface Tie {
    teamA: string;
    teamB: string;
    leg1: Match | undefined;
    leg2: Match | undefined;
    teamAAgg: number;
    teamBAgg: number;
    winner: string | null;
    penaltyWin: boolean;
}

function groupTies(roundMatches: Match[]): Tie[] {
    const leg1Matches = roundMatches.filter(m => m.leg === 1);
    const leg2Matches = roundMatches.filter(m => m.leg === 2);
    const ties: Tie[] = [];

    for (const leg1 of leg1Matches) {
        const teamA = leg1.homeTeamName;
        const teamB = leg1.awayTeamName;
        const leg2 = leg2Matches.find(
            m => m.homeTeamName === teamB && m.awayTeamName === teamA
        );

        const leg1Played = !!leg1.played;
        const leg2Played = !!(leg2?.played);

        let teamAAgg = 0;
        let teamBAgg = 0;
        let winner: string | null = null;
        let penaltyWin = false;

        if (leg1Played) {
            teamAAgg += leg1.homeScore;
            teamBAgg += leg1.awayScore;
        }
        if (leg2 && leg2Played) {
            teamAAgg += leg2.awayScore;
            teamBAgg += leg2.homeScore;
        }

        if (leg1Played && leg2Played) {
            if (teamAAgg > teamBAgg) {
                winner = teamA;
            } else if (teamBAgg > teamAAgg) {
                winner = teamB;
            } else {
                penaltyWin = !!(leg2?.penaltyWin);
                if (penaltyWin && leg2) {
                    winner = leg2.homeScore > leg2.awayScore ? teamB : teamA;
                }
            }
        }

        ties.push({ teamA, teamB, leg1, leg2, teamAAgg, teamBAgg, winner, penaltyWin });
    }

    return ties;
}

export function ShowTournamentTable({
    tournamentTeams,
    tournamentMatches,
    onMatchClick,
    managerTeam,
}: ShowTournamentTableProps) {
    const teams = tournamentTeams ?? [];
    const matches = tournamentMatches ?? [];
    const tournamentName = teams[0]?.tournamentName ?? "";
    const european = isEuropeanTournament(tournamentName);

    if (teams.length === 0) {
        return <div className={styles.tableContainer}>No teams in this tournament.</div>;
    }

    // Group matches by round
    const roundMap = new Map<string, Match[]>();
    for (const match of matches) {
        const round = match.tournamentRound ?? "Unknown";
        if (!roundMap.has(round)) {
            roundMap.set(round, []);
        }
        roundMap.get(round)!.push(match);
    }

    // Sort rounds by the defined order
    const sortedRounds = [...roundMap.entries()].sort((a, b) => {
        const aIdx = roundOrder.indexOf(a[0]);
        const bIdx = roundOrder.indexOf(b[0]);
        return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
    });

    if (sortedRounds.length === 0) {
        return <div className={styles.tableContainer}>No matches scheduled yet.</div>;
    }

    const isManagerTeam = (name: string) => managerTeam === name;

    return (
        <div className={styles.bracketContainer}>
            <div className={styles.bracket}>
                {sortedRounds.map(([roundName, roundMatches]) => {
                    const isFinal = roundName === "Final";
                    const showTwoLegged = european && !isFinal && roundMatches.some(m => m.leg);

                    if (showTwoLegged) {
                        const ties = groupTies(roundMatches);
                        return (
                            <div key={roundName} className={styles.roundColumn}>
                                <div className={styles.roundTitle}>{roundName}</div>
                                {ties.map((tie, i) => {
                                    const leg1Played = !!(tie.leg1?.played);
                                    const leg2Played = !!(tie.leg2?.played);
                                    const hasManager = isManagerTeam(tie.teamA) || isManagerTeam(tie.teamB);

                                    return (
                                        <div key={i} className={`${styles.tieContainer} ${hasManager ? styles.managerTie : ""}`}>
                                            <div className={styles.tieTeams}>
                                                <span className={`${styles.tieTeamName} ${tie.winner === tie.teamA ? styles.tieWinner : ""} ${isManagerTeam(tie.teamA) ? styles.managerText : ""}`}>
                                                    {tie.teamA}
                                                </span>
                                                <span className={styles.tieVs}>vs</span>
                                                <span className={`${styles.tieTeamName} ${tie.winner === tie.teamB ? styles.tieWinner : ""} ${isManagerTeam(tie.teamB) ? styles.managerText : ""}`}>
                                                    {tie.teamB}
                                                </span>
                                            </div>
                                            <div className={styles.tieLegs}>
                                                <div
                                                    className={`${styles.tieLeg} ${leg1Played && onMatchClick ? styles.matchupClickable : ""}`}
                                                    onClick={() => leg1Played && tie.leg1 && onMatchClick?.(tie.leg1)}
                                                >
                                                    <span className={styles.tieLegLabel}>Leg 1</span>
                                                    <span className={styles.tieLegScore}>
                                                        {leg1Played
                                                            ? `${tie.leg1!.homeTeamName} ${tie.leg1!.homeScore} - ${tie.leg1!.awayScore} ${tie.leg1!.awayTeamName}`
                                                            : "Not played"}
                                                    </span>
                                                </div>
                                                <div
                                                    className={`${styles.tieLeg} ${leg2Played && onMatchClick ? styles.matchupClickable : ""}`}
                                                    onClick={() => leg2Played && tie.leg2 && onMatchClick?.(tie.leg2)}
                                                >
                                                    <span className={styles.tieLegLabel}>Leg 2</span>
                                                    <span className={styles.tieLegScore}>
                                                        {leg2Played
                                                            ? `${tie.leg2!.homeTeamName} ${tie.leg2!.homeScore} - ${tie.leg2!.awayScore} ${tie.leg2!.awayTeamName}`
                                                            : "Not played"}
                                                    </span>
                                                </div>
                                            </div>
                                            {(leg1Played || leg2Played) && (
                                                <div className={styles.tieAgg}>
                                                    <span className={`${styles.tieAggScore} ${tie.winner === tie.teamA ? styles.tieWinner : ""}`}>
                                                        {tie.teamA} {tie.teamAAgg}
                                                    </span>
                                                    <span className={styles.tieAggDash}> - </span>
                                                    <span className={`${styles.tieAggScore} ${tie.winner === tie.teamB ? styles.tieWinner : ""}`}>
                                                        {tie.teamBAgg} {tie.teamB}
                                                    </span>
                                                    {tie.penaltyWin && <span className={styles.penaltyTag}> (Pens)</span>}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    }

                    // Single-match rounds (non-European, or Final)
                    return (
                        <div key={roundName} className={styles.roundColumn}>
                            <div className={styles.roundTitle}>{roundName}</div>
                            {roundMatches.map((match, matchIndex) => {
                                const played = !!match.played;
                                const homeWon = played && match.homeScore > match.awayScore;
                                const awayWon = played && match.awayScore > match.homeScore;
                                const hasManager = isManagerTeam(match.homeTeamName) || isManagerTeam(match.awayTeamName);

                                return (
                                    <div
                                        key={matchIndex}
                                        className={`${styles.matchup} ${played && onMatchClick ? styles.matchupClickable : ""} ${hasManager ? styles.managerTie : ""}`}
                                        onClick={() => played && onMatchClick?.(match)}
                                    >
                                        <div className={`${styles.matchupTeam} ${homeWon ? styles.winner : ""}`}>
                                            <span className={`${styles.matchupTeamName} ${isManagerTeam(match.homeTeamName) ? styles.managerText : ""}`}>
                                                {match.homeTeamName}
                                            </span>
                                            <span className={styles.matchupScore}>
                                                {played ? match.homeScore : "-"}
                                            </span>
                                        </div>
                                        <div className={`${styles.matchupTeam} ${awayWon ? styles.winner : ""}`}>
                                            <span className={`${styles.matchupTeamName} ${isManagerTeam(match.awayTeamName) ? styles.managerText : ""}`}>
                                                {match.awayTeamName}
                                            </span>
                                            <span className={styles.matchupScore}>
                                                {played ? match.awayScore : "-"}
                                            </span>
                                        </div>
                                        {match.penaltyWin && (
                                            <div className={styles.penaltyTag}>Pens</div>
                                        )}
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

export default ShowTournamentTable;
