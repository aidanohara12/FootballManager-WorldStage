import { useState } from "react";
import type { League, Player, Team } from "../../Models/WorldStage";
import styles from "./StatsTable.module.css";

interface StatsTableProps {
    leaguePlayers: (Player | undefined)[] | undefined;
    managerTeam: Team | undefined;
    selectedLeague: League | null;
}

export function StatsTable({ leaguePlayers, managerTeam, selectedLeague }: StatsTableProps) {
    const [selectedTeam, setSelectedTeam] = useState<Team | undefined>(managerTeam);
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

    const sortedTeams = selectedLeague?.teams?.sort((a, b) => {
        if (a.Team.name === managerTeam?.name) return 1;
        if (b.Team.name === managerTeam?.name) return -1;
        if (a.Team.name < b.Team.name) return -1;
        if (a.Team.name > b.Team.name) return 1;
        return 0;
    });

    return (
        <div className={styles.tableContainer}>
            <div>
                <select value={selectedLeague?.teams?.find(t => t.Team.name === selectedTeam?.name)?.Team.name ?? ''} onChange={(e) => {
                    const team = selectedLeague?.teams?.find(t => t.Team.name === e.target.value)?.Team;
                    setSelectedTeam(team ?? managerTeam);
                }}>
                    {sortedTeams?.map(team => (
                        <option key={team.Team.name} value={team.Team.name}>{team.Team.name}</option>
                    ))}
                </select>
            </div>
            <div className={styles.table}>
                <div className={styles.tableHeader}>
                    <div className={styles.tableHeaderRow}>
                        <div className={styles.tableHeaderCell}>Team</div>
                    </div>
                </div>
                <div className={styles.tableBody}>
                    {leaguePlayers?.map((player) => {

                        return (
                            <div key={player?.name} className={styles.tableRow}>
                                <div className={styles.teamName}>{player?.name}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div >
    );
}

export default StatsTable;