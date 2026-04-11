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
            {m.penaltyWin && (
                <div className={styles.penaltyLabel}>Won on Penalties</div>
            )}

            <div className={styles.details}>
                <div className={styles.detailColumn}>
                    <ScorerList title="Scorers" entries={m.homeScorers} align="right" playersMap={playersMap} />
                    <AssistList title="Assists" entries={homeAssisters} align="right" playersMap={playersMap} />
                    {m.homeInjuries && m.homeInjuries.length > 0 && (
                        <InjuryList title="Injuries" entries={m.homeInjuries} align="right" playersMap={playersMap} />
                    )}
                    {m.homeCards && m.homeCards.length > 0 && (
                        <CardList title="Cards" entries={m.homeCards} align="right" playersMap={playersMap} />
                    )}
                </div>

                <div className={styles.detailDivider}></div>

                <div className={styles.detailColumn}>
                    <ScorerList title="Scorers" entries={m.awayScorers} align="left" playersMap={playersMap} />
                    <AssistList title="Assists" entries={awayAssisters} align="left" playersMap={playersMap} />
                    {m.awayInjuries && m.awayInjuries.length > 0 && (
                        <InjuryList title="Injuries" entries={m.awayInjuries} align="left" playersMap={playersMap} />
                    )}
                    {m.awayCards && m.awayCards.length > 0 && (
                        <CardList title="Cards" entries={m.awayCards} align="left" playersMap={playersMap} />
                    )}
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

function InjuryList({ title, entries, align, playersMap }: { title: string, entries: [string, number][], align: "left" | "right", playersMap: Map<string, Player> }) {
    return (
        <div className={styles.statSection}>
            <h4 className={`${styles.injuryTitle} ${align === "right" ? styles.alignRight : styles.alignLeft}`}>{title}</h4>
            {entries.map(([name, weeks]) => {
                const player = playersMap.get(name);
                const posLabel = player ? ` (${positionShort[player.position]})` : '';
                return (
                    <div key={name} className={`${styles.statRow} ${align === "right" ? styles.rowRight : styles.rowLeft}`}>
                        {align === "right" ? (
                            <>
                                <span className={styles.injuryName}>{name}{posLabel}</span>
                                <span className={styles.injuryWeeks}>{weeks}w</span>
                            </>
                        ) : (
                            <>
                                <span className={styles.injuryWeeks}>{weeks}w</span>
                                <span className={styles.injuryName}>{name}{posLabel}</span>
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function CardList({ title, entries, align, playersMap }: { title: string, entries: [string, string][], align: "left" | "right", playersMap: Map<string, Player> }) {
    return (
        <div className={styles.statSection}>
            <h4 className={`${styles.cardTitle} ${align === "right" ? styles.alignRight : styles.alignLeft}`}>{title}</h4>
            {entries.map(([name, cardType], i) => {
                const player = playersMap.get(name);
                const posLabel = player ? ` (${positionShort[player.position]})` : '';
                const isRed = cardType === "red";
                return (
                    <div key={`${name}-${i}`} className={`${styles.statRow} ${align === "right" ? styles.rowRight : styles.rowLeft}`}>
                        {align === "right" ? (
                            <>
                                <span className={isRed ? styles.redCardName : styles.yellowCardName}>{name}{posLabel}</span>
                                <span className={isRed ? styles.redCardIcon : styles.yellowCardIcon}>{isRed ? "🟥" : "🟨"}</span>
                            </>
                        ) : (
                            <>
                                <span className={isRed ? styles.redCardIcon : styles.yellowCardIcon}>{isRed ? "🟥" : "🟨"}</span>
                                <span className={isRed ? styles.redCardName : styles.yellowCardName}>{name}{posLabel}</span>
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
