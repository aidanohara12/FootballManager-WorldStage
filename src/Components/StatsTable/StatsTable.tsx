import { useState, useEffect, useRef } from "react";
import type { League, Player, Team } from "../../Models/WorldStage";
import PlayerAttributesView from "../Formation/PlayerAttributesView";
import styles from "./StatsTable.module.css";

interface StatsTableProps {
    leaguePlayers: Player[];
    managerTeam: Team;
    managerTeamName: string;
    selectedLeague: League | null;
    teamsMap: Map<string, Team>;
    playersMap: Map<string, Player>;
    leagues: League[];
    showAllLeagues: boolean;
}

interface TabColumn {
    header: string;
    getValue: (p: Player) => string | number;
    flex: number;
}

interface TabConfig {
    id: string;
    label: string;
    columns: TabColumn[];
    sortFn: (a: Player, b: Player) => number;
    filterFn?: (p: Player) => boolean;
}

const positionShort: Record<string, string> = {
    Forward: "FW",
    Midfielder: "MID",
    Defender: "DEF",
    Goalkeeper: "GK",
};

const positionClass: Record<string, string> = {
    Forward: "posFW",
    Midfielder: "posMID",
    Defender: "posDEF",
    Goalkeeper: "posGK",
};

const tabs: TabConfig[] = [
    {
        id: "scorers",
        label: "Top Scorers",
        columns: [
            { header: "Pos", getValue: (p) => positionShort[p.position] ?? p.position, flex: 0.6 },
            { header: "Team", getValue: (p) => p.team, flex: 1.5 },
            { header: "Goals", getValue: (p) => p.leagueGoals, flex: 0.7 },
            { header: "Assists", getValue: (p) => p.leagueAssists, flex: 0.7 },
        ],
        sortFn: (a, b) => b.leagueGoals - a.leagueGoals,
    },
    {
        id: "assists",
        label: "Top Assists",
        columns: [
            { header: "Pos", getValue: (p) => positionShort[p.position] ?? p.position, flex: 0.6 },
            { header: "Team", getValue: (p) => p.team, flex: 1.5 },
            { header: "Assists", getValue: (p) => p.leagueAssists, flex: 0.7 },
            { header: "Goals", getValue: (p) => p.leagueGoals, flex: 0.7 },
        ],
        sortFn: (a, b) => b.leagueAssists - a.leagueAssists,
    },
    {
        id: "cleansheets",
        label: "Clean Sheets",
        columns: [
            { header: "Team", getValue: (p) => p.team, flex: 1.5 },
            { header: "CS", getValue: (p) => p.cleanSheets, flex: 0.7 },
            { header: "OVR", getValue: (p) => p.overall, flex: 0.7 },
        ],
        sortFn: (a, b) => b.cleanSheets - a.cleanSheets,
        filterFn: (p) => p.position === "Goalkeeper",
    },
    {
        id: "best",
        label: "Best Players",
        columns: [
            { header: "Pos", getValue: (p) => positionShort[p.position] ?? p.position, flex: 0.6 },
            { header: "Team", getValue: (p) => p.team, flex: 1.5 },
            { header: "OVR", getValue: (p) => p.overall, flex: 0.7 },
            { header: "POT", getValue: (p) => p.potential, flex: 0.7 },
            { header: "Age", getValue: (p) => p.age, flex: 0.6 },
        ],
        sortFn: (a, b) => b.overall - a.overall,
    },
    {
        id: "young",
        label: "Young Stars",
        columns: [
            { header: "Pos", getValue: (p) => positionShort[p.position] ?? p.position, flex: 0.6 },
            { header: "Team", getValue: (p) => p.team, flex: 1.5 },
            { header: "Age", getValue: (p) => p.age, flex: 0.6 },
            { header: "OVR", getValue: (p) => p.overall, flex: 0.7 },
            { header: "POT", getValue: (p) => p.potential, flex: 0.7 },
        ],
        sortFn: (a, b) => b.potential !== a.potential ? b.potential - a.potential : b.overall - a.overall,
        filterFn: (p) => p.age <= 21,
    },
];

