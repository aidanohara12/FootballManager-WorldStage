import { useEffect } from "react";
import type { Player, Team } from "../../Models/WorldStage";
import { signal } from "@preact/signals-react";
import { Formation } from "../../Components/Formation/Formation";
import styles from "./TeamView.module.css";
import { PlayerAttributesView } from "../../Components/Formation/PlayerAttributesView";
import { useSignals } from "@preact/signals-react/runtime";
import { useGameContext } from "../../Context/GameContext";
import { SelectClub } from "../../Components/TeamSelection/SelectClub/SelectClub";
import { SelectNational } from "../../Components/TeamSelection/SelectNational/SelectNational";

const clubTeam = signal<Team | null>(null);
const nationalTeam = signal<Team | null>(null);
const selectedPlayer = signal<Player | null>(null);
const currentTeam = signal<string>("Club");
const showSetStarters = signal<boolean>(false);

export function TeamView() {
    useSignals();
    const { teamsMap, playersMap, nationalTeams, userManager, currentYear } = useGameContext();

    const isInternationalPeriod = ["May", "June", "July"].includes(currentYear.value.currentMonth);

    useEffect(() => {
        clubTeam.value = teamsMap.value.get(userManager.value.team) ?? null;
        nationalTeam.value = nationalTeams.value.find((nt) => nt.country === userManager.value.country)?.team ?? null;
        currentTeam.value = isInternationalPeriod ? "National" : "Club";
    }, [isInternationalPeriod]);

    function switchTeam() {
        currentTeam.value = currentTeam.value === "Club" ? "National" : "Club";
    }

    function handleSetStartersComplete() {
        showSetStarters.value = false;
        // Refresh team data
        clubTeam.value = teamsMap.value.get(userManager.value.team) ?? null;
        nationalTeam.value = nationalTeams.value.find((nt) => nt.country === userManager.value.country)?.team ?? null;
    }

    function autoSetBestTeam() {
        if (currentTeam.value === "Club") {
            const allTeamPlayers = Array.from(playersMap.value.values()).filter(p => p.team === userManager.value.team);
            allTeamPlayers.forEach(p => p.startingTeam = false);
            //set forwards
            allTeamPlayers.filter(p => p.position === "Forward" && !p.injured).sort((a, b) => b.overall - a.overall).slice(0, 3).forEach(p => p.startingTeam = true);
            //set midfielders
            allTeamPlayers.filter(p => p.position === "Midfielder" && !p.injured).sort((a, b) => b.overall - a.overall).slice(0, 3).forEach(p => p.startingTeam = true);
            //set defenders
            allTeamPlayers.filter(p => p.position === "Defender" && !p.injured).sort((a, b) => b.overall - a.overall).slice(0, 4).forEach(p => p.startingTeam = true);
            //set goalkeepers
            allTeamPlayers.filter(p => p.position === "Goalkeeper" && !p.injured).sort((a, b) => b.overall - a.overall).slice(0, 1).forEach(p => p.startingTeam = true);
        } else {
            const allTeamPlayers = Array.from(playersMap.value.values()).filter(p => p.team === userManager.value.country);
            allTeamPlayers.forEach(p => p.startingNational = false);
            //set forwards
            allTeamPlayers.filter(p => p.position === "Forward" && !p.injured).sort((a, b) => b.overall - a.overall).slice(0, 3).forEach(p => p.startingNational = true);
            //set midfielders
            allTeamPlayers.filter(p => p.position === "Midfielder" && !p.injured).sort((a, b) => b.overall - a.overall).slice(0, 3).forEach(p => p.startingNational = true);
            //set defenders
            allTeamPlayers.filter(p => p.position === "Defender" && !p.injured).sort((a, b) => b.overall - a.overall).slice(0, 4).forEach(p => p.startingNational = true);
            //set goalkeepers
            allTeamPlayers.filter(p => p.position === "Goalkeeper" && !p.injured).sort((a, b) => b.overall - a.overall).slice(0, 1).forEach(p => p.startingNational = true);
        }
        playersMap.value = new Map(playersMap.value);
    }

    return (
        <div className={styles.teamViewContainer} onClick={() => selectedPlayer.value = null}>
            <div className={styles.teamInfo}>
                <button onClick={switchTeam} className={styles.switchTeamButton}>
                    {currentTeam.value === "Club" ? "Switch to National Team" : "Switch to Club Team"}
                </button>
                <h4 className={styles.teamName} style={{ color: currentTeam.value === "Club" ? clubTeam.value?.color : nationalTeam.value?.color }}>
                    {currentTeam.value === "Club" ? clubTeam.value?.name : nationalTeam.value?.name}
                </h4>
                <div className={styles.teamButtons}>
                    <button onClick={(e) => { e.stopPropagation(); showSetStarters.value = true; }}>
                        Select Starters
                    </button>
                    <button onClick={autoSetBestTeam}>
                        Set Best Team
                    </button>
                </div>
            </div>
            <div className={styles.formation}>
                {(currentTeam.value === "Club" ? clubTeam.value : nationalTeam.value) && (
                    <Formation currentTeam={(currentTeam.value === "Club" ? clubTeam.value : nationalTeam.value)!} playersMap={playersMap.value} selectedPlayer={selectedPlayer} clubTeam={currentTeam.value === "Club"} />
                )}
            </div>

            {selectedPlayer.value && (
                <div className={styles.selectedPlayer} onClick={() => selectedPlayer.value = null}>
                    <PlayerAttributesView player={selectedPlayer.value} selectedPlayer={selectedPlayer} />
                </div>
            )}

            {showSetStarters.value && (
                <div className={styles.setStartersOverlay} onClick={() => showSetStarters.value = false}>
                    <div className={styles.setStartersModal} onClick={(e) => e.stopPropagation()}>
                        {currentTeam.value === "Club" ? (
                            <SelectClub onComplete={handleSetStartersComplete} wasClicked={true} />
                        ) : (
                            <SelectNational onComplete={handleSetStartersComplete} wasClicked={true} />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default TeamView;
