import type { Signal } from '@preact/signals-react'
import type { Match, Team, Player } from '../../Models/WorldStage'
import styles from './LeagueWeekMatches.module.css'
import { useState } from 'react'

interface LeagueWeekMatchesProps {
    allMatches: Match[]
    matchClicked: Signal<Match | undefined>
    teamsMap: Signal<Map<string, Team>>
    playersMap: Signal<Map<string, Player>>
}

export function LeagueWeekMatches({ allMatches, matchClicked, teamsMap }: LeagueWeekMatchesProps) {

    return (
        <div className={styles.leagueWeekMatchesContainer}>
            <div className={styles.leagueWeekMatches}>
                {allMatches.map((match) => {
                    const homeTeam = teamsMap.value.get(match.homeTeamName)
                    const awayTeam = teamsMap.value.get(match.awayTeamName)
                    const homeTeamName = homeTeam?.name
                    const awayTeamName = awayTeam?.name
                    const homeTeamScore = match.homeScore
                    const awayTeamScore = match.awayScore
                    return (
                        <div key={`${match.homeTeamName}-${match.awayTeamName}`} className={styles.matchRow} onClick={() => matchClicked.value = match}>
                            <div className={styles.homeTeam}>{homeTeamName}</div>
                            <div className={styles.scoreBox}>
                                <div className={styles.score}>{homeTeamScore}</div>
                                <div className={styles.divider}>-</div>
                                <div className={styles.score}>{awayTeamScore}</div>
                            </div>
                            <div className={styles.awayTeam}>{awayTeamName}</div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default LeagueWeekMatches