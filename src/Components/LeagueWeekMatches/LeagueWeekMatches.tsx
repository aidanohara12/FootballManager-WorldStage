import type { Signal } from '@preact/signals-react'
import type { Match, Team, Player } from '../../Models/WorldStage'
import { flagName } from '../../Models/Countries'
import styles from './LeagueWeekMatches.module.css'

interface LeagueWeekMatchesProps {
    allMatches: Match[]
    internationalMatches?: Match[]
    matchClicked: Signal<Match | undefined>
    teamsMap: Signal<Map<string, Team>>
    playersMap: Signal<Map<string, Player>>
    managerTeam: Team | undefined
    managerCountry?: string
    isIntPeriod: boolean
}

export function LeagueWeekMatches({ allMatches, internationalMatches, matchClicked, teamsMap, managerTeam, managerCountry, isIntPeriod }: LeagueWeekMatchesProps) {

    return (
        <div className={styles.leagueWeekMatchesContainer}>
            {!isIntPeriod && (
                <div className={styles.leagueWeekMatches}>
                    {allMatches.map((match) => {
                        const homeTeam = teamsMap.value.get(match.homeTeamName)
                        const awayTeam = teamsMap.value.get(match.awayTeamName)
                        const homeTeamName = homeTeam?.name
                        const awayTeamName = awayTeam?.name
                        const homeTeamScore = match.homeScore
                        const awayTeamScore = match.awayScore
                        return (
                            <div key={`${match.homeTeamName}-${match.awayTeamName}`} className={`${styles.matchRow} ${(homeTeamName === managerTeam?.name) || (awayTeamName === managerTeam?.name) ? styles.managerTeam : ''}`} onClick={() => matchClicked.value = match}>
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
                </div>)}
            {internationalMatches && internationalMatches.length > 0 && (
                <>
                    <div className={styles.sectionHeader}>International Matches</div>
                    <div className={styles.leagueWeekMatches}>
                        {internationalMatches.map((match) => {
                            const isManagerMatch = managerCountry && (match.homeTeamName === managerCountry || match.awayTeamName === managerCountry);
                            return (
                                <div
                                    key={`${match.homeTeamName}-${match.awayTeamName}-${match.tournamentRound}`}
                                    className={`${styles.matchRow} ${isManagerMatch ? styles.managerTeam : ''}`}
                                    onClick={() => match.played && (matchClicked.value = match)}
                                >
                                    <div className={styles.homeTeam}>{flagName(match.homeTeamName)}</div>
                                    <div className={styles.scoreBox}>
                                        <div className={styles.score}>{match.played ? match.homeScore : '-'}</div>
                                        <div className={styles.divider}>-</div>
                                        <div className={styles.score}>{match.played ? match.awayScore : '-'}</div>
                                    </div>
                                    <div className={styles.awayTeam}>{flagName(match.awayTeamName)}</div>
                                </div>
                            )
                        })}
                    </div>
                </>
            )}
        </div>
    )
}

export default LeagueWeekMatches
