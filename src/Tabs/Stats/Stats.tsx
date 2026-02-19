import { useState } from "react";
import type { currentYear, InternationalTournament, League, Manager, Player, Team, Tournament, WorldCup } from "../../Models/WorldStage";
import styles from "./Stats.module.css";
import { StatsTable } from "../../Components/StatsTable/StatsTable";

interface StatsProps {
    allPlayers: any;
    allTeams: Team[];
    manager: Manager;
    leagues: League[];
    tournaments: Tournament[];
    internationalTournaments: InternationalTournament[];
}

export function Stats({ allTeams, manager, leagues, tournaments, internationalTournaments }: StatsProps) {
    const managerTeam = allTeams.find(team => team.name === manager.team);
    const managerLeague = leagues.find((league) => league.teams?.find((team) => team.Team.name === manager.team));
    const managerTournament = tournaments.find((tournament) => tournament.teams?.find((team) => team.Team.name === manager.team));
    const managerInternationalTournaments = internationalTournaments.find((tournament) => tournament.teams?.find((team) => team.Team.team.name === manager.country));

    // Sorted arrays with user's league/tournament first
    const sortedLeagues = managerLeague
        ? [managerLeague, ...leagues.filter((league) => league !== managerLeague)]
        : leagues;

    const [selectedOption ] = useState<string>("Leagues");

    const [selectedLeague, setSelectedLeague] = useState<League | null>(managerLeague ?? null);
    const [selectedTournament] = useState<Tournament | null>(managerTournament ?? null);
    const [selectedInternationalTournament] = useState<InternationalTournament | null>(managerInternationalTournaments ?? null);

    function getLeague(): string | undefined {
        if (selectedOption === "Leagues") {
            return selectedLeague?.name;
        } else if (selectedOption === "Tournaments") {
            return selectedTournament?.name;
        } else if (selectedOption === "International Tournaments") {
            return selectedInternationalTournament?.name;
        }
        return undefined;
    }

    function getLeaguePlayers(): (Player | undefined)[] | undefined {
        if (selectedOption === "Leagues") {
            return selectedLeague?.teams?.flatMap((team) => team.Team.players);
        } else if (selectedOption === "Tournaments") {
            return tournamentPlayers;
        } else if (selectedOption === "International Tournaments") {
            return internationalTournamentPlayers;
        }
        return undefined;
    }
    //get the players for the selected tournament
    const tournamentPlayers = tournaments.find((tournament) => tournament.name === selectedTournament?.name)?.teams?.flatMap((team) => team.Team.players);
    //get the players for the selected international tournament
    const internationalTournamentPlayers = internationalTournaments.find((tournament) => tournament.name === selectedInternationalTournament?.name)?.teams?.flatMap((team) => team.Team.team.players);

    return (
        <div>
            <h2 className={styles.title}>{getLeague()}</h2>
            <div className={styles.statsContainer}>
                <div className={styles.stats}>
                    <div className={styles.stat}>
                        <h3 className={styles.subTitle}>League Stats</h3>
                        <div>
                            <select className={styles.select} value={selectedLeague?.name ?? ''} onChange={(e) => {
                                const league = sortedLeagues.find(l => l.name === e.target.value);
                                setSelectedLeague(league ?? null);
                            }}>
                                {sortedLeagues.map(league => (
                                    <option key={league.name} value={league.name}>{league.name}</option>
                                ))}
                            </select>
                        </div>
                        <StatsTable leaguePlayers={getLeaguePlayers()} managerTeam={managerTeam} selectedLeague={selectedLeague} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Stats;