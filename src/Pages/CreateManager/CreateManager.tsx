import { useEffect } from "react";
import { showAlert } from "../../Components/AlertModal/AlertModal";
import { signal } from "@preact/signals-react";
import { Top50Countries } from "../../Models/Countries.ts";
import { AllTeams } from "../../Models/Teams.ts";
import styles from "./CreateManager.module.css";
import { useSignals } from "@preact/signals-react/runtime";
import { useGameContext } from "../../Context/GameContext.tsx";

const name = signal<string>("");
const country = signal<string>("Spain");
const league = signal<string>("Premier League");
const team = signal<string>("");
const age = signal<number>(25);
const type = signal<string>("scout");
const division = signal<string>("First");
export function CreateManager() {
    useSignals();
    const { teamsMap, nationalTeams, userManager, currentPage } = useGameContext();

    useEffect(() => {
        team.value = Array.from(teamsMap.value.values()).find((t) => t.league === league.value)?.name || "";
    }, [league.value, division.value]);

    useEffect(() => {
        if (!team.value) {
            // Find first team in the selected league
            const firstTeamInLeague = Array.from(teamsMap.value.values()).find((t) => t.league === league.value);
            team.value = firstTeamInLeague?.name || "";
        }
    }, []);
    function createManager() {
        if (!name || age.value < 20 || age.value > 70) {
            showAlert("Please fill in all fields correctly");
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
            trophiesWon: [],
            isUserManager: true
        };

        // Update the club team's manager directly in teamsMap
        const clubTeam = teamsMap.value.get(team.value);
        if (clubTeam) {
            clubTeam.manager = { ...manager, type: "Club" };
            teamsMap.value = new Map(teamsMap.value);
        }

        // Update the national team's manager
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

        // Also update the national team in teamsMap
        const nationalTeamInMap = teamsMap.value.get(country.value);
        if (nationalTeamInMap) {
            nationalTeamInMap.manager = { ...manager, type: "National" };
            teamsMap.value = new Map(teamsMap.value);
        }

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
                            className={styles.formControl}
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
                            className={styles.formControl}
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
                <div className={styles.formGroup}>
                    <label htmlFor="country">National Team</label>
                    <h4>Select the national team you want to manage</h4>
                    <select
                        className={styles.formControl}
                        id="country"
                        value={country.value}
                        onChange={(e) => country.value = e.target.value}
                    >
                        {Top50Countries.map((country: any) => (
                            <option key={country.country} value={country.country}>{country.country} {country.flag}</option>
                        ))}
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="league">League</label>
                    <h4>Select the league you want to manage</h4>
                    <div className={styles.leagueRow}>
                        <select
                            id="division"
                            value={division.value}
                            onChange={(e) => {
                                division.value = e.target.value;
                                league.value = division.value === "First" ? "Premier League" : division.value === "Second" ? "Championship" : "League One";
                            }}
                        >
                            <option value="First">First Division</option>
                            <option value="Second">Second Division</option>
                            <option value="Third">Third Division</option>
                        </select>
                        <select
                            id="league"
                            value={league.value}
                            onChange={(e) => {
                                league.value = e.target.value;
                                team.value = AllTeams.find((t: any) => t.league === e.target.value)?.name || "";
                            }}
                        >
                            {division.value === "First" && <option value="Premier League">Premier League</option>}
                            {division.value === "First" && <option value="La Liga">La Liga</option>}
                            {division.value === "First" && <option value="Serie A">Serie A</option>}
                            {division.value === "First" && <option value="Bundesliga">Bundesliga</option>}
                            {division.value === "First" && <option value="Ligue 1">Ligue 1</option>}
                            {division.value === "First" && <option value="Eredivisie">Eredivisie</option>}
                            {division.value === "First" && <option value="Primeira Liga">Primeira Liga</option>}
                            {division.value === "Second" && <option value="Championship">Championship</option>}
                            {division.value === "Second" && <option value="La Liga 2">La Liga 2</option>}
                            {division.value === "Second" && <option value="Serie B">Serie B</option>}
                            {division.value === "Second" && <option value="2. Bundesliga">2. Bundesliga</option>}
                            {division.value === "Second" && <option value="Ligue 2">Ligue 2</option>}
                            {division.value === "Second" && <option value="Eerste Divisie">Eerste Divisie</option>}
                            {division.value === "Second" && <option value="Segunda Liga">Segunda Liga</option>}
                            {division.value === "Third" && <option value="League One">League One</option>}
                            {division.value === "Third" && <option value="Primera Federación">Primera Federación</option>}
                            {division.value === "Third" && <option value="Serie C">Serie C</option>}
                            {division.value === "Third" && <option value="3. Liga">3. Liga</option>}
                            {division.value === "Third" && <option value="National">National</option>}
                            {division.value === "Third" && <option value="Tweede Divisie">Tweede Divisie</option>}
                            {division.value === "Third" && <option value="Liga 3">Liga 3</option>}
                        </select>
                    </div>
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="club">Club</label>
                    <h4>Select the club you want to manage</h4>
                    <select
                        className={styles.formControl}
                        id="club"
                        value={team.value}
                        onChange={(e) => team.value = e.target.value}
                    >
                        {AllTeams.filter((t: any) => t.league === league.value).map((t: any, index: number) => (
                            <option key={index} value={t.name}>{t.name}</option>
                        ))}
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="type">Type</label>
                    <h4>Select the type of manager you want to be</h4>
                    <select
                        className={styles.formControl}
                        id="type"
                        value={type.value}
                        onChange={(e) => type.value = e.target.value}
                    >
                        <option value="Scout">Scout- Recruits better players</option>
                        <option value="Tactitian">Tactitian- Improves team strategy for matches</option>
                        <option value="Developer">Developer- Improves player development and training</option>
                    </select>
                </div>
                <button
                    type="button"
                    onClick={() => createManager()}
                >
                    Create Manager
                </button>
            </form>
        </div>
    );
}

export default CreateManager;