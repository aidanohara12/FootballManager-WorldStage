import React from 'react';
import logo from '../../assets/Images/logo.png';
import styles from "./StartingPage.module.css";

interface StartingPageProps {
    setCurrentPage: (page: string) => void;
}

export function StartingPage({ setCurrentPage }: StartingPageProps) {

    return (
        <div className={styles.startingPageContainer}>
            <div>
                <img src={logo} className={styles.logo} alt="logo" />
            </div>
            <div className={styles.welcomeContainer}>
                <h3>Welcome to Footy Manager: World Stage!</h3>
                <h3>Click the button below to begin your football journey.</h3>
                <button onClick={() => setCurrentPage("CreateManager")}>Start</button>
            </div>
        </div>
    );
}

export default StartingPage;