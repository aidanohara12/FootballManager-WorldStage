import { useState, useEffect, useRef } from "react";
import type { League, Player, Team } from "../../Models/WorldStage";
import PlayerAttributesView from "../Formation/PlayerAttributesView";
import styles from "./StatsTable.module.css";

interface StatsTableProps {
    leaguePlayers: (Player | undefined)[] | undefined;
    managerTeam: Team;
    selectedLeague: League | null;
}

export function StatsTable({ leaguePlayers, managerTeam, selectedLeague }: StatsTableProps) {
    const [selectedTeam, setSelectedTeam] = useState<Team>(managerTeam);
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
    const isFirstRender = useRef(true);

    useEffect(() => {
        setSelectedTeam(managerTeam);
    }, [managerTeam]);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        if (selectedLeague) {
            const managerInLeague = selectedLeague.teams?.find(t => t.Team.name === managerTeam.name)?.Team;
            setSelectedTeam(managerInLeague ?? selectedLeague.teams?.[0]?.Team ?? managerTeam);
        }
    }, [selectedLeague]);

    const sortedTeams = selectedLeague?.teams;

    return (
        <div className={styles.tableContainer}>
            <div>
                <select value={selectedTeam?.name ?? ''} onChange={(e) => {
                    const team = selectedLeague?.teams?.find(t => t.Team.name === e.target.value)?.Team;
                    setSelectedTeam(team ?? managerTeam);
                }}>
                    {sortedTeams?.map(team => (
                        <option key={team.Team.name} value={team.Team.name}>{team.Team.name}</option>
                    ))}
                </select>
            </div>
            <div className={styles.table}>
                <div className={styles.tableBody}>
                    <div className={styles.table}>
                        <div className={styles.tableHeader}>
                            <div className={styles.tableHeaderRow}>
                                <div className={styles.tableHeaderCell}>Player</div>
                                <div className={styles.tableHeaderCell}>Goals</div>
                                <div className={styles.tableHeaderCell}>Assists</div>
                                <div className={styles.tableHeaderCell}>G/A</div>
                            </div>
                        </div>
                        <div className={styles.tableBody}>
                            {selectedTeam?.players?.sort((a, b) => (b.leagueGoals + b.leagueAssists) - (a.leagueGoals + a.leagueAssists)).map((player) => {
                                const playerGoals = player.leagueGoals + player.countryGoals;
                                const playerAssists = player.leagueAssists + player.countryAssists;
                                const playerGoalsAssists = playerGoals + playerAssists;
                                return (
                                    <div key={player.name} className={styles.tableRow} onClick={() => setSelectedPlayer(player)}>
                                        <div className={styles.teamName}>{player.name}</div>
                                        <div className={styles.statCell}>{playerGoals}</div>
                                        <div className={styles.statCell}>{playerAssists}</div>
                                        <div className={styles.statCell}>{playerGoalsAssists}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {selectedPlayer && (
                <div className={styles.overlay} onClick={() => setSelectedPlayer(null)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <PlayerAttributesView player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
                    </div>
                </div>
            )}
        </div >
    );
}

export default StatsTable;
