import type { Signal } from '@preact/signals-react'
import styles from './MatchOverview.module.css'
import type { Match, Player } from '../../Models/WorldStage'

interface MatchOverviewProps {
    match: Signal<Match | undefined>
    playersMap: Map<string, Player>
}

const positionShort: Record<string, string> = {
    Forward: "FW",
    Midfielder: "MID",
    Defender: "DEF",
    Goalkeeper: "GK"
};

export function MatchOverview(props: MatchOverviewProps) {
    const { match, playersMap } = props;
    if (!match.value) return null;
    const homeAssisters: Record<string, number> = {};
    const awayAssisters: Record<string, number> = {};
    match.value.homeAssists.forEach(([playerName]) => {
        homeAssisters[playerName] = (homeAssisters[playerName] || 0) + 1;
    });
    match.value.awayAssists.forEach(([playerName]) => {
        awayAssisters[playerName] = (awayAssisters[playerName] || 0) + 1;
    });

    const m = match.value;

    return (
        <div className={styles.matchOverview}>
            <div className={styles.scoreBoard}>
                <div className={styles.teamSide}>
                    <div className={styles.teamName}>{m.homeTeamName}</div>
                    <div className={styles.score}>{m.homeScore}</div>
                </div>
                <div className={styles.divider}>
                    <span className={styles.vs}>VS</span>
                </div>
                <div className={styles.teamSide}>
                    <div className={styles.score}>{m.awayScore}</div>
                    <div className={styles.teamName}>{m.awayTeamName}</div>
                </div>
            </div>

            <div className={styles.details}>
                <div className={styles.detailColumn}>
                    <ScorerList title="Scorers" entries={m.homeScorers} align="right" playersMap={playersMap} />
                    <AssistList title="Assists" entries={homeAssisters} align="right" playersMap={playersMap} />
                </div>

                <div className={styles.detailDivider}></div>

                <div className={styles.detailColumn}>
                    <ScorerList title="Scorers" entries={m.awayScorers} align="left" playersMap={playersMap} />
                    <AssistList title="Assists" entries={awayAssisters} align="left" playersMap={playersMap} />
                </div>
            </div>
        </div>
    )
}

function ScorerList({ title, entries, align, playersMap }: { title: string, entries: [string, string][], align: "left" | "right", playersMap: Map<string, Player> }) {
    return (
        <div className={styles.statSection}>
            <h4 className={`${styles.statTitle} ${align === "right" ? styles.alignRight : styles.alignLeft}`}>{title}</h4>
            {entries?.length > 0 ? entries.map(([playerName, minute], i) => {
                const player = playersMap.get(playerName);
                const posLabel = player ? ` (${positionShort[player.position]})` : '';
                return (
                    <div key={`${playerName}-${minute}-${i}`} className={`${styles.statRow} ${align === "right" ? styles.rowRight : styles.rowLeft}`}>
                        {align === "right" ? (
                            <>
                                <span className={styles.playerName}>{playerName}{posLabel}</span>
                                <span className={styles.minute}>{`${minute}'`}</span>
                            </>
                        ) : (
                            <>
                                <span className={styles.minute}>{`${minute}'`}</span>
                                <span className={styles.playerName}>{playerName}{posLabel}</span>
                            </>
                        )}
                    </div>
                );
            }) : (
                <div className={`${styles.noStats} ${align === "right" ? styles.alignRight : styles.alignLeft}`}>-</div>
            )}
        </div>
    );
}

function AssistList({ title, entries, align, playersMap }: { title: string, entries: Record<string, number>, align: "left" | "right", playersMap: Map<string, Player> }) {
    const assistEntries = Object.entries(entries);
    return (
        <div className={styles.statSection}>
            <h4 className={`${styles.statTitle} ${align === "right" ? styles.alignRight : styles.alignLeft}`}>{title}</h4>
            {assistEntries.length > 0 ? assistEntries.map(([name, count]) => {
                const player = playersMap.get(name);
                const posLabel = player ? ` (${positionShort[player.position]})` : '';
                return (
                    <div key={name} className={`${styles.statRow} ${align === "right" ? styles.rowRight : styles.rowLeft}`}>
                        {align === "right" ? (
                            <>
                                {count > 1 && <span className={styles.minute}>x{count}</span>}
                                <span className={styles.playerName}>{name} {posLabel}</span>
                            </>
                        ) : (
                            <>
                                <span className={styles.playerName}>{name} {posLabel}</span>
                                {count > 1 && <span className={styles.minute}>x{count}</span>}
                            </>
                        )}
                    </div>)
            }) : (
                <div className={`${styles.noStats} ${align === "right" ? styles.alignRight : styles.alignLeft}`}>-</div>)}
        </div>
    );
}
