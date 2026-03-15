import { useState } from "react";
import type { InternationalTournament, League, Team, Tournament } from "../../Models/WorldStage";
import { ShowLeagueTable } from "../../Components/Table/ShowTables/ShowLeagueTable";
import ShowTournamentTable from "../../Components/Table/ShowTables/ShowTournamentTable";
import { ShowInternationalTournamentTable } from "../../Components/Table/ShowTables/ShowIntTournamentTable";
import styles from "./Table.module.css";
import { useGameContext } from "../../Context/GameContext";

export function Table() {
    const ctx = useGameContext();
    const teamsMap = ctx.teamsMap.value;
    const manager = ctx.userManager.value;
    const leagues = ctx.leagues.value;
    const tournaments = ctx.tournaments.value;
    const internationalTournaments = ctx.internationalTournaments.value;
    const managerLeague = leagues.find((league) => league.teams?.includes(manager.team));
    const managerTournament = tournaments.find((tournament) => tournament.teams?.find((team) => team.teamName === manager.team));
    const managerInternationalTournaments = internationalTournaments.find((tournament) => tournament.teams?.find((team) => team.teamName === manager.country));

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

    const divisionMap: Record<string, string[]> = {
        "First": ["Premier League", "La Liga", "Serie A", "Bundesliga", "Ligue 1", "Eredivisie", "Primeira Liga"],
        "Second": ["Championship", "La Liga 2", "Serie B", "2. Bundesliga", "Ligue 2", "Eerste Divisie", "Segunda Liga"],
        "Third": ["League One", "Primera Federación", "Serie C", "3. Liga", "National", "Tweede Divisie", "Liga 3"]
    };

    function getManagerDivision(): string {
        if (!managerLeague) return "First";
        for (const [div, names] of Object.entries(divisionMap)) {
            if (names.includes(managerLeague.name)) return div;
        }
        return "First";
    }

    const [selectedOption, setSelectedOption] = useState<string>("Leagues");
    const [selectedDivision, setSelectedDivision] = useState<string>(getManagerDivision());

    const filteredLeagues = sortedLeagues.filter(l => (divisionMap[selectedDivision] ?? []).includes(l.name));

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
    const leagueTeamNames = leagues.find((league) => league.name === selectedLeague?.name)?.teams;
    const leagueTeams = leagueTeamNames?.map((name) => teamsMap.get(name)).filter((t): t is Team => !!t);
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
                            <select value={selectedDivision} onChange={(e) => {
                                setSelectedDivision(e.target.value);
                                const newFiltered = sortedLeagues.filter(l => (divisionMap[e.target.value] ?? []).includes(l.name));
                                if (newFiltered.length > 0) {
                                    setSelectedLeague(newFiltered[0]);
                                }
                            }}>
                                <option value="First">First Division</option>
                                <option value="Second">Second Division</option>
                                <option value="Third">Third Division</option>
                            </select>
                            <select value={selectedLeague?.name ?? ''} onChange={(e) => {
                                const league = filteredLeagues.find(l => l.name === e.target.value);
                                setSelectedLeague(league ?? null);
                            }}>
                                {filteredLeagues.map(league => (
                                    <option key={league.name} value={league.name}>{league.name}</option>
                                ))}
                            </select>
                        </div>
                        <ShowLeagueTable leagueTitle={getLeague()} leageTeams={leagueTeams} managerTeam={teamsMap.get(manager.team)!} />
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