import { useState, useEffect, useRef } from "react";
import type { League, Player, Team } from "../../Models/WorldStage";
import PlayerAttributesView from "../Formation/PlayerAttributesView";
import styles from "./StatsTable.module.css";

interface StatsTableProps {
    leaguePlayers: Player[];
    managerTeam: Team;
    selectedLeague: League | null;
    teamsMap: Map<string, Team>;
    playersMap: Map<string, Player>;
    leagues: League[];
    showAllLeagues: boolean;
}

export function StatsTable({ leaguePlayers, managerTeam, selectedLeague, teamsMap, playersMap, leagues, showAllLeagues }: StatsTableProps) {
    const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>(managerTeam.name);
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
    const isFirstRender = useRef(true);

    useEffect(() => {
        setSelectedTeamFilter(managerTeam.name);
    }, [managerTeam]);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        if (selectedLeague) {
            const isManagerInLeague = selectedLeague.teams?.includes(managerTeam.name);
            if (isManagerInLeague) {
                setSelectedTeamFilter(managerTeam.name);
            } else {
                setSelectedTeamFilter(selectedLeague.teams?.[0] ?? managerTeam.name);
            }
        }
    }, [selectedLeague]);

    const sortedTeams = selectedLeague?.teams;
    const isAllTeams = selectedTeamFilter === "__all_teams__";
    const showTeamColumn = isAllTeams || showAllLeagues;

    // Resolve players based on selection
    let displayPlayers: Player[];
    if (showAllLeagues) {
        // All players across all leagues
        displayPlayers = leagues.flatMap((league) =>
            league.teams.flatMap((teamName) => {
                const team = teamsMap.get(teamName);
                return team?.players.map((name) => playersMap.get(name)!).filter(Boolean) ?? [];
            })
        );
    } else if (isAllTeams) {
        // All players in the selected league
        displayPlayers = selectedLeague?.teams.flatMap((teamName) => {
            const team = teamsMap.get(teamName);
            return team?.players.map((name) => playersMap.get(name)!).filter(Boolean) ?? [];
        }) ?? [];
    } else {
        // Single team
        const team = teamsMap.get(selectedTeamFilter);
        displayPlayers = team?.players.map((name) => playersMap.get(name)!).filter(Boolean) ?? [];
    }

    displayPlayers.sort((a, b) => (b.leagueGoals + b.leagueAssists) - (a.leagueGoals + a.leagueAssists));

    return (
        <div className={styles.tableContainer}>
            <div>
                {!showAllLeagues && (
                    <select value={selectedTeamFilter} onChange={(e) => setSelectedTeamFilter(e.target.value)} disabled={showAllLeagues}>
                        <option value="__all_teams__">All Teams in League</option>
                        {sortedTeams?.map(teamName => (
                            <option key={teamName} value={teamName}>{teamName}</option>
                        ))}
                    </select>
                )}
            </div>
            <div className={styles.table}>
                <div className={styles.tableBody}>
                    <div className={styles.table}>
                        <div className={styles.tableHeader}>
                            <div className={styles.tableHeaderRow}>
                                <div className={styles.tableHeaderCell}>Player</div>
                                {showTeamColumn && <div className={styles.tableHeaderCell}>Team</div>}
                                <div className={styles.tableHeaderCell}>Goals</div>
                                <div className={styles.tableHeaderCell}>Assists</div>
                                <div className={styles.tableHeaderCell}>G/A</div>
                            </div>
                        </div>
                        <div className={styles.tableBody}>
                            {displayPlayers.map((player) => {
                                const playerGoals = player.leagueGoals + player.countryGoals;
                                const playerAssists = player.leagueAssists + player.countryAssists;
                                const playerGoalsAssists = playerGoals + playerAssists;
                                return (
                                    <div key={player.name} className={styles.tableRow} onClick={() => setSelectedPlayer(player)}>
                                        <div className={styles.teamName}>{player.name}</div>
                                        {showTeamColumn && <div className={styles.statCell}>{player.team}</div>}
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
