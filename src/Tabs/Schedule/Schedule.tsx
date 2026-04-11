import logo from '../../assets/Images/logo.png';
import styles from './Schedule.module.css';
import WeekSchedule from "../../Components/WeekSchedule/WeekSchedule";
import { signal, type Signal } from '@preact/signals-react';
import type { InternationalTournament, Match, Player, PlayerAwards, Team, Tournament } from '../../Models/WorldStage';
import { advanceTournamentRound, isEuropeanTournament } from '../../Utils/TournamentSchedule';
import {
    updateGroupStandings,
    isGroupStageComplete,
    advanceToKnockout,
    advanceInternationalKnockout,
    areFriendliesComplete,
    advanceFriendlyToMiniTournament,
    advanceFriendlyKnockout,
    advanceWorldCupQualifying,
    advanceWorldCupToKnockout,
    advanceWorldCupKnockout,
    isWorldCupYear,
    isMajorTournamentYear,
} from '../../Utils/InternationalTournamentSchedule';
import MiniTable from "../../Components/Table/Table";
import { useSignals } from '@preact/signals-react/runtime';
import { useEffect, useRef, useState } from 'react';
import { moveToNextDay, months } from "../../Utils/Calendar";
import SelectTraining from '../../Components/TeamSelection/SelectTraining/SelectTraining';
import getCurrentWeek from "../../Components/WeekSchedule/GetCurrentWeek";
import { simulateGame } from "../../Utils/SimulateGame";
import { MatchOverview } from '../../Components/MatchOverview/MatchOverview';
import LeagueWeekMatches from '../../Components/LeagueWeekMatches/LeagueWeekMatches';
import { useGameContext } from '../../Context/GameContext';
import { flagName, Top50Countries } from '../../Models/Countries';
interface ScheduleProps {
    isFirstSeason: Signal<boolean>;
    currentPage: Signal<string>;
    retiredPlayers: Signal<Player[]>;
    playerAwards: Signal<PlayerAwards>;
}

const monthToNumber: Record<string, number> = {
    "January": 1,
    "February": 2,
    "March": 3,
    "April": 4,
    "May": 5,
    "June": 6,
    "July": 7,
    "August": 8,
    "September": 9,
    "October": 10,
    "November": 11,
    "December": 12
};

const matches = signal<Match[]>([]);
const isSimulated: Record<string, boolean> = {};
const matchClicked = signal<Match | undefined>(undefined);
let lastPreGameSuspended: Set<string> | undefined;

