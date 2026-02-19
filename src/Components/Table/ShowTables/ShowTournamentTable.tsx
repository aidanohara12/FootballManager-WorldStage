import type { TournamentTeam, Match } from "../../../Models/WorldStage";
import styles from "./Show.module.css";

interface ShowTournamentTableProps {
    tournamentTitle: string | undefined;
    tournamentTeams: TournamentTeam[] | undefined;
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

function findMatch(matches: Match[], home: string, away: string): Matchup {
    const match = matches.find(
        m =>
            (m.homeTeam.name === home && m.awayTeam.name === away) ||
            (m.homeTeam.name === away && m.awayTeam.name === home)
    );
    if (match) {
        return {
            home: match.homeTeam.name,
            away: match.awayTeam.name,
            homeScore: match.homeScore,
            awayScore: match.awayScore,
        };
    }
    return { home, away, homeScore: null, awayScore: null };
}

function nextPowerOf2(n: number): number {
    let p = 1;
    while (p < n) p *= 2;
    return p;
}

function buildBracket(teams: TournamentTeam[], matches: Match[]): Matchup[][] {
    const rounds: Matchup[][] = [];
    const teamNames = teams.map(t => t.Team.name);
    const totalTeams = teamNames.length;

    if (totalTeams < 2) return rounds;

    const bracketSize = nextPowerOf2(totalTeams);
    const numByes = bracketSize - totalTeams;
    // Number of play-in matches (teams that must play to get into the main bracket)
    const numPlayInMatches = totalTeams - bracketSize / 2;

    // Top seeds get byes, lower seeds play in the preliminary round
    // Bye teams: seeds 1 through numByes (indices 0..numByes-1)
    // Play-in teams: the remaining seeds pair up (best remaining vs worst remaining)
    if (numPlayInMatches > 0) {
        const playInRound: Matchup[] = [];
        const playInTeams = teamNames.slice(numByes); // lower-seeded teams that must play in
        for (let i = 0; i < playInTeams.length / 2; i++) {
            const home = playInTeams[i];
            const away = playInTeams[playInTeams.length - 1 - i];
            playInRound.push(findMatch(matches, home, away));
        }
        rounds.push(playInRound);
    }

    // Build the main bracket round (bracketSize / 2 matchups)
    // Slots are filled by: bye teams in seeded order + winners of play-in matches
    const mainRoundSlots: string[] = [];
    // Interleave bye teams and play-in winners by seed position
    const playInRound = numPlayInMatches > 0 ? rounds[0] : null;

    // Build a seeded list: for each slot in the full bracket, determine if it's a bye team or a play-in winner
    // Seeds 1..numByes are byes, seeds (numByes+1)..totalTeams played in
    // We pair seed 1 vs seed bracketSize, seed 2 vs seed bracketSize-1, etc.
    // But since some seeds played in, we replace those with their play-in result
    for (let i = 0; i < bracketSize / 2; i++) {
        const topSeed = i; // 0-indexed seed
        // Determine top team for this matchup
        let topTeam: string;
        if (topSeed < numByes) {
            topTeam = teamNames[topSeed]; // bye team
        } else {
            // play-in winner
            const playInIdx = topSeed - numByes;
            topTeam = playInRound ? getWinner(playInRound[playInIdx]) : "TBD";
        }

        // Determine bottom team for this matchup
        let bottomTeam: string;
        // bottomSeed maps to a team index: but bracket slots beyond totalTeams don't exist
        // The bottom seed in terms of actual team index
        const bottomTeamIndex = bracketSize - 1 - i;
        if (bottomTeamIndex < numByes) {
            bottomTeam = teamNames[bottomTeamIndex];
        } else if (bottomTeamIndex < totalTeams) {
            // This team played in the play-in round - find which play-in match they were in
            const playInTeams = teamNames.slice(numByes);
            const playInIdx = playInTeams.length - 1 - (bottomTeamIndex - numByes);
            if (playInIdx >= 0 && playInIdx < (playInRound?.length ?? 0)) {
                bottomTeam = playInRound ? getWinner(playInRound[playInIdx]) : "TBD";
            } else {
                bottomTeam = "TBD";
            }
        } else {
            bottomTeam = "TBD"; // empty bracket slot
        }

        mainRoundSlots.push(topTeam);
        mainRoundSlots.push(bottomTeam);
    }

    // Now pair up the main round slots
    const mainRound: Matchup[] = [];
    for (let i = 0; i < mainRoundSlots.length; i += 2) {
        const home = mainRoundSlots[i];
        const away = mainRoundSlots[i + 1];
        mainRound.push(findMatch(matches, home, away));
    }
    rounds.push(mainRound);

    // Build subsequent rounds from winners
    let prevRound = mainRound;
    while (prevRound.length > 1) {
        const nextRound: Matchup[] = [];
        for (let i = 0; i < prevRound.length; i += 2) {
            const winner1 = getWinner(prevRound[i]);
            const winner2 = i + 1 < prevRound.length ? getWinner(prevRound[i + 1]) : "TBD";
            nextRound.push(findMatch(matches, winner1, winner2));
        }
        rounds.push(nextRound);
        prevRound = nextRound;
    }

    return rounds;
}

export function ShowTournamentTable({
    tournamentTeams,
    tournamentMatches,
}: ShowTournamentTableProps) {
    const teams = tournamentTeams ?? [];
    const matches = tournamentMatches ?? [];
    const rounds = buildBracket(teams, matches);
    const hasPlayIn = teams.length > 0 && nextPowerOf2(teams.length) !== teams.length;

    if (teams.length === 0) {
        return <div className={styles.tableContainer}>No teams in this tournament.</div>;
    }

    return (
        <div className={styles.bracketContainer}>
            <div className={styles.bracket}>
                {rounds.map((round, roundIndex) => {
                    const isPlayIn = hasPlayIn && roundIndex === 0;
                    const teamsInRound = round.length * 2;
                    const roundName = isPlayIn ? "Play-In" : getRoundName(teamsInRound);
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

export default ShowTournamentTable;
