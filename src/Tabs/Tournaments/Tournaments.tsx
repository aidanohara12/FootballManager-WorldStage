import { useState } from "react";
import { signal } from "@preact/signals-react";
import { useSignals } from "@preact/signals-react/runtime";
import type { InternationalTournament, Match, Tournament } from "../../Models/WorldStage";
import ShowTournamentTable from "../../Components/Table/ShowTables/ShowTournamentTable";
import { ShowInternationalTournamentTable } from "../../Components/Table/ShowTables/ShowIntTournamentTable";
import { MatchOverview } from "../../Components/MatchOverview/MatchOverview";
import { useGameContext } from "../../Context/GameContext";
import { flagName } from "../../Models/Countries";
import styles from "../Table/Table.module.css";

const matchClicked = signal<Match | undefined>(undefined);

const tournamentCountries: Record<string, string> = {
    "England Cup": "England",
    "League Cup": "England",
    "King's Cup": "Spain",
    "Spanish Super Cup": "Spain",
    "Italian Cup": "Italy",
    "Italian Super Cup": "Italy",
    "German Cup": "Germany",
    "German Super Cup": "Germany",
    "French Cup": "France",
    "French League Cup": "France",
    "Dutch Cup": "Netherlands",
    "Dutch Shield": "Netherlands",
    "Portuguese Cup": "Portugal",
    "Portuguese League Cup": "Portugal",
}

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function Tournaments() {
    useSignals();
    const ctx = useGameContext();
    const playersMap = ctx.playersMap.value;
    const manager = ctx.userManager.value;
    const tournaments = ctx.tournaments.value;
    const internationalTournaments = ctx.internationalTournaments.value;
    const currentYear = ctx.currentYear.value;
    const currentInternationalTournament = ctx.currentInternationalTournament.value;
    const europeanTournaments = ['Champions Cup', 'Europa Cup', 'Conference Cup'];
    const countries = ['England', 'Spain', 'Italy', 'Germany', 'France', 'Netherlands', 'Portugal'];

    const managerTournament = tournaments.find((tournament) => tournament.teams?.find((team) => team.teamName === manager.team));
    const managerInternationalTournament = internationalTournaments.find((tournament) => tournament.teams?.find((team) => team.teamName === manager.country));
    const allTournamentsSorted = managerTournament ? [managerTournament, ...tournaments.filter((t) => t !== managerTournament)] : [...tournaments];
    const managerCountry = managerTournament ? (tournamentCountries[managerTournament.name] || "") : countries[0];
    const [sortedTournaments, setSortedTournaments] = useState<Tournament[]>(
        allTournamentsSorted.filter(t => !europeanTournaments.includes(t.name) && tournamentCountries[t.name] === managerCountry)
    );
    const sortedInternationalTournaments = managerInternationalTournament
        ? [managerInternationalTournament, ...internationalTournaments.filter((t) => t !== managerInternationalTournament)]
        : internationalTournaments;

    // Auto-select the right tab based on whether any international tournament is active
    let intStartTime = Infinity;
    internationalTournaments.forEach(t => {
        if (t.currentPhase === "not_started" || t.matches.length === 0) return;
        const firstMatchTime = new Date(t.matches[0].date).getTime();
        if (firstMatchTime < intStartTime) intStartTime = firstMatchTime;
    });
    const currentDateObj = new Date(currentYear.year, monthNames.indexOf(currentYear.currentMonth), currentYear.currentDay);
    const isIntPeriod = intStartTime !== Infinity && currentDateObj.getTime() >= intStartTime;
    const defaultOption = isIntPeriod ? "International Tournaments" : "Tournaments";

    // Find the active international tournament based on currentInternationalTournament type
    const continentalNames = ["Euro Nations", "Americas Cup", "Africa Nations", "Asian Nations"];
    const friendlyNames = ["Euro Nations Friendly", "Americas Friendly", "Africa Nations Friendly", "Asian Nations Friendly"];
    const activeIntTournament = (() => {
        if (!currentInternationalTournament) return managerInternationalTournament ?? null;
        if (currentInternationalTournament === "World Stage") {
            return internationalTournaments.find(t => t.name === "World Stage") ?? null;
        }
        if (currentInternationalTournament === "Continental") {
            return internationalTournaments.find(t =>
                continentalNames.includes(t.name) && t.teams.some(tm => tm.teamName === manager.country)
            ) ?? null;
        }
        // "Friendly"
        return internationalTournaments.find(t =>
            friendlyNames.includes(t.name) && t.teams.some(tm => tm.teamName === manager.country)
        ) ?? null;
    })();

    const [selectedOption, setSelectedOption] = useState<string>(defaultOption);
    const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(managerTournament ?? null);
    const [selectedInternationalTournament, setSelectedInternationalTournament] = useState<InternationalTournament | null>(activeIntTournament);
    const [selectedTournamentType, setSelectedTournamentType] = useState<string>("National");
    const [selectedTournamentCountry, setSelectedTournamentCountry] = useState<string>(managerCountry);

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
    const selectedIntTournament = internationalTournaments.find((t) => t.name === selectedInternationalTournament?.name);

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
                            <div className={styles.toggleGroup}>
                                <button
                                    className={`${styles.toggleButton} ${selectedTournamentType === "National" ? styles.toggleActive : ""}`}
                                    onClick={() => {
                                        setSelectedTournamentType("National");
                                        const filtered = allTournamentsSorted.filter((t: Tournament) =>
                                            !europeanTournaments.includes(t.name) && tournamentCountries[t.name] === selectedTournamentCountry
                                        );
                                        setSortedTournaments(filtered);
                                        setSelectedTournament(filtered[0] ?? null);
                                    }}
                                >
                                    National
                                </button>
                                <button
                                    className={`${styles.toggleButton} ${selectedTournamentType === "European" ? styles.toggleActive : ""} ${styles.european}`}
                                    onClick={() => {
                                        setSelectedTournamentType("European");
                                        const filtered = allTournamentsSorted.filter((t: Tournament) => europeanTournaments.includes(t.name));
                                        setSortedTournaments(filtered);
                                        setSelectedTournament(filtered[0] ?? null);
                                    }}
                                    disabled={currentYear.yearsCompleted < 1}
                                    title={currentYear.yearsCompleted < 1 ? "European tournaments unlock after completing the first season" : ""}
                                >
                                    European
                                </button>
                            </div>
                            <div className={styles.toggleGroup}>
                                {selectedTournamentType === "National" && (
                                    <select value={selectedTournamentCountry} onChange={(e) => {
                                        setSelectedTournamentCountry(e.target.value);
                                        const filtered = allTournamentsSorted.filter((t: Tournament) =>
                                            !europeanTournaments.includes(t.name) && tournamentCountries[t.name] === e.target.value
                                        );
                                        setSortedTournaments(filtered);
                                        setSelectedTournament(filtered[0] ?? null);
                                    }}>
                                        {countries.map(country => (
                                            <option key={country} value={country}>{flagName(country)}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
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
                                {sortedInternationalTournaments.map(tournament => {
                                    const label = tournament.name === "World Stage" ? "World Stage" : tournament.name;
                                    return (
                                        <option key={tournament.name} value={tournament.name}>{label}</option>
                                    );
                                })}
                            </select>
                        </div>
                        <ShowInternationalTournamentTable tournament={selectedIntTournament} onMatchClick={(m) => matchClicked.value = m} manager={manager} />
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
