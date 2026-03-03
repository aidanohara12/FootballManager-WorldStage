import logo from '../../assets/Images/logo.png';
import styles from './Schedule.module.css';
import WeekSchedule from "../../Components/WeekSchedule/WeekSchedule";
import { signal, type Signal } from '@preact/signals-react';
import type { Team, Manager, League, Tournament, InternationalTournament, currentYear, Match, Player, Achievements, ManagerHistory, NationalTeam, PlayerAwards } from '../../Models/WorldStage';
import MiniTable from "../../Components/Table/Table";
import { useSignals } from '@preact/signals-react/runtime';
import { moveToNextDay, daysOfTheMonth, months } from "../../Utils/Calendar";
import getCurrentWeek from "../../Components/WeekSchedule/GetCurrentWeek";
import { simulateGame } from "../../Utils/SimulateGame";
import { MatchOverview } from '../../Components/MatchOverview/MatchOverview';
import LeagueWeekMatches from '../../Components/LeagueWeekMatches/LeagueWeekMatches';
interface ScheduleProps {
    teamsMap: Signal<Map<string, Team>>;
    playersMap: Signal<Map<string, Player>>;
    manager: Signal<Manager>;
    leagues: Signal<League[]>;
    tournaments: Signal<Tournament[]>;
    internationalTournaments: Signal<InternationalTournament[]>;
    currentYear: Signal<currentYear>;
    managerHistory: Signal<ManagerHistory>;
    achievements: Signal<Achievements>;
    nationalTeams: Signal<NationalTeam[]>;
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

export function Schedule({ teamsMap, playersMap, manager, leagues, currentYear, managerHistory, achievements, nationalTeams, isFirstSeason, currentPage, retiredPlayers, playerAwards }: ScheduleProps) {
    const managerTeam = teamsMap.value.get(manager.value.team);
    const leagueTeamNames = leagues.value.find((l) => l.name === managerTeam?.league)?.teams;
    const leageTeams = leagueTeamNames?.map((name) => teamsMap.value.get(name)).filter((t): t is Team => !!t);
    const date = `${String(monthToNumber[currentYear.value.currentMonth]).padStart(2, "0")}/${String(currentYear.value.currentDay).padStart(2, "0")}/${currentYear.value.year}`;
    const foundMatch = managerTeam?.Schedule.find(m => m.date === date);
    const todayMatch = foundMatch ? signal<Match>(foundMatch) : undefined;
    // Compute dates for all days of the current week
    const currentWeekDays = getCurrentWeek(currentYear.value.currentMonth, currentYear.value.currentDay, currentYear.value.currentDayOfWeek);
    const weekDates: string[] = [];
    for (const [, dayNumber] of Object.entries(currentWeekDays.weekDays) as [string, number][]) {
        const curDay = currentYear.value.currentDay;
        const curMonth = currentYear.value.currentMonth;
        const curYear = currentYear.value.year;
        const monthIndex = months.indexOf(curMonth);
        const maxDays = daysOfTheMonth[curMonth];

        let m = monthIndex;
        let y = curYear;
        if (dayNumber > maxDays) {
            // Wrapped to next month
            m = (monthIndex + 1) % 12;
            if (m === 0) y++;
        } else if (dayNumber > curDay + 6 || (dayNumber < curDay - 6 && dayNumber < curDay)) {
            // Wrapped to previous month
            m = (monthIndex - 1 + 12) % 12;
            if (m === 11 && monthIndex === 0) y--;
        }
        weekDates.push(`${String(m + 1).padStart(2, "0")}/${String(dayNumber).padStart(2, "0")}/${y}`);
    }

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

    function simulateDay() {
        const simulated = new Set<string>();
        leagues.value.forEach((league) => {
            league.teams.forEach((teamName) => {
                const team = teamsMap.value.get(teamName);
                if (!team) return;
                const hasMatch = team.Schedule.find(m => m.date === date);
                if (hasMatch) {
                    const matchKey = `${hasMatch.homeTeamName}-${hasMatch.awayTeamName}`;
                    if (simulated.has(matchKey)) return;
                    simulated.add(matchKey);
                    const matchSignal = signal<Match>(hasMatch);
                    simulateGame(matchSignal, teamsMap.value, playersMap.value, manager);
                }
            });
        });
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
                                <h4>Matchweek: {currentYear.value.leagueWeek}</h4>
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
                            onClick={() => moveToNextDay(currentYear, isSimulated, leagues, teamsMap, playersMap, manager, managerHistory, achievements, nationalTeams, isFirstSeason, currentPage, retiredPlayers, playerAwards)}
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