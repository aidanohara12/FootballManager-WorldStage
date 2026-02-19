import { useState } from "react";
import type { InternationalTournament, League, Manager, Team, Tournament } from "../../Models/WorldStage";
import { ShowLeagueTable } from "../../Components/Table/ShowTables/ShowLeagueTable";
import ShowTournamentTable from "../../Components/Table/ShowTables/ShowTournamentTable";
import { ShowInternationalTournamentTable } from "../../Components/Table/ShowTables/ShowIntTournamentTable";
import styles from "./Table.module.css";

interface TableProps {
    allTeams: Team[];
    manager: Manager;
    leagues: League[];
    tournaments: Tournament[];
    internationalTournaments: InternationalTournament[];
}

export function Table({ allTeams, manager, leagues, tournaments, internationalTournaments }: TableProps) {
    const managerLeague = leagues.find((league) => league.teams?.find((team) => team.Team.name === manager.team));
    const managerTournament = tournaments.find((tournament) => tournament.teams?.find((team) => team.Team.name === manager.team));
    const managerInternationalTournaments = internationalTournaments.find((tournament) => tournament.teams?.find((team) => team.Team.team.name === manager.country));

    // Sorted arrays with user's league/tournament first
    const sortedLeagues = managerLeague
        ? [managerLeague, ...leagues.filter((league) => league !== managerLeague)]
        : leagues;

    const sortedTournaments = managerTournament
        ? [managerTournament, ...tournaments.filter((tournament) => tournament !== managerTournament)]
        : tournaments;

    const sortedInternationalTournaments = managerInternationalTournaments
        ? [managerInternationalTournaments, ...internationalTournaments.filter((tournament) => tournament !== managerInternationalTournaments)]
        : internationalTournaments;

    const [selectedOption, setSelectedOption] = useState<string>("Leagues");

    const [selectedLeague, setSelectedLeague] = useState<League | null>(managerLeague ?? null);
    const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(managerTournament ?? null);
    const [selectedInternationalTournament, setSelectedInternationalTournament] = useState<InternationalTournament | null>(managerInternationalTournaments ?? null);

    function nextOption(): string {
        if (selectedOption === "Leagues") {
            return "Tournaments";
        } else if (selectedOption === "Tournaments") {
            return "International Tournaments";
        } else if (selectedOption === "International Tournaments") {
            return "Leagues";
        }
        return "Leagues"; // Default case
    }

    function handleOptionChange() {
        if (selectedOption === "Leagues") {
            setSelectedOption("Tournaments");
        } else if (selectedOption === "Tournaments") {
            setSelectedOption("International Tournaments");
        } else if (selectedOption === "International Tournaments") {
            setSelectedOption("Leagues");
        }
    }

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
    //get the teams for the selected league
    const leagueTeams = leagues.find((league) => league.name === selectedLeague?.name)?.teams;
    //get the teams for the selected tournament
    const tournamentTeams = tournaments.find((tournament) => tournament.name === selectedTournament?.name)?.teams;
    const tournamentMatches = tournaments.find((tournament) => tournament.name === selectedTournament?.name)?.matches;
    //get the teams for the selected international tournament
    const internationalTournamentTeams = internationalTournaments.find((tournament) => tournament.name === selectedInternationalTournament?.name)?.teams;
    const internationalTournamentMatches = internationalTournaments.find((tournament) => tournament.name === selectedInternationalTournament?.name)?.matches;
    return (
        <div>
            <div className={styles.topContainer}>
                <h3 className={styles.title}>{getLeague()}</h3>
                <button onClick={handleOptionChange}>Change To {nextOption()}</button>
            </div>
            <div className={styles.tableContainer}>

                {/* Choose League */}
                {selectedOption === "Leagues" && (
                    <div>
                        <div className={styles.selectContainer}>
                            <h3 className={styles.subTitle}>Leagues</h3>
                            <select value={selectedLeague?.name ?? ''} onChange={(e) => {
                                const league = sortedLeagues.find(l => l.name === e.target.value);
                                setSelectedLeague(league ?? null);
                            }}>
                                {sortedLeagues.map(league => (
                                    <option key={league.name} value={league.name}>{league.name}</option>
                                ))}
                            </select>
                        </div>
                        <ShowLeagueTable leagueTitle={getLeague()} leageTeams={leagueTeams} />
                    </div>
                )}

                {/* Choose Tournament */}
                {selectedOption === "Tournaments" && (
                    <div>
                        <div className={styles.selectContainer}>
                            <h3>Tournaments</h3>
                            <select value={selectedTournament?.name ?? ''} onChange={(e) => {
                                const tournament = sortedTournaments.find(t => t.name === e.target.value);
                                setSelectedTournament(tournament ?? null);
                            }}>
                                {sortedTournaments.map(tournament => (
                                    <option key={tournament.name} value={tournament.name}>{tournament.name}</option>
                                ))}
                            </select>
                        </div>
                        <ShowTournamentTable tournamentTitle={getLeague()} tournamentTeams={tournamentTeams} tournamentMatches={tournamentMatches} />
                    </div>
                )}

                {/* Choose International Tournament */}
                {selectedOption === "International Tournaments" && (
                    <div>
                        <div className={styles.selectContainer}>
                            <h3>International Tournaments</h3>
                            <select value={selectedInternationalTournament?.name ?? ''} onChange={(e) => {
                                const tournament = sortedInternationalTournaments.find(t => t.name === e.target.value);
                                setSelectedInternationalTournament(tournament ?? null);
                            }}>
                                {sortedInternationalTournaments.map(tournament => (
                                    <option key={tournament.name} value={tournament.name}>{tournament.name}</option>
                                ))}
                            </select>
                        </div>
                        <ShowInternationalTournamentTable tournamentTitle={getLeague()} tournamentTeams={internationalTournamentTeams} tournamentMatches={internationalTournamentMatches} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default Table;