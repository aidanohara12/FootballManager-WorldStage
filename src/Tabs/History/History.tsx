import { useState } from "react";
import styles from "./History.module.css";
import ManagerStats from "../../Components/ManagerStats/ManagerStats";
import { useGameContext } from "../../Context/GameContext";
import { saveGame, deleteSave } from "../../Utils/SaveLoad";

export function History() {
    const ctx = useGameContext();
    const manager = ctx.userManager.value;
    const achievements = ctx.achievements.value;
    const managerHistory = ctx.managerHistory.value;
    const currentYear = ctx.currentYear.value;
    const [saveConfirm, setSaveConfirm] = useState(false);

    function handleSave() {
        saveGame();
        setSaveConfirm(true);
        setTimeout(() => setSaveConfirm(false), 2000);
    }

    function handleDelete() {
        if (window.confirm("Delete your save and restart from the beginning? This cannot be undone.")) {
            deleteSave();
            window.location.reload();
        }
    }

    return (
        <div className={styles.historyContainer}>
            <div className={styles.gameButtons}>
                <button className={styles.saveButton} onClick={handleSave}>
                    {saveConfirm ? "Saved!" : "Save Game"}
                </button>
                <button className={styles.deleteButton} onClick={handleDelete}>
                    Delete Save &amp; Restart
                </button>
            </div>
            <div className={styles.boxesContainer}>
                <div className={styles.trophiesContainer}>
                    <div>
                        <div className={styles.trophiesTitle}>Trophy Cabinet</div>
                        <div className={styles.tint}>
                            {manager.trophiesWon.map((trophie, index) => (
                                <div key={index} className={styles.trophy}>
                                    <h4>🏆</h4>
                                    <div className={styles.trophyName}>{trophie.trophy}</div>
                                    <div className={styles.trophyName}>{trophie.trophyYear}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className={styles.managerStats}>
                    <div className={styles.managerTitle}>{manager.name}'s Stats</div>
                    <div>
                        <ManagerStats manager={manager} managerHistory={managerHistory} currentYear={currentYear.year} />
                    </div>
                </div>
                <div className={styles.achievementsContainer}>
                    <div className={styles.achievementsTitle}>
                        <h3>Achievements</h3>
                        <div className={styles.achievement}>
                            <h4 className={achievements.playFirstSeason ? styles.achieved : styles.notAchieved}>Play in the first season</h4>
                        </div>
                        <div className={styles.achievement}>
                            <h4 className={achievements.play10Seasons ? styles.achieved : styles.notAchieved}>Play in 10 seasons</h4>
                        </div>
                        <div className={styles.achievement}>
                            <h4 className={achievements.play50Seasons ? styles.achieved : styles.notAchieved}>Play in 50 seasons</h4>
                        </div>
                        <div className={styles.achievement}>
                            <h4 className={achievements.play100Seasons ? styles.achieved : styles.notAchieved}>Play in 100 seasons</h4>
                        </div>
                        <div className={styles.achievement}>
                            <h4 className={achievements.playFirstTournament ? styles.achieved : styles.notAchieved}>Play in the first international tournament</h4>
                        </div>
                        <div className={styles.achievement}>
                            <h4 className={achievements.winTheLeague ? styles.achieved : styles.notAchieved}>Win the league</h4>
                        </div>
                        <div className={styles.achievement}>
                            <h4 className={achievements.win10Leagues ? styles.achieved : styles.notAchieved}>Win 10 leagues</h4>
                        </div>
                        <div className={styles.achievement}>
                            <h4 className={achievements.win50Leagues ? styles.achieved : styles.notAchieved}>Win 50 leagues</h4>
                        </div>
                        <div className={styles.achievement}>
                            <h4 className={achievements.get100Points ? styles.achieved : styles.notAchieved}>Get 100 points in a season</h4>
                        </div>
                        <div className={styles.achievement}>
                            <h4 className={achievements.invincibleSeason ? styles.achieved : styles.notAchieved}>Go unbeaten in a season</h4>
                        </div>
                        <div className={styles.achievement}>
                            <h4 className={achievements.winAnInternationalTournament ? styles.achieved : styles.notAchieved}>Win an international tournament</h4>
                        </div>
                        <div className={styles.achievement}>
                            <h4 className={achievements.winFirstTrophy ? styles.achieved : styles.notAchieved}>Win your first trophy</h4>
                        </div>
                        <div className={styles.achievement}>
                            <h4 className={achievements.winTheWorldCup ? styles.achieved : styles.notAchieved}>Win the World Stage</h4>
                        </div>
                        <div className={styles.achievement}>
                            <h4 className={achievements.win10Trophies ? styles.achieved : styles.notAchieved}>Win 10 trophies</h4>
                        </div>
                        <div className={styles.achievement}>
                            <h4 className={achievements.win50Trophies ? styles.achieved : styles.notAchieved}>Win 50 trophies</h4>
                        </div>
                        <div className={styles.achievement}>
                            <h4 className={achievements.win100Trophies ? styles.achieved : styles.notAchieved}>Win 100 trophies</h4>
                        </div>
                        <div className={styles.achievement}>
                            <h4 className={achievements.getA99Overall ? styles.achieved : styles.notAchieved}>Have a player with 99 overall</h4>
                        </div>
                        <div className={styles.achievement}>
                            <h4 className={achievements.getA99Potential ? styles.achieved : styles.notAchieved}>Have a player with 99 potential</h4>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default History; 