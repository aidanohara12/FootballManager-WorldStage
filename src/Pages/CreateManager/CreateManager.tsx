import { useState, useEffect } from "react";
import { Top50Countries } from "../../Models/Countries.ts";
import { AllTeams } from "../../Models/Teams.ts";
import styles from "./CreateManager.module.css";
import type { Manager, NationalTeam, Team } from "../../Models/WorldStage.ts";

interface CreateManagerProps {
    setCurrentPage: (page: string) => void;
    allTeams: Team[];
    nationalTeams: NationalTeam[];
    setAllTeams: (teams: Team[]) => void;
    setNationalTeams: (teams: NationalTeam[]) => void;
    setUserManager: (manager: Manager) => void;
}

export function CreateManager({ setCurrentPage, allTeams, nationalTeams, setAllTeams, setNationalTeams, setUserManager }: CreateManagerProps) {
    const [name, setName] = useState<string>("");
    const [country, setCountry] = useState<string>("Spain");
    const [league, setLeague] = useState<string>("Premier League");
    const [team, setTeam] = useState<string>(allTeams.find((team: any) => team.league === league)?.name || "");
    const [age, setAge] = useState<number>(0);
    const [type, setType] = useState<string>("scout");

    function createManager() {
        if (!name || age < 20 || age > 70) {
            alert("Please fill in all fields correctly");
            return;
        }

        const manager = {
            name: name,
            country: country,
            team: team,
            age: age,
            type: type
        };

        const updatedClubTeams = allTeams.map((t) =>
            t.name === team
                ? { ...t, manager: { ...manager, type: "Club" } }
                : t
        );
        setAllTeams(updatedClubTeams);

        const updatedNationalTeams = nationalTeams.map((nt) =>
            nt.country === country
                ? {
                    ...nt,
                    team: {
                        ...nt.team,
                        manager: { ...manager, type: "National" }
                    }
                }
                : nt
        );
        setNationalTeams(updatedNationalTeams);

        setUserManager(manager);
        setCurrentPage("MainPage");
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
                            value={name}
                            required={true}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="age">Age</label>
                        <h4>Enter the age of your manager (20-70)</h4>
                        <input
                            type="number"
                            className="form-control"
                            id="age"
                            value={age}
                            min={20}
                            max={70}
                            required={true}
                            onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                            onBlur={(e) => {
                                const newAge = parseInt(e.target.value);
                                if (newAge < 20) setAge(20);
                                if (newAge > 70) setAge(70);
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
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                    >
                        {Top50Countries.map((country: any, index: number) => (
                            <option key={index} value={country}>{index + 1}. {country}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="league">League</label>
                    <h4>Select the league you want to manage</h4>
                    <select
                        className="form-control"
                        id="league"
                        value={league}
                        onChange={(e) => setLeague(e.target.value)}
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
                        value={team}
                        onChange={(e) => setTeam(e.target.value)}
                    >
                        {AllTeams.filter((team: any) => team.league === league).map((team: any, index: number) => (
                            <option key={index} value={team.name}>{team.name}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="type">Type</label>
                    <h4>Select the type of manager you want to be</h4>
                    <select
                        className="form-control"
                        id="type"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
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