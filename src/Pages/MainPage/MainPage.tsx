import { useEffect } from "react";
import { signal, useSignal, type Signal } from "@preact/signals-react";
import type { Achievements, currentYear, InternationalTournament, League, LeagueTeam, Manager, ManagerHistory, Match, NationalTeam, Player, Team, Tournament, WorldCup } from "../../Models/WorldStage.ts";
import { createSchedule } from "../../Utils/CreateSchedule.ts";
import SelectNational from "../../Components/TeamSelection/SelectNational/SelectNational.tsx";
import styles from "./MainPage.module.css";
import { SelectClub } from "../../Components/TeamSelection/SelectClub/SelectClub.tsx";
import { Schedule } from "../../Tabs/Schedule/Schedule.tsx";
import { Stats } from "../../Tabs/Stats/Stats.tsx";
import { TeamView } from "../../Tabs/Team/TeamView.tsx";
import { History } from "../../Tabs/History/History.tsx";
import { Table } from "../../Tabs/Table/Table.tsx";
import { useSignals } from "@preact/signals-react/runtime";

interface MainPageProps {
    allPlayers: Signal<Player[]>;
    allTeams: Signal<Team[]>;
    nationalTeams: Signal<NationalTeam[]>;
    userManager: Signal<Manager>;
    leagues: Signal<League[]>;
    tournaments: Signal<Tournament[]>;
    internationalTournaments: Signal<InternationalTournament[]>;
    worldCup: Signal<WorldCup>;
    currentYear: Signal<currentYear>;
    achievements: Signal<Achievements>;
    managerHistory: Signal<ManagerHistory>;
}

const currentPage = signal<string>("SelectNational");
const activeTab = signal<string>("Schedule");
const scheduleCreated = signal<boolean>(false);

export function MainPage({ allPlayers, allTeams, nationalTeams, userManager, leagues, tournaments, internationalTournaments, worldCup, currentYear, achievements, managerHistory }: MainPageProps) {
    useSignals();

    if (currentPage.value === "MainPage" && !scheduleCreated.value) {
        leagues.value.forEach((league: League) => {
            const fullSchedule = createSchedule(league, currentYear);
            league.teams.forEach((team: LeagueTeam) => {
                team.Schedule = fullSchedule.filter(
                    (m: Match) => m.homeTeam === team.Team || m.awayTeam === team.Team
                ).sort((a: Match, b: Match) => new Date(a.date).getTime() - new Date(b.date).getTime());
            });
        });

        leagues.value.forEach((league: League) => {
            league.teams.forEach((team: LeagueTeam) => {
                team.Schedule.forEach((match: Match) => {
                    currentYear.value.yearMatches.push(match);
                });
            });
        });

        scheduleCreated.value = true;
    }

    return (
        <div className={styles.mainPageContainer}>
            {currentPage.value === "SelectNational" && (
                <SelectNational
                    nationalTeams={nationalTeams}
                    manager={userManager}
                    currentPage={currentPage}
                />
            )}
            {currentPage.value === "SelectClub" && (
                <SelectClub
                    teams={allTeams}
                    leagues={leagues}
                    manager={userManager}
                    currentPage={currentPage}
                />
            )}
            {currentPage.value === "MainPage" && (
                <div className={styles.tabs}>
                    {activeTab.value === "Schedule" && <Schedule
                        allTeams={allTeams}
                        manager={userManager}
                        leagues={leagues}
                        tournaments={tournaments}
                        internationalTournaments={internationalTournaments}
                        currentYear={currentYear}
                    />}
                    {activeTab.value === "Stats" && <Stats
                        allPlayers={allPlayers.value}
                        allTeams={allTeams.value}
                        manager={userManager.value}
                        leagues={leagues.value}
                        tournaments={tournaments.value}
                        internationalTournaments={internationalTournaments.value}
                    />}
                    {activeTab.value === "Team" && <TeamView
                        allTeams={allTeams}
                        nationalTeams={nationalTeams}
                        userManager={userManager}
                    />}
                    {activeTab.value === "History" && <History
                        manager={userManager.value}
                        achievements={achievements.value}
                        managerHistory={managerHistory.value}
                        currentYear={currentYear.value}
                    />}
                    {activeTab.value === "Table" && <Table
                        allTeams={allTeams.value}
                        manager={userManager.value}
                        leagues={leagues.value}
                        tournaments={tournaments.value}
                        internationalTournaments={internationalTournaments.value}
                    />}
                    <div className={styles.tabButtons}>
                        <button className={activeTab.value === "Schedule" ? styles.activeTab : ""} onClick={() => activeTab.value = "Schedule"}>Schedule</button>
                        <button className={activeTab.value === "Team" ? styles.activeTab : ""} onClick={() => activeTab.value = "Team"}>Team</button>
                        <button className={activeTab.value === "Table" ? styles.activeTab : ""} onClick={() => activeTab.value = "Table"}>Table</button>
                        <button className={activeTab.value === "Stats" ? styles.activeTab : ""} onClick={() => activeTab.value = "Stats"}>Stats</button>
                        <button className={activeTab.value === "History" ? styles.activeTab : ""} onClick={() => activeTab.value = "History"}>History</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MainPage;
