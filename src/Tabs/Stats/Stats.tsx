import { useState } from "react";
import type { InternationalTournament, League, Player, Tournament } from "../../Models/WorldStage";
import styles from "./Stats.module.css";
import { StatsTable } from "../../Components/StatsTable/StatsTable";
import { useGameContext } from "../../Context/GameContext";

export function Stats() {
    const ctx = useGameContext();
    const teamsMap = ctx.teamsMap.value;
    const playersMap = ctx.playersMap.value;
    const manager = ctx.userManager.value;
    const leagues = ctx.leagues.value;
    const tournaments = ctx.tournaments.value;
    const internationalTournaments = ctx.internationalTournaments.value;
    const managerTeam = teamsMap.get(manager.team);
    const managerLeague = leagues.find((league) => league.teams?.includes(manager.team));
    const managerTournament = tournaments.find((tournament) => tournament.teams?.find((team) => team.teamName === manager.team));
    const managerInternationalTournaments = internationalTournaments.find((tournament) => tournament.teams?.find((team) => team.teamName === manager.country));

    // Sorted arrays with user's league/tournament first
    const sortedLeagues = managerLeague
        ? [managerLeague, ...leagues.filter((league) => league !== managerLeague)]
        : leagues;

    const [selectedOption] = useState<string>("Leagues");

    const [selectedLeague, setSelectedLeague] = useState<League | null>(managerLeague ?? null);
    const [showAllLeagues, setShowAllLeagues] = useState<boolean>(false);
    const [selectedTournament] = useState<Tournament | null>(managerTournament ?? null);
    const [selectedInternationalTournament] = useState<InternationalTournament | null>(managerInternationalTournaments ?? null);

    function getLeague(): string | undefined {
        if (selectedOption === "Leagues") {
            return showAllLeagues ? "All Leagues" : selectedLeague?.name;
        } else if (selectedOption === "Tournaments") {
            return selectedTournament?.name;
        } else if (selectedOption === "International Tournaments") {
            return selectedInternationalTournament?.name;
        }
        return undefined;
    }

    function resolvePlayerNames(names: string[]): Player[] {
        return names.map((name) => playersMap.get(name)!).filter(Boolean);
    }

    function getLeaguePlayers(): Player[] {
        if (selectedOption === "Leagues") {
            return selectedLeague?.teams?.flatMap((teamName) => resolvePlayerNames(teamsMap.get(teamName)?.players ?? [])) ?? [];
        } else if (selectedOption === "Tournaments") {
            return tournaments.find((tournament) => tournament.name === selectedTournament?.name)?.teams?.flatMap((team) => resolvePlayerNames(teamsMap.get(team.teamName)?.players ?? [])) ?? [];
        } else if (selectedOption === "International Tournaments") {
            return internationalTournaments.find((tournament) => tournament.name === selectedInternationalTournament?.name)?.teams?.flatMap((team) => resolvePlayerNames(teamsMap.get(team.teamName)?.players ?? [])) ?? [];
        }
        return [];
    }

    return (
        <div>
            <h2 className={styles.title}>{getLeague()}</h2>
            <div className={styles.statsContainer}>
                <div className={styles.stats}>
                    <div className={styles.stat}>
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
                        <StatsTable leaguePlayers={getLeaguePlayers()} managerTeam={managerTeam ?? Array.from(teamsMap.values())[0]} selectedLeague={selectedLeague} teamsMap={teamsMap} playersMap={playersMap} leagues={leagues} showAllLeagues={showAllLeagues} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Stats;
