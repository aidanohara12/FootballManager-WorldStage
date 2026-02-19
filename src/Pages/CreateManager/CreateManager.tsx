import { useEffect } from "react";
import { signal, type Signal } from "@preact/signals-react";
import { Top50Countries } from "../../Models/Countries.ts";
import { AllTeams } from "../../Models/Teams.ts";
import styles from "./CreateManager.module.css";
import type { Manager, NationalTeam, Team } from "../../Models/WorldStage.ts";
import { useSignals } from "@preact/signals-react/runtime";

interface CreateManagerProps {
    allTeams: Signal<Team[]>;
    nationalTeams: Signal<NationalTeam[]>;
    userManager: Signal<Manager>;
    currentPage: Signal<string>;
}

const name = signal<string>("");
const country = signal<string>("Spain");
const league = signal<string>("Premier League");
const team = signal<string>("");
const age = signal<number>(25);
const type = signal<string>("scout");

export function CreateManager({ allTeams, nationalTeams, userManager, currentPage }: CreateManagerProps) {
    useSignals();

    useEffect(() => {
        if (!team.value) {
            team.value = allTeams.value.find((t) => t.league === league.value)?.name || "";
        }
    }, []);
    function createManager() {
        if (!name || age.value < 20 || age.value > 70) {
            alert("Please fill in all fields correctly");
            return;
        }

        const manager = {
            name: name.value,
            country: country.value,
            team: team.value,
            age: age.value,
            type: type.value,
            leagueTrophies: 0,
            tournamentTrophies: 0,
            internationalTrophies: 0,
            careerWins: 0,
            careerLosses: 0,
            careerDraws: 0,
            trophiesWon: []
        };

        const updatedClubTeams = allTeams.value.map((t) =>
            t.name === team.value
                ? { ...t, manager: { ...manager, type: "Club" } }
                : t
        );
        allTeams.value = updatedClubTeams;

        const updatedNationalTeams = nationalTeams.value.map((nt) =>
            nt.country === country.value
                ? {
                    ...nt,
                    team: {
                        ...nt.team,
                        manager: { ...manager, type: "National" }
                    }
                }
                : nt
        );
        nationalTeams.value = updatedNationalTeams;

        userManager.value = manager;
        currentPage.value = "MainPage";
    }


    return (
        <div className={styles.createManagerContainer}>
            <h1>Create Your Manager!</h1>
            <form>
                <div className={styles.formRow}>
                    <div>
                        <label htmlFor="name">Name</label>
                        <h4>Enter the name of your manager</h4>
                        <input
                            type="text"
                            className="form-control"
                            id="name"
                            value={name.value}
                            required={true}
                            onChange={(e) => name.value = e.target.value}
                        />
                    </div>
                    <div>
                        <label htmlFor="age">Age</label>
                        <h4>Enter the age of your manager (20-70)</h4>
                        <input
                            type="number"
                            className="form-control"
                            id="age"
                            value={age.value}
                            min={20}
                            max={70}
                            required={true}
                            onChange={(e) => age.value = parseInt(e.target.value) || 0}
                            onBlur={(e) => {
                                const newAge = parseInt(e.target.value);
                                if (newAge < 20) age.value = 20;
                                if (newAge > 70) age.value = 70;
                            }}
                        />
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="country">National Team</label>
                    <h4>Select the national team you want to manage (Top 50 countries)</h4>
                    <select
                        className="form-control"
                        id="country"
                        value={country.value}
                        onChange={(e) => country.value = e.target.value}
                    >
                        {Top50Countries.map((country: any) => (
                            <option key={country.country} value={country.country}>{country.country} {country.flag}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="league">League</label>
                    <h4>Select the league you want to manage</h4>
                    <select
                        className="form-control"
                        id="league"
                        value={league.value}
                        onChange={(e) => league.value = e.target.value}
                    >
                        <option value="Premier League">Premier League</option>
                        <option value="La Liga">La Liga</option>
                        <option value="Serie A">Serie A</option>
                        <option value="Bundesliga">Bundesliga</option>
                        <option value="Ligue 1">Ligue 1</option>
                        <option value="Eredivisie">Eredivisie</option>
                        <option value="Primeira Liga">Primeira Liga</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="club">Club</label>
                    <h4>Select the club you want to manage</h4>
                    <select
                        className="form-control"
                        id="club"
                        value={team.value}
                        onChange={(e) => team.value = e.target.value}
                    >
                        {AllTeams.filter((t: any) => t.league === league.value).map((t: any, index: number) => (
                            <option key={index} value={t.name}>{t.name}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="type">Type</label>
                    <h4>Select the type of manager you want to be</h4>
                    <select
                        className="form-control"
                        id="type"
                        value={type.value}
                        onChange={(e) => type.value = e.target.value}
                    >
                        <option value="scout">Scout- Recruits better players</option>
                        <option value="tactitian">Tactitian- Improves team strategy for matches</option>
                        <option value="Developer">Developer- Improves player development and training</option>
                    </select>
                </div>
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => createManager()}
                >
                    Create Manager
                </button>
            </form>
        </div>
    );
}

export default CreateManager;