export function Schedule({ isFirstSeason, currentPage, retiredPlayers, playerAwards }: ScheduleProps) {
    const ctx = useGameContext();
    const { teamsMap, playersMap, userManager: manager, leagues, currentYear, tournaments, internationalTournaments, currentInternationalTournament } = ctx;
    const managerTeam = teamsMap.value.get(manager.value.team);
    const managerNationalTeam = teamsMap.value.get(manager.value.country);
    const leagueTeamNames = leagues.value.find((l) => l.name === managerTeam?.leagueName)?.teams;
    const leageTeams = leagueTeamNames?.map((name) => teamsMap.value.get(name)).filter((t): t is Team => !!t);
    const date = `${String(monthToNumber[currentYear.value.currentMonth]).padStart(2, "0")}/${String(currentYear.value.currentDay).padStart(2, "0")}/${currentYear.value.year}`;
    const foundMatch = managerTeam?.Schedule.find(m => m.date === date) || managerNationalTeam?.Schedule.find(m => m.date === date);
    const todayMatch = foundMatch ? signal<Match>(foundMatch) : undefined;
    // Compute dates for all days of the current week
    const currentWeekDays = getCurrentWeek(currentYear.value.currentMonth, currentYear.value.currentDay, currentYear.value.currentDayOfWeek, currentYear.value.year);
    const weekDates: string[] = Object.values(currentWeekDays.weekDays).map(wd => wd.dateStr);

    // Populate manager's matches for the current week (in useEffect to avoid setState during render)
    useEffect(() => {
        const managerWeekMatches: Match[] = [];
        if (managerTeam) {
            for (const weekDate of weekDates) {
                const match = managerTeam.Schedule.find(m => m.date === weekDate);
                if (match) managerWeekMatches.push(match);
            }
        }
        if (managerNationalTeam) {
            for (const weekDate of weekDates) {
                const match = managerNationalTeam.Schedule.find(m => m.date === weekDate);
                if (match && !managerWeekMatches.includes(match)) managerWeekMatches.push(match);
            }
        }
        matches.value = managerWeekMatches;
    }, [date]);

    // On Sunday/Monday, show last week's league results; otherwise show this week's
    const dayOfWeek = currentYear.value.currentDayOfWeek;
    const showPrevWeek = dayOfWeek === "Sunday";
    const leagueWeekDates = (() => {
        if (!showPrevWeek) return weekDates;
        // Compute previous week's dates (7 days back)
        const monthIndex = months.indexOf(currentYear.value.currentMonth);
        const today = new Date(currentYear.value.year, monthIndex, currentYear.value.currentDay);
        const prevWeekDates: string[] = [];
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const todayDowIndex = dayNames.indexOf(dayOfWeek);
        const prevSundayOffset = -todayDowIndex - 7;
        for (let i = 0; i < 7; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + prevSundayOffset + i);
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const dd = String(d.getDate()).padStart(2, "0");
            const yyyy = String(d.getFullYear());
            prevWeekDates.push(`${mm}/${dd}/${yyyy}`);
        }
        return prevWeekDates;
    })();

    const allMatchesForWeek: Match[] = [];
    const seenMatchKeys = new Set<string>();
    leagueTeamNames?.forEach((teamName) => {
        const team = teamsMap.value.get(teamName);
        if (!team) return;
        for (const weekDate of leagueWeekDates) {
            const match = team.Schedule.find(m => m.date === weekDate);
            if (match) {
                const key = `${match.homeTeamName}-${match.awayTeamName}`;
                if (!seenMatchKeys.has(key)) {
                    seenMatchKeys.add(key);
                    allMatchesForWeek.push(match);
                }
            }
        }
    });

    // Gather international matches for the week from the manager's tournament
    const internationalMatchesForWeek: Match[] = [];
    const intSeenKeys = new Set<string>();
    internationalTournaments.value.forEach((tournament: InternationalTournament) => {
        if (tournament.currentPhase === "not_started") return;
        // Only show tournaments the manager's country participates in
        if (!tournament.teams.some(t => t.teamName === manager.value.country)) return;
        for (const match of tournament.matches) {
            if (!leagueWeekDates.includes(match.date)) continue;
            const key = `${match.homeTeamName}-${match.awayTeamName}-${match.tournamentRound}`;
            if (intSeenKeys.has(key)) continue;
            intSeenKeys.add(key);
            internationalMatchesForWeek.push(match);
        }
    });
    const [trainingDone, setTrainingDone] = useState<Record<string, boolean>>({});

    // Pick one training day per week: first Mon-Thu without a match
    const trainingDayDate: string | null = (() => {
        const trainingDays = ["Monday", "Tuesday", "Wednesday", "Thursday"];
        const matchDates = new Set<string>();
        if (managerTeam) {
            for (const wd of weekDates) {
                if (managerTeam.Schedule.some(m => m.date === wd)) matchDates.add(wd);
            }
        }
        if (managerNationalTeam) {
            for (const wd of weekDates) {
                if (managerNationalTeam.Schedule.some(m => m.date === wd)) matchDates.add(wd);
            }
        }
        for (const day of trainingDays) {
            const wd = currentWeekDays.weekDays[day];
            if (wd && !matchDates.has(wd.dateStr)) return wd.dateStr;
        }
        return null;
    })();

    const isTrainingDay = trainingDayDate === date;
    const needsTraining = isTrainingDay && !trainingDone[date];
    const trainingPanelRef = useRef<HTMLDivElement>(null);
    const trainingConfirmRef = useRef<(() => void) | null>(null);
    useEffect(() => {
        if (needsTraining && trainingPanelRef.current) {
            trainingPanelRef.current.scrollTop = 0;
        }
    }, [needsTraining]);
    useSignals();

    function simulateTournamentMatches(simulated: Set<string>) {
        let anySimulated = false;
        tournaments.value.forEach((tournament: Tournament) => {
            const todayMatches = tournament.matches.filter(m => m.date === date);
            const european = isEuropeanTournament(tournament.name);

            todayMatches.forEach((match) => {
                const matchKey = `${match.homeTeamName}-${match.awayTeamName}`;
                if (simulated.has(matchKey)) return;
                simulated.add(matchKey);
                anySimulated = true;
                const matchSignal = signal<Match>(match);
                simulateGame(matchSignal, teamsMap.value, playersMap.value, manager);
                match.played = true;

                if (european) {
                    // European tournaments: leg 1 draws are fine, leg 2 aggregate ties
                    // are handled in advanceTournamentRound. Final draws get penalties.
                    if (!match.leg && match.homeScore === match.awayScore) {
                        // Final (single game) — penalty shootout
                        match.penaltyWin = true;
                        if (Math.random() < 0.5) {
                            match.homeScore++;
                        } else {
                            match.awayScore++;
                        }
                    }
                    // Leg 1 and leg 2 draws are allowed — aggregate decides in advanceTournamentRound
                } else {
                    // Non-European: no draws allowed — penalty shootout
                    if (match.homeScore === match.awayScore) {
                        match.penaltyWin = true;
                        if (Math.random() < 0.5) {
                            match.homeScore++;
                        } else {
                            match.awayScore++;
                        }
                    }
                }
            });

            // If all current round matches are played, advance to next round
            if (todayMatches.length > 0 && tournament.currentRound !== "Complete") {
                const currentRoundMatches = tournament.matches.filter(m => m.tournamentRound === tournament.currentRound);
                const allPlayed = currentRoundMatches.every(m => m.played);
                if (allPlayed) {
                    advanceTournamentRound(tournament, currentYear, teamsMap, playersMap.value);
                }
            }
        });
        // Reassign signal so UI re-renders with updated tournament data
        if (anySimulated) {
            tournaments.value = [...tournaments.value];
        }
    }

    function simulateInternationalMatches(simulated: Set<string>) {
        let anySimulated = false;
        internationalTournaments.value.forEach((tournament: InternationalTournament) => {
            if (tournament.currentPhase === "complete" || tournament.currentPhase === "not_started") return;

            const todayMatches = tournament.matches.filter(m => m.date === date && !m.played);
            todayMatches.forEach((match) => {
                const matchKey = `${match.homeTeamName}-${match.awayTeamName}`;
                if (simulated.has(matchKey)) return;
                simulated.add(matchKey);
                anySimulated = true;
                const matchSignal = signal<Match>(match);
                simulateGame(matchSignal, teamsMap.value, playersMap.value, manager);
                match.played = true;

                // Knockout matches (not group stage, not friendlies) need penalty on draw
                const isGroupMatch = match.tournamentRound?.startsWith("Group");
                const isFriendlyMatch = match.tournamentRound?.startsWith("Friendly");
                if (!isGroupMatch && !isFriendlyMatch && match.homeScore === match.awayScore) {
                    match.penaltyWin = true;
                    if (Math.random() < 0.5) {
                        match.homeScore++;
                    } else {
                        match.awayScore++;
                    }
                }
            });

            if (todayMatches.length > 0) {
                const isWorldCup = tournament.name === "World Cup";

                // World Cup qualifying phase
                if (tournament.currentPhase === "qualifying") {
                    const currentRoundMatches = tournament.matches.filter(
                        m => m.tournamentRound?.startsWith("WCQ-") &&
                            m.tournamentRound.endsWith(tournament.currentRound!.replace("WCQ ", ""))
                    );
                    const allPlayed = currentRoundMatches.length > 0 && currentRoundMatches.every(m => m.played);
                    if (allPlayed) {
                        advanceWorldCupQualifying(tournament, currentYear.value.year, teamsMap);
                    }
                }
                // Update group standings after group matches
                else if (tournament.currentPhase === "group") {
                    updateGroupStandings(tournament);
                    if (isGroupStageComplete(tournament)) {
                        if (isWorldCup) {
                            advanceWorldCupToKnockout(tournament, currentYear.value.year, teamsMap);
                        } else {
                            advanceToKnockout(tournament, currentYear.value.year, teamsMap);
                        }
                    }
                }
                // Advance knockout rounds
                else if (tournament.currentPhase === "knockout") {
                    const currentRoundMatches = tournament.matches.filter(
                        m => m.tournamentRound === tournament.currentRound
                    );
                    const allPlayed = currentRoundMatches.every(m => m.played);
                    if (allPlayed) {
                        if (isWorldCup) {
                            advanceWorldCupKnockout(tournament, currentYear.value.year, teamsMap, playersMap.value, currentYear);
                        } else {
                            advanceInternationalKnockout(tournament, currentYear.value.year, teamsMap, playersMap.value, currentYear);
                        }
                    }
                }
                // Friendly tournament: check if friendlies done, then advance mini tournament
                else if (tournament.currentPhase === "friendly") {
                    if (tournament.currentRound === "Friendlies" && areFriendliesComplete(tournament)) {
                        advanceFriendlyToMiniTournament(tournament, currentYear.value.year, teamsMap);
                    } else if (tournament.currentRound !== "Friendlies") {
                        const currentRoundMatches = tournament.matches.filter(
                            m => m.tournamentRound === tournament.currentRound && !m.tournamentRound?.startsWith("Friendly")
                        );
                        const allPlayed = currentRoundMatches.every(m => m.played);
                        if (allPlayed) {
                            advanceFriendlyKnockout(tournament, currentYear.value.year, teamsMap, playersMap.value, currentYear);
                        }
                    }
                }
            }
        });
        if (anySimulated) {
            internationalTournaments.value = [...internationalTournaments.value];
        }
    }

    // Determine if we're in the international period based on when the first international match is scheduled
    let intStartTime = Infinity;
    internationalTournaments.value.forEach(t => {
        if (t.currentPhase === "not_started" || t.matches.length === 0) return;
        const firstMatchTime = new Date(t.matches[0].date).getTime();
        if (firstMatchTime < intStartTime) intStartTime = firstMatchTime;
    });
    const currentDateObj = new Date(currentYear.value.year, months.indexOf(currentYear.value.currentMonth), currentYear.value.currentDay);
    const isIntPeriod = intStartTime !== Infinity && currentDateObj.getTime() >= intStartTime;

    function hasInjuredStarters(): boolean {
        if (!todayMatch) return false;
        const match = todayMatch.value;
        const isNational = Top50Countries.some((c: { country: string }) => c.country === match.homeTeamName);
        const team = isNational ? managerNationalTeam : managerTeam;
        if (!team) return false;
        for (const playerName of team.players) {
            const player = playersMap.value.get(playerName);
            if (!player) continue;
            const isStarter = isNational ? player.startingNational : player.startingTeam;
            if (isStarter && player.injured) return true;
        }
        return false;
    }

    function hasSuspendedStarters(): boolean {
        if (!todayMatch) return false;
        const match = todayMatch.value;
        const isNational = Top50Countries.some((c: { country: string }) => c.country === match.homeTeamName);
        const team = isNational ? managerNationalTeam : managerTeam;
        if (!team) return false;
        for (const playerName of team.players) {
            const player = playersMap.value.get(playerName);
            if (!player) continue;
            const isStarter = isNational ? player.startingNational : player.startingTeam;
            if (isStarter && player.gamesSuspended > 0) return true;
        }
        return false;
    }

    function simulateDay() {
        // Snapshot who is suspended RIGHT NOW, before any games simulate.
        // Only these players will have their ban decremented after today's games.
        const preGameSuspended = new Set<string>();
        playersMap.value.forEach(player => {
            if (player.gamesSuspended > 0) preGameSuspended.add(player.name);
        });

        const simulated = new Set<string>();
        leagues.value.forEach((league) => {
            league.teams.forEach((teamName) => {
                const team = teamsMap.value.get(teamName);
                if (!team) return;
                const hasMatch = team.Schedule.find(m => m.date === date && m.isLeagueMatch);
                if (hasMatch) {
                    const matchKey = `${hasMatch.homeTeamName}-${hasMatch.awayTeamName}`;
                    if (simulated.has(matchKey)) return;
                    simulated.add(matchKey);
                    const matchSignal = signal<Match>(hasMatch);
                    simulateGame(matchSignal, teamsMap.value, playersMap.value, manager);
                    hasMatch.played = true;
                }
            });
        });
        // Determine international tournament type based on the calendar year the tournaments play in
        // After January, currentYear.value.year is already the correct tournament year (e.g., 2026 for World Cup)
        const intYear = currentYear.value.year;
        if (isWorldCupYear(intYear)) {
            currentInternationalTournament.value = "World Cup";
        } else if (isMajorTournamentYear(intYear)) {
            currentInternationalTournament.value = "Continental";
        } else {
            currentInternationalTournament.value = "Friendly";
        }

        simulateTournamentMatches(simulated);
        simulateInternationalMatches(simulated);

        // Trigger signal re-render so UI updates
        teamsMap.value = new Map(teamsMap.value);
        isSimulated[date] = true;
        return preGameSuspended;
    }

    const isIntMonth = isIntPeriod;

    // Find the manager's active international tournament (with groups)
    const managerIntTournament = internationalTournaments.value.find(t =>
        t.teams.some(tm => tm.teamName === manager.value.country) &&
        t.currentPhase !== "not_started"
    );
    // Sort groups so manager's group is first
    const managerGroups = managerIntTournament?.groups ? (() => {
        const mc = manager.value.country;
        const groups = managerIntTournament.groups!;
        const idx = groups.findIndex(g => g.teams.includes(mc));
        if (idx <= 0) return groups;
        const sorted = [...groups];
        const [mg] = sorted.splice(idx, 1);
        sorted.unshift(mg);
        return sorted;
    })() : undefined;

    return (
        <div>
            <div className={styles.logoContainer}>
                <img src={logo} alt="football-manager" className="logo" />
            </div>
            <div className={styles.scheduleContainer}>
                <div className={styles.schedule}>
                    <WeekSchedule
                        matches={matches}
                        currentYear={currentYear}
                        manager={manager}
                        trainingDayDate={trainingDayDate}
                    />
                    {todayMatch ? (
                        <div
                            className={`${styles.game} ${isSimulated[date] ? styles.gameClickable : ''}`}
                            onClick={() => isSimulated[date] && (matchClicked.value = todayMatch.value)}
                        >
                            <div className={styles.gameHeader}>
                                <h4>{todayMatch.value.isTournamentMatch
                                    ? `${todayMatch.value.tournamentName} - ${todayMatch.value.tournamentRound}`
                                    : `Matchweek: ${currentYear.value.leagueWeek}`
                                }</h4>
                            </div>
                            <div className={styles.gameMatchup}>
                                <span className={styles.gameTeamName}>{todayMatch.value.homeTeamName}</span>
                                <span className={styles.gameVs}>vs</span>
                                <span className={styles.gameTeamName}>{todayMatch.value.awayTeamName}</span>
                            </div>
                            {isSimulated[date] && (
                                <div className={styles.gameResult}>
                                    <div className={styles.gameScoreLine}>
                                        <span className={styles.gameScore}>{todayMatch.value.homeScore}</span>
                                        <span className={styles.gameDash}>-</span>
                                        <span className={styles.gameScore}>{todayMatch.value.awayScore}</span>
                                    </div>
                                    <span className={styles.gameViewLink}>Click to view match details</span>
                                </div>
                            )}
                        </div>
                    ) : needsTraining ? (
                        <div ref={trainingPanelRef} className={styles.trainingPanel}>
                            <SelectTraining
                                compact
                                isInternational={isIntMonth}
                                onComplete={() => setTrainingDone(prev => ({ ...prev, [date]: true }))}
                                onConfirmReady={(fn) => { trainingConfirmRef.current = fn; }}
                            />
                        </div>
                    ) : isTrainingDay && trainingDone[date] ? (
                        <div className={styles.game}>
                            <span className={styles.noGame}>Training Complete — Ready to advance</span>
                        </div>
                    ) : (
                        <div className={styles.game}>
                            <span className={styles.noGame}>No Games Scheduled</span>
                        </div>
                    )}
                    <div className={styles.simButtom}>
                        {todayMatch && !isSimulated[date] && (
                            <button onClick={() => {
                                if (hasInjuredStarters()) {
                                    alert("You cannot proceed with an illegal lineup! Please reset your lineup to remove injured players.");
                                    return;
                                }
                                if (hasSuspendedStarters()) {
                                    alert("You cannot proceed with a suspended player in the starting lineup! Please remove them.");
                                    return;
                                }
                                lastPreGameSuspended = simulateDay();
                            }}>Simulate Game</button>
                        )}
                        {needsTraining && (
                            <button onClick={() => {
                                if (trainingConfirmRef.current) {
                                    trainingConfirmRef.current();
                                }
                            }}>
                                Set Training Plan
                            </button>
                        )}
                        <button
                            disabled={(!!todayMatch && !isSimulated[date]) || needsTraining}
                            onClick={() => {
                                if (!isSimulated[date]) {
                                    if (hasInjuredStarters()) {
                                        alert("You cannot proceed with an illegal lineup! Please reset your lineup to remove injured players.");
                                        return;
                                    }
                                    if (hasSuspendedStarters()) {
                                        alert("You cannot proceed with a suspended player in the starting lineup! Please remove them.");
                                        return;
                                    }
                                    const suspended = simulateDay();
                                    moveToNextDay(ctx, isSimulated, isFirstSeason, currentPage, retiredPlayers, playerAwards, suspended);
                                } else {
                                    moveToNextDay(ctx, isSimulated, isFirstSeason, currentPage, retiredPlayers, playerAwards, lastPreGameSuspended);
                                    lastPreGameSuspended = undefined;
                                }
                            }}
                        >
                            Simulate to next day
                        </button>
                    </div>
                </div>
                <div className={styles.miniTable}>
                    <div className={styles.miniTableTwo}>
                        {!isIntMonth && (
                            <>
                                <h4 className={styles.miniTableTitle}>League Table</h4>
                                <MiniTable
                                    leagueTitle="League Table"
                                    leageTeams={leageTeams}
                                    managerTeam={managerTeam}
                                />
                            </>
                        )}
                        {isIntMonth && managerGroups && (
                            <div className={styles.miniGroupsScroll}>
                                <h4 className={styles.miniTableTitle}>{managerIntTournament?.name} Groups</h4>
                                {managerGroups.map(group => {
                                    const mc = manager.value.country;
                                    return (
                                        <div key={group.name} className={styles.miniGroup}>
                                            <div className={styles.miniGroupTitle}>{group.name}</div>
                                            <table className={styles.miniGroupTable}>
                                                <thead>
                                                    <tr>
                                                        <th style={{ textAlign: 'left' }}>Team</th>
                                                        <th>P</th>
                                                        <th>GD</th>
                                                        <th>Pts</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {group.standings.map((s) => (
                                                        <tr key={s.teamName} className={s.teamName === mc ? styles.miniGroupManager : ''}>
                                                            <td style={{ textAlign: 'left' }}>{flagName(s.teamName)}</td>
                                                            <td>{s.wins + s.draws + s.losses}</td>
                                                            <td>{s.goalsFor - s.goalsAgainst}</td>
                                                            <td style={{ fontWeight: 700 }}>{s.points}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        {isIntMonth && !managerGroups && (
                            <div style={{ textAlign: 'center', padding: '1rem', color: '#888' }}>
                                <h4 className={styles.miniTableTitle}>International Tournament</h4>
                                <p>No groups yet — view Tournaments tab for matches</p>
                            </div>
                        )}
                    </div>
                    <div className={styles.matchTable}>
                        {!isIntMonth && (
                            <>
                                <h4 className={styles.miniTableTitle}>League Matches</h4>
                                <LeagueWeekMatches
                                    allMatches={allMatchesForWeek}
                                    internationalMatches={[]}
                                    matchClicked={matchClicked}
                                    teamsMap={teamsMap}
                                    playersMap={playersMap}
                                    managerTeam={managerTeam}
                                    managerCountry={manager.value.country}
                                    isIntPeriod={false}
                                />
                            </>
                        )}
                        {isIntMonth && (
                            <>
                                <h4 className={styles.miniTableTitle} style={{ display: 'none' }}>International Matches</h4>
                                <LeagueWeekMatches
                                    allMatches={[]}
                                    internationalMatches={internationalMatchesForWeek}
                                    matchClicked={matchClicked}
                                    teamsMap={teamsMap}
                                    playersMap={playersMap}
                                    managerTeam={managerTeam}
                                    managerCountry={manager.value.country}
                                    isIntPeriod={true}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
            {matchClicked.value && (
                <div className={styles.overlay} onClick={() => matchClicked.value = undefined}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <MatchOverview match={matchClicked} playersMap={playersMap.value} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default Schedule;