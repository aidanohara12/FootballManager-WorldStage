import { signal, type Signal } from '@preact/signals-react';
import type { Player, PlayerAwards } from '../../Models/WorldStage';
import styles from './SeasonSummary.module.css'
import PlayerAttributesView from '../../Components/Formation/PlayerAttributesView';
import { useEffect } from 'react';
import { useGameContext } from '../../Context/GameContext';

interface SeasonSummaryProps {
    currentPage: Signal<string>;
    retiredPlayers: Signal<Player[]>;
    playerAwards: Signal<PlayerAwards>;
}

const selectedPlayer = signal<Player | null>(null);
const showBallonDorWinner = signal<boolean>(false);
const showGoldenBootWinner = signal<boolean>(false);
const showBestKeeper = signal<boolean>(false);

export function SeasonSummary({ currentPage, retiredPlayers, playerAwards }: SeasonSummaryProps) {
    const { leagues, teamsMap, playersMap, userManager: manager, currentYear, tournaments } = useGameContext();
    const ballonDorWinner = playersMap.value.get(playerAwards.value.ballonDorWinners[playerAwards.value.ballonDorWinners.length - 1]);
    const goldenBootWinner = playersMap.value.get(playerAwards.value.goldenBootWinners[playerAwards.value.goldenBootWinners.length - 1]);
    const bestKeeper = playersMap.value.get(playerAwards.value.bestKeeper[playerAwards.value.bestKeeper.length - 1]);
    const premBestPlayer = playersMap.value.get(playerAwards.value.premBestPlayer[playerAwards.value.premBestPlayer.length - 1]);
    const premGoldenBoot = playersMap.value.get(playerAwards.value.premGoldenBoot[playerAwards.value.premGoldenBoot.length - 1]);
    const laLigaBestPlayer = playersMap.value.get(playerAwards.value.laLigaBestPlayer[playerAwards.value.laLigaBestPlayer.length - 1]);
    const laLigaGoldenBoot = playersMap.value.get(playerAwards.value.laLigaGoldenBoot[playerAwards.value.laLigaGoldenBoot.length - 1]);
    const serieABestPlayer = playersMap.value.get(playerAwards.value.serieABestPlayer[playerAwards.value.serieABestPlayer.length - 1]);
    const serieAGoldenBoot = playersMap.value.get(playerAwards.value.serieAGoldenBoot[playerAwards.value.serieAGoldenBoot.length - 1]);
    const bundesligaBestPlayer = playersMap.value.get(playerAwards.value.bundesligaBestPlayer[playerAwards.value.bundesligaBestPlayer.length - 1]);
    const bundesligaGoldenBoot = playersMap.value.get(playerAwards.value.bundesligaGoldenBoot[playerAwards.value.bundesligaGoldenBoot.length - 1]);
    const ligue1BestPlayer = playersMap.value.get(playerAwards.value.ligue1BestPlayer[playerAwards.value.ligue1BestPlayer.length - 1]);
    const ligue1GoldenBoot = playersMap.value.get(playerAwards.value.ligue1GoldenBoot[playerAwards.value.ligue1GoldenBoot.length - 1]);
    const eredivisieBestPlayer = playersMap.value.get(playerAwards.value.eredivisieBestPlayer[playerAwards.value.eredivisieBestPlayer.length - 1]);
    const eredivisieGoldenBoot = playersMap.value.get(playerAwards.value.eredivisieGoldenBoot[playerAwards.value.eredivisieGoldenBoot.length - 1]);
    const primeraDivisionBestPlayer = playersMap.value.get(playerAwards.value.primeraDivisionBestPlayer[playerAwards.value.primeraDivisionBestPlayer.length - 1]);
    const primeraDivisionGoldenBoot = playersMap.value.get(playerAwards.value.primeraDivisionGoldenBoot[playerAwards.value.primeraDivisionGoldenBoot.length - 1]);

    useEffect(() => {
        showBallonDorWinner.value = false;
        showGoldenBootWinner.value = false;
        showBestKeeper.value = false;
    }, []);

    function handlePageChange() {
        selectedPlayer.value = null;
        currentPage.value = "SelectNational";
    }

    return (
        <div className={styles.summaryContainer}>
            <h1>Season Summary</h1>
            <div className={styles.retiredPlayers}>
                <h3>Retired Players</h3>
                <div className={styles.retiredPlayersList}>
                    {Array.from(retiredPlayers.value).map(player => (
                        <div key={player.name} className={player.team === manager.value.team ? styles.winner : ''} onClick={() => selectedPlayer.value = player}>
                            <div className={styles.playerName}>{player.name} - {player.team}</div>
                        </div>
                    ))}
                    {retiredPlayers.value.length === 0 && (
                        <div className={styles.noPlayers}>No retired players</div>
                    )}
                </div>
            </div>
            <div className={styles.awards}>
                <h3>Awards</h3>
                <div className={styles.awardsList}>
                    <div className={styles.award}>
                        <h4>Ballon d'Or Winner</h4>
                        {!showBallonDorWinner.value && (
                            <button onClick={() => showBallonDorWinner.value = true}>Reveal Winner</button>
                        )}
                        {showBallonDorWinner.value && (
                            <div>
                                <div className={styles.playerName}>{ballonDorWinner?.name} - {ballonDorWinner?.team}</div>
                                <div className={styles.playerName}>Goals: {ballonDorWinner?.leagueGoals}</div>
                                <div className={styles.playerName}>Assists: {ballonDorWinner?.leagueAssists}</div>
                            </div>
                        )}
                    </div>

                    {/* Golden Boot Winners */}
                    <div className={styles.award}>
                        <h4>Golden Boot Winner</h4>
                        {!showGoldenBootWinner.value && (
                            <button onClick={() => showGoldenBootWinner.value = true}>Reveal Winner</button>
                        )}
                        {showGoldenBootWinner.value && (
                            <div>
                                <div className={styles.playerName}>{goldenBootWinner?.name} - {goldenBootWinner?.team}</div>
                                <div className={styles.playerName}>Goals: {goldenBootWinner?.leagueGoals}</div>
                            </div>
                        )}
                    </div>

                    {/* Best Keeper */}
                    <div className={styles.award}>
                        <h4>Best Keeper</h4>
                        {!showBestKeeper.value && (
                            <button onClick={() => showBestKeeper.value = true}>Reveal Winner</button>
                        )}
                        {showBestKeeper.value && (
                            <div>
                                <div className={styles.playerName}>{bestKeeper?.name} - {bestKeeper?.team}</div>
                                <div className={styles.playerName}>Clean Sheets: {bestKeeper?.cleanSheets}</div>
                            </div>
                        )}
                    </div>

                    <div className={styles.leagueAwards}>
                        <div className={styles.leagueAwardsList}>
                            <h3>Premier League</h3>
                            <div className={styles.award}>
                                <h4>Best Player</h4>
                                <div className={styles.playerName}>{premBestPlayer?.name} - {premBestPlayer?.team}</div>
                                <div className={styles.playerName}>Goals: {premBestPlayer?.leagueGoals}</div>
                                <div className={styles.playerName}>Assists: {premBestPlayer?.leagueAssists}</div>
                            </div>
                            <div className={styles.award}>
                                <h4>Golden Boot</h4>
                                <div className={styles.playerName}>{premGoldenBoot?.name} - {premGoldenBoot?.team}</div>
                                <div className={styles.playerName}>Goals: {premGoldenBoot?.leagueGoals}</div>
                            </div>
                        </div>
                        {/* La Liga */}
                        <div className={styles.leagueAwardsList}>
                            <h3>La Liga</h3>
                            <div className={styles.award}>
                                <h4>Best Player</h4>
                                <div className={styles.playerName}>{laLigaBestPlayer?.name} - {laLigaBestPlayer?.team}</div>
                                <div className={styles.playerName}>Goals: {laLigaBestPlayer?.leagueGoals}</div>
                                <div className={styles.playerName}>Assists: {laLigaBestPlayer?.leagueAssists}</div>
                            </div>
                            <div className={styles.award}>
                                <h4>Golden Boot</h4>
                                <div className={styles.playerName}>{laLigaGoldenBoot?.name} - {laLigaGoldenBoot?.team}</div>
                                <div className={styles.playerName}>Goals: {laLigaGoldenBoot?.leagueGoals}</div>
                            </div>
                        </div>
                        {/* Serie A */}
                        <div className={styles.leagueAwardsList}>
                            <h3>Serie A</h3>
                            <div className={styles.award}>
                                <h4>Best Player</h4>
                                <div className={styles.playerName}>{serieABestPlayer?.name} - {serieABestPlayer?.team}</div>
                                <div className={styles.playerName}>Goals: {serieABestPlayer?.leagueGoals}</div>
                                <div className={styles.playerName}>Assists: {serieABestPlayer?.leagueAssists}</div>
                            </div>
                            <div className={styles.award}>
                                <h4>Golden Boot</h4>
                                <div className={styles.playerName}>{serieAGoldenBoot?.name} - {serieAGoldenBoot?.team}</div>
                                <div className={styles.playerName}>Goals: {serieAGoldenBoot?.leagueGoals}</div>
                            </div>
                        </div>

                        <div className={styles.leagueAwardsList}>
                            <h3>Bundesliga</h3>
                            <div className={styles.award}>
                                <h4>Best Player</h4>
                                <div className={styles.playerName}>{bundesligaBestPlayer?.name} - {bundesligaBestPlayer?.team}</div>
                                <div className={styles.playerName}>Goals: {bundesligaBestPlayer?.leagueGoals}</div>
                                <div className={styles.playerName}>Assists: {bundesligaBestPlayer?.leagueAssists}</div>
                            </div>
                            <div className={styles.award}>
                                <h4>Golden Boot</h4>
                                <div className={styles.playerName}>{bundesligaGoldenBoot?.name} - {bundesligaGoldenBoot?.team}</div>
                                <div className={styles.playerName}>Goals: {bundesligaGoldenBoot?.leagueGoals}</div>
                            </div>
                        </div>

                        <div className={styles.leagueAwardsList}>
                            <h3>Ligue 1</h3>
                            <div className={styles.award}>
                                <h4>Best Player</h4>
                                <div className={styles.playerName}>{ligue1BestPlayer?.name} - {ligue1BestPlayer?.team}</div>
                                <div className={styles.playerName}>Goals: {ligue1BestPlayer?.leagueGoals}</div>
                                <div className={styles.playerName}>Assists: {ligue1BestPlayer?.leagueAssists}</div>
                            </div>
                            <div className={styles.award}>
                                <h4>Golden Boot</h4>
                                <div className={styles.playerName}>{ligue1GoldenBoot?.name} - {ligue1GoldenBoot?.team}</div>
                                <div className={styles.playerName}>Goals: {ligue1GoldenBoot?.leagueGoals}</div>
                            </div>
                        </div>

                        <div className={styles.leagueAwardsList}>
                            <h3>Eredivisie</h3>
                            <div className={styles.award}>
                                <h4>Best Player</h4>
                                <div className={styles.playerName}>{eredivisieBestPlayer?.name} - {eredivisieBestPlayer?.team}</div>
                                <div className={styles.playerName}>Goals: {eredivisieBestPlayer?.leagueGoals}</div>
                                <div className={styles.playerName}>Assists: {eredivisieBestPlayer?.leagueAssists}</div>
                            </div>
                            <div className={styles.award}>
                                <h4>Golden Boot</h4>
                                <div className={styles.playerName}>{eredivisieGoldenBoot?.name} - {eredivisieGoldenBoot?.team}</div>
                                <div className={styles.playerName}>Goals: {eredivisieGoldenBoot?.leagueGoals}</div>
                            </div>
                        </div>
                        <div className={styles.leagueAwardsList}>
                            <h3>Primera Division</h3>
                            <div className={styles.award}>
                                <h4>Best Player</h4>
                                <div className={styles.playerName}>{primeraDivisionBestPlayer?.name} - {primeraDivisionBestPlayer?.team}</div>
                                <div className={styles.playerName}>Goals: {primeraDivisionBestPlayer?.leagueGoals}</div>
                                <div className={styles.playerName}>Assists: {primeraDivisionBestPlayer?.leagueAssists}</div>
                            </div>
                            <div className={styles.award}>
                                <h4>Golden Boot</h4>
                                <div className={styles.playerName}>{primeraDivisionGoldenBoot?.name} - {primeraDivisionGoldenBoot?.team}</div>
                                <div className={styles.playerName}>Goals: {primeraDivisionGoldenBoot?.leagueGoals}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.leagueWinners}>
                <div className={styles.winnerContainer}>
                    <h3>League Winners</h3>
                    <div className={styles.leagueWinnersList}>
                        {leagues.value.map(league => {
                            const winner = league.pastChampions[league.pastChampions.length - 1];
                            return (
                                <div key={league.name} className={winner === manager.value.team ? styles.winner : ''}>
                                    <div className={styles.playerName}>{league.name} - {winner}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className={styles.winnerContainer}>
                    <h3>Tournament Winners</h3>
                    <div className={styles.leagueWinnersList}>
                        {tournaments.value.map(tournament => {
                            const winner = tournament.pastChampions[tournament.pastChampions.length - 1];
                            return (
                                <div key={tournament.name} className={winner?.teamName === manager.value.team ? styles.winner : ''}>
                                    <div className={styles.playerName}>
                                        {tournament.name} - {winner ? winner.teamName : "In Progress"}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {selectedPlayer.value && (
                <div className={styles.selectedPlayer} onClick={() => selectedPlayer.value = null}>
                    <PlayerAttributesView player={selectedPlayer.value} selectedPlayer={selectedPlayer} />
                </div>
            )}

            <div className={styles.returnBar}>
                <button className={styles.returnButton} onClick={handlePageChange}>Return</button>
            </div>
        </div>
    )
}

export default SeasonSummary