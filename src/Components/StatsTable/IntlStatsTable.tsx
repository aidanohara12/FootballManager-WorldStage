import { useState } from "react";
import type { NationalTeam, Player } from "../../Models/WorldStage";
import PlayerAttributesView from "../Formation/PlayerAttributesView";
import styles from "./StatsTable.module.css";
import { Top50Countries } from "../../Models/Countries";

interface IntlStatsTableProps {
    nationalTeams: NationalTeam[];
    playersMap: Map<string, Player>;
    managerCountry: string;
}

interface TabConfig {
    id: string;
    label: string;
    columns: { header: string; getValue: (p: Player) => string | number; flex: number }[];
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
            { header: "Country", getValue: (p) => p.country, flex: 1.5 },
            { header: "Goals", getValue: (p) => p.countryGoals, flex: 0.7 },
            { header: "Assists", getValue: (p) => p.countryAssists, flex: 0.7 },
        ],
        sortFn: (a, b) => b.countryGoals - a.countryGoals,
    },
    {
        id: "assists",
        label: "Top Assists",
        columns: [
            { header: "Country", getValue: (p) => p.country, flex: 1.5 },
            { header: "Assists", getValue: (p) => p.countryAssists, flex: 0.7 },
            { header: "Goals", getValue: (p) => p.countryGoals, flex: 0.7 },
        ],
        sortFn: (a, b) => b.countryAssists - a.countryAssists,
    },
    {
        id: "best",
        label: "Best Players",
        columns: [
            { header: "Country", getValue: (p) => p.country, flex: 1.5 },
            { header: "OVR", getValue: (p) => p.overall, flex: 0.7 },
            { header: "POT", getValue: (p) => p.potential, flex: 0.7 },
            { header: "Age", getValue: (p) => p.age, flex: 0.6 },
        ],
        sortFn: (a, b) => b.overall - a.overall,
    },
];

export function IntlStatsTable({ nationalTeams, playersMap, managerCountry }: IntlStatsTableProps) {
    const [activeTab, setActiveTab] = useState("scorers");
    const [selectedCountry, setSelectedCountry] = useState("__all__");
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

    const currentTab = tabs.find(t => t.id === activeTab) ?? tabs[0];

    const allNtPlayers: Player[] = nationalTeams.flatMap(nt =>
        nt.team.players.map(name => playersMap.get(name)).filter(Boolean) as Player[]
    );

    const displayPlayers = selectedCountry === "__all__"
        ? allNtPlayers
        : allNtPlayers.filter(p => p.country === selectedCountry);

    const filtered = currentTab.filterFn ? displayPlayers.filter(currentTab.filterFn) : displayPlayers;
    const sorted = [...filtered].sort(currentTab.sortFn);

    return (
        <div className={styles.intTablecontainer}>
            <div className={styles.tabRow}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`${styles.tabButton} ${activeTab === tab.id ? styles.tabActive : ""}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <select className={styles.teamSelect} value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)}>
                <option value="__all__">All Countries</option>
                {nationalTeams.map(nt => {
                    const flag = Top50Countries.find(c => c.country === nt.country)?.flag ?? "";
                    return (
                        <option key={nt.country} value={nt.country}>{flag} {nt.country}</option>
                    );
                })}
            </select>

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
                    {sorted.map((player, index) => {
                        const isManager = player.country === managerCountry;
                        const medalClass = index === 0 ? styles.gold : index === 1 ? styles.silver : index === 2 ? styles.bronze : "";
                        const posClass = positionClass[player.position] ?? "";
                        return (
                            <div
                                key={player.name}
                                className={`${styles.tableRow} ${medalClass} ${isManager ? styles.managerRow : ""}`}
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

export default IntlStatsTable;
