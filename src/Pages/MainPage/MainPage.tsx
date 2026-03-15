import { signal } from "@preact/signals-react";
import type { League, Match, PlayerAwards, Player } from "../../Models/WorldStage.ts";
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
import SeasonSummary from "../SeasonSummary/SeasonSummary.tsx";
import { useGameContext } from "../../Context/GameContext.tsx";

const currentPage = signal<string>("SelectNational");
const activeTab = signal<string>("Schedule");
const scheduleCreated = signal<boolean>(false);
const isFirstSeason = signal<boolean>(true);
const playerAwards = signal<PlayerAwards>({
    ballonDorWinners: [],
    goldenBootWinners: [],
    bestKeeper: [],
    premBestPlayer: [],
    premGoldenBoot: [],
    laLigaBestPlayer: [],
    laLigaGoldenBoot: [],
    serieABestPlayer: [],
    serieAGoldenBoot: [],
    bundesligaBestPlayer: [],
    bundesligaGoldenBoot: [],
    ligue1BestPlayer: [],
    ligue1GoldenBoot: [],
    eredivisieBestPlayer: [],
    eredivisieGoldenBoot: [],
    primeraDivisionBestPlayer: [],
    primeraDivisionGoldenBoot: []
});

const retiredPlayers = signal<Player[]>([]);

export function MainPage() {
    useSignals();
    const { teamsMap, leagues, currentYear } = useGameContext();

    if (currentPage.value === "MainPage" && !scheduleCreated.value) {
        leagues.value.forEach((league: League) => {
            const fullSchedule = createSchedule(league, currentYear);
            league.teams.forEach((teamName: string) => {
                const team = teamsMap.value.get(teamName);
                if (team) {
                    team.Schedule = fullSchedule.filter(
                        (m: Match) => m.homeTeamName === teamName || m.awayTeamName === teamName
                    ).sort((a: Match, b: Match) => new Date(a.date).getTime() - new Date(b.date).getTime());
                }
            });
        });

        leagues.value.forEach((league: League) => {
            league.teams.forEach((teamName: string) => {
                const team = teamsMap.value.get(teamName);
                team?.Schedule.forEach((match: Match) => {
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
                    currentPage={currentPage}
                    isFirstSeason={isFirstSeason}
                />
            )}
            {currentPage.value === "SelectClub" && (
                <SelectClub
                    currentPage={currentPage}
                    isFirstSeason={isFirstSeason}
                />
            )}
            {currentPage.value === "SeasonSummary" && (
                <SeasonSummary
                    currentPage={currentPage}
                    retiredPlayers={retiredPlayers}
                    playerAwards={playerAwards}
                />
            )}
            {currentPage.value === "MainPage" && (
                <div className={styles.tabs}>
                    {activeTab.value === "Schedule" && <Schedule
                        isFirstSeason={isFirstSeason}
                        currentPage={currentPage}
                        retiredPlayers={retiredPlayers}
                        playerAwards={playerAwards}
                    />}
                    {activeTab.value === "Stats" && <Stats />}
                    {activeTab.value === "Team" && <TeamView />}
                    {activeTab.value === "History" && <History />}
                    {activeTab.value === "Table" && <Table />}
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
