import logo from '../../assets/Images/logo.png';
import styles from './Schedule.module.css';
import WeekSchedule from "../../Components/WeekSchedule/WeekSchedule";
import { signal, type Signal } from '@preact/signals-react';
import type { Match, Player, PlayerAwards, Team, Tournament } from '../../Models/WorldStage';
import { advanceTournamentRound, isEuropeanTournament } from '../../Utils/TournamentSchedule';
import MiniTable from "../../Components/Table/Table";
import { useSignals } from '@preact/signals-react/runtime';
import { useEffect } from 'react';
import { moveToNextDay } from "../../Utils/Calendar";
import getCurrentWeek from "../../Components/WeekSchedule/GetCurrentWeek";
import { simulateGame } from "../../Utils/SimulateGame";
import { MatchOverview } from '../../Components/MatchOverview/MatchOverview';
import LeagueWeekMatches from '../../Components/LeagueWeekMatches/LeagueWeekMatches';
import { useGameContext } from '../../Context/GameContext';
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

export function Schedule({ isFirstSeason, currentPage, retiredPlayers, playerAwards }: ScheduleProps) {
    const ctx = useGameContext();
    const { teamsMap, playersMap, userManager: manager, leagues, currentYear, tournaments } = ctx;
    const managerTeam = teamsMap.value.get(manager.value.team);
    const leagueTeamNames = leagues.value.find((l) => l.name === managerTeam?.leagueName)?.teams;
    const leageTeams = leagueTeamNames?.map((name) => teamsMap.value.get(name)).filter((t): t is Team => !!t);
    const date = `${String(monthToNumber[currentYear.value.currentMonth]).padStart(2, "0")}/${String(currentYear.value.currentDay).padStart(2, "0")}/${currentYear.value.year}`;
    const foundMatch = managerTeam?.Schedule.find(m => m.date === date);
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
        matches.value = managerWeekMatches;
    }, [date]);

    const allMatchesForWeek: Match[] = [];
    const seenMatchKeys = new Set<string>();
    leagueTeamNames?.forEach((teamName) => {
        const team = teamsMap.value.get(teamName);
        if (!team) return;
        for (const weekDate of weekDates) {
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

    function simulateDay() {
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

        simulateTournamentMatches(simulated);

        // Trigger signal re-render so UI updates
        teamsMap.value = new Map(teamsMap.value);
        isSimulated[date] = true;
    }

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
                    ) : (
                        <div className={styles.game}>
                            <span className={styles.noGame}>No Games Scheduled</span>
                        </div>
                    )}
                    <div className={styles.simButtom}>
                        {todayMatch && !isSimulated[date] && (
                            <button onClick={simulateDay}>Simulate Game</button>
                        )}
                        <button
                            disabled={!!todayMatch && !isSimulated[date]}
                            onClick={() => {
                                if (!isSimulated[date]) {
                                    simulateTournamentMatches(new Set<string>());
                                    teamsMap.value = new Map(teamsMap.value);
                                }
                                moveToNextDay(ctx, isSimulated, isFirstSeason, currentPage, retiredPlayers, playerAwards);
                            }}
                        >
                            Simulate to next day
                        </button>
                    </div>
                </div>
                <div className={styles.miniTable}>
                    <div>
                        <h4 className={styles.miniTableTitle}>League Table</h4>
                        <MiniTable
                            leagueTitle="League Table"
                            leageTeams={leageTeams}
                            managerTeam={managerTeam}
                        />
                    </div>
                    <div className={styles.matchTable}>
                        <h4 className={styles.miniTableTitle}>League Matches</h4>
                        <LeagueWeekMatches
                            allMatches={allMatchesForWeek}
                            matchClicked={matchClicked}
                            teamsMap={teamsMap}
                            playersMap={playersMap}
                            managerTeam={managerTeam}
                        />
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