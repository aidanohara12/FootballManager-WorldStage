import { useEffect } from "react";
import type { Manager, NationalTeam, Player, Team } from "../../Models/WorldStage";
import { signal, type Signal } from "@preact/signals-react";
import { Formation } from "../../Components/Formation/Formation";
import styles from "./TeamView.module.css";
import { PlayerAttributesView } from "../../Components/Formation/PlayerAttributesView";
import { useSignals } from "@preact/signals-react/runtime";

interface TeamViewProps {
    allTeams: Signal<Team[]>;
    nationalTeams: Signal<NationalTeam[]>;
    userManager: Signal<Manager>;
}

const clubTeam = signal<Team | null>(null);
const nationalTeam = signal<Team | null>(null);
const selectedPlayer = signal<Player | null>(null);
const currentTeam = signal<string>("Club");

export function TeamView({ allTeams, nationalTeams, userManager }: TeamViewProps) {
    useSignals();
    console.log("teamView", allTeams.value);

    useEffect(() => {
        clubTeam.value = allTeams.value.find((t) => t.name === userManager.value.team) ?? null;
        nationalTeam.value = nationalTeams.value.find((nt) => nt.country === userManager.value.country)?.team ?? null;
    }, []);

    function switchTeam() {
        currentTeam.value = currentTeam.value === "Club" ? "National" : "Club";
    }

    return (
        <div className={styles.teamViewContainer} onClick={() => selectedPlayer.value = null}>
            <div className={styles.teamInfo}>
                <h4 className={styles.teamName} style={{ color: currentTeam.value === "Club" ? clubTeam.value?.color : nationalTeam.value?.color }}>
                    {currentTeam.value === "Club" ? clubTeam.value?.name : nationalTeam.value?.name}
                </h4>
                <div>
                    <button onClick={switchTeam}>
                        {currentTeam.value === "Club" ? "Switch to National Team" : "Switch to Club Team"}
                    </button>
                </div>
            </div>
            <div className={styles.formation}>
                {(currentTeam.value === "Club" ? clubTeam.value : nationalTeam.value) && (
                    <Formation currentTeam={(currentTeam.value === "Club" ? clubTeam.value : nationalTeam.value)!} selectedPlayer={selectedPlayer} clubTeam={currentTeam.value === "Club"} />
                )}
            </div>

            {selectedPlayer.value && (
                <div className={styles.selectedPlayer} onClick={() => selectedPlayer.value = null}>
                    <PlayerAttributesView player={selectedPlayer.value} selectedPlayer={selectedPlayer} />
                </div>
            )}
        </div>
    );
}

export default TeamView;
