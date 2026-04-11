import logo from '../../assets/Images/logo.png';
import styles from "./StartingPage.module.css";
import { useGameContext } from '../../Context/GameContext';
import { hasSave, loadGame, deleteSave } from '../../Utils/SaveLoad';

export function StartingPage() {
    const { currentPage } = useGameContext();
    const saveExists = hasSave();

    function handleContinue() {
        const loaded = loadGame();
        if (!loaded) {
            alert("Save file could not be loaded.");
        }
    }

    function handleNewGame() {
        if (saveExists && !window.confirm("Starting a new game will delete your current save. Continue?")) {
            return;
        }
        deleteSave();
        currentPage.value = "CreateManager";
    }

    return (
        <div className={styles.startingPageContainer}>
            <div>
                <img src={logo} className={styles.logo} alt="logo" />
            </div>
            <div className={styles.welcomeContainer}>
                <h3>Welcome to Footy Manager: World Stage!</h3>
                <h3>Click the button below to begin your football journey.</h3>
                {saveExists && (
                    <button onClick={handleContinue}>Continue</button>
                )}
                <button onClick={handleNewGame}>New Game</button>
            </div>
        </div>
    );
}

export default StartingPage;
