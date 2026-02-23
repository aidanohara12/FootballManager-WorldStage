import logo from '../../assets/Images/logo.png';
import styles from './Schedule.module.css';
import WeekSchedule from "../../Components/WeekSchedule/WeekSchedule";
import { signal, type Signal } from '@preact/signals-react';
import type { Team, Manager, League, Tournament, InternationalTournament, currentYear, Match } from '../../Models/WorldStage';
import MiniTable from "../../Components/Table/Table";
import { useSignals } from '@preact/signals-react/runtime';
import { moveToNextDay } from "../../Utils/Calendar";
import { simulateGame } from "../../Utils/SimulateGame";
interface ScheduleProps {
    allTeams: Signal<Team[]>;
    manager: Signal<Manager>;
    leagues: Signal<League[]>;
    tournaments: Signal<Tournament[]>;
    internationalTournaments: Signal<InternationalTournament[]>;
    currentYear: Signal<currentYear>;
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

export function Schedule({ allTeams, manager, leagues, tournaments, internationalTournaments, currentYear }: ScheduleProps) {
    const managerTeam = allTeams.value.find(t => t.name === manager.value.team);
    const leageTeams = leagues.value.find((l) => l.teams[0].League.name === managerTeam?.league)?.teams;
    const managerLeagueTeam = leagues.value.find((l) => l.name === managerTeam?.league)?.teams?.find((t) => t.Team.name === manager.value.team);
    const date = `${String(monthToNumber[currentYear.value.currentMonth]).padStart(2, "0")}/${String(currentYear.value.currentDay).padStart(2, "0")}/${currentYear.value.year}`;
    const foundMatch = managerLeagueTeam?.Schedule.find(m => m.date === date);
    const todayMatch = foundMatch ? signal<Match>(foundMatch) : undefined;
    useSignals();

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
                    <div className={styles.game}>
                        {(() => {
                            return todayMatch ? (
                                <h3>{todayMatch.value.homeTeam.name} vs {todayMatch.value.awayTeam.name}</h3>
                            ) : (
                                <h3>No Games Scheduled</h3>
                            );
                        })()}
                    </div>
                    <div className={styles.simButtom}>
                        {todayMatch && (
                            <button onClick={() => simulateGame(todayMatch, allTeams, leagues)}>Simulate Game</button>
                        )}
                        <button onClick={() => moveToNextDay(currentYear)}>Simulate to next day</button>
                    </div>
                </div>
                <div className={styles.miniTable}>
                    <h4 className={styles.miniTableTitle}>League Table</h4>
                    <MiniTable
                        leagueTitle="League Table"
                        leageTeams={leageTeams}
                    />
                </div>
            </div>
        </div>
    );
}

export default Schedule;