export function StatsTable({ managerTeamName, selectedLeague, teamsMap, playersMap, leagues, showAllLeagues }: StatsTableProps) {
    const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>("__all_teams__");
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
    const [activeTab, setActiveTab] = useState<string>("scorers");
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        setSelectedTeamFilter("__all_teams__");
    }, [selectedLeague]);

    const sortedTeams = selectedLeague?.teams;
    const isAllTeams = selectedTeamFilter === "__all_teams__";

    // Resolve players based on selection
    let displayPlayers: Player[];
    if (showAllLeagues) {
        displayPlayers = leagues.flatMap((league) =>
            league.teams.flatMap((teamName) => {
                const team = teamsMap.get(teamName);
                return team?.players.map((name) => playersMap.get(name)).filter(Boolean) as Player[] ?? [];
            })
        );
    } else if (isAllTeams) {
        displayPlayers = selectedLeague?.teams.flatMap((teamName) => {
            const team = teamsMap.get(teamName);
            return team?.players.map((name) => playersMap.get(name)).filter(Boolean) as Player[] ?? [];
        }) ?? [];
    } else {
        const team = teamsMap.get(selectedTeamFilter);
        displayPlayers = team?.players.map((name) => playersMap.get(name)!).filter(Boolean) ?? [];
    }

    const currentTab = tabs.find(t => t.id === activeTab) ?? tabs[0];

    // Apply tab filter and sort
    let filteredPlayers = currentTab.filterFn ? displayPlayers.filter(currentTab.filterFn) : displayPlayers;
    filteredPlayers = [...filteredPlayers].sort(currentTab.sortFn);

    return (
        <div className={styles.tableContainer}>
            {/* Tab buttons */}
            <div className={styles.tabRow}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`${styles.tabButton} ${activeTab === tab.id ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Team filter */}
            {!showAllLeagues && (
                <select className={styles.teamSelect} value={selectedTeamFilter} onChange={(e) => setSelectedTeamFilter(e.target.value)}>
                    <option value="__all_teams__">All Teams in League</option>
                    {sortedTeams?.map(teamName => (
                        <option key={teamName} value={teamName}>{teamName}</option>
                    ))}
                </select>
            )}

            {/* Table */}
            <div className={styles.table}>
                <div className={styles.tableHeader}>
                    <div className={styles.tableHeaderRow}>
                        <div className={styles.rankHeaderCell}>#</div>
                        <div className={styles.nameHeaderCell}>Player</div>
                        {currentTab.columns.map(col => (
                            <div key={col.header} className={styles.tableHeaderCell} style={{ flex: col.flex }}>
                                {col.header}
                            </div>
                        ))}
                    </div>
                </div>
                <div className={styles.tableBody}>
                    {filteredPlayers.map((player, index) => {
                        const isManager = player.team === managerTeamName;
                        const medalClass = index === 0 ? styles.gold : index === 1 ? styles.silver : index === 2 ? styles.bronze : '';
                        const posClass = positionClass[player.position] ?? '';

                        return (
                            <div
                                key={player.name}
                                className={`${styles.tableRow} ${medalClass} ${isManager ? styles.managerRow : ''}`}
                                onClick={() => setSelectedPlayer(player)}
                            >
                                <div className={styles.rankCell}>{index + 1}</div>
                                <div className={styles.nameCell}>
                                    <span className={`${styles.posBadge} ${styles[posClass]}`}>
                                        {positionShort[player.position]}
                                    </span>
                                    {player.name}
                                </div>
                                {currentTab.columns.map(col => (
                                    <div key={col.header} className={styles.statCell} style={{ flex: col.flex }}>
                                        {col.getValue(player)}
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </div>

            {selectedPlayer && (
                <div className={styles.overlay} onClick={() => setSelectedPlayer(null)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <PlayerAttributesView player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default StatsTable;
