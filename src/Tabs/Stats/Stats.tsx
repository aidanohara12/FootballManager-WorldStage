import { useState } from "react";
import type { League } from "../../Models/WorldStage";
import styles from "./Stats.module.css";
import { StatsTable } from "../../Components/StatsTable/StatsTable";
import { IntlStatsTable } from "../../Components/StatsTable/IntlStatsTable";
import { useGameContext } from "../../Context/GameContext";

export function Stats() {
    const ctx = useGameContext();
    const teamsMap = ctx.teamsMap.value;
    const playersMap = ctx.playersMap.value;
    const manager = ctx.userManager.value;
    const leagues = ctx.leagues.value;
    const nationalTeams = ctx.nationalTeams.value;
    const managerTeam = teamsMap.get(manager.team);
    const managerLeague = leagues.find((league) => league.teams?.includes(manager.team));

    const sortedLeagues = managerLeague
        ? [managerLeague, ...leagues.filter((league) => league !== managerLeague)]
        : leagues;

    const [selectedLeague, setSelectedLeague] = useState<League | null>(managerLeague ?? null);
    const [showAllLeagues, setShowAllLeagues] = useState<boolean>(false);
    const [activeSection, setActiveSection] = useState<"league" | "international">("league");

    function getTitle(): string {
        if (activeSection === "international") return "International Stats";
        return showAllLeagues ? "All Leagues" : (selectedLeague?.name ?? "");
    }

    return (
        <div>
            <h2 className={styles.title}>{getTitle()}</h2>
            <div className={styles.statsContainer}>
                <div className={styles.stats}>
                    <div className={styles.stat}>
                        <div className={styles.sectionTabs}>
                            <button
                                className={`${styles.sectionTab} ${activeSection === "league" ? styles.sectionTabActive : ""}`}
                                onClick={() => setActiveSection("league")}
                            >
                                League
                            </button>
                            <button
                                className={`${styles.sectionTab} ${activeSection === "international" ? styles.sectionTabActive : ""}`}
                                onClick={() => setActiveSection("international")}
                            >
                                International
                            </button>
                        </div>
                        {activeSection === "league" ? (
                            <>
                                <h3 className={styles.subTitle}>League Stats</h3>
                                <div>
                                    <select className={styles.select} value={showAllLeagues ? '__all_leagues__' : (selectedLeague?.name ?? '')} onChange={(e) => {
                                        if (e.target.value === '__all_leagues__') {
                                            setShowAllLeagues(true);
                                        } else {
                                            setShowAllLeagues(false);
                                            const league = sortedLeagues.find(l => l.name === e.target.value);
                                            setSelectedLeague(league ?? null);
                                        }
                                    }}>
                                        <option value="__all_leagues__">All Leagues</option>
                                        {sortedLeagues.map(league => (
                                            <option key={league.name} value={league.name}>{league.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <StatsTable leaguePlayers={[]} managerTeam={managerTeam ?? Array.from(teamsMap.values())[0]} managerTeamName={manager.team} selectedLeague={selectedLeague} teamsMap={teamsMap} playersMap={playersMap} leagues={leagues} showAllLeagues={showAllLeagues} />
                            </>
                        ) : (
                            <IntlStatsTable nationalTeams={nationalTeams} playersMap={playersMap} managerCountry={manager.country} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Stats;
