import { signal } from "@preact/signals-react";
import type { League, Match, PlayerAwards, Player, Tournament } from "../../Models/WorldStage.ts";
import { createSchedule } from "../../Utils/CreateSchedule.ts";
import { createTournamentSchedule } from "../../Utils/TournamentSchedule.ts";
import { scheduleAllInternationalTournaments } from "../../Utils/InternationalTournamentSchedule.ts";
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
import Tournaments from "../../Tabs/Tournaments/Tournaments.tsx";

export const currentPage = signal<string>("SelectNational");
export const activeTab = signal<string>("Schedule");
export const scheduleCreated = signal<boolean>(false);
export const isFirstSeason = signal<boolean>(true);
export const playerAwards = signal<PlayerAwards>({
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

export const retiredPlayers = signal<Player[]>([]);

export function MainPage() {
    useSignals();
    const { teamsMap, playersMap, leagues, currentYear, tournaments, internationalTournaments, nationalTeams } = useGameContext();

    if (currentPage.value !== "MainPage") {
        scheduleCreated.value = false;
    }

    if (currentPage.value === "MainPage" && !scheduleCreated.value) {
        currentYear.value.yearMatches = [];
        // Reset player seasonal stats now (after awards page was shown)
        playersMap.value.forEach((player) => {
            player.leagueGoals = 0;
            player.leagueAssists = 0;
            player.countryGoals = 0;
            player.countryAssists = 0;
            player.totalGoals = 0;
            player.totalAssists = 0;
            player.cleanSheets = 0;
            player.otherTrophiesThisSeason = 0;
            player.importantTrophiesThisSeason = 0;
            player.injured = false;
            player.weeksInjured = 0;
            player.stamina = 100;
        });
        // Clear all team schedules and reset stats before creating new ones (ensures promoted/relegated teams start clean)
        teamsMap.value.forEach((team) => {
            team.Schedule = [];
            team.points = 0;
            team.wins = 0;
            team.losses = 0;
            team.draws = 0;
            team.goalsFor = 0;
            team.goalsAgainst = 0;
            team.form = [];
        });
        // Ensure each team is only in the league matching its leagueName (safety against promotion/relegation bugs)
        leagues.value.forEach((league: League) => {
            league.teams = [...new Set(league.teams)].filter((teamName: string) => {
                const team = teamsMap.value.get(teamName);
                return team && team.leagueName === league.name;
            });
        });
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

        // Reset and create tournament schedules
        tournaments.value.forEach((tournament: Tournament) => {
            tournament.matches = [];
            tournament.teams.forEach(t => { t.nextRound = true; });
            createTournamentSchedule(tournament, currentYear, teamsMap);
        });

        // Schedule international tournaments for next calendar year (May-July of year+1, during this season)
        scheduleAllInternationalTournaments(internationalTournaments, currentYear.value.year + 1, teamsMap, playersMap, nationalTeams.value);

        // Collect all matches into yearMatches
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
                    {activeTab.value === "Tournaments" && <Tournaments />}
                    <div className={styles.tabButtons}>
                        <button className={activeTab.value === "Schedule" ? styles.activeTab : ""} onClick={() => activeTab.value = "Schedule"}>Schedule</button>
                        <button className={activeTab.value === "Team" ? styles.activeTab : ""} onClick={() => activeTab.value = "Team"}>Team</button>
                        <button className={activeTab.value === "Table" ? styles.activeTab : ""} onClick={() => activeTab.value = "Table"}>Table</button>
                        <button className={activeTab.value === "Tournaments" ? styles.activeTab : ""} onClick={() => activeTab.value = "Tournaments"}>Tournaments</button>
                        <button className={activeTab.value === "Stats" ? styles.activeTab : ""} onClick={() => activeTab.value = "Stats"}>Stats</button>
                        <button className={activeTab.value === "History" ? styles.activeTab : ""} onClick={() => activeTab.value = "History"}>History</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MainPage;
