import { useState } from "react";
import { signal } from "@preact/signals-react";
import type { InternationalTournament, Match, Tournament } from "../../Models/WorldStage";
import ShowTournamentTable from "../../Components/Table/ShowTables/ShowTournamentTable";
import { ShowInternationalTournamentTable } from "../../Components/Table/ShowTables/ShowIntTournamentTable";
import { MatchOverview } from "../../Components/MatchOverview/MatchOverview";
import { useGameContext } from "../../Context/GameContext";
import styles from "../Table/Table.module.css";

const matchClicked = signal<Match | undefined>(undefined);

export function Tournaments() {
    const ctx = useGameContext();
    const playersMap = ctx.playersMap.value;
    const manager = ctx.userManager.value;
    const tournaments = ctx.tournaments.value;
    const internationalTournaments = ctx.internationalTournaments.value;

    const managerTournament = tournaments.find((tournament) => tournament.teams?.find((team) => team.teamName === manager.team));
    const managerInternationalTournament = internationalTournaments.find((tournament) => tournament.teams?.find((team) => team.teamName === manager.country));

    const sortedTournaments = managerTournament
        ? [managerTournament, ...tournaments.filter((t) => t !== managerTournament)]
        : tournaments;

    const sortedInternationalTournaments = managerInternationalTournament
        ? [managerInternationalTournament, ...internationalTournaments.filter((t) => t !== managerInternationalTournament)]
        : internationalTournaments;

    const [selectedOption, setSelectedOption] = useState<string>("Tournaments");
    const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(managerTournament ?? null);
    const [selectedInternationalTournament, setSelectedInternationalTournament] = useState<InternationalTournament | null>(managerInternationalTournament ?? null);

    function nextOption(): string {
        return selectedOption === "Tournaments" ? "International Tournaments" : "Tournaments";
    }

    function handleOptionChange() {
        setSelectedOption(selectedOption === "Tournaments" ? "International Tournaments" : "Tournaments");
    }

    function getTitle(): string | undefined {
        if (selectedOption === "Tournaments") {
            return selectedTournament?.name;
        }
        return selectedInternationalTournament?.name;
    }

    const tournamentTeams = tournaments.find((t) => t.name === selectedTournament?.name)?.teams;
    const tournamentMatches = tournaments.find((t) => t.name === selectedTournament?.name)?.matches;
    const internationalTournamentTeams = internationalTournaments.find((t) => t.name === selectedInternationalTournament?.name)?.teams;
    const internationalTournamentMatches = internationalTournaments.find((t) => t.name === selectedInternationalTournament?.name)?.matches;

    return (
        <div>
            <div className={styles.topContainer}>
                <h3 className={styles.title}>{getTitle()}</h3>
                <button onClick={handleOptionChange}>Change To {nextOption()}</button>
            </div>
            <div className={styles.tableContainer}>
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
                        <ShowTournamentTable tournamentTitle={getTitle()} tournamentTeams={tournamentTeams} tournamentMatches={tournamentMatches} onMatchClick={(m) => matchClicked.value = m} managerTeam={manager.team} />
                    </div>
                )}

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
                        <ShowInternationalTournamentTable tournamentTitle={getTitle()} tournamentTeams={internationalTournamentTeams} tournamentMatches={internationalTournamentMatches} onMatchClick={(m) => matchClicked.value = m} />
                    </div>
                )}
            </div>
            {matchClicked.value && (
                <div className={styles.overlay} onClick={() => matchClicked.value = undefined}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <MatchOverview match={matchClicked} playersMap={playersMap} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default Tournaments;
