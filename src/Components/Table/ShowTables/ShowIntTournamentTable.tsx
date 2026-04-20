import type { InternationalGroup, InternationalTournament, Manager, Match } from "../../../Models/WorldStage";
import { flagName } from "../../../Models/Countries";
import styles from "./Show.module.css";

interface ShowInternationalTournamentTableProps {
    tournament: InternationalTournament | undefined;
    onMatchClick?: (match: Match) => void;
    manager: Manager;
}

const knockoutRoundOrder = [
    "Round of 32",
    "Round of 16",
    "Quarter-Finals",
    "Semi-Finals",
    "Final",
];

function sortGroupsManagerFirst(groups: InternationalGroup[], managerCountry: string): InternationalGroup[] {
    const managerGroupIdx = groups.findIndex(g => g.teams.includes(managerCountry));
    if (managerGroupIdx <= 0) return groups;
    const sorted = [...groups];
    const [managerGroup] = sorted.splice(managerGroupIdx, 1);
    sorted.unshift(managerGroup);
    return sorted;
}

function GroupTable({ group, matches, onMatchClick, managerCountry }: { group: InternationalGroup; matches: Match[]; onMatchClick?: (match: Match) => void; managerCountry: string }) {
    const groupMatches = matches.filter(m => m.tournamentRound?.startsWith(group.name));

    return (
        <div className={styles.groupContainer}>
            <div className={styles.groupTitle}>{group.name}</div>
            <div className={styles.groupTable}>
                <div className={styles.groupHeaderRow}>
                    <span className={styles.groupTeamCol}>Team</span>
                    <span className={styles.groupStatCol}>P</span>
                    <span className={styles.groupStatCol}>W</span>
                    <span className={styles.groupStatCol}>D</span>
                    <span className={styles.groupStatCol}>L</span>
                    <span className={styles.groupStatCol}>GF</span>
                    <span className={styles.groupStatCol}>GA</span>
                    <span className={styles.groupStatCol}>GD</span>
                    <span className={styles.groupStatColBold}>Pts</span>
                </div>
                {group.standings.map((standing, i) => {
                    const qualifies = i < 2;
                    const isManager = standing.teamName === managerCountry;
                    return (
                        <div
                            key={standing.teamName}
                            className={`${styles.groupRow} ${qualifies ? styles.groupQualify : ""} ${isManager ? styles.managerTeam : ""}`}
                        >
                            <span className={`${styles.groupTeamCol} ${isManager ? styles.managerText : ""}`}>{flagName(standing.teamName)}</span>
                            <span className={styles.groupStatCol}>{standing.wins + standing.draws + standing.losses}</span>
                            <span className={styles.groupStatCol}>{standing.wins}</span>
                            <span className={styles.groupStatCol}>{standing.draws}</span>
                            <span className={styles.groupStatCol}>{standing.losses}</span>
                            <span className={styles.groupStatCol}>{standing.goalsFor}</span>
                            <span className={styles.groupStatCol}>{standing.goalsAgainst}</span>
                            <span className={styles.groupStatCol}>{standing.goalsFor - standing.goalsAgainst}</span>
                            <span className={styles.groupStatColBold}>{standing.points}</span>
                        </div>
                    );
                })}
            </div>
            {groupMatches.length > 0 && (
                <div className={styles.groupMatches}>
                    {groupMatches.map((match, i) => {
                        const played = !!match.played;
                        const isManagerMatch = match.homeTeamName === managerCountry || match.awayTeamName === managerCountry;
                        return (
                            <div
                                key={i}
                                className={`${styles.groupMatch} ${played && onMatchClick ? styles.matchupClickable : ""} ${isManagerMatch ? styles.managerTeam : ""}`}
                                onClick={() => played && onMatchClick?.(match)}
                            >
                                <span className={styles.groupMatchTeam}>{flagName(match.homeTeamName)}</span>
                                <span className={styles.groupMatchScore}>
                                    {played ? `${match.homeScore} - ${match.awayScore}` : "vs"}
                                </span>
                                <span className={styles.groupMatchTeam}>{flagName(match.awayTeamName)}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function KnockoutBracket({ matches, onMatchClick, managerCountry }: { matches: Match[]; onMatchClick?: (match: Match) => void; managerCountry: string }) {
    // Get only knockout matches (not group stage, not friendlies, not qualifying)
    const knockoutMatches = matches.filter(
        m => !m.tournamentRound?.startsWith("Group") && !m.tournamentRound?.startsWith("Friendly") && !m.tournamentRound?.startsWith("WCQ")
    );

    if (knockoutMatches.length === 0) {
        return <div className={styles.tableContainer}>Knockout stage has not started yet.</div>;
    }

    // Group by round
    const roundMap = new Map<string, Match[]>();
    for (const match of knockoutMatches) {
        const round = match.tournamentRound ?? "Unknown";
        if (!roundMap.has(round)) roundMap.set(round, []);
        roundMap.get(round)!.push(match);
    }

    const sortedRounds = [...roundMap.entries()].sort((a, b) => {
        const aIdx = knockoutRoundOrder.indexOf(a[0]);
        const bIdx = knockoutRoundOrder.indexOf(b[0]);
        return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
    });

    return (
        <div className={styles.bracketContainer}>
            <div className={styles.bracket}>
                {sortedRounds.map(([roundName, roundMatches]) => (
                    <div key={roundName} className={styles.roundColumn}>
                        <div className={styles.roundTitle}>{roundName}</div>
                        {roundMatches.map((match, i) => {
                            const played = !!match.played;
                            const homeWon = played && match.homeScore > match.awayScore;
                            const awayWon = played && match.awayScore > match.homeScore;
                            const isManagerMatch = match.homeTeamName === managerCountry || match.awayTeamName === managerCountry;

                            return (
                                <div
                                    key={i}
                                    className={`${styles.matchup} ${played && onMatchClick ? styles.matchupClickable : ""} ${isManagerMatch ? styles.managerTie : ""}`}
                                    onClick={() => played && onMatchClick?.(match)}
                                >
                                    <div className={`${styles.matchupTeam} ${homeWon ? styles.winner : ""}`}>
                                        <span className={`${styles.matchupTeamName} ${match.homeTeamName === managerCountry ? styles.managerText : ""}`}>{flagName(match.homeTeamName)}</span>
                                        <span className={styles.matchupScore}>{played ? match.homeScore : "-"}</span>
                                    </div>
                                    <div className={`${styles.matchupTeam} ${awayWon ? styles.winner : ""}`}>
                                        <span className={`${styles.matchupTeamName} ${match.awayTeamName === managerCountry ? styles.managerText : ""}`}>{flagName(match.awayTeamName)}</span>
                                        <span className={styles.matchupScore}>{played ? match.awayScore : "-"}</span>
                                    </div>
                                    {match.penaltyWin && <div className={styles.penaltyTag}>Pens</div>}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}

function FriendlyResults({ matches, onMatchClick, manager }: { matches: Match[]; onMatchClick?: (match: Match) => void; manager: Manager }) {
    const friendlyMatches = matches.filter(m => m.tournamentRound?.startsWith("Friendly"));

    if (friendlyMatches.length === 0) return null;

    // Group by week (Friendly 1, Friendly 2, Friendly 3)
    const weekMap = new Map<string, Match[]>();
    for (const match of friendlyMatches) {
        const week = match.tournamentRound ?? "Friendly";
        if (!weekMap.has(week)) weekMap.set(week, []);
        weekMap.get(week)!.push(match);
    }

    const sortedWeeks = [...weekMap.entries()].sort((a, b) => a[0].localeCompare(b[0]));

    return (
        <div className={styles.friendlyContainer}>
            <div className={styles.groupTitle}>Friendly Matches</div>
            {sortedWeeks.map(([weekName, weekMatches]) => (
                <div key={weekName}>
                    <div className={styles.roundTitle}>Week {weekName.replace("Friendly ", "")}</div>
                    <div className={styles.groupMatches}>
                        {weekMatches.map((match, i) => {
                            const played = !!match.played;
                            const isManagerMatch = match.homeTeamName === manager.country || match.awayTeamName === manager.country;
                            return (
                                <div
                                    key={i}
                                    className={`${styles.groupMatch} ${played && onMatchClick ? styles.matchupClickable : ""} ${isManagerMatch ? styles.managerTeam : ""}`}
                                    onClick={() => played && onMatchClick?.(match)}
                                >
                                    <span className={styles.groupMatchTeam}>{flagName(match.homeTeamName)}</span>
                                    <span className={styles.groupMatchScore}>
                                        {played ? `${match.homeScore} - ${match.awayScore}` : "vs"}
                                    </span>
                                    <span className={styles.groupMatchTeam}>{flagName(match.awayTeamName)}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}

function QualifyingBrackets({ matches, onMatchClick, managerCountry }: { matches: Match[]; onMatchClick?: (match: Match) => void; managerCountry: string }) {
    const qualifyingMatches = matches.filter(m => m.tournamentRound?.startsWith("WCQ-"));
    if (qualifyingMatches.length === 0) return null;

    // Group by bracket (WCQ-1, WCQ-2, WCQ-3, WCQ-4)
    const bracketMap = new Map<string, Match[]>();
    for (const match of qualifyingMatches) {
        const bracketNum = match.tournamentRound?.split(" ")[0] ?? "WCQ-1"; // e.g. "WCQ-1"
        if (!bracketMap.has(bracketNum)) bracketMap.set(bracketNum, []);
        bracketMap.get(bracketNum)!.push(match);
    }

    const qualRoundOrder = ["Quarter-Finals", "Semi-Finals", "Final"];

    // Sort brackets so the one containing manager's country comes first
    const sortedBrackets = [...bracketMap.entries()].sort((a, b) => {
        const aHasManager = a[1].some(m => m.homeTeamName === managerCountry || m.awayTeamName === managerCountry);
        const bHasManager = b[1].some(m => m.homeTeamName === managerCountry || m.awayTeamName === managerCountry);
        if (aHasManager && !bHasManager) return -1;
        if (!aHasManager && bHasManager) return 1;
        return a[0].localeCompare(b[0]);
    });

    return (
        <div className={styles.qualifyingContainer}>
            {sortedBrackets.map(([bracketName, bracketMatches]) => {
                // Group matches by round within this bracket
                const roundMap = new Map<string, Match[]>();
                for (const match of bracketMatches) {
                    const roundPart = match.tournamentRound?.replace(`${bracketName} `, "") ?? "";
                    if (!roundMap.has(roundPart)) roundMap.set(roundPart, []);
                    roundMap.get(roundPart)!.push(match);
                }

                const sortedRounds = [...roundMap.entries()].sort((a, b) => {
                    const aIdx = qualRoundOrder.indexOf(a[0]);
                    const bIdx = qualRoundOrder.indexOf(b[0]);
                    return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
                });

                return (
                    <div key={bracketName} className={styles.qualifyingBracket}>
                        <div className={styles.roundTitle}>Bracket {bracketName.replace("WCQ-", "")}</div>
                        <div className={styles.bracket}>
                            {sortedRounds.map(([roundName, roundMatches]) => (
                                <div key={roundName} className={styles.roundColumn}>
                                    <div className={styles.roundTitle}>{roundName}</div>
                                    {roundMatches.map((match, i) => {
                                        const played = !!match.played;
                                        const homeWon = played && match.homeScore > match.awayScore;
                                        const awayWon = played && match.awayScore > match.homeScore;
                                        const isManagerMatch = match.homeTeamName === managerCountry || match.awayTeamName === managerCountry;
                                        return (
                                            <div
                                                key={i}
                                                className={`${styles.matchup} ${played && onMatchClick ? styles.matchupClickable : ""} ${isManagerMatch ? styles.managerTie : ""}`}
                                                onClick={() => played && onMatchClick?.(match)}
                                            >
                                                <div className={`${styles.matchupTeam} ${homeWon ? styles.winner : ""}`}>
                                                    <span className={`${styles.matchupTeamName} ${match.homeTeamName === managerCountry ? styles.managerText : ""}`}>{flagName(match.homeTeamName)}</span>
                                                    <span className={styles.matchupScore}>{played ? match.homeScore : "-"}</span>
                                                </div>
                                                <div className={`${styles.matchupTeam} ${awayWon ? styles.winner : ""}`}>
                                                    <span className={`${styles.matchupTeamName} ${match.awayTeamName === managerCountry ? styles.managerText : ""}`}>{flagName(match.awayTeamName)}</span>
                                                    <span className={styles.matchupScore}>{played ? match.awayScore : "-"}</span>
                                                </div>
                                                {match.penaltyWin && <div className={styles.penaltyTag}>Pens</div>}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export function ShowInternationalTournamentTable({
    tournament,
    onMatchClick,
    manager,
}: ShowInternationalTournamentTableProps) {
    if (!tournament) {
        return <div className={styles.tableContainer}>No tournament selected.</div>;
    }

    const teams = tournament.teams ?? [];
    const matches = tournament.matches ?? [];
    const mc = manager.country;

    if (teams.length === 0) {
        return <div className={styles.tableContainer}>No teams in this tournament.</div>;
    }

    // Not started yet
    if (tournament.currentPhase === "not_started" || !tournament.currentPhase) {
        return <div className={styles.tableContainer}>This tournament has not started yet.</div>;
    }

    // World Cup — show qualifying, groups, and knockout all in one view
    const isWorldCup = tournament.name === "World Stage";
    const hasQualifyingMatches = matches.some(m => m.tournamentRound?.startsWith("WCQ-"));
    const hasKnockoutMatches = matches.some(m =>
        !m.tournamentRound?.startsWith("Group") &&
        !m.tournamentRound?.startsWith("Friendly") &&
        !m.tournamentRound?.startsWith("WCQ")
    );

    if (isWorldCup) {
        const sortedGroups = tournament.groups ? sortGroupsManagerFirst(tournament.groups, mc) : undefined;
        return (
            <div className={styles.intTournamentContainer}>
                {hasQualifyingMatches && tournament.currentPhase === "qualifying" && (
                    <div className={styles.knockoutContainer}>
                        <div className={styles.phaseLabel}>World Stage Qualifying</div>
                        <QualifyingBrackets matches={matches} onMatchClick={onMatchClick} managerCountry={mc} />
                    </div>
                )}
                {sortedGroups && (
                    <div className={styles.groupTableContainer}>
                        <div className={styles.phaseLabel}>Group Stage</div>
                        <div className={styles.groupsGrid}>
                            {sortedGroups.map((group) => (
                                <div key={group.name}>
                                    <GroupTable
                                        group={group}
                                        matches={matches}
                                        onMatchClick={onMatchClick}
                                        managerCountry={mc}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {hasKnockoutMatches && (
                    <div className={styles.knockoutContainer}>
                        <div className={styles.phaseLabel}>Knockout Stage</div>
                        <KnockoutBracket matches={matches} onMatchClick={onMatchClick} managerCountry={mc} />
                    </div>
                )}
            </div>
        );
    }

    // Friendly tournament
    if (tournament.currentPhase === "friendly" || (tournament.currentPhase === "complete" && !tournament.groups)) {
        const hasKnockout = matches.some(m => !m.tournamentRound?.startsWith("Friendly"));
        return (
            <div className={styles.intTournamentContainer}>
                <div className={styles.friendlyTableContainer}>
                    <FriendlyResults matches={matches} onMatchClick={onMatchClick} manager={manager} />
                </div>
                {hasKnockout && (
                    <>
                        <div className={styles.friendlyKnockoutContainer}>
                            <div className={styles.phaseLabel}>Mini Tournament</div>
                            <KnockoutBracket matches={matches} onMatchClick={onMatchClick} managerCountry={mc} />
                        </div>
                    </>
                )}
            </div>
        );
    }

    // Major tournament (group + knockout) — sort manager's group first
    const sortedGroups = tournament.groups ? sortGroupsManagerFirst(tournament.groups, mc) : undefined;
    return (
        <div className={styles.intTournamentContainer}>
            {sortedGroups && (
                <div className={styles.groupTableContainer}>
                    <div className={styles.groupsGrid}>
                        {sortedGroups.map((group) => (
                            <div key={group.name}>
                                <GroupTable
                                    group={group}
                                    matches={matches}
                                    onMatchClick={onMatchClick}
                                    managerCountry={mc}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {(tournament.currentPhase === "knockout" || tournament.currentPhase === "complete") && (
                <>
                    <div className={styles.knockoutContainer}>
                        <div className={styles.phaseLabel}>Knockout Stage</div>
                        <KnockoutBracket matches={matches} onMatchClick={onMatchClick} managerCountry={mc} />
                    </div>
                </>
            )}
        </div>
    );
}

export default ShowInternationalTournamentTable;
